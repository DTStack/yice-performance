declare module 'dotenv/config';

declare module 'typing' {
    /**
     * 检测任务所需要的字段
     */
    export interface ITask {
        /** 任务id */
        taskId?: number;
        /** 项目id */
        projectId?: number;
        /** 项目名称  */
        projectName?: string;
        /** 版本 id */
        versionId?: string;
        /** 版本名称 */
        versionName?: string;
        /** 待检测地址 */
        url?: string;
        /** 检测得分 */
        score?: number;
        /** 检测耗时 */
        duration?: number;
        /** 检测结果html文件路径 */
        reportPath?: string;
        /** 检测任务是否有效 0 无效, 1 有效 */
        isUseful: number;
        /** 结果的首屏图片预览 */
        previewImg: string;
        /** 检测任务的状态 0 等待中, 1 检测中, 2 检测失败, 3 检测完成, 4 取消检测 */
        status: number;
    }

    /**
     * 检测记录性能详情所需要的字段
     */
    export interface IPerformance {
        /** 检测任务id */
        taskId?: number;
        /** 单项所占的权重 */
        weight: number;
        /** 单项名称 */
        name: string;
        /** 单项得分 */
        score: number;
        /** 单项耗时 */
        duration: number;
    }

    /**
     * 补数据的入参
     */
    export interface IPatchDataBody {
        /** 项目id */
        projectId: number;
        /** 版本id集合 */
        versionIds: number[];
        /** 补数据次数 */
        time: number;
        /** 已冻结的版本是否补数据 */
        includeIsFreeze: boolean;
    }

    /** 子产品性能评分趋势接口结果 */
    export interface IProjectChartData {
        taskList: IProjectChartSeries[];
        versionNameList: string[];
        maxLength: number;
    }
    export interface IProjectChartDataList {
        projectId: number;
        name: string;
        projectChartData: IProjectChartData;
    }
}
