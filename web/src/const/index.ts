export enum TASK_STATUS {
    WAITING,
    RUNNING,
    FAIL,
    SUCCESS,
    SET_FAIL,
}

export const TASK_STATUS_TEXT = [
    { text: '等待中', value: TASK_STATUS.WAITING },
    { text: '检测中', value: TASK_STATUS.RUNNING },
    { text: '检测失败', value: TASK_STATUS.FAIL },
    { text: '检测成功', value: TASK_STATUS.SUCCESS },
    { text: '手动置失败', value: TASK_STATUS.SET_FAIL },
];
