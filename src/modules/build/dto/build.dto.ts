import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class BuildDto {
    @ApiPropertyOptional({ description: '分支名' })
    @IsNotEmpty({ message: '分支名不能为空' })
    readonly branch: string;

    @ApiPropertyOptional({ description: '构建时长，毫秒' })
    @IsInt({ message: '构建时长必须是数字，单位毫秒' })
    readonly duration: number;

    @ApiPropertyOptional({ description: '构建后的文件大小，单位 KB' })
    @IsInt({ message: '构建后的文件大小必须是数字，单位 KB' })
    readonly fileSize: number;
}
