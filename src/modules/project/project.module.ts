import { Module } from '@nestjs/common';
import { ProjectController } from './controllers/project.controller';
import { ProjectService } from './services/project.service';
import { Project } from './entities/project.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Project])],
    controllers: [ProjectController],
    providers: [ProjectService],
})
export class ProjectModule {}
