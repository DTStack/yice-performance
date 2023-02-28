import { Injectable } from '@nestjs/common';
import { chromeLauncherOptions, getLhOptions, lhConfig } from '@/configs/lighthouse.config';
import { getPuppeteerConfig } from '@/configs/puppeteer.config';
import { UrlDto } from '../dto/url.dto';
import { sleep } from '@/utils';
const fs = require('fs');
const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');
const chromeLauncher = require('chrome-launcher');

// puppeteer 和 lighthouse 公用该端口
const PORT = 8041;

@Injectable()
export class ExaminationService {
    // 登录
    async toLogin(page, urlDto: UrlDto) {
        const { loginUrl, username, password } = urlDto;
        await page.goto(loginUrl);
        // 等待指定的选择器匹配元素出现在页面中
        await page.waitForSelector('#username', { visible: true });

        // 用户名、密码、验证码
        const usernameInput = await page.$('#username');
        await usernameInput.type(username);
        const passwordInput = await page.$('#password');
        await passwordInput.type(password);
        const codeInput = await page.$('.c-login__container__form__code__input');
        await codeInput.type('bz4x');

        // 登录按钮
        await page.click('.c-login__container__form__btn');
        // await page.waitForNavigation();
        await sleep(process.env.RESPONSE_SLEEP);

        /**
         * TODO 开了验证码，账号密码错误，不弹出选择租户
         */
        // 若跳转之后仍在登录页，说明登录出错
        const currentUrl = await page.url();
        if (currentUrl.includes('login')) {
            await page.waitForSelector('.ant-message-custom-content > span');
            // 获取错误信息内容
            const errorText = await page.$eval('.ant-message-custom-content > span', (el) =>
                el.textContent.trim()
            );
            // 抛出错误信息
            console.log('登录失败', errorText);
            throw errorText;
        } else {
            console.log(`登录成功`);
        }
    }

    // 选择租户
    async changeTenant(page) {
        // 等待指定的选择器匹配元素出现在页面中
        await page.waitForSelector('#change_ten_id', { visible: true });

        // 用户名、密码、验证码
        await page.click('.ant-select-selection--single');
        const tenantInput = await page.$('input#change_ten_id');
        await tenantInput.type('demo');

        // 搜索到的租户，点击第一条
        await sleep(process.env.RESPONSE_SLEEP);
        await page.click('li.ant-select-dropdown-menu-item');

        // 确定按钮
        await page.click('button.ant-btn-lg');
    }

    // 需要登录的页面检测
    async withLogin(urlDto: UrlDto) {
        const { url } = urlDto;
        // 创建 puppeteer 无头浏览器
        const browser = await puppeteer.launch(getPuppeteerConfig(PORT));
        const page = await browser.newPage();

        let runResult;
        try {
            // 登录
            await this.toLogin(page, urlDto);
            // 选择租户
            await this.changeTenant(page);

            console.log('开始检测');
            runResult = await lighthouse(url, getLhOptions(PORT), lhConfig);
            console.log('检测完成');
        } catch (error) {
            console.log('检测失败', error);
            throw error;
        } finally {
            await page.close();
            await browser.close();
        }

        return runResult;
    }

    // 不需要登录的页面检测
    async withOutLogin(url: string) {
        let chrome, runResult;
        try {
            console.log('开始检测');
            chrome = await chromeLauncher.launch(chromeLauncherOptions);
            runResult = await lighthouse(url, getLhOptions(chrome.port), lhConfig);
            console.log('检测完成');
        } catch (error) {
            console.log('检测失败', error);
            throw error;
        } finally {
            await chrome.kill();
        }

        return runResult;
    }

    // 开始检测
    async run(urlDto: UrlDto): Promise<object> {
        const start = new Date().getTime();
        try {
            const { url, loginUrl } = urlDto;
            // 依据是否包含 devops 来判断是否需要登录
            const needLogin = url.includes('devops') || loginUrl;
            console.log(`本次检测${needLogin ? '' : '不'}需要登录`, url);

            const runResult = needLogin
                ? await this.withLogin(urlDto)
                : await this.withOutLogin(url);

            // 保存检测结果文件，便于预览
            const urlStr = url.replace(/http(s?):\/\//g, '').replace(/\//g, '');
            const resultPath = `./static/${urlStr}-report.html`;
            fs.writeFileSync(resultPath, runResult?.report);

            // 性能数据
            const audits = runResult?.lhr?.audits || {};
            const auditRefs =
                runResult?.lhr?.categories?.performance?.auditRefs?.filter((item) => item.weight) ||
                [];
            const { score = 0 } = runResult?.lhr?.categories?.performance || {};
            const duration = (new Date().getTime() - start).toFixed(2);
            const data = {
                score,
                duration,
                resultPath,
                performance: [],
            };
            for (const auditRef of auditRefs) {
                const { weight, acronym } = auditRef;
                const { score, numericValue } = audits[auditRef.id] || {};
                data.performance.push({
                    weight,
                    name: acronym,
                    score,
                    time: Math.round(numericValue * 100) / 100,
                });
            }

            console.log(data);
            console.log(`本次检测耗时：${duration}ms`);

            return {
                code: 200,
                data,
            };
        } catch (error) {
            return {
                code: 401,
                message: error,
            };
        }
    }
}
