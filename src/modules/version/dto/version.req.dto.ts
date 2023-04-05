import { ApiPropertyOptional } from '@nestjs/swagger';
import { QueryDto } from '@/modules/base.req.dto';

export class getVersionsReqDto extends QueryDto {
    @ApiPropertyOptional({ required: false, description: '项目id' })
    projectId: number;
}

export class getVersionReqDto extends QueryDto {
    @ApiPropertyOptional({ required: false, description: '版本id' })
    versionId: number;
}

export class devopsShiliReqDto {
    @ApiPropertyOptional({ required: false, description: 'devops项目id' })
    devopsProjectId: number;
}
