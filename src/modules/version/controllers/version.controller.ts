import {
    Controller,
    Get,
    Post,
    Query,
    HttpStatus,
    HttpCode,
    Body,
    HttpException,
} from '@nestjs/common';
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
        return await this.versionService.findOne({ versionId });
    }

    @ApiOperation({ summary: '创建版本' })
    @HttpCode(HttpStatus.OK)
    @Post('createVersion')
    async createVersion(@Body() versionDto: VersionDto) {
        const { name, projectId, devopsShiLiId } = versionDto;
        if (devopsShiLiId) {
            const version = await this.versionService.findOne({ devopsShiLiId });
            if (version?.versionId) {
                throw new HttpException('当前实例已经被绑定，请重新选择', HttpStatus.OK);
            }
        }
        if (name && projectId) {
            const version = await this.versionService.findOne({ name, projectId });
            if (version) {
                throw new HttpException('当前项目下名称重复，请重新输入名称', HttpStatus.OK);
            }
        }

        delete versionDto.versionId;
        return await this.versionService.create(versionDto);
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
    async previewCron(@Body() { cron }) {
        if (cron?.[0] !== '0') {
            throw new HttpException('不允许秒级调度，请修改Cron表达式', HttpStatus.OK);
        }
        return await this.versionService.previewCron(cron);
    }
}
