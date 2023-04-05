import { Controller, Get, Post, Query, HttpStatus, HttpCode, Body } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProjectDto } from '../dto/project.dto';
import { ProjectService } from '../services/project.service';

@Controller('project')
export class ProjectController {
    constructor(private readonly projectService: ProjectService) {}

    @ApiOperation({ summary: '项目列表' })
    @HttpCode(HttpStatus.OK)
    @Get('getProjects')
    async getProjects() {
        return await this.projectService.findAll();
    }

    @ApiOperation({ summary: '项目详情' })
    @ApiQuery({ name: 'projectId', required: true })
    @HttpCode(HttpStatus.OK)
    @Get('getProject')
    async getProject(@Query() query) {
        return await this.projectService.findOne(query?.projectId);
    }

    @ApiOperation({ summary: '更新项目' })
    @HttpCode(HttpStatus.OK)
    @Post('updateProject')
    async updateProject(@Body() projectDto: ProjectDto) {
        return await this.projectService.update(projectDto);
    }
}
