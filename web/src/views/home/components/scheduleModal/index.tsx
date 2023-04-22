import { useEffect, useState } from 'react';
import { Modal, Form, Input, message, Button, Tooltip, Checkbox } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import API from '../../../../utils/api';
import { IProject } from 'typing';
import './style.less';

interface IProps {
    open: boolean;
    versionId: number | undefined;
    versionName: string | undefined;
    project: IProject | undefined;
    onCancel: () => void;
    setRunTime: (runTime: number) => void;
}

export default function ScheduleModal(props: IProps) {
    const { open, versionId, versionName, project, onCancel, setRunTime } = props;
    const [form] = Form.useForm();
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
    const [runLoading, setRunLoading] = useState<boolean>(false);

    useEffect(() => {
        if (open) {
            form.resetFields();
            getVersion();
        }
    }, [open]);

    const getVersion = () => {
        API.getVersion({ versionId }).then((res) => {
            setTimeout(() => {
                form.setFieldsValue(res.data || {});
            }, 200);
        });
    };

    // 立即运行按钮
    const handleRun = () => {
        setRunLoading(true);
        API.createTask({ versionId })
            .then(() => {
                setRunTime(new Date().getTime());
                message.success('操作成功，请在任务列表查看');
            })
            .finally(() => {
                setRunLoading(false);
                onCancel();
            });
    };

    // 确定按钮
    const handleOk = () => {
        form.validateFields().then((values) => {
            setConfirmLoading(true);
            API.updateScheduleConf({ projectId: project?.projectId, versionId, ...values })
                .then(() => {
                    message.success('保存成功！');
                    onCancel();
                })
                .finally(() => {
                    setConfirmLoading(false);
                });
        });
    };

    // 预览最近的20个计划周期
    const handlePreviewCron = () => {
        form.validateFields().then((values) => {
            setConfirmLoading(true);
            API.previewCron(values)
                .then((res) => {
                    const { data: list = [], isSecond } = res?.data || {};
                    Modal[isSecond ? 'warning' : 'info']({
                        title: `最近的20个计划周期${
                            isSecond ? '，当前属于秒级调度，将不允许保存' : ''
                        }`,
                        okText: isSecond ? '这就去改' : '知道了',
                        content: (
                            <>
                                {list.map((item: any, idx: number) => (
                                    <div key={idx} style={{ fontSize: 16 }}>
                                        {item}
                                    </div>
                                ))}
                            </>
                        ),
                    });
                })
                .finally(() => {
                    setConfirmLoading(false);
                });
        });
    };

    const renderButtons = () => {
        return (
            <div className="btn-box">
                <Button type="primary" loading={runLoading} onClick={handleRun}>
                    立即运行
                </Button>

                <div>
                    <Button onClick={onCancel}>取消</Button>
                    <Button type="primary" loading={confirmLoading} onClick={handleOk}>
                        确定
                    </Button>
                </div>
            </div>
        );
    };

    const tooltip = (
        <>
            <div>0 10 * * * * 每小时的第10分钟</div>
            <div>0 */12 0-2 * * * 零点到两点每12分钟</div>
            <div>0 30 11 * * 1-5 周一至周五的 11:30</div>
            <a
                href="https://docs.nestjs.com/techniques/task-scheduling#declarative-cron-jobs"
                target="_blank"
                rel="noreferrer"
            >
                nestjs cron jobs
            </a>
        </>
    );

    return (
        <Modal
            width={500}
            title={`${versionName}调度信息`}
            open={open}
            forceRender
            destroyOnClose
            footer={renderButtons()}
            onCancel={onCancel}
        >
            <Form
                className="schedule-form"
                form={form}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 14 }}
                name="Form"
            >
                <Form.Item name="cron" label="Cron表达式" rules={[{ required: true }]}>
                    <Input placeholder="请输入Cron表达式" autoFocus maxLength={64} />
                </Form.Item>
                <Form.Item name="isFreeze" label="调度冻结" valuePropName="checked" required>
                    <Checkbox>冻结</Checkbox>
                </Form.Item>

                <Tooltip title={tooltip} placement="bottom">
                    <QuestionCircleOutlined />
                </Tooltip>

                <Button onClick={handlePreviewCron}>预览</Button>
            </Form>
        </Modal>
    );
}
