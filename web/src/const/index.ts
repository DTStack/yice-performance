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

/**
 * 得分的颜色
 * 慢 red #FF3333 0 ~ 49
 * 平均值 orange #FFAA33 50 ~ 89
 * 快 green #00CC66 90 ~ 100
 */
const scoreColor = {
    orangeMin: 50,
    greenMin: 90,
};

export const getScoreColor = (score: string | number) => {
    if (score >= scoreColor.greenMin) {
        return 'green';
    } else if (score >= scoreColor.orangeMin) {
        return 'orange';
    }
    return 'red';
};
