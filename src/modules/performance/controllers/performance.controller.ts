import { Controller, Get, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PerformanceService } from '../services/performance.service';

@Controller('performance')
export class PerformanceController {
    constructor(private readonly performanceService: PerformanceService) {}

    @ApiOperation({
        summary: '检测任务性能详情',
        description: '检测任务性能详情',
    })
    @ApiQuery({ name: 'performanceId', required: true })
    @HttpCode(HttpStatus.OK)
    @Get('getPerformance')
    async getPerformance(@Query() query) {
        return await this.performanceService.findOne(query?.performanceId);
    }
}
