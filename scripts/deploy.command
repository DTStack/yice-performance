echo -e '1、web 资源打包'
cd web
pnpm build


echo -e '\n2、node 资源打包'
cd ..
pnpm build


echo -e '3、本地压缩资源中...'
gtar -czf yice-performance.tar.gz dist pm2 static web/dist .env scripts/start.sh package.json pnpm-lock.yaml


echo -e '\n4、上传压缩包到远程服务器'
scp -P 22 -r yice-performance.tar.gz root@$yiceServerIP:/opt/dtstack/yice-performance/


echo -e '\n5、在远程服务器解压、安装依赖并重启服务...'
ssh root@$yiceServerIP "cd /opt/dtstack/yice-performance/; tar -xzf yice-performance.tar.gz; rm -rf yice-performance.tar.gz; mv scripts/start.sh ./; ls; source /etc/profile; ./start.sh"


echo -e '\n6、删除本地压缩包'
rm -rf yice-performance.tar.gz


echo -e '\nDONE! 资源已经成功上传到远程服务器啦~\n\n'

