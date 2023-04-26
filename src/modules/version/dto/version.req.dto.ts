import { ApiPropertyOptional } from '@nestjs/swagger';
import { QueryDto } from '@/modules/base.req.dto';

export class getVersionsReqDto extends QueryDto {
    @ApiPropertyOptional({ required: false, description: '项目id' })
    projectId: number;
}

export class getVersionReqDto extends QueryDto {
    @ApiPropertyOptional({ required: false, description: '版本id' })
    versionId: number;
    @ApiPropertyOptional({ required: false, description: '绑定的devops实例id' })
    devopsShiLiId?: number;
    @ApiPropertyOptional({ required: false, description: '项目id' })
    projectId?: number;
    @ApiPropertyOptional({ required: false, description: '版本名称' })
    name?: string;
}
