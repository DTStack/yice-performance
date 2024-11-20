import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl, MaxLength } from 'class-validator';

export class VersionDto {
    @ApiPropertyOptional({ description: '版本id' })
    versionId: number;

    @ApiPropertyOptional({ description: '项目id' })
    @IsNotEmpty({ message: '项目id不能为空' })
    readonly projectId: number;

    @ApiPropertyOptional({ description: '绑定的devops实例id' })
    readonly devopsShiLiId?: number;

    @ApiPropertyOptional({ description: '版本名称' })
    @MaxLength(64, { message: '版本名称最大长度为64' })
    readonly name: string;

    // eslint-disable-next-line camelcase
    @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { message: '检测地址无效' })
    @IsNotEmpty({ message: '检测地址不能为空' })
    @ApiPropertyOptional({ description: '检测地址' })
    @MaxLength(2048, { message: '检测地址最大长度为2048' })
    readonly url: string;

    // @IsUrl(
    //     { protocols: ['http', 'https'], require_protocol: true },
    //     { message: '登录页面地址无效' }
    // )
    @ApiPropertyOptional({ description: '登录页面地址，可选' })
    // @MaxLength(2048, { message: '登录页面地址最大长度为2048' })
    readonly loginUrl: string;

    // @IsNotEmpty({ message: '用户名不能为空' })
    @ApiPropertyOptional({ description: '用户名' })
    readonly username: string;

    // @IsNotEmpty({ message: '密码不能为空' })
    @ApiPropertyOptional({ description: '密码' })
    readonly password: string;

    @ApiPropertyOptional({ description: '版本的cron表达式' })
    readonly cron?: string;

    @ApiPropertyOptional({ description: '排序序号' })
    readonly sort?: number;

    @ApiPropertyOptional({ description: '备注' })
    readonly note?: string;
}
