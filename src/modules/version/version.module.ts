import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Performance } from '../performance/entities/performance.entity';
import { Project } from '../project/entities/project.entity';
import { Task } from '../task/entities/task.entity';
import { TaskRunService } from '../task/services/task.run.service';
import { TaskService } from '../task/services/task.service';
import { VersionController } from './controllers/version.controller';
import { Version } from './entities/version.entity';
import { VersionService } from './services/version.service';

@Module({
    imports: [TypeOrmModule.forFeature([Version, Performance, Project, Task])],
    controllers: [VersionController],
    providers: [VersionService, TaskRunService, TaskService],
})
export class VersionModule {}
