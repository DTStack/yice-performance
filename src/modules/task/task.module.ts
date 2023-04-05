import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskController } from './controllers/task.controller';
import { TaskService } from './services/task.service';
import { TaskRunService } from './services/task.run.service';
import { Task } from './entities/task.entity';
import { Performance } from '../performance/entities/performance.entity';
import { Project } from '../project/entities/project.entity';
import { Version } from '../version/entities/version.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Task, Performance, Project, Version])],
    controllers: [TaskController],
    providers: [TaskService, TaskRunService],
})
export class TaskModule {}
