echo -e '查看服务器 static 文件夹大小'

ssh root@$yiceServerIP "cd /opt/dtstack/yice-performance-test/; du -h --max-depth=1 ./static"

