import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { IFileSizeChartData, IProjectChartData } from 'typing';

import { getLastWeekRange } from '@/utils';
import { renderChart } from '@/utils/echarts';

@Injectable()
export class EmailService {
    constructor(private readonly mailerService: MailerService) {}

    async sendMail(
        project,
        projectChartData: IProjectChartData,
        fileSizeChartData: IFileSizeChartData
    ) {
        const [_, __, startTime, endTime] = getLastWeekRange();
        const { projectId, name, emails } = project;

        if (emails?.split(',')?.length) {
            const html = renderChart([{ projectId, name, projectChartData, fileSizeChartData }]);
            try {
                const result = await this.mailerService.sendMail({
                    to: emails?.split(','),
                    subject: `【${name}】易测数据周报（${startTime}~${endTime}）`, // 标题
                    html,
                });
                console.log(
                    `\nprojectId: ${projectId}, ${name}, 发送【单个子产品】的数据周报成功`,
                    result
                );
                return result;
            } catch (error) {
                console.log(
                    `\nprojectId: ${projectId}, ${name}, 发送【单个子产品】的数据周报失败`,
                    error
                );
                throw new HttpException('发送单个子产品的数据周报失败', HttpStatus.OK);
            }
        }
    }

    // 定时发送所有子产品的数据周报到指定邮箱
    async sendMailAllProject(emails, chartDataList = []) {
        const [_, __, startTime, endTime] = getLastWeekRange();

        if (emails?.split(',')?.length) {
            const html = renderChart(chartDataList);
            try {
                const result = await this.mailerService.sendMail({
                    to: emails?.split(','),
                    subject: `【所有子产品】易测数据周报（${startTime}~${endTime}）`, // 标题
                    html,
                });

                console.log('\n发送【所有子产品】的数据周报成功', result);
                return result;
            } catch (error) {
                console.log('\n发送【所有子产品】的数据周报失败', error);
                throw new HttpException('发送【所有子产品】的数据周报失败', HttpStatus.OK);
            }
        }
    }
}
