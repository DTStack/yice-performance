import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChartController } from './controllers/chart.controller';
import { ChartService } from './services/chart.service';
import { Project } from '../project/entities/project.entity';
import { Version } from '../version/entities/version.entity';
import { Task } from '../task/entities/task.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Project, Version, Task])],
    controllers: [ChartController],
    providers: [ChartService],
})
export class ChartModule {}
