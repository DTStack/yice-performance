/**
 * 任务的查询和更新
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TASK_STATUS } from '@/const';
import { Project } from '@/modules/project/entities/project.entity';
import { TaskDto } from '@/modules/task/dto/task.dto';
import { Task } from '@/modules/task/entities/task.entity';
import { Version } from '@/modules/version/entities/version.entity';
import { formatDate, getWhere } from '@/utils';
import { projectChartReqDto } from '../dto/chart.req.dto';

@Injectable()
export class ChartService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        @InjectRepository(Version)
        private readonly versionRepository: Repository<Version>,
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>
    ) {}

    // 子产品性能数据
    async projectChart(query: projectChartReqDto): Promise<object> {
        try {
            const { projectId, startTime, endTime } = query;
            const result = await this.versionRepository.find({ where: getWhere({ projectId }) });

            const whereParams = { isDelete: 0, status: TASK_STATUS.SUCCESS };
            let whereSql = 'isDelete = :isDelete and status = :status ';
            if (result?.length) {
                const versionIds = result.map((task: TaskDto) => task.versionId);
                whereSql += 'and versionId IN (:...versionIds) ';
                Object.assign(whereParams, { versionIds });
            }
            if (startTime && endTime) {
                whereSql += 'and startAt between :startTime and :endTime ';
                Object.assign(whereParams, { startTime, endTime });
            }

            const [data] = await this.taskRepository
                .createQueryBuilder()
                .where(whereSql, whereParams)
                .orderBy({ taskId: 'ASC' })
                .printSql()
                .getManyAndCount();

            return data?.map((task: TaskDto) => {
                const { taskId, versionId, versionName, score, startAt } = task;
                return {
                    taskId,
                    versionId,
                    versionName,
                    score,
                    startAt: formatDate(startAt, 'YYYY-MM-DD HH:mm'),
                };
            });
        } catch (error) {
            console.error('getCharts error', error);
        }
    }
}
