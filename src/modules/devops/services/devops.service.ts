import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
// import { catchError, pluck, throwError } from 'rxjs';
import { getHistoriesReqDto } from '../dto/devops.req.dto';

@Injectable()
export class DevopsService {
    constructor(private readonly httpService: HttpService) {}

    async axiosGet(url: string) {
        const res: any = await this.httpService.axiosRef.get(url, {
            headers: { Cookie: 'dtstack=test' },
        });
        return res?.data?.data;
    }

    /** 获取项目下的实例列表 */
    async getShiLis(devopsProjectId: number) {
        const res = await this.axiosGet(
            `http://devops.dtstack.cn/api/v1/workflowruns?project_id=${devopsProjectId}&page=1&limit=20&state=running`
        );
        return res?.list || [];
    }

    /** 获取实例下的阶段列表 */
    async getStages(shiliId: number) {
        const res = await this.axiosGet(`http://devops.dtstack.cn/api/v1/workflowruns/${shiliId}`);
        return res?.stages || [];
    }

    /** 获取实例下的运行记录列表 */
    async getHistories(query: getHistoriesReqDto) {
        const { shiliId, stageId } = query;
        const res = await this.axiosGet(
            `http://devops.dtstack.cn/api/v1/stageruns?workflowrun_id=${shiliId}&stage=${stageId}&filter=success&limit=5&page=1`
        );
        return res?.list || [];
    }

    /** 实例下单条运行记录的详情 */
    async getHistory(historyId: number) {
        const { renderedContent = '' } = await this.axiosGet(
            `http://devops.dtstack.cn/api/v1/stageruns/${historyId}`
        );
        const [portalfront, str] =
            renderedContent
                ?.split('*****************************************')?.[0]
                ?.split('\nportalfront:')?.[1]
                ?.split('\nportalfront-doraemon:') || '';
        const uicfront = str.split('uicfront:')?.[1]?.replace(/\n/g, '');

        return { portalfront, uicfront };
    }
}
