const inquirer = require('inquirer');

const { spawn } = require('child_process');

inquirer
    .prompt([
        {
            type: 'input',
            name: 'yiceServerIP',
            message: 'Input yice server IP: ',
            loop: false,
        },
        {
            type: 'confirm',
            name: 'isProd',
            message: 'Server is production? Default is yes',
            default: true,
            loop: false,
        },
    ])
    .then(execFunc);

function execFunc(res) {
    const { yiceServerIP, isProd } = res;

    const cmd = `ssh root@${yiceServerIP} "cd /opt/dtstack/yice-performance${
        isProd ? '' : '-test'
    }/; du -h --max-depth=1 ./"`;

    console.info(`Executing: ${cmd} \n`);

    runCommand(cmd)
        .then(({ message }) => {
            message && console.info(message);
        })
        .catch(({ error, code }) => {
            code && console.error('Error: process exit code' + code);
            error && console.error(error);
        });
}

const runCommand = (command, args) => {
    return new Promise((resolve, reject) => {
        const executedCommand = spawn(command, args, {
            stdio: 'inherit',
            shell: true,
        });
        executedCommand.on('error', (error) => {
            reject({
                error,
                message: null,
                code: null,
            });
        });
        executedCommand.on('exit', (code) => {
            if (code === 0) {
                resolve({
                    error: null,
                    message: null,
                    code,
                });
            } else {
                reject({
                    error: null,
                    message: null,
                    code,
                });
            }
        });
        executedCommand.on('message', (message) => {
            resolve({
                error: null,
                message,
                code: null,
            });
        });
    });
};
