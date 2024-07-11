## 升级：从 v1 到 v2

- 1. 服务器的 `static` 文件夹需要改名为 `yice-report`
- 2. 数据库 task reportPath 的数据需要刷新：

``` SQL
UPDATE task
SET reportPath = REPLACE (reportPath, 'report', 'yice-report')
WHERE
	reportPath LIKE '%/report/%';
```

- 3. 调用一次 `batchUpdateTaskReportPath` 接口，易测自带了 `Swagger`
- 4. 将文件按日期文件夹区分，先在挂载的目录 `/opt/dtstack/yice-performance/yice-report` 下新建一个 `rename.js`，然后进入容器执行

``` js
const fs = require('fs');

const currentDir = './apps/server/yice-report';

try {
    const files = fs.readdirSync(currentDir, { withFileTypes: true });
    files.forEach((file) => {
        if (!file.isDirectory() && (file.name.includes('2023') || file.name.includes('2024'))) {
            const arr = file.name.split('-');
            const [year, month, day] = arr;
            const date = `${year}-${month}-${day}`;
            const fileName = arr.slice(3, arr.length).join('-');

            const dirPath = `${currentDir}/${date}`;
            fs.mkdirSync(dirPath, { recursive: true }, (err) => {
                err && console.log('创建文件夹出错了', err);
            });

            fs.renameSync(`${currentDir}/${file.name}`, `./${dirPath}/${fileName}`);
        }
    });
} catch (err) {
    console.error('出错了：', err);
}
```

``` shell
node apps/server/yice-report/rename.js
```

&emsp;&emsp;在页面上确认检测报告能否查看。
