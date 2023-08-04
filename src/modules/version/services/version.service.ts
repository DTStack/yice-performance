import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPatchDataBody } from 'typing';

import { TASK_STATUS, TASK_TRIGGER_TYPE } from '@/const';
import { Project } from '@/modules/project/entities/project.entity';
import { Task } from '@/modules/task/entities/task.entity';
import { TaskRunService } from '@/modules/task/services/task.run.service';
import { getWhere, isSecond, previewCron } from '@/utils';
import { VersionDto } from '../dto/version.dto';
import { Version } from '../entities/version.entity';

@Injectable()
export class VersionService {
    constructor(
        @InjectRepository(Version)
        private readonly versionRepository: Repository<Version>,
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        private readonly taskRunService: TaskRunService
    ) {}

    async findAll(projectId: number): Promise<Version[]> {
        const result = await this.versionRepository.find({ where: getWhere({ projectId }) });
        return result.map((item) => {
            return { ...item, isDefault: item.name === '汇总' && item.url === 'default' };
        });
    }

    async findOne(query) {
        const result = await this.versionRepository.findOneBy(getWhere(query));
        return result ? { ...result, isFreeze: !!result.isFreeze } : null;
    }

    async create(versionDto: VersionDto) {
        const version = this.versionRepository.create(versionDto);
        const result = await this.versionRepository.save(version);
        return result;
    }

    async update(versionDto) {
        if (versionDto.isDelete === 1) {
            const task = await this.taskRepository.findOne({
                where: getWhere({ versionId: versionDto.versionId, status: TASK_STATUS.RUNNING }),
            });
            if (task?.taskId) {
                throw new HttpException(
                    '当前版本下还有正在运行的任务，暂时不能删除',
                    HttpStatus.OK
                );
            }
        }

        const result = await this.versionRepository.update(versionDto.versionId, versionDto);
        return result;
    }

    async updateScheduleConf(versionDto) {
        const result = await this.versionRepository.update(versionDto.versionId, versionDto);
        return result;
    }

    async previewCron(cron: string, num: number) {
        const data = await previewCron(cron, num);
        return { data, isSecond: isSecond(cron) };
    }

    async patchData(body: IPatchDataBody) {
        const { projectId, versionIds, time } = body;

        const whereParams = { isDelete: 0, versionIds };
        const whereSql = `isDelete = :isDelete and versionId IN (:...versionIds)`;
        const versionList = await this.versionRepository
            .createQueryBuilder()
            .where(whereSql, whereParams)
            .orderBy({ versionId: 'ASC' })
            .printSql()
            .getMany();

        const { name: projectName } = await this.projectRepository.findOneBy(
            getWhere({ projectId })
        );

        const taskList = versionList
            .map((version: any) => {
                delete version.isDelete;
                delete version.createAt;
                delete version.updateAt;

                const list = [];
                for (let i = 0; i < time; i++) {
                    list.push({
                        ...version,
                        versionName: `${projectName}-${version.name}`,
                        triggerType: TASK_TRIGGER_TYPE.PATCH_DATA,
                    });
                }
                return list;
            })
            .flat(Infinity);

        // 批量创建任务
        const result = await this.taskRepository
            .createQueryBuilder()
            .insert()
            .into(Task)
            .values(taskList)
            .execute();

        this.taskRunService.scheduleControl();

        return result;
    }
}
