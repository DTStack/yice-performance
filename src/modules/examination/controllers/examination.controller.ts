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

import { ExaminationService } from '../services/examination.service';

@Controller()
export class ExaminationController {
    constructor(private readonly examinationService: ExaminationService) {}

    @ApiOperation({
        summary: '创建账号',
        description: '创建账号',
    })
    @ApiOkResponse({
        type: String,
        description: '创建账号返回值',
    })
    @HttpCode(HttpStatus.CREATED)
    @Post()
    async test1(): Promise<string> {
        return await this.examinationService.test1();
    }

    @Get('/a')
    getHello(): string {
        return this.examinationService.getHello();
    }
}
