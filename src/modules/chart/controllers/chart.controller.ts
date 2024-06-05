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

    @ApiOperation({ summary: '构建产物大小数据' })
    @HttpCode(HttpStatus.OK)
    @Get('getFileSizeChart')
    async getFileSizes(@Query() query: projectChartReqDto) {
        return await this.chartService.fileSizeChart(query);
    }

    @ApiOperation({ summary: '子产品构建数据' })
    @HttpCode(HttpStatus.OK)
    @Get('getBuildChart')
    async getBuilds(@Query() query: projectChartReqDto) {
        return await this.chartService.buildChart(query);
    }
}
