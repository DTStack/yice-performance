import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class ProjectDto {
    @ApiPropertyOptional({ description: '项目id' })
    readonly projectId: number;

    @ApiPropertyOptional({ description: 'devops项目id' })
    readonly devopsProjectId: number;

    @IsNotEmpty({ message: '项目名称不能为空' })
    @ApiPropertyOptional({ description: '项目名称' })
    @MaxLength(256, { message: '最大长度为256' })
    readonly name: string;

    @IsOptional()
    @ApiPropertyOptional({ description: '项目路径/标识' })
    @MaxLength(256, { message: '最大长度为256' })
    readonly appName?: string;
}
