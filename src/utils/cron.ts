import { formatDate } from './date';
const cronParser = require('cron-parser');

/**
 * 根据 cron 表达式预览接下来的十个计划周期
 * @param cron
 */
export const previewCron = (cron: string): string[] => {
    const result = [];
    try {
        const interval = cronParser.parseExpression(cron);
        for (let i = 0; i < 10; i++) {
            result.push(formatDate(new Date(interval.next().toString())));
        }
    } catch (err) {
        console.log('Error: ' + err.message);
    }
    return result;
};

// 判断当前时间是否和 cron 匹配
export const canCreateTask = (currentDate, cron: string): boolean => {
    let cronDate = '';
    try {
        const interval = cronParser.parseExpression(cron);
        cronDate = formatDate(new Date(interval.prev().toString()));
    } catch (err) {
        console.log('Error: ' + err.message);
    }
    return currentDate === cronDate;
};
