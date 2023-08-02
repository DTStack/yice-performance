import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';
import { ValidationPipe } from './pipe/validation/validation.pipe';
import { TransformInterceptor } from './interceptors/transform.interceptor';

import { ProjectModule } from './modules/project/project.module';
import { TaskModule } from './modules/task/task.module';
import { PerformanceModule } from './modules/performance/performance.module';
import { BuildModule } from './modules/build/build.module';
import { VersionModule } from './modules/version/version.module';
import { DevopsModule } from './modules/devops/devops.module';
import { ChartModule } from './modules/chart/chart.module';
import { DatabaseModule } from './modules/database.module';

@Module({
    imports: [
        DatabaseModule,
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ProjectModule,
        TaskModule,
        PerformanceModule,
        BuildModule,
        VersionModule,
        DevopsModule,
        ChartModule,

        // 托管页面的静态资源
        ServeStaticModule.forRoot({
            serveRoot: '/',
            rootPath: join(__dirname, '..', 'web/dist'),
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
