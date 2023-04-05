/** 任务状态 */
export enum TASK_STATUS {
    WAITING,
    RUNNING,
    FAIL,
    SUCCESS,
    CANCEL,
}

/** 任务触发方式 0 系统触发, 1 用户手动触发 */
export enum TASK_TRIGGER_TYPE {
    SYSTEM,
    USER,
}
