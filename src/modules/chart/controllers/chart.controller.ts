import { Controller, Get, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ChartService } from '../services/chart.service';
import { projectChartReqDto } from '../dto/chart.req.dto';

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
