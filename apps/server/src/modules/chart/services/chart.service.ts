/**
 * 图标数据的查询
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TASK_STATUS } from '@/const';
import { countBy, maxBy } from 'lodash';
import { BuildDto } from '@/modules/build/dto/build.dto';
import { Build } from '@/modules/build/entities/build.entity';
import { TaskDto } from '@/modules/task/dto/task.dto';
import { Task } from '@/modules/task/entities/task.entity';
import { Version } from '@/modules/version/entities/version.entity';
import { VersionService } from '@/modules/version/services/version.service';
import { Repository } from 'typeorm';
import { IFileSizeChartData, IProjectChartData } from 'typing';
import { formatDate, getWhere } from '@/utils';

import { projectChartReqDto } from '../dto/chart.req.dto';

type IBuildDto = BuildDto & { sizeMBNum: number };

@Injectable()
export class ChartService {
    constructor(
        @InjectRepository(Build)
        private readonly buildRepository: Repository<Build>,
        @InjectRepository(Version)
        private readonly versionRepository: Repository<Version>,
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>
    ) {}

    // 子产品性能数据
    async projectChart(query: projectChartReqDto): Promise<IProjectChartData> {
        try {
            const { projectId, startTime, endTime } = query;
            const versions = await this.versionRepository.find({
                where: getWhere({ projectId }),
            });
            VersionService.versionSort(versions);

            const whereParams = { isDelete: 0, status: TASK_STATUS.SUCCESS };
            let whereSql = 'isDelete = :isDelete and status = :status ';
            if (versions?.length) {
                const versionIds = versions.map((task: TaskDto) => task.versionId);
                whereSql += 'and versionId IN (:...versionIds) ';
                Object.assign(whereParams, { versionIds });
            } else {
                // 没有版本就不用查检测数据列表了
                return { taskList: [], versionNameList: [], maxLength: 0 };
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

            const taskList = [];
            const versionNameList = [];
            let maxLength = 0;

            for (let i = 0; i < versions.length; i++) {
                const scores = [];
                let name;
                const taskIds = [];
                for (let j = 0; j < data.length; j++) {
                    const { taskId, versionId, versionName, score } = data[j];
                    if (versionId === versions[i].versionId) {
                        name = versionName;
                        scores.push(score);
                        taskIds.push(taskId);
                    }
                }
                if (scores.length > maxLength) {
                    maxLength = scores.length;
                }
                scores.length &&
                    taskList.push({
                        name,
                        type: 'line',
                        data: scores,
                        smooth: true,
                        taskIds,
                    });
                name && versionNameList.push(name);
            }

            return { taskList, versionNameList, maxLength };
        } catch (error) {
            console.log('getCharts error', error);
        }
    }

    // 构建产物大小
    async fileSizeChart(query: projectChartReqDto): Promise<IFileSizeChartData> {
        try {
            const { projectId, startTime, endTime } = query;
            const whereParams = { isDelete: 0, projectId };
            let whereSql = 'isDelete = :isDelete and projectId = :projectId ';
            if (startTime && endTime) {
                whereSql += 'and createAt between :startTime and :endTime ';
                Object.assign(whereParams, { startTime, endTime });
            }

            const [data] = await this.buildRepository
                .createQueryBuilder()
                .where(whereSql, whereParams)
                .orderBy({ buildId: 'ASC' })
                .printSql()
                .getManyAndCount();

            // 将分支名有 3 个 _ 的过滤掉；将带 jungong 的分支名过滤掉
            const _result = data
                ?.filter(
                    (build: BuildDto) =>
                        !(build.branch?.split('_')?.length > 3 || build.branch?.includes('jungong'))
                )
                ?.map((build: BuildDto) => {
                    return { ...build, sizeMBNum: Math.round(build.fileSize / 1000) };
                });

            // 纵坐标节点 - 版本号
            const fileSizeVersions = ChartService.versionSort(
                _result?.map((build: BuildDto) => build.version)
            );

            // 横坐标的节点 - 文件大小
            const fileSizeList = [];
            fileSizeVersions.forEach((version: string) => {
                const count = countBy(
                    _result
                        ?.filter((build: IBuildDto) => build.version === version)
                        ?.map((build: IBuildDto) => build.sizeMBNum)
                );
                fileSizeList.push(maxBy(Object.keys(count), (key) => count[key]));
            });

            return { fileSizeVersions, fileSizeList };
        } catch (error) {
            console.log('getCharts error', error);
        }
    }

    // 子产品构建数据
    async buildChart(query: projectChartReqDto): Promise<object> {
        try {
            const { projectId, startTime, endTime } = query;
            const whereParams = { isDelete: 0, projectId };
            let whereSql = 'isDelete = :isDelete and projectId = :projectId ';
            if (startTime && endTime) {
                whereSql += 'and createAt between :startTime and :endTime ';
                Object.assign(whereParams, { startTime, endTime });
            }

            const [result] = await this.buildRepository
                .createQueryBuilder()
                .where(whereSql, whereParams)
                .orderBy({ buildId: 'ASC' })
                .printSql()
                .getManyAndCount();

            // 将分支名有 3 个 _ 的过滤掉；将带 jungong 的分支名过滤掉
            const _result = result?.filter(
                (build: BuildDto) =>
                    !(build.branch?.split('_')?.length > 3 || build.branch?.includes('jungong'))
            );
            const buildVersions = ChartService.versionSort(
                _result?.map((build: BuildDto) => build.version)
            ).reverse();

            const data = _result?.map((build: BuildDto) => {
                const {
                    buildId,
                    projectId,
                    repository,
                    branch,
                    version,
                    duration,
                    fileSize,
                    createAt,
                } = build;
                return {
                    buildId,
                    projectId,
                    repository,
                    branch,
                    version,
                    duration: +(duration / 1000).toFixed(2),
                    fileSize: +(fileSize / 1000).toFixed(2),
                    createAt: formatDate(createAt, 'YYYY-MM-DD HH:mm'),
                };
            });
            return { buildVersions, data };
        } catch (error) {
            console.log('getCharts error', error);
        }
    }

    // 5.3.x, 6.0.x, 6.2.x, 7.0.x 排序
    static versionSort = (versions: string[]) => {
        return Array.from(new Set(versions))?.sort((a: string, b: string) => {
            const aParts = a.split('.').map((part) => (part === 'x' ? Infinity : parseInt(part)));
            const bParts = b.split('.').map((part) => (part === 'x' ? Infinity : parseInt(part)));

            for (let i = 0; i < aParts.length; i++) {
                if (aParts[i] !== bParts[i]) {
                    return aParts[i] - bParts[i];
                }
            }

            return 0;
        });
    };
}
