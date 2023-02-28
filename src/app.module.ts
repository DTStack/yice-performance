import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ValidationPipe } from './pipe/validation/validation.pipe';
import { ExaminationModule } from './modules/examination/examination.module';
import { TaskModule } from './modules/task/task.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ExaminationModule,
        TaskModule,
        ServeStaticModule.forRoot({
            renderPath: '/',
            rootPath: join(__dirname, '..', 'web/dist'),
        }),
    ],
    controllers: [],
    providers: [
        // 全局使用管道(数据校验)
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
