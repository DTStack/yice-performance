// https://github.com/GoogleChrome/lighthouse/blob/main/core/config/desktop-config.js
module.exports = {
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
            width: 1350,
            height: 940,
            deviceScaleFactor: 1,
            disabled: false,
        },
        emulatedUserAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4695.0 Safari/537.36 Chrome-Lighthouse',
    },
};
