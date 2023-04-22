import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
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

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: '127.0.0.1',
            port: 3306,
            username: 'root',
            password: '123456',
            database: 'yice-performance',
            entities: [join(__dirname, '/**/*.entity{.ts,.js}')],
            timezone: '+08:00', // 东八区
            cache: {
                duration: 60000, // 1分钟的缓存
            },
            extra: {
                poolMax: 32,
                poolMin: 16,
                queueTimeout: 60000,
                pollPingInterval: 60, // 每隔60秒连接
                pollTimeout: 60, // 连接有效60秒
            },
            // logging: true, // 打印真实 sql
            // autoLoadEntities: true, // 自动链接被 forFeature 注册的实体
            // synchronize: true, // 实体与表同步 调试模式下开始。不然会有强替换导致数据丢失
        }),
        ConfigModule.forRoot({ isGlobal: true }),
        ProjectModule,
        TaskModule,
        PerformanceModule,
        BuildModule,
        VersionModule,
        DevopsModule,

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
