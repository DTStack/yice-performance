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

import { TASK_STATUS } from '@/const';
import { TaskDto } from '../dto/task.dto';
import { batchReqDto, TaskReqDto } from '../dto/task.req.dto';
import { TaskRunService } from '../services/task.run.service';
import { TaskService } from '../services/task.service';

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
        const { taskId, status } = taskDto;
        if (!taskId) {
            throw new HttpException('请传入任务id', HttpStatus.OK);
        }

        // 取消检测时判断任务状态是否处于等待检测，检测中的任务不可取消
        const { status: latestStatus } = await this.taskService.findOne(taskId);
        if (status === TASK_STATUS.CANCEL) {
            if (![TASK_STATUS.WAITING].includes(latestStatus)) {
                throw new HttpException('当前任务状态不是等待中，不能取消检测', HttpStatus.OK);
            } else {
                return await this.taskRunService.cancel(taskId, taskDto);
            }
        }

        return await this.taskService.update(taskId, taskDto);
    }

    @ApiOperation({ summary: '批量操作' })
    @HttpCode(HttpStatus.OK)
    @Post('batchTask')
    async batchTask(@Body() taskDto: batchReqDto) {
        const { taskIds = [], operation } = taskDto;
        if (!taskIds?.length) {
            throw new HttpException('请传入任务id集合', HttpStatus.OK);
        }
        if (!operation) {
            throw new HttpException('请传入批量操作类型', HttpStatus.OK);
        }

        // 批量取消
        if (operation === 'cancel') {
            return await this.taskService.batchCancelTask(taskIds);
        }
        // 批量删除
        if (operation === 'delete') {
            return await this.taskService.batchDeleteTask(taskIds);
        }
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
