/**
 * 任务的查询和更新
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TASK_STATUS } from '@/const';
import { Performance } from '@/modules/performance/entities/performance.entity';
import { Version } from '@/modules/version/entities/version.entity';
import { getWhere } from '@/utils';
import { TaskDto } from '../dto/task.dto';
import { TaskReqDto } from '../dto/task.req.dto';
import { Task } from '../entities/task.entity';
const fs = require('fs');

@Injectable()
export class TaskService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @InjectRepository(Version)
        private readonly versionRepository: Repository<Version>,
        @InjectRepository(Performance)
        private readonly performanceRepository: Repository<Performance>
    ) {}

    async findAll(query: TaskReqDto): Promise<object> {
        try {
            const {
                pageSize = 20,
                current = 1,
                isDefault,
                projectId,
                versionId,
                versionName,
                triggerType = [],
                isUseful = [],
                status = [],
                startTime = '',
                endTime = '',
            } = query;

            let versionIds = [];
            // 以项目维度查询任务列表
            if (projectId !== undefined && !versionId) {
                const result = await this.versionRepository.find({
                    where: getWhere({ projectId }),
                });
                versionIds = result.map((task: TaskDto) => task.versionId);
            } else {
                // 从版本维度查询任务列表
                versionIds = [versionId];
            }

            const whereParams = { isDelete: 0 };
            let whereSql = 'isDelete = :isDelete ';

            if (isDefault !== 'true') {
                whereSql += 'and versionId IN (:...versionIds) ';
                Object.assign(whereParams, { versionIds });
            }
            if (versionName !== undefined) {
                whereSql += 'and versionName LIKE :versionName ';
                Object.assign(whereParams, { versionName: `%${versionName}%` });
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
                whereSql += 'and createAt between :startTime and :endTime ';
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
                data: data.map((item) => {
                    return item.status === TASK_STATUS.RUNNING
                        ? {
                              ...item,
                              duration: new Date().getTime() - new Date(item.startAt).getTime(),
                          }
                        : item;
                }),
                total,
                current: +current,
                pageSize: +pageSize,
            };
        } catch (error) {
            console.error('getTasks error', error);
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

    // 批量操作 - 取消
    async batchCancelTask(taskIds: number[]) {
        const result = await this.taskRepository
            .createQueryBuilder()
            .update(Task)
            .set({ status: TASK_STATUS.CANCEL, failReason: '批量手动取消检测' })
            .where('taskId IN (:...taskIds) and status IN (:...status)', {
                taskIds,
                status: [TASK_STATUS.WAITING],
            })
            .execute();

        return result;
    }

    // 批量操作 - 删除
    async batchDeleteTask(taskIds: number[]) {
        const result = await this.taskRepository
            .createQueryBuilder()
            .update(Task)
            .set({ isDelete: 1 })
            .where('taskId IN (:...taskIds) and status != :status', {
                taskIds,
                status: TASK_STATUS.RUNNING,
            })
            .execute();

        // 删除报告文件
        const whereParams = { isDelete: 1, taskIds };
        const whereSql = `isDelete = :isDelete and taskId IN (:...taskIds)`;
        const [data] = await this.taskRepository
            .createQueryBuilder()
            .where(whereSql, whereParams)
            .printSql()
            .getManyAndCount();
        data?.filter((task) => !!task?.reportPath)?.forEach((task) => {
            const filePath = `./static/${task?.reportPath?.replace('/report/', '')}`;
            try {
                fs.unlinkSync(filePath);
            } catch (_error) {
                console.log(`taskId: ${task.taskId}, 检测报告文件删除失败，${filePath}`);
            }
        });

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
