const moment = require('moment');
/**
 * 格式化日期
 * @param dateNum 时间
 * @param isDue 是否显示时分秒
 */
export const formatDate = (dateNum?: string | number): string => {
    if (dateNum) {
        return moment(dateNum).format('YYYY-MM-DD HH:mm:ss');
    } else {
        return moment().format('YYYY-MM-DD HH:mm:ss');
    }
};
