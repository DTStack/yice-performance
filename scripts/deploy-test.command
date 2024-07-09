echo -e '1、web 资源开始打包'
pnpm build:web-test


echo -e '\n2、node 资源开始打包'
pnpm build


# gtar 是给 macos 使用的，和 tar 区别不大，可以通过 brew install gnu-tar 安装
echo -e '3、本地资源开始压缩'
gtar -czf yice-performance-test.tar.gz dist pm2/config-test.json static/README.md web/dist scripts/start-test.sh package.json pnpm-lock.yaml


echo -e '\n4、压缩包开始上传到远程服务器'
scp -P 22 -r yice-performance-test.tar.gz root@$yiceServerIP:/opt/dtstack/yice-performance-test/


echo -e '\n5、开始在远程服务器解压、安装依赖并重启服务...'
ssh root@$yiceServerIP "cd /opt/dtstack/yice-performance-test/; tar -xzf yice-performance-test.tar.gz; rm -rf yice-performance-test.tar.gz; mv scripts/start-test.sh ./; ls; source /etc/profile; ./start-test.sh; du -h --max-depth=1 ./static"


echo -e '\n6、删除本地压缩包'
rm -rf yice-performance-test.tar.gz


echo -e '\nDONE! 所有操作都已经完成啦，去浏览器看看效果吧~ \n
http://test.yice.dtstack.cn'

