import { Body, Controller, HttpCode, HttpException, HttpStatus, Post } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ApiOperation } from '@nestjs/swagger';

import { ChartService } from '@/modules/chart/services/chart.service';
import { ProjectService } from '@/modules/project/services/project.service';
import { formatDate, lastMonthRange, lastWeekRange } from '@/utils';
import { EmailService } from '../services/email.service';
import moment from 'moment';

@Controller('email')
export class EmailController {
    constructor(
        private readonly emailService: EmailService,
        private readonly chartService: ChartService,
        private readonly projectService: ProjectService
    ) {}

    // 每周一九点半执行一次 https://docs.nestjs.com/techniques/task-scheduling#declarative-cron-jobs
    @Cron('0 30 9 * * 1')
    async handleCron() {
        if (process.env.NODE_ENV === 'production') {
            // 定时发送单个子产品的数据周报到指定邮箱
            this.handleSendProject();
            // 定时发送所有子产品的数据周报到指定邮箱
            this.handleSendAll();
        }
    }

    async handleSendProject() {
        const projectList = await this.projectService.findAll();
        projectList
            .filter((project) => project.name !== '汇总')
            .forEach(async (project) => {
                const { projectId, name, emails } = project;
                if (emails?.split(',').length) {
                    try {
                        await this.sendProject({ projectId, emails });
                    } catch (error) {}
                    console.log(formatDate(), ` ${name}, 定时发送单个子产品的数据周报到指定邮箱`);
                }
            });
    }
    async handleSendAll() {
        if (process.env.DEFAULT_EMAIL) {
            this.sendAll({ emails: process.env.DEFAULT_EMAIL });
            console.log(formatDate(), ' 定时发送所有子产品的数据周报到指定邮箱');
        }
    }

    @ApiOperation({ summary: '发送邮件' })
    @HttpCode(HttpStatus.OK)
    @Post('sendProjectMail')
    async sendProject(@Body() { projectId, emails: _emails }) {
        const project = await this.projectService.findOne(projectId);
        const emails = _emails?.split(',')?.length ? _emails : project?.emails;

        if (emails?.split(',')?.length) {
            try {
                const result = await this.generatePromise(project);
                return result;
            } catch (error) {
                console.log(formatDate(), ' 邮件数据处理失败', error);
                throw new HttpException('没有历史检测数据', HttpStatus.OK);
            }
        }
    }

    async generatePromise(project) {
        const [startTime, endTime] = lastWeekRange;
        const [startMonthTime, endMonthTime] = lastMonthRange;
        const projectChartData = await this.chartService.projectChart({
            projectId: project.projectId,
            startTime,
            endTime,
        });
        const fileSizeChartData = await this.chartService.fileSizeChart({
            projectId: project.projectId,
            startTime: startMonthTime,
            endTime: endMonthTime,
        });

        if (projectChartData?.versionNameList?.length) {
            const result = await this.emailService.sendMail(
                project,
                lastWeekRange,
                projectChartData,
                fileSizeChartData
            );
            return result;
        } else {
            throw new HttpException('没有历史检测数据', HttpStatus.OK);
        }
    }

    @ApiOperation({ summary: '定时发送所有子产品的数据周报到指定邮箱' })
    @HttpCode(HttpStatus.OK)
    @Post('sendAll')
    async sendAll(@Body() { emails = process.env.DEFAULT_EMAIL }) {
        try {
            if (!emails) {
                throw new Error('DEFAULT_EMAIL 未配置邮箱');
            }

            const [startTime, endTime] = lastWeekRange;
            let projectList = await this.projectService.findAll();
            projectList = projectList.filter((project) => project.name !== '汇总');

            const promiseList = projectList.map((project) => {
                return this.chartService.projectChart({
                    projectId: project.projectId,
                    startTime,
                    endTime,
                });
            });

            const projectChartDataList = [];
            const projectChartDataResults = await Promise.all(promiseList);
            for (let i = 0; i < projectChartDataResults.length; i++) {
                if (projectChartDataResults[i].versionNameList?.length) {
                    const { projectId, name } = projectList[i];
                    projectChartDataList.push({
                        projectId,
                        name,
                        projectChartData: projectChartDataResults[i],
                    });
                }
            }

            if (projectChartDataList.length) {
                const result = await this.emailService.sendMailAllProject(
                    emails,
                    projectChartDataList,
                    lastWeekRange
                );
                return result;
            }
        } catch (error) {
            throw new HttpException(`尝试发送所有子产品的数据周报失败, ${error}`, HttpStatus.OK);
        }
    }
}
