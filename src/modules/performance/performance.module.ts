import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PerformanceController } from './controllers/performance.controller';
import { Performance } from './entities/performance.entity';
import { PerformanceService } from './services/performance.service';

@Module({
    imports: [TypeOrmModule.forFeature([Performance])],
    controllers: [PerformanceController],
    providers: [PerformanceService],
    exports: [PerformanceService],
})
export class PerformanceModule {}
