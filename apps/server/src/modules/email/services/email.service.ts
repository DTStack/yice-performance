import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { IFileSizeChartData, IProjectChartData } from 'typing';

import { formatDate } from '@/utils';
import { renderChart } from '@/utils/echarts';

@Injectable()
export class EmailService {
    constructor(private readonly mailerService: MailerService) {}

    async sendMail(
        project,
        lastWeekRange,
        projectChartData: IProjectChartData,
        fileSizeChartData: IFileSizeChartData
    ) {
        const [_, __, startTime, endTime] = lastWeekRange;
        const { projectId, name, emails } = project;

        if (emails?.split(',')?.length) {
            const html = renderChart([{ projectId, name, projectChartData, fileSizeChartData }]);
            try {
                const result = await this.mailerService.sendMail({
                    to: emails?.split(','),
                    subject: `【${name}】易测数据周报（${startTime}~${endTime}）`, // 标题
                    html,
                });
                console.log(formatDate(), ' 发送单个子产品的数据周报成功', result);
                return result;
            } catch (error) {
                console.log(formatDate(), ' 尝试发送单个子产品的数据周报失败', error);
                throw new HttpException('尝试发送单个子产品的数据周报失败', HttpStatus.OK);
            }
        }
    }

    // 定时发送所有子产品的数据周报到指定邮箱
    async sendMailAllProject(emails, projectChartDataList = [], lastWeekRange) {
        const [_, __, startTime, endTime] = lastWeekRange;

        if (emails?.split(',')?.length) {
            const html = renderChart(projectChartDataList);
            try {
                const result = await this.mailerService.sendMail({
                    to: emails?.split(','),
                    subject: `【数栈子产品】易测数据周报（${startTime}~${endTime}）`, // 标题
                    html,
                });
                console.log(formatDate(), ' 发送所有子产品的数据周报成功', result);
                return result;
            } catch (error) {
                console.log(formatDate(), ' 尝试发送所有子产品的数据周报失败', error);
                throw new HttpException('尝试发送所有子产品的数据周报失败', HttpStatus.OK);
            }
        }
    }
}