import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class PerformanceDto {
    @ApiPropertyOptional({ description: '性能记录id' })
    readonly performanceId: number;

    @ApiPropertyOptional({ description: '任务id' })
    readonly taskId: number;

    @ApiPropertyOptional({ description: '单项所占的权重' })
    readonly weight: number;

    @IsOptional()
    @ApiPropertyOptional({ description: '单项名称' })
    readonly name?: string;

    @ApiPropertyOptional({ description: '单项得分' })
    readonly score: number;

    @IsOptional()
    @ApiPropertyOptional({ description: '单项耗时，单位毫秒' })
    readonly duration?: string;
}
