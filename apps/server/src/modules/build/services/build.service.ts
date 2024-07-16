import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Project } from '@/modules/project/entities/project.entity';
import { getWhere } from '@/utils';
import { BuildDto } from '../dto/build.dto';
import { Build } from '../entities/build.entity';

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
        const { repository, branch, duration, fileSize } = buildDto;
        let appName = '';
        if (repository.includes('studio')) {
            appName = branch?.split('/')[0];
        } else if (repository.includes('dt-')) {
            const appList = [
                { repository: 'dt-batch-works', appName: 'batch' },
                { repository: 'dt-stream-works', appName: 'stream' },
                { repository: 'dt-console', appName: 'console' },
                { repository: 'dt-data-api', appName: 'dataApi' },
                { repository: 'dt-data-assets', appName: 'dataAssets' },
                { repository: 'dt-tag-engine', appName: 'tag' },
                { repository: 'dt-easy-index', appName: 'easyIndex' },
                { repository: 'dt-portal-front', appName: 'portal' },
            ];
            appName = appList.find((app) => repository.includes(app.repository))?.appName || '';
        }
        if (!appName) {
            throw new HttpException('repository, branch 不符合规则，此次数据不录入', HttpStatus.OK);
        }

        try {
            const version = branch.split('_')?.filter((item) => item.includes('.x'))?.[0];

            const { projectId } = await this.projectRepository.findOneBy(getWhere({ appName }));

            const build = this.buildRepository.create({
                projectId,
                repository,
                branch,
                version,
                duration,
                fileSize,
            });
            const result = await this.buildRepository.save(build);
            return result;
        } catch (error) {
            console.log(
                `\n构建数据未保存, appName: ${appName}, repository: ${repository}, branch: ${branch}, duration: ${duration}, fileSize: ${fileSize}`,
                error
            );
            throw new HttpException('构建数据未保存', HttpStatus.OK);
        }
    }
}
