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
