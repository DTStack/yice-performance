import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Project } from '../project/entities/project.entity';
import { BuildController } from './controllers/build.controller';
import { Build } from './entities/build.entity';
import { BuildService } from './services/build.service';

@Module({
    imports: [TypeOrmModule.forFeature([Build, Project])],
    controllers: [BuildController],
    providers: [BuildService],
    exports: [BuildService],
})
export class BuildModule {}
