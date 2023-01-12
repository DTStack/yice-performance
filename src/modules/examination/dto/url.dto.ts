import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class UrlDto {
    @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { message: '页面地址无效' })
    @IsNotEmpty({ message: '页面地址不能为空' })
    @ApiPropertyOptional({ description: '页面地址' })
    url: string;

    @IsOptional()
    @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { message: '页面地址无效' })
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
