import { useEffect, useState } from 'react';
import { Modal, Form, Input, message, Button, Tooltip } from 'antd';
import API from '../../../../utils/api';
import './style.less';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { IProject } from 'typing';

interface IProps {
    open: boolean;
    versionId: number | undefined;
    versionName: string | undefined;
    project: IProject | undefined;
    onCancel: (needFetch: any) => void;
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

    // 运行按钮
    const handleRun = () => {
        setRunLoading(true);
        API.createTask({ versionId })
            .then(() => {
                setRunTime(new Date().getTime());
                message.success('操作成功，请在任务列表查看');
            })
            .finally(() => {
                setRunLoading(false);
                onCancel(true);
            });
    };

    // 确定按钮
    const handleOk = () => {
        form.validateFields().then((values) => {
            setConfirmLoading(true);

            API.updateVersionCron({ projectId: project?.projectId, versionId, ...values })
                .then(() => {
                    message.success('保存成功！');
                    onCancel(false);
                })
                .finally(() => {
                    setConfirmLoading(false);
                });
        });
    };

    // 预览最近的十个计划周期
    const handlePreviewCron = () => {
        form.validateFields().then((values) => {
            setConfirmLoading(true);
            API.previewCron(values)
                .then((res) => {
                    const list = res?.data || [];
                    Modal.info({
                        title: '接下来的10个计划周期',
                        content: (
                            <>
                                {list.map((item: any, idx: number) => (
                                    <div key={idx}>{item}</div>
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
                    单次运行
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
                <Form.Item
                    name="cron"
                    label="Cron表达式"
                    rules={[{ required: true }]}
                    initialValue="0 */12 0-2 * * *"
                >
                    <Input placeholder="请输入Cron表达式" maxLength={64} />
                </Form.Item>

                <Tooltip title={tooltip} placement="bottom">
                    <QuestionCircleOutlined />
                </Tooltip>

                <Button onClick={handlePreviewCron}>预览</Button>
            </Form>
        </Modal>
    );
}
