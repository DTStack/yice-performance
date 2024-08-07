export enum TASK_STATUS {
    WAITING,
    RUNNING,
    FAIL,
    SUCCESS,
    CANCEL,
}
export const TASK_STATUS_TEXT = [
    { text: '等待中', value: TASK_STATUS.WAITING },
    { text: '检测中', value: TASK_STATUS.RUNNING },
    { text: '检测失败', value: TASK_STATUS.FAIL },
    { text: '检测完成', value: TASK_STATUS.SUCCESS },
    { text: '取消检测', value: TASK_STATUS.CANCEL },
];

export enum TASK_TRIGGER_TYPE {
    SYSTEM,
    USER_HAND,
    PATCH_DATA,
    BATCH_RETRY,
}
export const TASK_TRIGGER_TYPE_TEXT = [
    { text: '系统触发', value: TASK_TRIGGER_TYPE.SYSTEM },
    { text: '手动触发', value: TASK_TRIGGER_TYPE.USER_HAND },
    { text: '补数据', value: TASK_TRIGGER_TYPE.PATCH_DATA },
    { text: '批量重试', value: TASK_TRIGGER_TYPE.BATCH_RETRY },
];

export enum IS_USEFUL {
    INVALID,
    EFFECTIVE,
}
export const IS_USEFUL_TEXT = [
    { text: '无效', value: IS_USEFUL.INVALID },
    { text: '有效', value: IS_USEFUL.EFFECTIVE },
];

/**
 * 得分的颜色
 * 分数较低 red #FF3333
 * 分数中等 orange #FFAA33
 * 分数较高 green #00CC66
 */
const scoreColor = {
    orangeMin: 50,
    greenMin: 90,
};

export const getScoreColor = (score: number) => {
    if (score >= scoreColor.greenMin) {
        return 'green';
    } else if (score >= scoreColor.orangeMin) {
        return 'orange';
    }
    return 'red';
};
