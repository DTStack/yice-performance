import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskDto } from '../dto/task.dto';
import { Task } from '../entities/task.entity';
import { taskRun } from '@/utils/taskRun';
import { Performance } from '@/modules/performance/entities/performance.entity';
import { TASK_STATUS } from '@/const';
import { TaskReqDto } from '../dto/task.req.dto';
import { Project } from '@/modules/project/entities/project.entity';

@Injectable()
export class TaskService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @InjectRepository(Performance)
        private readonly performanceRepository: Repository<Performance>,
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>
    ) {}

    async findAll(query: TaskReqDto): Promise<object> {
        try {
            const {
                pageSize = 10,
                current = 1,
                status = [
                    TASK_STATUS.WAITING,
                    TASK_STATUS.RUNNING,
                    TASK_STATUS.FAIL,
                    TASK_STATUS.SUCCESS,
                    TASK_STATUS.CANCEL,
                ],
            } = query;
            const [data, total] = await this.taskRepository
                .createQueryBuilder()
                .where('status IN (:...status)', { status })
                .skip((current - 1) * pageSize)
                .take(pageSize)
                .orderBy({ taskId: 'DESC' })
                .printSql()
                .getManyAndCount();

            return {
                data,
                total,
                current: +current,
                pageSize: +pageSize,
            };
        } catch (error) {
            console.log('getTasks error', error);
        }
    }

    async findOne(taskId): Promise<Task> {
        const result = await this.taskRepository.findOneBy({ taskId });
        return result;
    }

    async update(taskId, taskDto: TaskDto): Promise<any> {
        // 取消检测时判断任务是否还是运行中
        const { status } = taskDto;
        const { status: latestStatus } = await this.findOne(taskId);
        if (status === TASK_STATUS.CANCEL && latestStatus !== TASK_STATUS.RUNNING) {
            throw new HttpException('当前任务已经结束，不可取消检测', HttpStatus.OK);
        }

        const result = await this.taskRepository.update(taskId, taskDto);
        return result;
    }

    // 再次检测
    async tryAgain(taskId): Promise<any> {
        const { projectId, projectName, url } = await this.findOne(taskId);
        const runningList = await this.taskRepository.find({
            where: [{ status: TASK_STATUS.RUNNING }],
        });
        const task = this.taskRepository.create({
            projectId,
            projectName,
            url,
            status: runningList.length ? TASK_STATUS.WAITING : TASK_STATUS.RUNNING,
        });
        const result = await this.taskRepository.save(task);

        // 如果没有等待中的任务，则运行当前任务；如果有等待中的任务，则不进行操作
        if (!runningList.length) {
            this.runWithFirstWait(result);
        }

        return result;
    }

    // 尝试运行
    async tryRun(taskId): Promise<any> {
        const task = await this.findOne(taskId);
        const runningList = await this.taskRepository.find({
            where: [{ status: TASK_STATUS.RUNNING }],
        });
        // 如果没有等待中的任务，则运行当前任务；如果有等待中的任务，则不进行操作
        !runningList.length && this.runWithFirstWait(task);

        return task;
    }

    /**
     * 如果当前有正在运行的任务，此时新增的任务默认状态就是等待中 0
     * 如果没有正在运行的任务，则运行当前任务，并将状态置为检测中 1
     * 运行失败后将任务状态置为检测失败 2
     * 运行成功后将任务状态置为检测成功 3
     * 运行成功或失败都属于运行结束，此时应从数据库查询下是否有等待中的任务，有则运行第一个等待中的任务
     */
    async create(taskDto: TaskDto) {
        const runningList = await this.taskRepository.find({
            where: [{ status: TASK_STATUS.RUNNING }],
        });
        const { projectId } = taskDto;

        if (projectId) {
            const { name: projectName, url } = await this.projectRepository.findOneBy({
                projectId,
            });
            taskDto.projectName = projectName;
            taskDto.url = url;
        }
        taskDto.status = runningList.length ? TASK_STATUS.WAITING : TASK_STATUS.RUNNING;

        const task = this.taskRepository.create(taskDto);
        const result = await this.taskRepository.save(task);

        // 如果没有等待中的任务，则运行当前任务；如果有等待中的任务，则不进行操作
        if (!runningList.length) {
            this.runWithFirstWait({ ...taskDto, taskId: result.taskId });
        }

        return result;
    }

    /**
     * 运行第一个等待中的任务
     * @param task 即将运行的任务，包含任务id
     */
    private async runWithFirstWait(task) {
        const successCallback = async (taskId, result) => {
            try {
                const { status } = await this.findOne(taskId);
                // 只有任务是进行中才保存检测结果
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
                    await this.update(taskId, {
                        score,
                        duration,
                        reportUrl,
                        status: TASK_STATUS.SUCCESS,
                        failReason: '',
                    });
                } else {
                    console.log(`taskId: ${taskId}, 本次检测结果不做记录, taskStatus: ${status}`);
                }
                completeCallback();
            } catch (error) {
                console.log('successCallback error', error);
            }
        };
        const failCallback = async (taskId, failReason, duration) => {
            await this.update(taskId, { status: TASK_STATUS.FAIL, failReason, duration });
            completeCallback();
        };
        const completeCallback = async () => {
            const runningList = await this.taskRepository.find({
                where: [{ status: TASK_STATUS.WAITING }],
            });
            runningList.length && this.runWithFirstWait(runningList[0]);
        };

        let runInfo = { ...task };
        // 点击项目的检测
        if (task.projectId) {
            const project = await this.projectRepository.findOneBy({ projectId: task.projectId });
            runInfo = { ...task, ...project };
        }

        await this.update(runInfo.taskId, {
            status: TASK_STATUS.RUNNING,
            url: runInfo.url,
        });

        taskRun(runInfo, successCallback, failCallback);
    }
}
