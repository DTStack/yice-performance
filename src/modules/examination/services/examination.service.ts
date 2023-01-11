import { Injectable } from '@nestjs/common';
const fs = require('fs');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

const config = require('../../../configs/lighthouse.config');

@Injectable()
export class ExaminationService {
    async run(urlDto): Promise<string> {
        const { url } = urlDto;
        console.log('开始性能检测', url);
        const start = new Date().getTime();
        const chrome = await chromeLauncher.launch({
            // --headless 表示不打开窗口
            chromeFlags: ['--headless'],
            logLevel: 'error',
        });
        const options = {
            logLevel: 'error',
            output: 'html',
            onlyCategories: ['performance'],
            port: chrome.port,
        };

        const runResult = await lighthouse(url, options, config);
        await chrome.kill();

        const urlStr = url.replace(/http(s?):\/\//g, '').replace(/\//g, '');
        fs.mkdirSync(`./static/${urlStr}`);
        fs.writeFileSync(`./static/${urlStr}/report.html`, runResult.report);
        console.log(runResult?.lhr?.categories?.performance);

        return `耗时：${((new Date().getTime() - start) / 1000).toFixed(2)}s`;
    }
}
