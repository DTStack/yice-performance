import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
const packageJson = require('../package.json');

const APP_PORT = process.env.APP_PORT || 4000;
const API_PREFIX = process.env.API_PREFIX || '';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // 给请求添加prefix
    app.setGlobalPrefix(API_PREFIX);

    // 配置api文档信息
    const options = new DocumentBuilder()
        .setTitle('权限系统管理  api文档')
        .setDescription('权限系统管理  api接口文档')
        .setBasePath(API_PREFIX)
        .setVersion(packageJson?.version)
        .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(`${API_PREFIX}/docs`, app, document);

    await app.listen(APP_PORT, () => {
        console.log(`app is running: http://localhost:${APP_PORT}`);
        console.log(`api docs: http://localhost:${APP_PORT}/${API_PREFIX}/docs`);
    });
}
bootstrap();
