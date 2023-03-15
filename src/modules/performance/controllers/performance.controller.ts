import { Controller, Get, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PerformanceService } from '../services/performance.service';

@Controller('performance')
export class PerformanceController {
    constructor(private readonly performanceService: PerformanceService) {}

    @ApiOperation({
        summary: '检测任务的性能指标列表',
        description: '检测任务的性能指标列表',
    })
    @ApiQuery({ name: 'taskId', required: true })
    @HttpCode(HttpStatus.OK)
    @Get('getPerformancesByTaskId')
    async getPerformancesByTaskId(@Query() { taskId }) {
        return await this.performanceService.findByTaskId(taskId);
    }
}
