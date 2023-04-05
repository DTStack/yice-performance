/**
 * 任务调度
 */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskDto } from '../dto/task.dto';
import { Task } from '../entities/task.entity';
import { taskRun } from '@/utils/taskRun';
import { TaskService } from '../services/task.service';
import { Performance } from '@/modules/performance/entities/performance.entity';
import { TASK_STATUS } from '@/const';
import { Version } from '@/modules/version/entities/version.entity';

@Injectable()
export class TaskRunService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @InjectRepository(Performance)
        private readonly performanceRepository: Repository<Performance>,
        @InjectRepository(Version)
        private readonly versionRepository: Repository<Version>,
        private readonly taskService: TaskService
    ) {}

    // 再次检测
    async tryAgain(taskId: number) {
        const currentTask = await this.taskService.findOne(taskId);

        console.log(1111, currentTask);
        delete currentTask.taskId;
        console.log(1112, currentTask);

        const task = this.taskRepository.create({
            ...currentTask,
            status: TASK_STATUS.WAITING,
        });
        const result = await this.taskRepository.save(task);

        this.scheduleControl();

        return result;
    }

    // 尝试运行 - 手动触发调度
    async scheduleControlByHand(taskId: number) {
        const task = await this.taskService.findOne(taskId);
        const runTask = await this.taskRepository.findOneBy({ status: TASK_STATUS.RUNNING });
        if (runTask?.taskId) {
            throw new HttpException('当前还有运行中的任务，请耐心等待', HttpStatus.OK);
        } else {
            this.scheduleControl();
        }
        return task;
    }

    // 创建任务时，参数需要完整
    async create(taskDto: TaskDto) {
        const { versionId, url } = taskDto;
        let taskInfo: TaskDto = { url, status: TASK_STATUS.WAITING };

        // 根据项目新增的任务
        if (versionId) {
            const { name: versionName, ...version } = await this.versionRepository.findOneBy({
                versionId,
            });
            taskInfo = { ...taskDto, ...taskInfo, ...version, versionName };
        }

        // 保存任务
        const task = this.taskRepository.create(taskInfo);
        const result = await this.taskRepository.save(task);

        this.scheduleControl();

        return result;
    }

    // 任务运行成功的回调
    private async successCallback(taskId, result) {
        try {
            const { status } = await this.taskService.findOne(taskId);
            // 只有当前任务是运行中才保存检测结果，因为任务可能被手动取消，手动取消的任务不保存结果数据
            if (status === TASK_STATUS.RUNNING) {
                const { score, duration, reportUrl, performance } = result;
                await this.performanceRepository
                    .createQueryBuilder()
                    .insert()
                    .into(Performance)
                    .values(
                        performance.map((item) => {
                            return { ...item, taskId };
                        })
                    )
                    .printSql()
                    .execute();
                await this.taskService.update(taskId, {
                    score,
                    duration,
                    reportUrl,
                    status: TASK_STATUS.SUCCESS,
                    // failReason: '',
                });
            } else {
                console.log(
                    `taskId: ${taskId}, 任务不是运行中的状态，可能是由于被手动取消了，故本次检测结果不做记录, taskStatus: ${status}`
                );
            }
        } catch (error) {
            console.log('successCallback error', error);
        }
    }

    // 任务运行失败的回调
    private async failCallback(taskId, failReason, duration) {
        try {
            await this.taskService.update(taskId, {
                status: TASK_STATUS.FAIL,
                failReason,
                duration,
            });
        } catch (error) {
            console.log('failCallback error', error);
        }
    }

    /**
     * 任务调度
     * 1、查询是否有正在运行的任务
     * 2、没有则运行等待中的第一个任务，有则不进行下一步处理
     */
    private async scheduleControl() {
        const runTask = await this.taskRepository.findOneBy({ status: TASK_STATUS.RUNNING });

        // 开始检测
        if (!runTask?.taskId) {
            const start = new Date().getTime();
            const task = await this.taskRepository.findOneBy({ status: TASK_STATUS.WAITING });
            if (task?.taskId) {
                await this.taskService.update(task?.taskId, {
                    status: TASK_STATUS.RUNNING,
                    start,
                });
            }

            taskRun(
                { ...task, start },
                this.successCallback,
                this.failCallback,
                this.scheduleControl
            );
        }
    }
}
