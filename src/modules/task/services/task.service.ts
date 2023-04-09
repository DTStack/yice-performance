/**
 * 任务的查询和更新
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskDto } from '../dto/task.dto';
import { Task } from '../entities/task.entity';
import { TaskReqDto } from '../dto/task.req.dto';
import { getWhere } from '@/utils';

@Injectable()
export class TaskService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>
    ) {}

    async findAll(query: TaskReqDto): Promise<object> {
        try {
            const { pageSize = 10, current = 1, versionId, triggerType = [], status = [] } = query;
            let whereSql = 'versionId= :versionId';
            const whereParams = { versionId };

            if (triggerType?.length) {
                whereSql += 'triggerType IN (:...triggerType)';
                Object.assign(whereParams, { triggerType });
            }
            if (status?.length) {
                whereSql += 'status IN (:...status)';
                Object.assign(whereParams, { status });
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
        const result = await this.taskRepository.findOneBy(getWhere({ taskId }));
        return result;
    }

    async update(taskId: number, taskDto: TaskDto) {
        const result = await this.taskRepository.update(taskId, taskDto);
        return result;
    }
}
