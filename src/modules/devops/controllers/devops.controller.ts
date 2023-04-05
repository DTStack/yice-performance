import { Controller, Get, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DevopsService } from '../services/devops.service';
import {
    getShiLisReqDto,
    getStagesReqDto,
    getHistoriesReqDto,
    getHistoryReqDto,
} from '../dto/devops.req.dto';

@Controller('devops')
export class DevopsController {
    constructor(private readonly devopsService: DevopsService) {}

    @ApiOperation({ summary: '获取项目下的实例列表' })
    @ApiQuery({ name: 'devopsProjectId', required: true })
    @HttpCode(HttpStatus.OK)
    @Get('getShiLis')
    async getShiLis(@Query() query: getShiLisReqDto) {
        return await this.devopsService.getShiLis(query?.devopsProjectId);
    }

    @ApiOperation({ summary: '获取实例下的阶段列表' })
    @ApiQuery({ name: 'shiliId', required: true })
    @HttpCode(HttpStatus.OK)
    @Get('getStages')
    async getStages(@Query() query: getStagesReqDto) {
        return await this.devopsService.getStages(query?.shiliId);
    }

    @ApiOperation({ summary: '获取实例下的运行记录列表' })
    @ApiQuery({ name: 'shiliId', required: true })
    @HttpCode(HttpStatus.OK)
    @Get('getHistories')
    async getHistories(@Query() query: getHistoriesReqDto) {
        return await this.devopsService.getHistories(query);
    }

    @ApiOperation({ summary: '实例下单条运行记录的详情' })
    @ApiQuery({ name: 'historyId', required: true })
    @HttpCode(HttpStatus.OK)
    @Get('getHistory')
    async getHistory(@Query() query: getHistoryReqDto) {
        return await this.devopsService.getHistory(query?.historyId);
    }
}
