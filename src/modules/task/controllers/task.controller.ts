import {
    Controller,
    Get,
    Body,
    Delete,
    Param,
    ParseIntPipe,
    Post,
    Patch,
    UseGuards,
    Query,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

import { TaskService } from '../services/task.service';

@Controller('task')
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @ApiOperation({
        summary: '创建任务',
        description: '创建任务',
    })
    @ApiOkResponse({
        type: String,
        description: '创建任务的返回值',
    })
    @HttpCode(HttpStatus.CREATED)
    @Post('createTask')
    async createTask(): Promise<string> {
        return await this.taskService.createTask();
    }
}
