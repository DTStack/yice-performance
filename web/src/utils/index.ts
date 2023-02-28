/**
 * 获取本地图
 * @param fileName // 文件名 如 doc.png
 * @returns {*|string}
 */
export function getImgUrl(fileName: string) {
    return new URL(`/src/assets/menu-icon/${fileName}`, import.meta.url).href;
}
