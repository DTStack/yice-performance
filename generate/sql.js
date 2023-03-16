const fs = require('fs');

const version = '5.3.x';
const username = 'admin@dtstack.com';
const password = 'DrpEco_2020';
const url = 'http://portalfront-default-yice-53x-shuzhan.base53.devops.dtstack.cn';
const loginUrl = 'http://uicfront-default-yice-53x-shuzhan.base53.devops.dtstack.cn';

const apps = [
    { key: 'batch', name: '离线' },
    { key: 'stream', name: '实时' },
    { key: 'console', name: '控制台' },
    { key: 'dataApi', name: 'API' },
    { key: 'dataAssets', name: '资产' },
    { key: 'tag', name: '标签' },
    { key: 'easyIndex', name: '指标' },
    { key: 'dataLake', name: '数据湖' },
    { key: 'portal', name: 'portal' },
    { key: 'dataSource', name: '数据源中心', url: 'publicService/#/public/data-source/list' },
];

let sql = '';
for (const app of apps) {
    const appUrl = app.url ? `${url}/${app.url}` : `${url}/${app.key}/#/`;
    sql += `INSERT INTO project (name, logo, url, loginUrl, username, password) values ('${app.name}-${version}', '${app.key}.png', '${appUrl}', '${loginUrl}', '${username}', '${password}');\n`;
}

try {
    fs.writeFileSync(`./generate/addApps-${version}.sql`, sql);
    console.log('sql 生成成功！');
} catch (error) {
    console.log('sql 生成失败！');
}
