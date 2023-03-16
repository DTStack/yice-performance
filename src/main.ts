import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter } from './filters/http-exception.filter';

import { AppModule } from './app.module';
const packageJson = require('../package.json');

const APP_PORT = process.env.APP_PORT || 4000;
const API_PREFIX = process.env.API_PREFIX || 'api/v1';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // 给请求添加prefix
    app.setGlobalPrefix(API_PREFIX);

    // 配置api文档信息
    const options = new DocumentBuilder()
        .setTitle('性能检测系统管理  api文档')
        .setDescription('性能检测系统管理  api接口文档')
        .setVersion(packageJson?.version)
        .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(`docs`, app, document);

    // 全局注册错误的过滤器(错误异常)
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.listen(APP_PORT, () => {
        console.log(`app is running: http://localhost:${APP_PORT}`);
        console.log(`api docs: http://localhost:${APP_PORT}/docs`);
    });
}
bootstrap();
