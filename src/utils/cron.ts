import { HttpException, HttpStatus } from '@nestjs/common';

import { formatDate } from './date';
const cronParser = require('cron-parser');

/**
 * 根据 cron 表达式预览最近的 n 个计划周期
 * @param cron
 */
export const previewCron = (cron: string, n = 20): string[] => {
    const result = [];
    try {
        const interval = cronParser.parseExpression(cron);
        for (let i = 0; i < n; i++) {
            result.push(formatDate(new Date(interval.next().toString())));
        }
    } catch (err) {
        throw new HttpException(err.message, HttpStatus.OK);
    }
    return result;
};

// 判断是否秒级调度
export const isSecond = (cron: string) => {
    const [currentDate, nextDate] = previewCron(cron, 2);
    const current = currentDate?.split(':') || [];
    const next = nextDate?.split(':') || [];

    return current[0] === next[0] && current[1] === next[1] && current[2] !== next[2];
};

// 判断当前时间是否和 cron 匹配
export const canCreateTask = (currentDate, cron: string): boolean => {
    let cronDate = '';
    try {
        const interval = cronParser.parseExpression(cron);
        cronDate = formatDate(new Date(interval.prev().toString()));
    } catch (err) {
        console.error('Error: ' + err.message);
    }
    return currentDate === cronDate;
};
