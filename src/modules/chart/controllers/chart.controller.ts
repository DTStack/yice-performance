import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { projectChartReqDto } from '../dto/chart.req.dto';
import { ChartService } from '../services/chart.service';

@Controller('chart')
export class ChartController {
    constructor(private readonly chartService: ChartService) {}

    @ApiOperation({ summary: '子产品性能数据' })
    @HttpCode(HttpStatus.OK)
    @Get('getProjectChart')
    async getCharts(@Query() query: projectChartReqDto) {
        return await this.chartService.projectChart(query);
    }
}
