// https://github.com/GoogleChrome/lighthouse/blob/main/core/config/desktop-config.js

const chromeLauncherOptions = {
    chromeFlags: process.env.USE_HEADLESS !== 'yes' ? ['--headless', '--no-sandbox'] : [], // --headless 表示不打开窗口
    logLevel: 'error',
};

const getLhOptions = (PORT: number) => {
    return {
        port: PORT,
        logLevel: 'error',
        output: 'html',
        onlyCategories: ['performance'], // 仅采集 performance 数据
        disableStorageReset: true, // 禁止在运行前清除浏览器缓存和其他存储 API
    };
};

const lhConfig = {
    extends: 'lighthouse:default',
    settings: {
        onlyCategories: ['performance'],
        // onlyAudits: ['first-meaningful-paint', 'speed-index', 'interactive'],
        formFactor: 'desktop',
        throttling: {
            rttMs: 80, // 网络延迟，单位 ms
            throughputKbps: 10 * 1024,
            cpuSlowdownMultiplier: 1,
            requestLatencyMs: 0, // 0 means unset
            downloadThroughputKbps: 0,
            uploadThroughputKbps: 0,
        },
        screenEmulation: {
            mobile: false,
            width: 1440,
            height: 960,
            deviceScaleFactor: 1,
            disabled: false,
        },
        emulatedUserAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4695.0 Safari/537.36 Chrome-Lighthouse',
    },
};

export { chromeLauncherOptions, getLhOptions, lhConfig };
