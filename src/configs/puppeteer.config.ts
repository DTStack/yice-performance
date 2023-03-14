// https://blog.csdn.net/qq_43382853/article/details/103688551

const getPuppeteerConfig = (PORT: number) => {
    return {
        args: [`--remote-debugging-port=${PORT}`],
        headless: process.env.NODE_ENV !== 'production', // 是否允许无头浏览器
        defaultViewport: { width: 1440, height: 960 }, // 指定打开页面的宽高
        slowMo: 30, // 使 Puppeteer 操作减速，可以观察到 Puppeteer 的操作
    };
};

export { getPuppeteerConfig };
