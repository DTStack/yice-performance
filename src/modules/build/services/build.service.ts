import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Build } from '../entities/build.entity';
import { BuildDto } from '../dto/build.dto';
import { Project } from '@/modules/project/entities/project.entity';
import { getWhere } from '@/utils';

@Injectable()
export class BuildService {
    constructor(
        @InjectRepository(Build)
        private readonly buildRepository: Repository<Build>,
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>
    ) {}

    async findAll(projectId: number): Promise<Build[]> {
        const result = await this.buildRepository.find({ where: getWhere({ projectId }) });
        return result;
    }

    async create(buildDto: BuildDto) {
        const { branch, duration, fileSize } = buildDto;
        const appName = branch?.split('/')[0];
        const { projectId } = await this.projectRepository.findOneBy(getWhere({ appName }));

        const build = this.buildRepository.create({ projectId, duration, fileSize });
        const result = await this.buildRepository.save(build);
        return result;
    }
}
