import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { QueryDto } from '@/modules/base.req.dto';

export class TaskReqDto extends QueryDto {
    @ApiPropertyOptional({ required: false, description: '是否默认的版本，即汇总' })
    @IsOptional()
    isDefault?: string;

    @ApiPropertyOptional({ required: false, description: '项目id' })
    @IsOptional()
    projectId: number;

    @ApiPropertyOptional({ required: false, description: '任务绑定的版本id' })
    @IsOptional()
    versionId?: number;

    @ApiPropertyOptional({ required: false, description: 'taskId 或版本名称' })
    @IsOptional()
    searchStr?: string;

    @ApiPropertyOptional({ required: false, description: '任务触发方式' })
    @IsOptional()
    triggerType?: number[];

    @ApiPropertyOptional({ required: false, description: '是否有效' })
    @IsOptional()
    isUseful?: number[];

    @ApiPropertyOptional({ required: false, description: '任务状态' })
    @IsOptional()
    status?: number[];

    @ApiPropertyOptional({ required: false, description: '开始时间' })
    @IsOptional()
    startTime?: string;

    @ApiPropertyOptional({ required: false, description: '结束时间' })
    @IsOptional()
    endTime?: string;
}

export class batchReqDto {
    @ApiPropertyOptional({ required: true, description: '任务id集合' })
    taskIds: number[];
    @ApiPropertyOptional({ required: true, description: '批量操作类型 delete 删除, cancel 取消' })
    operation: string;
}
