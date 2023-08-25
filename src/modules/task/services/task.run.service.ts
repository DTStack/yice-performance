/**
 * 任务调度
 */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { join } from 'path';
import { Repository } from 'typeorm';

import { TASK_STATUS, TASK_TRIGGER_TYPE } from '@/const';
import { Performance } from '@/modules/performance/entities/performance.entity';
import { Project } from '@/modules/project/entities/project.entity';
import { Version } from '@/modules/version/entities/version.entity';
import { canCreateTask, formatDate, getWhere } from '@/utils';
import DingtalkRobot from '@/utils/dingtalkRobot';
import { taskRun } from '@/utils/taskRun';
import { TaskDto } from '../dto/task.dto';
import { Task } from '../entities/task.entity';
import { TaskService } from '../services/task.service';
const fs = require('fs');

@Injectable()
export class TaskRunService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @InjectRepository(Performance)
        private readonly performanceRepository: Repository<Performance>,
        @InjectRepository(Version)
        private readonly versionRepository: Repository<Version>,
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        private readonly taskService: TaskService
    ) {}

    // 每分钟执行一次 https://docs.nestjs.com/techniques/task-scheduling#declarative-cron-jobs
    @Cron('0 * * * * *')
    async handleCron() {
        if (process.env.NODE_ENV === 'production') {
            this.checkCronForCurrentDate();
        }
        this.checkHasWaitingTask();
        this.checkTaskIsTimeout();
    }

    // 再次检测
    async tryAgain(taskId: number) {
        const currentTask = await this.taskService.findOne(taskId);
        if (!currentTask?.versionId) {
            throw new HttpException('当前检测记录已经删除，不允许再次检测', HttpStatus.OK);
        }

        const { versionId, versionName, url } = currentTask;

        // 如果任务对应的版本已删除，不允许再次检测
        const version = await this.versionRepository.findOneBy(getWhere({ versionId }));
        if (!version?.versionId) {
            throw new HttpException(
                '当前检测记录对应的版本已经删除，不允许再次检测',
                HttpStatus.OK
            );
        }

        const task = this.taskRepository.create({
            versionId,
            versionName,
            url,
            status: TASK_STATUS.WAITING,
        });
        const result = await this.taskRepository.save(task);

        this.scheduleControl();

        return result;
    }

    // 尝试运行 - 手动触发调度
    async scheduleControlByHand(taskId: number) {
        const task = await this.taskService.findOne(taskId);
        if (task.status === TASK_STATUS.RUNNING) {
            throw new HttpException('当前任务已经在运行，请耐心等待结果', HttpStatus.OK);
        }
        const runTask = await this.taskRepository.findOneBy(
            getWhere({ status: TASK_STATUS.RUNNING })
        );
        if (runTask?.taskId && runTask.taskId !== taskId) {
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
            const {
                name: versionName,
                projectId,
                ...version
            } = await this.versionRepository.findOneBy(getWhere({ versionId }));
            const { name: projectName } = await this.projectRepository.findOneBy(
                getWhere({ projectId })
            );
            taskInfo = {
                ...taskDto,
                ...taskInfo,
                ...version,
                versionName: `${projectName}-${versionName}`,
            };
        } else {
            // 输入框输入地址进行检测
            const version = await this.versionRepository.findOneBy(
                getWhere({ name: '汇总', url: 'default' })
            );
            taskInfo = { ...taskInfo, versionId: version?.versionId, versionName: '自定义地址' };
        }

        // 保存任务
        const task = this.taskRepository.create(taskInfo);
        const result = await this.taskRepository.save(task);

        this.scheduleControl();

        return result;
    }

    // 取消检测
    async cancel(taskId: number, taskDto: TaskDto) {
        // 手动取消任务只会修改任务状态，任务实际不会停止
        const result = await this.taskRepository.update(taskId, taskDto);
        return result;
    }

    // 检查结果文件是否存在
    async checkFileExists(reportPath: string) {
        return fs.existsSync(
            join(__dirname, '../../../../', `static/${reportPath.replace('/report/', '')}`)
        );
    }

    // 任务运行成功的回调
    private async successCallback(taskId, result) {
        try {
            const { score, duration, reportPath, performance } = result;
            const { status } = await this.taskService.findOne(taskId);
            // 只有当前任务是运行中才保存检测结果，因为任务可能被手动取消，手动取消的任务不保存结果数据
            if (status === TASK_STATUS.RUNNING) {
                let status = TASK_STATUS.SUCCESS;
                let failReason = '';
                try {
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

                    console.log(`taskId: ${taskId}, 数据整理完成，已落库`);
                } catch (error) {
                    status = TASK_STATUS.FAIL;
                    failReason = error;
                    console.log(`taskId: ${taskId}, 性能数据落库失败`, error?.toString());
                }
                await this.taskService.update(taskId, {
                    score,
                    duration,
                    reportPath,
                    status,
                    failReason,
                });
            } else {
                console.log(`taskId: ${taskId}, 任务不是运行中的状态，故本次检测结果不做记录`);
            }

            console.log(`taskId: ${taskId}, 检测完成，本次检测耗时：${duration}ms\n`);
        } catch (error) {
            console.log('successCallback error', error);
        }
    }

    // 任务运行失败的回调
    private async failCallback(task, failReason, duration) {
        try {
            await this.taskService.update(task?.taskId, {
                status: TASK_STATUS.FAIL,
                failReason,
                duration,
            });
            await DingtalkRobot.failure(task);
        } catch (error) {
            console.log('failCallback error', error);
        }
    }

    /**
     * 任务调度
     * 1、查询是否有正在运行的任务
     * 2、没有则运行等待中的第一个任务，有则不进行下一步处理
     */
    async scheduleControl() {
        const runTask = await this.taskRepository.findOneBy(
            getWhere({ status: TASK_STATUS.RUNNING })
        );

        // 没有运行中的任务则查询等待中的任务
        if (!runTask?.taskId) {
            const start = new Date().getTime();
            const task = await this.taskRepository.findOneBy(
                getWhere({ status: TASK_STATUS.WAITING })
            );
            // 有等待中的任务
            if (task?.taskId) {
                const { versionId } = task;
                const versionResult = await this.versionRepository.findOneBy(
                    getWhere({ versionId })
                );

                if (versionResult) {
                    const { url, ...version } = versionResult;

                    await this.taskService.update(task?.taskId, {
                        status: TASK_STATUS.RUNNING,
                        startAt: new Date(start),
                    });

                    // 参数的方法不能简写，否则会使方法丢失 this
                    // url 使用 task 的 url 即可，使用 version 的 url 会导致 default 的 url 覆盖实际输入的 url
                    taskRun(
                        { url, ...task, ...version, start },
                        (taskId, result) => this.successCallback(taskId, result),
                        (task, failReason, duration) =>
                            this.failCallback(task, failReason, duration),
                        () => this.scheduleControl()
                    );
                } else {
                    // 如果该版本已删除，不允许再次检测
                    await this.taskService.update(task?.taskId, {
                        status: TASK_STATUS.FAIL,
                        failReason: '当前检测记录对应的版本已被删除，不允许再次检测',
                    });
                }
            }
        }
    }

    // 检测版本的 cron，符合当前时间运行的则创建任务
    private async checkCronForCurrentDate() {
        const versionResult = await this.versionRepository.find({
            where: getWhere({ isFreeze: 0 }),
        });
        const versionList = versionResult.filter(({ cron }) => {
            const currentDate = formatDate();
            return cron ? canCreateTask(currentDate, cron) : false;
        });

        const projectList = await this.projectRepository.find({ where: getWhere() });
        const taskList = versionList.map((version: any) => {
            delete version.isDelete;
            delete version.createAt;
            delete version.updateAt;

            return {
                ...version,
                versionName: `${
                    projectList.find((project: any) => project.projectId === version.projectId)
                        ?.name
                }-${version.name}`,
                triggerType: TASK_TRIGGER_TYPE.SYSTEM,
            };
        });

        // 批量创建任务
        await this.taskRepository
            .createQueryBuilder()
            .insert()
            .into(Task)
            .values(taskList)
            .execute();

        this.scheduleControl();
    }

    // 检查是否有任务在等待中
    private async checkHasWaitingTask() {
        // 1、是否有运行中的任务
        const runningResult = await this.taskRepository.find({
            where: getWhere({ status: TASK_STATUS.RUNNING }),
        });

        // 2、没有运行中的任务则查询是否有等待中的任务，有则进行任务调度
        if (!runningResult.length) {
            const waitingResult = await this.taskRepository.find({
                where: getWhere({ status: TASK_STATUS.WAITING }),
            });
            waitingResult.length && this.scheduleControl();
        }
    }

    // 检查任务的运行时长，超时的则让任务失败
    private async checkTaskIsTimeout() {
        const result = await this.taskRepository.find({
            where: getWhere({ status: TASK_STATUS.RUNNING }),
        });
        result.forEach(async (task: any) => {
            // 任务运行超过一定时间
            const duration = new Date().getTime() - new Date(task.startAt).getTime();
            const taskTimeout = Number(process.env.TASK_TIMEOUT ?? 5);
            if (duration > taskTimeout * 60 * 1000) {
                const failReason = `任务运行超过${taskTimeout}分钟，系统已取消该任务`;
                await this.taskService.update(task?.taskId, {
                    status: TASK_STATUS.FAIL,
                    failReason,
                    duration,
                });
                console.log(`taskId: ${task.taskId}, ${failReason}！`);
                this.scheduleControl();

                const { projectId } = await this.versionRepository.findOne({
                    where: getWhere({ versionId: task.versionId }),
                });

                await DingtalkRobot.timeout({ ...task, projectId });
            }
        });
    }
}
