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

// 等待元素出现，秒
const waitForSelectorOptions = {
    visible: true,
    timeout: 20_000,
};

interface ITask {
    taskId: number;
    start: number;
    url: string;
    loginUrl?: string;
    username?: string;
    password?: string;
}

/**
 * UIC 选择登录方式；选择租户；
 * antd3 和 antd4 的 Select DOM 不同
 * @param text Select 选择包含的文本
 */
const handleAntdSelect = async (page, text: string) => {
    const antd3Item = await page.$('li.ant-select-dropdown-menu-item');
    const antd4Item = await page.$('div.ant-select-item-option-content');

    if (antd3Item) {
        // antd3
        await page.$$eval(
            'li.ant-select-dropdown-menu-item',
            (options = [], text) => {
                options.forEach((item) => {
                    item?.textContent?.includes(text) && item.click();
                });
            },
            text
        );
    } else if (antd4Item) {
        // antd4
        await page.$$eval(
            'div.ant-select-item-option-content',
            (options = [], text) => {
                options.forEach((item) => {
                    item?.textContent?.includes(text) && item.click();
                });
            },
            text
        );
    }
};

// 登录
const toLogin = async (page, runInfo: ITask) => {
    const { taskId, loginUrl, username, password } = runInfo;
    try {
        await page.goto(loginUrl);

        // 等待指定的选择器匹配元素出现在页面中
        await page.waitForSelector('#sysId', waitForSelectorOptions);

        // 登录方式选择 UIC账号登录
        await page.click('.ant-select');
        await handleAntdSelect(page, 'UIC账号登录');

        // 等待指定的选择器匹配元素出现在页面中
        await page.waitForSelector('#username', waitForSelectorOptions);

        // 用户名、密码、验证码
        const usernameInput = await page.$('#username');
        await usernameInput.type(username);
        const passwordInput = await page.$('#password');
        await passwordInput.type(password);
        const codeInput = await page.$('.c-login__container__form__code__input');
        await codeInput?.type('bz4x');

        // 登录按钮
        await page.click('.c-login__container__form__btn');
        await page.waitForNavigation();
        // await sleep(Number(process.env.RESPONSE_SLEEP ?? 5));

        /**
         * TODO 开了验证码、账号密码错误，则不会弹出选择租户
         */
        const currentUrl = await page.url();
        // 依据是否包含 /login 或 /uic/#/ 来判断登录是否成功，包含则说明登录出错
        if (currentUrl.includes('/login') || currentUrl.includes('/uic/#/')) {
            throw new Error(`taskId: ${taskId}, 登录失败，仍在登录页面`);
        }
    } catch (error) {
        const currentUrl = await page.url();
        if (currentUrl.includes('/portal/#/')) {
            // 通过非用户名密码方式登录，已进入 portal 页面，比如默认登录方式设置为单点登录
            console.log(`taskId: ${taskId}, 通过非用户名密码方式登录，已进入 portal 页面`);
            return 'not-uic';
        } else {
            console.log(`taskId: ${taskId}, 登录出错`, error?.toString());
            throw error;
        }
    }
};

// 选择租户
const changeTenant = async (page, taskId) => {
    try {
        // 等待指定的选择器匹配元素出现在页面中
        await page.waitForSelector('#change_ten_id', waitForSelectorOptions);
        console.log(`taskId: ${taskId}, 登录成功，开始搜索并将选择租户`);

        // 租户
        await page.click('.ant-select');
        const tenantInput = await page.$('input#change_ten_id');
        await tenantInput.type('demo');

        const sleepTime = Number(process.env.RESPONSE_SLEEP ?? 5);
        // 搜索到的 demo 租户，点击查询到的第一条租户信息
        await sleep(sleepTime);

        // v5.3.x
        try {
            await page.click('li.ant-select-dropdown-menu-item');
            console.log(`taskId: ${taskId}, 这是数栈 v5.3.x 及之前版本的租户选择框`);
        } catch (_error) {}

        // v6.0.x
        try {
            await page.click('.ant-select-item-option-content');
            console.log(`taskId: ${taskId}, 这是数栈 v6.0.x 的租户选择框`);
        } catch (_error) {}

        // 确定按钮，等待接口选择租户成功
        await page.click('button.ant-btn-primary');

        // 等待出现数栈的产品入口
        await page.waitForSelector('div.product-box', waitForSelectorOptions);
        // await sleep(sleepTime);
    } catch (error) {
        console.log(`taskId: ${taskId}, 选择租户出错`, `选择租户出错，${error?.toString()}`);
        throw error;
    }
};

const withLogin = async (runInfo: ITask) => {
    const { taskId, url } = runInfo;
    // 创建 puppeteer 无头浏览器
    const browser = await puppeteer.launch(getPuppeteerConfig(PORT));
    const page = await browser.newPage();

    let runResult;
    try {
        // 登录
        const result = await toLogin(page, runInfo);
        if (result !== 'not-uic') {
            // 选择租户
            await changeTenant(page, taskId);
        }

        console.log(`taskId: ${taskId}, 选择租户成功，开始检测`);

        // 开始检测
        runResult = await lighthouse(url, getLhOptions(PORT), lhConfig);
    } catch (error) {
        console.log(`taskId: ${taskId}, 检测失败`, `${error?.toString()}`);
        throw error;
    } finally {
        // 检测结束关闭标签页、无头浏览器
        await page.close();
        await browser.close();
    }

    return runResult;
};

// 不需要登录的页面检测
const withOutLogin = async (runInfo: ITask) => {
    const { taskId, url } = runInfo;
    let chrome, runResult;
    try {
        console.log(`taskId: ${taskId}, 开始检测`);

        // 通过 API 控制 Node 端的 chrome 打开标签页，借助 Lighthouse 检测页面
        chrome = await chromeLauncher.launch(chromeLauncherOptions);
        runResult = await lighthouse(url, getLhOptions(chrome.port), lhConfig);
    } catch (error) {
        console.log(`taskId: ${taskId}, 检测失败，${error?.toString()}`);
        throw error;
    } finally {
        await chrome.kill();
    }

    return runResult;
};

export const taskRun = async (task: ITask, successCallback, failCallback, completeCallback) => {
    const { taskId, start, url, loginUrl } = task;
    try {
        // 依据是否包含 devops 来判断是否需要登录
        const needLogin = url.includes('devops') || loginUrl;
        console.log(`taskId: ${taskId}, 本次检测${needLogin ? '' : '不'}需要登录，检测地址：`, url);

        // 需要登录与否会决定使用哪个方法
        const runResult = needLogin ? await withLogin(task) : await withOutLogin(task);

        console.log(`taskId: ${taskId}, 开始整理数据...`);

        // 保存检测结果的报告文件，便于预览
        const urlStr = url.replace(/http(s?):\/\//g, '').replace(/\/|\#|\?|\&/g, '-');
        const fileName = `${moment().format('YYYY-MM-DD')}-${taskId}-${urlStr}`;
        const filePath = `./static/${fileName}.html`;
        const reportPath = `/report/${fileName}.html`;
        fs.writeFileSync(filePath, runResult?.report);

        // 结果的首屏图片预览
        const previewImg = runResult?.lhr?.audits?.['final-screenshot']?.details?.data;

        // 整理性能数据
        const audits = runResult?.lhr?.audits || {};
        const auditRefs =
            runResult?.lhr?.categories?.performance?.auditRefs?.filter((item) => item.weight) || [];
        const { score = 0 } = runResult?.lhr?.categories?.performance || {};

        const performance = [];
        for (const auditRef of auditRefs) {
            const { weight, acronym } = auditRef;
            const { score, numericValue } = audits[auditRef.id] || {};
            if (numericValue === undefined) {
                console.log(`taskId: ${taskId}, 检测结果出现问题，没有单项检测时长`);
                throw new Error(
                    `检测结果出现问题，没有单项检测时长，${JSON.stringify(audits[auditRef.id])}`
                );
            }
            performance.push({
                weight,
                name: acronym,
                score: Math.floor(score * 100),
                duration: Math.round(numericValue * 100) / 100,
            });
        }
        const duration = Number((new Date().getTime() - start).toFixed(2));

        // 汇总检测结果
        const result = {
            score: Math.floor(score * 100),
            duration,
            reportPath,
            performance,
            previewImg,
        };

        // 抛出结果
        await successCallback(task, result);

        return result;
    } catch (error) {
        // 错误处理
        let failReason = error.toString().substring(0, 10240);
        if (failReason.includes('#username') && failReason.includes('TimeoutError')) {
            failReason = `等待用户名输入框超时，${failReason}`;
        }
        const duration = Number((new Date().getTime() - start).toFixed(2));
        await failCallback(task, failReason, duration);
    } finally {
        completeCallback();
    }
};
