import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VersionController } from './controllers/version.controller';
import { VersionService } from './services/version.service';
import { Version } from './entities/version.entity';
import { Performance } from '../performance/entities/performance.entity';
import { Project } from '../project/entities/project.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Version, Performance, Project])],
    controllers: [VersionController],
    providers: [VersionService],
})
export class VersionModule {}