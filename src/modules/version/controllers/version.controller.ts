import { Controller, Get, Post, Query, HttpStatus, HttpCode, Body } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { VersionDto } from '../dto/version.dto';
import { VersionService } from '../services/version.service';
import { getVersionsReqDto, getVersionReqDto } from '../dto/version.req.dto';

@Controller('version')
export class VersionController {
    constructor(private readonly versionService: VersionService) {}

    @ApiOperation({ summary: '版本列表' })
    @ApiQuery({ name: 'projectId', required: true })
    @HttpCode(HttpStatus.OK)
    @Get('getVersions')
    async getVersions(@Query() query: getVersionsReqDto) {
        return await this.versionService.findAll(query?.projectId);
    }

    @ApiOperation({ summary: '版本详情' })
    @ApiQuery({ name: 'versionId', required: true })
    @HttpCode(HttpStatus.OK)
    @Get('getVersion')
    async getVersion(@Query() query: getVersionReqDto) {
        return await this.versionService.findOne(query?.versionId);
    }

    @ApiOperation({ summary: '更新版本' })
    @HttpCode(HttpStatus.OK)
    @Post('updateVersion')
    async updateVersion(@Body() versionDto: VersionDto) {
        return await this.versionService.update(versionDto);
    }

    @ApiOperation({ summary: '创建版本' })
    @HttpCode(HttpStatus.OK)
    @Post('createVersion')
    async createVersion(@Body() versionDto: VersionDto) {
        return await this.versionService.create(versionDto);
    }
}
