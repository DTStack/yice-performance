/**
 * 钉钉机器人相关方法
 */
const ChatBot = require('dingtalk-robot-sender');

class DingtalkRobot {
    // 任务超时告警
    timeout(taskId: number) {
        this.send(`taskId: ${taskId} 任务【运行超时】，请注意检查！`);
    }

    // 任务运行失败告警
    failure(taskId: number) {
        this.send(`taskId: ${taskId} 任务【运行失败】，请注意检查！`);
    }

    // 发送消息的实现
    private send(content: string) {
        const webhook = process.env.ALARM_WEBHOOK;
        if (!webhook) return;

        const robot = new ChatBot({ webhook });

        const at = {
            atMobiles: [process.env.ALARM_USER_PHONE],
            isAtAll: false,
        };

        robot.text(content, at);
    }
}

export default new DingtalkRobot();
