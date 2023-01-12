// 等待一段时间再执行
export function sleep(time: number | string) {
    return new Promise((resolve) => setTimeout(resolve, isNaN(+time) ? 0 : +time));
}
