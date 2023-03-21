declare module 'typing' {
    /**
     * 检测任务所需要的字段
     */
    export interface ITask {
        /** 项目id */
        projectId?: number;
        /** 项目名称  */
        projectName?: string;
        /** 待检测地址 */
        url?: string;
        /** 检测得分 */
        score?: string;
        /** 检测耗时 */
        duration?: number;
        /** 检测结果html文件路径 */
        reportUrl?: string;
        /** 检测任务是否有效 0 无效, 1 有效 */
        isUseful: number;
        /** 检测任务的状态 0 等待中, 1 检测中, 2 检测失败, 3 检测成功, 4 取消检测 */
        status: number;
    }

    /**
     * 检测记录性能详情所需要的字段
     */
    export interface IPerformance {
        /** 检测任务id */
        taskId?: number;
        /** 单项所占的权重 */
        weight: string;
        /** 单项名称 */
        name: string;
        /** 单项得分 */
        score: string;
        /** 单项耗时 */
        time: string;
    }
}
