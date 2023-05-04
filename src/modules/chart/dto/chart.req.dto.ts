import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class projectChartReqDto {
    @ApiPropertyOptional({ required: false, description: '项目id' })
    projectId: number[];

    @ApiPropertyOptional({ required: false, description: '版本id' })
    versionId?: number[];

    @ApiPropertyOptional({ required: false, description: '开始时间' })
    @IsOptional()
    startTime?: string;

    @ApiPropertyOptional({ required: false, description: '结束时间' })
    @IsOptional()
    endTime?: string;
}
