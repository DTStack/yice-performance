import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl, MaxLength } from 'class-validator';

export class VersionDto {
    @ApiPropertyOptional({ description: '版本id' })
    readonly versionId: number;

    @ApiPropertyOptional({ description: '项目id' })
    readonly projectId: number;

    @MaxLength(256, { message: '最大长度为256' })
    @ApiPropertyOptional({ description: '版本名称' })
    readonly name: string;

    @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { message: '检测地址无效' })
    @IsNotEmpty({ message: '检测地址不能为空' })
    @MaxLength(2048, { message: '最大长度为2048' })
    @ApiPropertyOptional({ description: '检测地址' })
    readonly url: string;

    @IsUrl(
        { protocols: ['http', 'https'], require_protocol: true },
        { message: '登录页面地址无效' }
    )
    @MaxLength(2048, { message: '最大长度为2048' })
    @ApiPropertyOptional({ description: '登录页面地址，可选' })
    readonly loginUrl: string;

    @IsNotEmpty({ message: '用户名不能为空' })
    @ApiPropertyOptional({ description: '用户名' })
    readonly username: string;

    @IsNotEmpty({ message: '密码不能为空' })
    @ApiPropertyOptional({ description: '密码' })
    readonly password: string;
}
