import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'mysql',
                host: config.get('DB_HOST'),
                port: config.get('DB_PORT'),
                username: config.get('DB_USERNAME'),
                password: config.get('DB_PASSWORD'),
                database: config.get('DB_DATABASE'),
                logging: false, // 打印真实 sql
                entities: [join(__dirname, '**/*.entity{.ts,.js}')],
                timezone: '+08:00', // 东八区
                cache: {
                    duration: 60000, // 1分钟的缓存
                },
                extra: {
                    poolMax: 50,
                    poolMin: 20,
                    queueTimeout: 65_000,
                    pollPingInterval: 50, // 每隔50秒连接
                    pollTimeout: 55, // 连接有效55秒
                },
                // autoLoadEntities: true, // 自动链接被 forFeature 注册的实体
            }),
        }),
    ],
})
export class DatabaseModule {}
