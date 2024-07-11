import { ApiPropertyOptional } from '@nestjs/swagger';

export class getBuildsReqDto {
    @ApiPropertyOptional({ required: false, description: '项目id' })
    projectId: number;
}
