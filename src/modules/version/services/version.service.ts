import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VersionDto } from '../dto/version.dto';
import { Version } from '../entities/version.entity';
import { getWhere } from '@/utils';
import { getVersionReqDto } from '../dto/version.req.dto';

@Injectable()
export class VersionService {
    constructor(
        @InjectRepository(Version)
        private readonly versionRepository: Repository<Version>
    ) {}

    async findAll(projectId: number): Promise<Version[]> {
        const result = await this.versionRepository.find({ where: getWhere({ projectId }) });
        return result;
    }

    async findOne(query: getVersionReqDto): Promise<Version> {
        const result = await this.versionRepository.findOneBy(getWhere(query));
        return result;
    }

    async create(versionDto: VersionDto) {
        const version = this.versionRepository.create(versionDto);
        const result = await this.versionRepository.save(version);
        return result;
    }

    async update(versionDto) {
        const result = await this.versionRepository.update(versionDto.versionId, versionDto);
        return result;
    }
}
