import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Performance } from '../performance/entities/performance.entity';
import { Project } from '../project/entities/project.entity';
import { Version } from '../version/entities/version.entity';
import { TaskController } from './controllers/task.controller';
import { Task } from './entities/task.entity';
import { TaskRunService } from './services/task.run.service';
import { TaskService } from './services/task.service';

@Module({
    imports: [TypeOrmModule.forFeature([Task, Performance, Project, Version])],
    controllers: [TaskController],
    providers: [TaskService, TaskRunService],
})
export class TaskModule {}
