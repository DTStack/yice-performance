import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { QueryDto } from '@/modules/base.req.dto';

export class TaskReqDto extends QueryDto {
    @ApiPropertyOptional({ required: false, description: '是否默认的版本，即汇总' })
    @IsOptional()
    isDefault?: string;

    @ApiPropertyOptional({ required: false, description: '任务绑定的版本id' })
    @IsOptional()
    versionId: number;

    @ApiPropertyOptional({ required: false, description: '任务触发方式' })
    @IsOptional()
    triggerType?: number[];

    @ApiPropertyOptional({ required: false, description: '任务状态' })
    @IsOptional()
    status?: number[];
}
