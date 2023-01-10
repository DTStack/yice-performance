import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ClassSerializerInterceptor, Module } from '@nestjs/common';

import { ValidationPipe } from './pipe/validation/validation.pipe';
import { ExaminationModule } from './modules/examination/examination.module';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), ExaminationModule],
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
