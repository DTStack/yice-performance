import { ApiPropertyOptional } from '@nestjs/swagger';

export class getShiLisReqDto {
    @ApiPropertyOptional({ required: false, description: 'devops项目id' })
    devopsProjectId: number;
}

export class getStagesReqDto {
    @ApiPropertyOptional({ required: false, description: 'devops实例id' })
    shiliId: number;
}

export class getHistoriesReqDto {
    @ApiPropertyOptional({ required: false, description: 'devops实例id' })
    shiliId: number;

    @ApiPropertyOptional({ required: false, description: 'devops阶段id' })
    stageId: number;
}

export class getHistoryReqDto {
    @ApiPropertyOptional({ required: false, description: 'devops运行历史记录id' })
    historyId: number;
}
