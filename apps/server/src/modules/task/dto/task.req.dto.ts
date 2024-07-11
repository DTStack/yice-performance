import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { QueryDto } from '@/modules/base.req.dto';

export class TaskReqDto extends QueryDto {
    @ApiPropertyOptional({ required: false, description: '项目id' })
    @IsOptional()
    projectId: number;

    @ApiPropertyOptional({ required: false, description: '任务绑定的版本id' })
    @IsOptional()
    versionId?: number;

    @ApiPropertyOptional({ required: false, description: 'taskId 或版本名称' })
    @IsOptional()
    searchStr?: string;

    @ApiPropertyOptional({ required: false, description: '排序方式' })
    @IsOptional()
    sorter?: {
        columnKey: string | undefined;
        order: 'DESC' | 'ASC' | undefined;
    };

    @ApiPropertyOptional({
        required: false,
        description: '任务触发方式 0 系统触发, 1 用户手动触发, 2 补数据, 3 批量重试',
    })
    @IsOptional()
    triggerType?: number[];

    @ApiPropertyOptional({ required: false, description: '是否有效' })
    @IsOptional()
    isUseful?: number[];

    @ApiPropertyOptional({ required: false, description: '结果的首屏图片预览' })
    @IsOptional()
    previewImg?: string;

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
    @ApiPropertyOptional({
        required: true,
        description: '批量操作类型 delete 删除, cancel 取消, retry 重试',
    })
    operation: string;
}
