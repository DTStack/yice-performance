import { useEffect, useState } from 'react';
import { Button, Checkbox, Form, Input, message, Modal, Select, Spin } from 'antd';
import { IProject, IVersion } from 'typing';

import { YICE_ROLE } from '../../../../const/role';
import API from '../../../../utils/api';
import './style.less';

interface IProps {
    open: boolean;
    project: IProject | undefined;
    versionList: IVersion[];
    defaultVersionId: number | null | undefined;
    setRunTime: (runTime: number) => void;
    onCancel: (needFetch: boolean) => void;
}

export default function ScheduleModal(props: IProps) {
    const { open, project, versionList, defaultVersionId, onCancel, setRunTime } = props;
    const [form] = Form.useForm();
    const [formLoading, setFormLoading] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [_isFreeze, setIsFreeze] = useState<boolean>(false);
    const [runLoading, setRunLoading] = useState<boolean>(false);

    const yiceRole = localStorage.getItem('yice-role');

    useEffect(() => {
        if (open) {
            form.resetFields();
            getVersion();
        }
    }, [open]);

    const getVersion = () => {
        setFormLoading(true);
        const versionId = form.getFieldValue('versionId') || defaultVersionId;
        API.getVersion({ versionId })
            .then((res) => {
                const { cron, isFreeze, note } = res.data || {};
                setIsFreeze(isFreeze);
                setTimeout(() => {
                    form.setFieldsValue({ cron, isFreeze, note });
                }, 200);
            })
            .finally(() => {
                setFormLoading(false);
            });
    };

    // 立即运行按钮
    const handleRun = () => {
        setRunLoading(true);
        const versionId = form.getFieldValue('versionId') || defaultVersionId;
        API.createTask({ versionId })
            .then(() => {
                setRunTime(new Date().getTime());
                message.success('操作完成，请在任务列表查看');
            })
            .finally(() => {
                setRunLoading(false);
                onCancel(false);
            });
    };

    // 保存
    const handleOk = () => {
        const versionId = form.getFieldValue('versionId') || defaultVersionId;
        form.validateFields().then((values) => {
            setSaving(true);
            API.updateScheduleConf({ projectId: project?.projectId, versionId, ...values })
                .then(() => {
                    message.success('保存成功！');
                    onCancel(_isFreeze !== values.isFreeze);
                })
                .finally(() => {
                    setSaving(false);
                });
        });
    };

    // 预览最近的 n 个计划周期
    const handlePreviewCron = () => {
        form.validateFields().then((values) => {
            const num = 10;
            setSaving(true);
            API.previewCron({ ...values, num })
                .then((res) => {
                    const { data: list = [], isSecond } = res?.data || {};
                    Modal[isSecond ? 'warning' : 'info']({
                        title: `最近的${num}个计划周期${
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
                    setSaving(false);
                });
        });
    };

    // 输入框的回车事件
    const handleInputEnter = (e: any) => {
        // 中文输入法输入时回车，keyCode 是 229；光标在输入框直接回车，keyCode 是 13
        !saving && e.keyCode === 13 && handleOk();
    };

    const renderButtons = () => {
        return (
            <div className="btn-box">
                <Button type="primary" loading={runLoading} onClick={handleRun}>
                    立即运行
                </Button>

                <div>
                    <Button onClick={() => onCancel(false)}>取消</Button>
                    <Button type="primary" loading={saving || formLoading} onClick={handleOk}>
                        保存
                    </Button>
                </div>
            </div>
        );
    };

    const tooltip = (
        <>
            <div>0 0 2-3 * * * 每天的两点和三点(建议)</div>
            <div>0 10 * * * * 每小时的第10分钟</div>
            <div>0 */20 0-2 * * * 零点到两点每20分钟</div>
            <div>0 30 11 * * 1-5 周一至周五的 11:30</div>
            <a
                href="https://docs.nestjs.com/techniques/task-scheduling#declarative-cron-jobs"
                target="_blank"
                rel="noreferrer"
            >
                文档：nestjs cron jobs
            </a>
        </>
    );

    return (
        <Modal
            width={500}
            title={`调度配置（${project?.name}）`}
            open={open}
            forceRender
            destroyOnClose
            footer={renderButtons()}
            onCancel={() => onCancel(false)}
        >
            <Spin spinning={formLoading}>
                <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} name="Form">
                    <Form.Item
                        name="versionId"
                        label="版本"
                        rules={[{ required: true }]}
                        initialValue={`${defaultVersionId}`}
                    >
                        <Select
                            loading={formLoading}
                            placeholder="请选择版本"
                            onChange={getVersion}
                            options={versionList.map((item: IVersion) => {
                                return {
                                    label: `${item.name}${item.isFreeze === 1 ? '(已冻结)' : ''}`,
                                    value: `${item.versionId}`,
                                };
                            })}
                        />
                    </Form.Item>
                    <Form.Item name="cron" label="Cron表达式" tooltip={tooltip} required>
                        <Input.Group compact>
                            <Form.Item
                                name="cron"
                                rules={[{ required: true }]}
                                style={{ marginBottom: 0 }}
                            >
                                <Input
                                    placeholder="请输入Cron表达式，如 0 0 2-3 * * *"
                                    autoFocus
                                    maxLength={64}
                                    style={{ width: 255 }}
                                    disabled={yiceRole !== YICE_ROLE.ADMIN}
                                    onPressEnter={handleInputEnter}
                                />
                            </Form.Item>
                            <Button
                                style={{ width: 85 }}
                                type="primary"
                                loading={saving}
                                onClick={handlePreviewCron}
                            >
                                预览
                            </Button>
                        </Input.Group>
                    </Form.Item>
                    <Form.Item name="isFreeze" label="调度状态" valuePropName="checked" required>
                        <Checkbox>冻结</Checkbox>
                    </Form.Item>
                    <Form.Item name="note" label="备注">
                        <Input.TextArea placeholder="请输入备注" maxLength={255} rows={3} />
                    </Form.Item>
                </Form>
            </Spin>
        </Modal>
    );
}
