import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUrl, MaxLength } from 'class-validator';

export class TaskDto {
    @ApiPropertyOptional({ description: '任务id' })
    readonly taskId?: number;

    @IsOptional()
    @ApiPropertyOptional({ description: '版本id' })
    readonly versionId?: number;

    @IsOptional()
    @ApiPropertyOptional({ description: '版本名称' })
    @MaxLength(256, { message: '版本名称最大长度为256' })
    versionName?: string;

    @IsOptional()
    @ApiPropertyOptional({ description: '开始检测时间' })
    readonly startAt?: Date;

    @IsOptional()
    @ApiPropertyOptional({ description: '创建时间' })
    readonly createAt?: Date;

    @IsOptional()
    @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { message: '检测地址无效' })
    @MaxLength(2048, { message: '检测地址最大长度为2048' })
    @ApiPropertyOptional({ description: '检测地址' })
    url?: string;

    @IsOptional()
    @ApiPropertyOptional({ description: '检测得分' })
    readonly score?: number;

    @IsOptional()
    @ApiPropertyOptional({ description: '检测耗时，单位毫秒' })
    readonly duration?: number;

    @IsOptional()
    @ApiPropertyOptional({ description: '检测结果html文件的相对路径' })
    @MaxLength(256, { message: '检测结果html文件的相对路径最大长度为256' })
    readonly reportPath?: string;

    @IsOptional()
    @ApiPropertyOptional({
        description: '检测任务的状态 0 等待中, 1 检测中, 2 检测失败, 3 检测完成, 4 取消检测',
    })
    status?: number;

    @IsOptional()
    @ApiPropertyOptional({
        description: '检测失败的报错信息',
    })
    readonly failReason?: string;

    @IsOptional()
    @ApiPropertyOptional({
        description: '任务触发方式 0 系统触发, 1 用户手动触发, 2 补数据, 3 批量重试',
    })
    readonly triggerType?: number;

    @IsOptional()
    @ApiPropertyOptional({ description: '任务是否有效 0 无效, 1 有效' })
    readonly isUseful?: number;

    @IsOptional()
    @ApiPropertyOptional({ description: '结果的首屏图片预览' })
    readonly previewImg?: string;
}
