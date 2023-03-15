import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUrl, MaxLength } from 'class-validator';

export class TaskDto {
    @ApiPropertyOptional({ description: '任务id' })
    readonly taskId?: number;

    @IsOptional()
    @ApiPropertyOptional({ description: '项目id' })
    readonly projectId?: number;

    @IsOptional()
    @ApiPropertyOptional({ description: '项目名称' })
    projectName?: string;

    @IsOptional()
    @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { message: '检测地址无效' })
    @MaxLength(1024, { message: '最大长度为1024' })
    @ApiPropertyOptional({ description: '检测地址' })
    url?: string;

    @IsOptional()
    @ApiPropertyOptional({ description: '检测得分' })
    readonly score?: string;

    @IsOptional()
    @ApiPropertyOptional({ description: '检测时长，毫秒' })
    readonly duration?: number;

    @IsOptional()
    @ApiPropertyOptional({ description: '检测结果html文件路径' })
    readonly reportUrl?: string;

    @IsOptional()
    @ApiPropertyOptional({ description: '任务是否有效 0 无效, 1 有效' })
    readonly isUseful?: number;

    @IsOptional()
    @ApiPropertyOptional({
        description: '检测任务的状态 0 等待中, 1 检测中, 2 检测失败, 3 检测成功, 4 手动置失败',
    })
    status?: number;

    @IsOptional()
    @ApiPropertyOptional({
        description: '检测失败的报错信息',
    })
    failReason?: string;
}
