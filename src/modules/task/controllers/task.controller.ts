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
import { TaskReqDto, batchDeleteReqDto } from '../dto/task.req.dto';
import { TASK_STATUS } from '@/const';

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
        const { status: latestStatus } = await this.taskService.findOne(taskId);

        // 取消检测时判断任务状态是否处于等待检测或检测中
        if (status === TASK_STATUS.CANCEL) {
            if (![TASK_STATUS.WAITING, TASK_STATUS.RUNNING].includes(latestStatus)) {
                throw new HttpException(
                    '当前任务状态非等待检测或检测中，不能取消检测',
                    HttpStatus.OK
                );
            } else {
                return await this.taskRunService.cancel(taskId, taskDto);
            }
        }

        return await this.taskService.update(taskId, taskDto);
    }

    @ApiOperation({ summary: '批量操作' })
    @HttpCode(HttpStatus.OK)
    @Post('batchTask')
    async batchTask(@Body() taskDto: batchDeleteReqDto) {
        const { taskIds = [] } = taskDto;
        if (!taskIds?.length) {
            throw new HttpException('请传入任务id集合', HttpStatus.OK);
        }

        return await this.taskService.batchTask(taskIds);
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
