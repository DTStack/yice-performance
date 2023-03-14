/**
 * 获取本地图
 * @param fileName // 文件名 如 doc.png
 * @returns {*|string}
 */
export function getImgUrl(fileName: string) {
    return new URL(`/src/assets/logo/${fileName}`, import.meta.url).href;
}

/**
 * 以 http(s) 开头的检测地址
 */
export const httpPattern =
    /^(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;
