import { $, chalk, echo, question } from 'zx';

const infoLog = (str) => console.log(chalk.whiteBright(str));
const doneLog = (str = '') => console.log(chalk.greenBright(str || '✔ DONE!\n'));

$.verbose = false;

(async () => {
    // 测试服部署
    const isTest = process.argv?.[3] === 'test';
    const testStr = isTest ? '-test' : '';

    infoLog(`\n---------------- ${isTest ? '测试' : '正式'}服开始部署 ----------------\n\n`);

    infoLog('1. website 资源开始打包');
    $.verbose = true;
    echo(await $`pnpm build:web${testStr}`);
    $.verbose = false;

    infoLog('2. node 资源开始打包');
    $.verbose = true;
    echo(await $`pnpm build${isTest ? ':test' : ''}`);
    $.verbose = false;

    // gtar 是给 macos 使用的，和 tar 区别不大，可以通过 brew install gnu-tar 安装
    infoLog('3. 本地资源开始压缩');
    $.verbose = true;
    // 第一次部署时应该加上 .env 文件
    echo(
        await $`gtar -czf yice-performance${testStr}.tar.gz dist pm2/config${testStr}.* static/README.md website/dist scripts/start${testStr}.sh package.json pnpm-lock.yaml`
    );
    $.verbose = false;
    doneLog();

    infoLog('4. 压缩包开始上传到远程服务器');
    const yiceServerIP = await question(`请输入远程服务器 ip: `);
    $.verbose = true;
    echo(
        await $`scp -P 22 -r yice-performance${testStr}.tar.gz root@${yiceServerIP}:/opt/dtstack/yice-performance${testStr}/`
    );
    $.verbose = false;
    doneLog();

    infoLog('5. 开始在远程服务器解压、安装依赖并重启服务...');
    $.verbose = true;
    echo(
        await $`ssh root@${yiceServerIP} "cd /opt/dtstack/yice-performance${testStr}/; tar -xzf yice-performance${testStr}.tar.gz; rm -rf node_modules yice-performance.tar${testStr}.gz; mv scripts/start${testStr}.sh ./; ls; source /etc/profile; ./start${testStr}.sh; du -h --max-depth=1 ./static"`
    );
    $.verbose = false;
    doneLog();

    infoLog('6. 删除本地压缩包');
    $.verbose = true;
    echo(await $`rm -rf yice-performance${testStr}.tar.gz`);
    $.verbose = false;
    doneLog();

    infoLog(`\n\n---------------- ${isTest ? '测试' : '正式'}服部署操作结束 ----------------\n\n`);
    doneLog(
        `DONE! 所有操作都已经完成啦，去浏览器看看效果吧~ \n http://${
            isTest ? 'test.' : ''
        }yice.dtstack.cn`
    );
})();
