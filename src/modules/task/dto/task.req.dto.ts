import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { QueryDto } from '@/modules/base.req.dto';

export class TaskReqDto extends QueryDto {
    @ApiPropertyOptional({ required: false, description: '任务绑定的项目id' })
    @IsOptional()
    projectId?: number[];

    @ApiPropertyOptional({ required: false, description: '任务状态' })
    @IsOptional()
    status?: number[];
}
