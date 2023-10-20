import moment from 'moment';

const todayStart = () => moment().set({ hour: 0, minute: 0, second: 0 });
const todayEnd = () => moment().set({ hour: 23, minute: 59, second: 59 });

export const todayRange: any = [todayStart(), todayEnd()];
export const lastDayRange: any = [todayStart().subtract(1, 'days'), todayEnd().subtract(1, 'days')];
export const last7DaysRange: any = [todayStart().subtract(6, 'days'), todayEnd()];
export const last30DaysRange: any = [todayStart().subtract(29, 'days'), todayEnd()];

export const disabledDate = (current: any) => {
    return current?.valueOf() > moment().subtract(0, 'days').valueOf();
};

export const parseTime = (time: any) => (time ? moment(time) : undefined);

export const formatTime = (mo: moment.Moment, isEnd?: boolean) => {
    if (!mo) return;
    return isEnd
        ? mo.set({ hour: 23, minute: 59, second: 59 }).format('YYYY-MM-DD HH:mm:ss')
        : mo.set({ hour: 0, minute: 0, second: 0 }).format('YYYY-MM-DD HH:mm:ss');
};

export const durationTime = (duration: number) => {
    const _duration = moment.duration(duration);
    const hours = Math.floor(_duration.asHours());
    const minute = Math.floor(_duration.asMinutes());
    const second = Math.ceil(_duration.asSeconds() % 60);

    if (hours > 0) {
        return `${hours}h${minute}m${second}s`;
    } else if (hours <= 0 && minute > 0) {
        return `${minute}m${second}s`;
    } else if (hours <= 0 && minute <= 0 && second >= 0) {
        return `${second}s`;
    }
};
