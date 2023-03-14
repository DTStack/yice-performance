import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskController } from './controllers/task.controller';
import { TaskService } from './services/task.service';
import { Task } from './entities/task.entity';
import { Performance } from '../performance/entities/performance.entity';
import { Project } from '../project/entities/project.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Task, Performance, Project])],
    controllers: [TaskController],
    providers: [TaskService],
})
export class TaskModule {}
