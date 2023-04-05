import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUrl, MaxLength } from 'class-validator';

export class TaskDto {
    @ApiPropertyOptional({ description: '任务id' })
    readonly taskId?: number;

    @IsOptional()
    @ApiPropertyOptional({ description: '版本id' })
    readonly versionId?: number;

    @IsOptional()
    @MaxLength(256, { message: '最大长度为256' })
    @ApiPropertyOptional({ description: '版本名称' })
    versionName?: string;

    @IsOptional()
    @ApiPropertyOptional({ description: '检测开始的时间戳' })
    readonly start?: number;

    @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { message: '检测地址无效' })
    @MaxLength(2048, { message: '最大长度为2048' })
    @ApiPropertyOptional({ description: '检测地址' })
    url?: string;

    @IsOptional()
    @ApiPropertyOptional({ description: '检测得分' })
    readonly score?: number;

    @IsOptional()
    @ApiPropertyOptional({ description: '检测耗时，单位毫秒' })
    readonly duration?: number;

    @IsOptional()
    @MaxLength(256, { message: '最大长度为256' })
    @ApiPropertyOptional({ description: '检测结果html文件的相对路径' })
    readonly reportUrl?: string;

    @IsOptional()
    @ApiPropertyOptional({
        description: '检测任务的状态 0 等待中, 1 检测中, 2 检测失败, 3 检测成功, 4 取消检测',
    })
    status?: number;

    @IsOptional()
    @ApiPropertyOptional({
        description: '检测失败的报错信息',
    })
    readonly failReason?: string;

    @IsOptional()
    @ApiPropertyOptional({ description: '任务触发方式 0 系统触发, 1 用户手动触发' })
    readonly triggerType?: number;

    @IsOptional()
    @ApiPropertyOptional({ description: '任务是否有效 0 无效, 1 有效' })
    readonly isUseful?: number;
}
