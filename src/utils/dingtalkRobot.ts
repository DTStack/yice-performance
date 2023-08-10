/**
 * 钉钉机器人相关方法
 * 消息类型：https://open.dingtalk.com/document/orgapp/robot-message-types-and-data-format
 */
const ChatBot = require('dingtalk-robot-sender');

class DingtalkRobot {
    // 任务超时告警
    async timeout({ taskId, projectId, versionId, versionName }) {
        const title = '任务超时告警';
        const text = `taskId: ${taskId} 【运行超时】，请注意检查！\n\n版本名称：[${versionName}](http://yice.dtstack.cn?projectId=${projectId}&versionId=${versionId})`;

        await this.send(taskId, title, text);
    }

    // 任务运行失败告警
    async failure({ taskId, projectId, versionId, versionName }) {
        const title = '任务失败告警';
        const text = `taskId: ${taskId} 【运行失败】，请注意检查！\n\n版本名称：[${versionName}](http://yice.dtstack.cn?projectId=${projectId}&versionId=${versionId})`;

        await this.send(taskId, title, text);
    }

    // 发送消息的具体实现
    private async send(taskId: number, title: string, text: string) {
        try {
            const webhook = process.env.ALARM_WEBHOOK;
            if (!webhook || process.env.NODE_ENV !== 'production') return;

            const robot = new ChatBot({ webhook });

            const at = {
                atMobiles: [process.env.ALARM_USER_PHONE],
                isAtAll: false,
            };
            await robot.markdown(title, text, at);
            console.log(`taskId: ${taskId}, ${title}已发送`);
        } catch (error) {
            console.log('发送失败', text);
        }
    }
}

export default new DingtalkRobot();
