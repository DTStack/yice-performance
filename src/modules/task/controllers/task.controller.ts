import {
    Controller,
    Get,
    Query,
    HttpStatus,
    HttpCode,
    Post,
    Body,
    HttpException,
} from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TaskService } from '../services/task.service';
import { TaskRunService } from '../services/task.run.service';
import { TaskDto } from '../dto/task.dto';
import { TaskReqDto } from '../dto/task.req.dto';

@Controller('task')
export class TaskController {
    constructor(
        private readonly taskService: TaskService,
        private readonly taskRunService: TaskRunService
    ) {}

    @ApiOperation({ summary: '检测任务列表' })
    @HttpCode(HttpStatus.OK)
    @Get('getTasks')
    async getTasks(@Query() query: TaskReqDto) {
        return await this.taskService.findAll(query);
    }

    @ApiOperation({ summary: '检测任务详情' })
    @ApiQuery({ name: 'taskId', required: true })
    @HttpCode(HttpStatus.OK)
    @Get('getTask')
    async getTask(@Query() query) {
        return await this.taskService.findOne(query?.taskId);
    }

    @ApiOperation({ summary: '创建任务' })
    @HttpCode(HttpStatus.OK)
    @Post('createTask')
    async createTask(@Body() taskDto: TaskDto) {
        const { versionId, url } = taskDto;
        if (!versionId && !url) {
            throw new HttpException('请输入待检测地址', HttpStatus.OK);
        }
        return await this.taskRunService.create(taskDto);
    }

    @ApiOperation({ summary: '更新任务' })
    @HttpCode(HttpStatus.OK)
    @Post('updateTask')
    async updateTask(@Body() taskDto: TaskDto) {
        const { taskId } = taskDto;
        if (!taskId) {
            throw new HttpException('请传入任务id', HttpStatus.OK);
        }
        return await this.taskService.update(taskId, taskDto);
    }

    @ApiOperation({ summary: '再次检测' })
    @HttpCode(HttpStatus.OK)
    @Post('tryTaskAgain')
    async tryTaskAgain(@Body() { taskId }) {
        if (!taskId) {
            throw new HttpException('请传入任务id', HttpStatus.OK);
        }
        return await this.taskRunService.tryAgain(taskId);
    }

    @ApiOperation({ summary: '尝试运行任务' })
    @HttpCode(HttpStatus.OK)
    @Post('tryRunTask')
    async tryRunTask(@Body() { taskId }) {
        if (!taskId) {
            throw new HttpException('请传入任务id', HttpStatus.OK);
        }
        return await this.taskRunService.scheduleControlByHand(taskId);
    }
}
