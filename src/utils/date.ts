const moment = require('moment');
/**
 * 格式化日期
 * @param dateNum 时间
 */
export const formatDate = (dateNum?): string => {
    if (dateNum) {
        return moment(dateNum).format('YYYY-MM-DD HH:mm:ss');
    } else {
        return moment().format('YYYY-MM-DD HH:mm:ss');
    }
};
