/**
 * 任务的查询和更新
 */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskDto } from '../dto/task.dto';
import { Task } from '../entities/task.entity';
import { TASK_STATUS } from '@/const';
import { TaskReqDto } from '../dto/task.req.dto';

@Injectable()
export class TaskService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>
    ) {}

    async findAll(query: TaskReqDto): Promise<object> {
        try {
            const { pageSize = 10, current = 1, status = [], projectId = [] } = query;
            let whereSql = '';
            const whereParams = {};

            if (status?.length) {
                whereSql += 'status IN (:...status)';
                Object.assign(whereParams, { status });
            }
            if (projectId?.length) {
                whereSql.length && (whereSql += ' AND ');
                whereSql += 'projectId IN (:...projectId)';
                Object.assign(whereParams, { projectId });
            }

            const [data, total] = await this.taskRepository
                .createQueryBuilder()
                .where(whereSql, whereParams)
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

    async findOne(taskId: number): Promise<Task> {
        const result = await this.taskRepository.findOneBy({ taskId });
        return result;
    }

    async update(taskId: number, taskDto: TaskDto) {
        // 取消检测时判断任务是否还是运行中
        const { status } = taskDto;
        const { status: latestStatus } = await this.findOne(taskId);
        if (status === TASK_STATUS.CANCEL && latestStatus !== TASK_STATUS.RUNNING) {
            throw new HttpException('当前任务不在检测中，不能取消检测', HttpStatus.OK);
        }

        // 手动取消任务只会修改任务状态，任务实际不会停止
        const result = await this.taskRepository.update(taskId, taskDto);
        return result;
    }
}
