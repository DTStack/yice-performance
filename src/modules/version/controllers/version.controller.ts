import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpException,
    HttpStatus,
    Post,
    Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { IPatchDataBody } from 'typing';

import { isDayMore, isSecond } from '@/utils';
import { VersionDto } from '../dto/version.dto';
import { getVersionReqDto, getVersionsReqDto } from '../dto/version.req.dto';
import { VersionService } from '../services/version.service';

@Controller('version')
export class VersionController {
    constructor(private readonly versionService: VersionService) {}

    @ApiOperation({ summary: '版本列表' })
    @ApiQuery({ name: 'projectId', required: true })
    @HttpCode(HttpStatus.OK)
    @Get('getVersions')
    async getVersions(@Query() query: getVersionsReqDto) {
        const { projectId } = query;
        if (!projectId) {
            throw new HttpException('项目id不能为空', HttpStatus.OK);
        }
        return await this.versionService.findAll(projectId);
    }

    @ApiOperation({ summary: '版本详情' })
    @ApiQuery({ name: 'versionId', required: true })
    @HttpCode(HttpStatus.OK)
    @Get('getVersion')
    async getVersion(@Query() query: getVersionReqDto) {
        const { versionId } = query;
        if (!versionId) {
            throw new HttpException('版本id不能为空', HttpStatus.OK);
        }
        return await this.versionService.findOne({ versionId });
    }

    @ApiOperation({ summary: '创建版本' })
    @HttpCode(HttpStatus.OK)
    @Post('createVersion')
    async createVersion(@Body() versionDto: VersionDto) {
        const { name, projectId } = versionDto;
        if (name && projectId) {
            const version = await this.versionService.findOne({ name, projectId });
            if (version) {
                throw new HttpException('当前项目下名称重复，请重新输入', HttpStatus.OK);
            }
        }

        delete versionDto.versionId;

        // 项目新增版本后，默认 cron 为 0 0 2-3 * * *
        return await this.versionService.create({
            ...versionDto,
            cron: process.env.TASK_DEFAULT_CRON || '0 0 2-3 * * *',
        });
    }

    @ApiOperation({ summary: '更新版本' })
    @HttpCode(HttpStatus.OK)
    @Post('updateVersion')
    async updateVersion(@Body() versionDto: VersionDto) {
        return await this.versionService.update(versionDto);
    }

    @ApiOperation({ summary: '更新版本的cron表达式' })
    @HttpCode(HttpStatus.OK)
    @Post('updateScheduleConf')
    async updateScheduleConf(@Body() versionDto) {
        const { cron } = versionDto;
        if (isSecond(cron)) {
            throw new HttpException('不允许秒级调度，请修改Cron表达式', HttpStatus.OK);
        }

        const max = 10;
        if (isDayMore(cron, max)) {
            throw new HttpException(`每天调度次数超过${max}次，请修改Cron表达式`, HttpStatus.OK);
        }

        return await this.versionService.updateScheduleConf(versionDto);
    }

    @ApiOperation({ summary: '删除版本' })
    @HttpCode(HttpStatus.OK)
    @Post('deleteVersion')
    async deleteVersion(@Body() { versionId }) {
        return await this.versionService.update({ versionId, isDelete: 1 });
    }

    @ApiOperation({ summary: '预览cron表达式' })
    @ApiQuery({ name: 'cron', required: true })
    @HttpCode(HttpStatus.OK)
    @Post('previewCron')
    async previewCron(@Body() { cron, num }) {
        return await this.versionService.previewCron(cron, num);
    }

    @ApiOperation({ summary: '补数据' })
    @HttpCode(HttpStatus.OK)
    @Post('patchData')
    async patchData(@Body() body: IPatchDataBody) {
        return await this.versionService.patchData(body);
    }
}
