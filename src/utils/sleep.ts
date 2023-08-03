/**
 * 等待一段时间再执行
 * @param time 时长，ms
 */
export function sleep(time: number | string) {
    return new Promise((resolve) => setTimeout(resolve, isNaN(+time) ? 0 : +time));
}
