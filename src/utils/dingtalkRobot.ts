/**
 * 钉钉机器人相关方法
 * 消息类型：https://open.dingtalk.com/document/orgapp/robot-message-types-and-data-format
 */
const ChatBot = require('dingtalk-robot-sender');

class DingtalkRobot {
    // 任务超时告警
    timeout({ taskId, projectId, versionId, versionName }) {
        const title = '任务超时告警';
        const text = `taskId: ${taskId} 【运行超时】，请注意检查！\n\n版本名称：[${versionName}](http://yice.dtstack.cn?projectId=${projectId}&versionId=${versionId})`;

        this.send(title, text);
    }

    // 任务运行失败告警
    failure({ taskId, projectId, versionId, versionName }) {
        const title = '任务失败告警';
        const text = `taskId: ${taskId} 【运行失败】，请注意检查！\n\n版本名称：[${versionName}](http://yice.dtstack.cn?projectId=${projectId}&versionId=${versionId})`;

        this.send(title, text);
    }

    // 发送消息的实现
    private send(title: string, text: string) {
        const webhook = process.env.ALARM_WEBHOOK;
        if (!webhook) return;

        const robot = new ChatBot({ webhook });

        const at = {
            atMobiles: [process.env.ALARM_USER_PHONE],
            isAtAll: false,
        };
        robot.markdown(title, text, at);
    }
}

export default new DingtalkRobot();
