import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Build } from '../build/entities/build.entity';
import { Project } from '../project/entities/project.entity';
import { Task } from '../task/entities/task.entity';
import { Version } from '../version/entities/version.entity';
import { ChartController } from './controllers/chart.controller';
import { ChartService } from './services/chart.service';

@Module({
    imports: [TypeOrmModule.forFeature([Project, Version, Task, Build])],
    controllers: [ChartController],
    providers: [ChartService],
})
export class ChartModule {}
