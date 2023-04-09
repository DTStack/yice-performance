import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Performance } from '../entities/performance.entity';
import { getWhere } from '@/utils';

@Injectable()
export class PerformanceService {
    constructor(
        @InjectRepository(Performance)
        private readonly performanceRepository: Repository<Performance>
    ) {}

    async findByTaskId(taskId): Promise<object> {
        const result = await this.performanceRepository.find({ where: getWhere({ taskId }) });
        return result;
    }
}
