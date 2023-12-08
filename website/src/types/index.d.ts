declare module 'typing' {
    /** 项目字段 */
    export interface IProject {
        projectId: number;
        devopsProjectIds?: string;
        name: string;
        appName?: string;
    }

    /** 版本字段 */
    export interface IVersion {
        versionId: number;
        projectId: number;
        name: string;
        url: string;
        loginUrl?: string;
        username?: string;
        password?: string;
        isDefault: boolean;
        cron?: string;
        isFreeze?: number;
        note?: string;
    }

    /** 任务字段 */
    export interface ITask {
        taskId: number;
        versionId?: number;
        versionName: string;
        url?: string;
        startAt?: Date;
        createAt?: Date;
        duration?: number;
        score?: number;
        reportPath?: string;
        status: number;
        triggerType: number;
        failReason?: string;
        isUseful: number;
        previewImg?: string;
    }

    /** 性能字段 */
    export interface IPerformance {
        performanceId: number;
        taskId: number;
        weight: number;
        name?: string;
        score?: number;
        duration?: number;
    }
}
