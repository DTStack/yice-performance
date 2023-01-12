import { Controller, Get, Body, Post, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiOkResponse } from '@nestjs/swagger';

import { ExaminationService } from '../services/examination.service';
import { UrlDto } from '../dto/url.dto';

@Controller('examination')
export class ExaminationController {
    constructor(private readonly examinationService: ExaminationService) {}

    @ApiOperation({ summary: '检测网页' })
    @ApiBody({ type: UrlDto })
    @ApiOkResponse({
        type: String,
        description: '检测结果',
    })
    @HttpCode(HttpStatus.OK)
    @Post('run')
    async run(@Body() urlDto: UrlDto): Promise<object> {
        return await this.examinationService.run(urlDto);
    }
}
