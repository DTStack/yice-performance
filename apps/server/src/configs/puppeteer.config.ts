// https://blog.csdn.net/qq_43382853/article/details/103688551

const getPuppeteerConfig = (PORT: number) => {
    return {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            `--remote-debugging-port=${PORT}`,
            '--window-size=1440,960',
        ],
        headless: process.env.USE_HEADLESS === 'yes' ? false : 'new', // 是否使用无头浏览器
        slowMo: 10, // 使 Puppeteer 操作减速，可以观察到 Puppeteer 的操作
    };
};

export { getPuppeteerConfig };
