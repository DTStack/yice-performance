import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class BuildDto {
    @ApiPropertyOptional({ description: '构建信息id' })
    readonly buildId: number;

    @ApiPropertyOptional({ description: '项目id' })
    readonly projectId: number;

    @ApiPropertyOptional({ description: '仓库名' })
    @IsNotEmpty({ message: '仓库名不能为空' })
    readonly repository?: string;

    @ApiPropertyOptional({ description: '分支名' })
    @IsNotEmpty({ message: '分支名不能为空' })
    readonly branch?: string;

    @ApiPropertyOptional({ description: '版本号' })
    readonly version?: string;

    @ApiPropertyOptional({ description: '构建时长，毫秒' })
    @IsNotEmpty({ message: '构建时长不能为空，毫秒' })
    @IsInt({ message: '构建时长必须是数字，单位毫秒' })
    readonly duration?: number;

    @ApiPropertyOptional({ description: '构建后的文件大小，单位 KB' })
    @IsNotEmpty({ message: '构建后的文件大小不能为空，单位 KB' })
    @IsInt({ message: '构建后的文件大小必须是数字，单位 KB' })
    readonly fileSize?: number;

    @IsOptional()
    @ApiPropertyOptional({ description: '创建时间' })
    readonly createAt?: Date;
}
