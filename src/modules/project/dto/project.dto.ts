import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class ProjectDto {
    @ApiPropertyOptional({ description: '项目id' })
    readonly projectId: number;

    @ApiPropertyOptional({ description: 'devops项目id' })
    readonly devopsProjectIds: string;

    @IsNotEmpty({ message: '项目名称不能为空' })
    @ApiPropertyOptional({ description: '项目名称' })
    @MaxLength(64, { message: '项目名称最大长度为64' })
    readonly name: string;

    @IsOptional()
    @ApiPropertyOptional({ description: '项目路径/标识' })
    @MaxLength(64, { message: '项目路径/标识最大长度为64' })
    readonly appName?: string;

    @IsOptional()
    @ApiPropertyOptional({ description: '子产品相关人员邮箱，用于接收数据周报邮件' })
    @MaxLength(256, { message: '邮箱地址最大长度为64' })
    readonly emails?: string;
}
