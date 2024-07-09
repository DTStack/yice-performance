// https://github.com/GoogleChrome/lighthouse/blob/v9.6.8/docs/configuration.md

const getLhOptions = (PORT: number) => {
    return {
        port: PORT,
        logLevel: 'error',
        output: 'html',
        onlyCategories: ['performance'], // 仅采集 performance 数据
        disableStorageReset: true, // 禁止在运行前清除浏览器缓存和其他存储 API
    };
};

const getLhConfig = ({ locale }) => {
    return {
        extends: 'lighthouse:default',
        // https://github.com/GoogleChrome/lighthouse/blob/575e29b8b6634bfb280bc820efea6795f3dd9017/types/externs.d.ts#L141-L186
        settings: {
            locale: locale || 'en', //  国际化
            onlyCategories: ['performance'],
            // onlyAudits: ['first-contentful-paint'],
            formFactor: 'desktop',
            throttling: {
                rttMs: 0, // 网络延迟，单位 ms
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
            skipAudits: ['uses-http2'], // 跳过的检查
            emulatedUserAgent:
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4695.0 Safari/537.36 Chrome-Lighthouse',
        },
    };
};

export { getLhConfig, getLhOptions };
