import { Module } from '@nestjs/common';
import { PerformanceController } from './controllers/performance.controller';
import { PerformanceService } from './services/performance.service';
import { Performance } from './entities/performance.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Performance])],
    controllers: [PerformanceController],
    providers: [PerformanceService],
    exports: [PerformanceService],
})
export class PerformanceModule {}
