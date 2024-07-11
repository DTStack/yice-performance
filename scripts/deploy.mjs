import { $, chalk, echo, question } from 'zx';

const infoLog = (str) => console.log(chalk.whiteBright(str));
const doneLog = (str = '') => console.log(chalk.greenBright(str || '✔ DONE!\n'));

$.verbose = false;

(async () => {
    // 测试服部署
    const isTest = process.argv?.[3] === 'test';
    const testStr = isTest ? '-test' : '';

    infoLog(`\n---------------- ${isTest ? '测试' : '正式'}服开始部署 ----------------\n\n`);

    infoLog('1. 资源开始打包');
    $.verbose = true;
    echo(await $`pnpm build${testStr}`);
    $.verbose = false;

    // gtar 是给 macos 使用的，和 tar 区别不大，可以通过 brew install gnu-tar 安装
    infoLog('2. 本地资源开始压缩');
    $.verbose = true;
    // 本地应该使用 `.env.prod` 文件
    echo(
        await $`gtar -czf yice-performance${testStr}.tar.gz apps/server/dist pm2/config${testStr}.* apps/server/yice-report/README.md apps/web/dist scripts package.json apps/server/package.json apps/web/package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .env .env.local`
    );
    $.verbose = false;
    doneLog();

    infoLog('3. 压缩包开始上传到远程服务器');
    const yiceServerIP = await question(`请输入远程服务器 ip: `);
    $.verbose = true;
    echo(
        await $`scp -P 22 -r yice-performance${testStr}.tar.gz root@${yiceServerIP}:/opt/dtstack/yice-performance${testStr}/`
    );
    $.verbose = false;
    doneLog();

    infoLog('4. 开始在远程服务器解压、安装依赖并重启服务...');
    $.verbose = true;
    echo(
        await $`ssh root@${yiceServerIP} "cd /opt/dtstack/yice-performance${testStr}/; tar -xzf yice-performance${testStr}.tar.gz; rm -rf yice-performance${testStr}.tar.gz; cp scripts/start${testStr}.sh ./; ls -lahS; ./start${testStr}.sh; du -h --max-depth=1 ./apps/server/yice-report;"`
    );
    $.verbose = false;
    doneLog();

    infoLog('5. 删除本地压缩包');
    $.verbose = true;
    echo(await $`rm -rf yice-performance${testStr}.tar.gz`);
    $.verbose = false;
    doneLog();

    infoLog(`\n\n---------------- ${isTest ? '测试' : '正式'}服部署操作结束 ----------------\n\n`);
    doneLog(
        `DONE! 所有操作都已经完成啦，去浏览器看看效果吧~ \nhttp://${
            isTest ? 'test.' : ''
        }yice.dtstack.cn`
    );
})();
