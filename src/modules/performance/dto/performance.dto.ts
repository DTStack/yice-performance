import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class PerformanceDto {
    @ApiPropertyOptional({ description: '性能记录id' })
    readonly performanceId: number;

    @IsOptional()
    @ApiPropertyOptional({ description: '任务id' })
    readonly taskId?: number;

    @IsOptional()
    @ApiPropertyOptional({ description: '单项所占的权重' })
    readonly weight: string;

    @IsOptional()
    @ApiPropertyOptional({ description: '单项名称' })
    readonly name: string;

    @IsOptional()
    @ApiPropertyOptional({ description: '单项得分' })
    readonly score: string;

    @IsOptional()
    @ApiPropertyOptional({ description: '单项耗时' })
    readonly time: string;
}
