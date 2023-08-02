import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TASK_STATUS } from '@/const';
import { Task } from '@/modules/task/entities/task.entity';
import { getWhere, isSecond, previewCron } from '@/utils';
import { VersionDto } from '../dto/version.dto';
import { Version } from '../entities/version.entity';

@Injectable()
export class VersionService {
    constructor(
        @InjectRepository(Version)
        private readonly versionRepository: Repository<Version>,
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>
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

    async previewCron(cron: string) {
        const data = await previewCron(cron);
        return { data, isSecond: isSecond(cron) };
    }
}
