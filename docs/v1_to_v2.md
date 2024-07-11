## 升级：从 v1 到 v2

- 1. 服务器的 `static` 文件夹需要改名为 `yice-report`
- 2. 数据库 task reportPath 的数据需要刷新：

``` SQL
UPDATE task
SET reportPath = REPLACE (reportPath, 'report', 'yice-report')
WHERE
	reportPath LIKE '%/report/%';
```
