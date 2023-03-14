import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class ProjectDto {
    @ApiPropertyOptional({ description: '项目id' })
    readonly projectId: number;

    @IsOptional()
    @IsNotEmpty({ message: '项目名称不能为空' })
    @ApiPropertyOptional({ description: '项目名称' })
    @MaxLength(256, { message: '最大长度为256' })
    readonly name: string;

    @IsOptional()
    @ApiPropertyOptional({ description: 'logo图片名称' })
    @MaxLength(256, { message: '最大长度为256' })
    readonly logo?: string;

    @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { message: '检测地址无效' })
    @IsNotEmpty({ message: '检测地址不能为空' })
    @MaxLength(1024, { message: '最大长度为1024' })
    @ApiPropertyOptional({ description: '检测地址' })
    url: string;

    @IsOptional()
    @IsUrl(
        { protocols: ['http', 'https'], require_protocol: true },
        { message: '登录页面地址无效' }
    )
    @MaxLength(1024, { message: '最大长度为1024' })
    @ApiPropertyOptional({ description: '登录页面地址，可选' })
    loginUrl: string;

    @IsOptional()
    @IsNotEmpty({ message: '用户名不能为空' })
    @ApiPropertyOptional({ description: '用户名' })
    username: string;

    @IsOptional()
    @IsNotEmpty({ message: '密码不能为空' })
    @ApiPropertyOptional({ description: '密码' })
    password: string;
}
