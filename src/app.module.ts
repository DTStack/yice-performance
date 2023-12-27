import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { TransformInterceptor } from './interceptors/transform.interceptor';
import { BuildModule } from './modules/build/build.module';
import { ChartModule } from './modules/chart/chart.module';
import { DatabaseModule } from './modules/database.module';
import { DevopsModule } from './modules/devops/devops.module';
import { EmailModule } from './modules/email/email.module';
import { PerformanceModule } from './modules/performance/performance.module';
import { ProjectModule } from './modules/project/project.module';
import { TaskModule } from './modules/task/task.module';
import { VersionModule } from './modules/version/version.module';
import { ValidationPipe } from './pipe/validation/validation.pipe';

@Module({
    imports: [
        DatabaseModule,
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ProjectModule,
        TaskModule,
        PerformanceModule,
        EmailModule,
        BuildModule,
        VersionModule,
        DevopsModule,
        ChartModule,

        // 托管页面的静态资源
        ServeStaticModule.forRoot({
            serveRoot: '/',
            rootPath: join(__dirname, '..', 'website/dist'),
        }),
        ServeStaticModule.forRoot({
            serveRoot: '/redirect',
            rootPath: join(__dirname, '..', 'website/dist'),
        }),
        // 托管检测报告的静态资源
        ServeStaticModule.forRoot({
            serveRoot: '/report',
            rootPath: join(__dirname, '..', 'static'),
        }),

        ScheduleModule.forRoot(),
    ],
    controllers: [],
    providers: [
        // 全局使用管道(数据校验)
        {
            provide: APP_INTERCEPTOR,
            useClass: TransformInterceptor,
        },
        {
            provide: APP_PIPE,
            useClass: ValidationPipe,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: ClassSerializerInterceptor,
        },
    ],
})
export class AppModule {}
