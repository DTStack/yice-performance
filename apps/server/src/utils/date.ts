const moment = require('moment');
/**
 * 格式化日期
 * @param dateNum 时间
 */
export const formatDate = (dateNum?, output = 'YYYY-MM-DD HH:mm:ss'): string => {
    if (dateNum) {
        return moment(dateNum).format(output);
    } else {
        return moment().format(output);
    }
};

const todayStart = () => moment().set({ hour: 0, minute: 0, second: 0 });

export const formatTime = (mo, isEnd?: boolean, output = 'YYYY-MM-DD HH:mm:ss') => {
    if (!mo) return;
    return isEnd
        ? mo.set({ hour: 23, minute: 59, second: 59 }).format(output)
        : mo.set({ hour: 0, minute: 0, second: 0 }).format(output);
};

// 近七天
export const getLastWeekRange = () => {
    return [
        formatTime(todayStart().subtract(6, 'days')),
        formatTime(todayStart().subtract(0, 'days'), true),
        formatTime(todayStart().subtract(6, 'days'), false, 'MM-DD'),
        formatTime(todayStart().subtract(0, 'days'), true, 'MM-DD'),
    ];
};
// 近 30 天
export const getLastMonthRange = () => {
    return [
        formatTime(todayStart().subtract(29, 'days')),
        formatTime(todayStart().subtract(0, 'days'), true),
        formatTime(todayStart().subtract(29, 'days'), false, 'MM-DD'),
        formatTime(todayStart().subtract(0, 'days'), true, 'MM-DD'),
    ];
};
