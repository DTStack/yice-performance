module.exports = {
    name: 'yice',
    script: './dist/main.js',
    cwd: './',
    max_memory_restart: '1G',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    out_file: './pm2/logs/pm2-out.log',
    error_file: './pm2/logs/pm2-err.log',
    // out_file: '/dev/null', // 不输出日志
    // error_file: '/dev/null',
    env_production: {
        NODE_ENV: 'production',
    },
};
