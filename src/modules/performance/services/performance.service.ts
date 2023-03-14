import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { PerformanceDto } from '../dto/performance.dto';
import { Performance } from '../entities/performance.entity';

@Injectable()
export class PerformanceService {
    constructor(
        @InjectRepository(Performance)
        private readonly performanceRepository: Repository<Performance>
    ) {}

    async findAll(): Promise<Performance[]> {
        const result = await this.performanceRepository.find();
        return result;
    }

    async findOne(performanceId): Promise<Performance> {
        const result = await this.performanceRepository.findOneBy({ performanceId });
        return result;
    }

    async create(performancesDto: PerformanceDto[]) {
        try {
            const result = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(Performance)
                .values(performancesDto)
                .execute();
            // await this.performanceRepository.save(result);
            // console.log(12312, result, performanceDto);
            // this.performanceRepository.create([performanceDto, performanceDto]);
            // const { url } = performanceDto;
            // taskRun({ url });

            return result;
        } catch (error) {
            console.log('performances create error', error);
            return error;
        }
    }
}
