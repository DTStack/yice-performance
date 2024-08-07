import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { getWhere } from '@/utils';
import { ProjectDto } from '../dto/project.dto';
import { Project } from '../entities/project.entity';

@Injectable()
export class ProjectService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>
    ) {}

    async findAll(): Promise<Project[]> {
        const result = await this.projectRepository.find({ where: getWhere() });
        return result;
    }

    async findOne(projectId): Promise<Project> {
        const result = await this.projectRepository.findOneBy(getWhere({ projectId }));
        return result;
    }

    async update(projectDto: ProjectDto) {
        const result = await this.projectRepository.update(projectDto.projectId, projectDto);
        return result;
    }
}
