/**
 * 任务运行相关方法
 */
import { chromeLauncherOptions, getLhOptions, lhConfig } from '@/configs/lighthouse.config';
import { getPuppeteerConfig } from '@/configs/puppeteer.config';
import { sleep } from './sleep';
const fs = require('fs');
const moment = require('moment');
const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');
const chromeLauncher = require('chrome-launcher');

// puppeteer 和 lighthouse 公用该端口
const PORT = 8041;

interface IRunInfo {
    taskId?: number;
    url: string;
    loginUrl?: string;
    username?: string;
    password?: string;
}

// 登录
const toLogin = async (page, runInfo: IRunInfo) => {
    const { loginUrl, username, password, taskId } = runInfo;
    try {
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
            console.log(`taskId: ${taskId}, 登录失败`, errorText);
            throw errorText;
        } else {
            console.log(`taskId: ${taskId}, 登录成功`);
        }
    } catch (error) {
        console.log(`taskId: ${taskId}, 登录出错`, error);
        throw error;
    }
};

// 选择租户
const changeTenant = async (page, taskId) => {
    try {
        // 等待指定的选择器匹配元素出现在页面中
        await page.waitForSelector('#change_ten_id', { visible: true });

        // 租户
        await page.click('.ant-select');
        const tenantInput = await page.$('input#change_ten_id');
        await tenantInput.type('demo');

        // 搜索到的租户，点击查询到的第一条租户信息
        await sleep(process.env.RESPONSE_SLEEP);
        // v5.3.x
        try {
            await page.click('li.ant-select-dropdown-menu-item');
        } catch (error) {
            console.log(`taskId: ${taskId}, 这不是 v5.3.x 的选择租户`, error?.toString());
        }
        // v6.0.x
        try {
            await page.click('.ant-select-item-option-content');
        } catch (error) {
            console.log(`taskId: ${taskId}, 这不是 v6.0.x 的选择租户`, error?.toString());
        }

        // 确定按钮，等待接口选择租户成功
        await page.click('button.ant-btn-primary');
        await sleep(process.env.RESPONSE_SLEEP);
        console.log(`taskId: ${taskId}, 选择租户成功`);
    } catch (error) {
        console.log(`taskId: ${taskId}, 选择租户出错`, error);
        throw error;
    }
};

const withLogin = async (runInfo: IRunInfo) => {
    const { url, taskId } = runInfo;
    // 创建 puppeteer 无头浏览器
    const browser = await puppeteer.launch(getPuppeteerConfig(PORT));
    const page = await browser.newPage();

    let runResult;
    try {
        // 登录
        await toLogin(page, runInfo);
        // 选择租户
        await changeTenant(page, taskId);

        console.log(`taskId: ${taskId}, 开始检测`);
        runResult = await lighthouse(url, getLhOptions(PORT), lhConfig);
        console.log(`taskId: ${taskId}, 检测完成`);
    } catch (error) {
        console.log(`taskId: ${taskId}, 检测失败`, error);
        throw error;
    } finally {
        await page.close();
        await browser.close();
    }

    return runResult;
};

// 不需要登录的页面检测
const withOutLogin = async (runInfo: IRunInfo) => {
    const { url, taskId } = runInfo;
    let chrome, runResult;
    try {
        console.log(`taskId: ${taskId}, 开始检测`);
        chrome = await chromeLauncher.launch(chromeLauncherOptions);
        runResult = await lighthouse(url, getLhOptions(chrome.port), lhConfig);
        console.log(`taskId: ${taskId}, 检测完成`);
    } catch (error) {
        console.log(`taskId: ${taskId}, 检测失败`, error);
        throw error;
    } finally {
        await chrome.kill();
    }

    return runResult;
};

export const taskRun = async (runInfo: IRunInfo, successCallback?, failCallback?) => {
    const start = new Date().getTime();
    const { url, loginUrl, taskId } = runInfo;
    try {
        // 依据是否包含 devops 来判断是否需要登录
        const needLogin = url.includes('devops') || loginUrl;
        console.log(`taskId: ${taskId}, 本次检测${needLogin ? '' : '不'}需要登录，检测地址：`, url);

        const runResult = needLogin ? await withLogin(runInfo) : await withOutLogin(runInfo);

        // 保存检测结果文件，便于预览
        const urlStr = url.replace(/http(s?):\/\//g, '').replace(/\/|#/g, '');
        const fileName = `${moment().format('YYYY-MM-DD')}-${taskId}-${urlStr}`;
        const filePath = `./static/${fileName}.html`;
        const reportUrl = `/report/${fileName}.html`;
        fs.writeFileSync(filePath, runResult?.report);

        // 性能数据
        const audits = runResult?.lhr?.audits || {};
        const auditRefs =
            runResult?.lhr?.categories?.performance?.auditRefs?.filter((item) => item.weight) || [];
        const { score = 0 } = runResult?.lhr?.categories?.performance || {};

        const performance = [];
        for (const auditRef of auditRefs) {
            const { weight, acronym } = auditRef;
            const { score, numericValue } = audits[auditRef.id] || {};
            performance.push({
                weight,
                name: acronym,
                score: Math.floor(score * 100),
                time: Math.round(numericValue * 100) / 100,
            });
        }
        const duration = Number((new Date().getTime() - start).toFixed(2));
        const result = {
            score: Math.floor(score * 100),
            duration,
            reportUrl,
            performance,
        };
        await successCallback?.(taskId, result);

        console.log(`taskId: ${taskId}, 本次检测耗时：${duration}ms`);
        return result;
    } catch (error) {
        const failReason = error.toString().substring(0, 10240);
        const duration = Number((new Date().getTime() - start).toFixed(2));
        await failCallback?.(taskId, failReason, duration);
        console.log(`taskId: ${taskId}, taskRun error`, failReason);
        throw error;
    }
};
