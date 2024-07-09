// 邮件
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';

import { Build } from '../build/entities/build.entity';
import { ChartService } from '../chart/services/chart.service';
import { Project } from '../project/entities/project.entity';
import { ProjectService } from '../project/services/project.service';
import { Task } from '../task/entities/task.entity';
import { Version } from '../version/entities/version.entity';
import { EmailController } from './controllers/email.controller';
import { EmailService } from './services/email.service';

// 邮件发送人
const emailFrom = 'yice_performance@163.com';

@Module({
    imports: [
        TypeOrmModule.forFeature([Project, Version, Task, Build]),
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                return {
                    transport: {
                        host: 'smtp.163.com',
                        port: 25,
                        ignoreTLS: true,
                        secure: false,
                        auth: {
                            user: emailFrom,
                            // 163 邮箱的授权码
                            pass: config.get('EMAIL_PASS'),
                        },
                    },
                    defaults: {
                        from: emailFrom,
                    },
                };
            },
        }),
    ],
    controllers: [EmailController],
    providers: [EmailService, ChartService, ProjectService],
    exports: [EmailService],
})
export class EmailModule {}
