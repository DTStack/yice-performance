/**
 * 任务的查询和更新
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskDto } from '../dto/task.dto';
import { Task } from '../entities/task.entity';
import { Performance } from '@/modules/performance/entities/performance.entity';
import { TaskReqDto } from '../dto/task.req.dto';
import { getWhere } from '@/utils';

@Injectable()
export class TaskService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @InjectRepository(Performance)
        private readonly performanceRepository: Repository<Performance>
    ) {}

    async findAll(query: TaskReqDto): Promise<object> {
        try {
            const {
                pageSize = 20,
                current = 1,
                isDefaultVersion,
                versionId,
                triggerType = [],
                isUseful = [],
                status = [],
                startTime = '',
                endTime = '',
            } = query;
            let whereSql = 'isDelete = 0 ';
            const whereParams = { isDelete: 0 };

            if (isDefaultVersion !== 'true') {
                whereSql += 'and versionId= :versionId ';
                Object.assign(whereParams, { versionId });
            }
            if (triggerType?.length) {
                whereSql += 'and triggerType IN (:...triggerType) ';
                Object.assign(whereParams, { triggerType });
            }
            if (isUseful?.length) {
                whereSql += 'and isUseful IN (:...isUseful) ';
                Object.assign(whereParams, { isUseful });
            }
            if (status?.length) {
                whereSql += 'and status IN (:...status) ';
                Object.assign(whereParams, { status });
            }
            if (startTime && endTime) {
                whereSql += 'and startAt between :startTime and :endTime ';
                Object.assign(whereParams, { startTime, endTime });
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

    // 批量操作 - 删除
    async batchTask(taskIds: number[]) {
        const result = await this.taskRepository
            .createQueryBuilder()
            .update(Task)
            .set({ isDelete: 1 })
            .where('taskId IN (:...taskIds) and status != :status', { taskIds, status: 1 })
            .execute();

        // 批量删除任务时，把关联的性能数据也删除
        await this.performanceRepository
            .createQueryBuilder()
            .update(Performance)
            .set({ isDelete: 1 })
            .where('taskId IN (:...taskIds) ', { taskIds })
            .execute();

        return result;
    }
}
