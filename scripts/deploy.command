echo -e '1、web 资源开始打包'
pnpm build:web


echo -e '\n2、node 资源开始打包'
pnpm build


# gtar 是给 macos 使用的，和 tar 区别不大，可以通过 brew install gnu-tar 安装
echo -e '3、本地资源开始压缩'
# gtar -czf yice-performance.tar.gz dist pm2/config.* static/README.md web/dist scripts/start.sh package.json pnpm-lock.yaml
gtar -czf yice-performance.tar.gz dist pm2/config.* static/README.md web/dist .env scripts/start.sh package.json pnpm-lock.yaml


echo -e '\n4、压缩包开始上传到远程服务器'
scp -P 22 -r yice-performance.tar.gz root@$yiceServerIP:/opt/dtstack/yice-performance/


echo -e '\n5、开始在远程服务器解压、安装依赖并重启服务...'
ssh root@$yiceServerIP "cd /opt/dtstack/yice-performance/; tar -xzf yice-performance.tar.gz; rm -rf yice-performance.tar.gz; mv scripts/start.sh ./; ls; source /etc/profile; ./start.sh; du -h --max-depth=1 ./static"


echo -e '\n6、删除本地压缩包'
rm -rf yice-performance.tar.gz


echo -e '\nDONE! 所有操作都已经完成啦，去浏览器看看效果吧~ \n
http://yice.dtstack.cn'

