import { useEffect, useState } from 'react';
import { Button, Form, Input, message, Modal, Select, Spin } from 'antd';
import { IProject } from 'typing';

import { YICE_ROLE } from '../../../../const/role';
import API from '../../../../utils/api';
import './style.less';

const Option = Select.Option;

interface IProps {
    open: boolean;
    project: IProject | undefined;
    onCancel: any;
}

export default function ProjectModal(props: IProps) {
    const { open, project, onCancel } = props;
    const [form] = Form.useForm();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [emailsIsTrue, setEmailsIsTrue] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [sending, setSending] = useState<boolean>(false);
    const [devopsLoading, setDevopsLoading] = useState<boolean>(false);
    const [devopsProjectList, setDevopsProjectList] = useState<any[]>([]);

    const yiceRole = localStorage.getItem('yice-role');

    useEffect(() => {
        if (open) {
            getDevopsProjectList();
            form.resetFields();
            const { devopsProjectIds, name, emails } = project || {};
            form.setFieldsValue({ devopsProjectIds: devopsProjectIds?.split(','), name, emails });
        }
    }, [open]);

    const getDevopsProjectList = () => {
        setDevopsLoading(true);
        API.getDevopsProjectList()
            .then((res: any) => {
                setDevopsProjectList(res.data || []);
            })
            .finally(() => {
                setDevopsLoading(false);
            });
    };

    // 保存
    const handleOk = () => {
        form.validateFields().then((values) => {
            const { devopsProjectIds, name, emails } = values;
            const params = {
                projectId: project?.projectId,
                name,
                emails,
            };
            if (yiceRole === YICE_ROLE.ADMIN) {
                Object.assign(params, { devopsProjectIds: devopsProjectIds.join(',') });
            }
            setLoading(true);
            API.updateProject(params)
                .then(() => {
                    message.success('保存成功！');
                    onCancel(true);
                })
                .finally(() => {
                    setLoading(false);
                    onCancel?.();
                });
        });
    };

    // 输入框的回车事件
    const handleInputEnter = (e: any) => {
        // 中文输入法输入时回车，keyCode 是 229；光标在输入框直接回车，keyCode 是 13
        !loading && e.keyCode === 13 && handleOk();
    };

    const handleSendMail = () => {
        form.validateFields().then((values: any) => {
            const { emails } = values;

            setSending(true);
            API.sendProjectMail({ projectId: project?.projectId, emails })
                .then(() => {
                    message.success('发送成功！');
                })
                .finally(() => {
                    setSending(false);
                });
        });
    };

    const renderButtons = () => {
        return (
            <div className="btn-box">
                <Button
                    type="primary"
                    loading={sending}
                    // disabled={!emailsIsTrue}
                    onClick={handleSendMail}
                >
                    发送周报
                </Button>

                <div>
                    <Button onClick={onCancel}>取消</Button>
                    <Button type="primary" loading={loading} onClick={handleOk}>
                        保存
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <Modal
            width={500}
            title={`产品设置（${project?.name}）`}
            open={open}
            forceRender
            destroyOnClose
            onOk={handleOk}
            footer={renderButtons()}
            onCancel={onCancel}
        >
            <Spin spinning={loading}>
                <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} name="Form">
                    <Form.Item
                        name="devopsProjectIds"
                        label="devops 项目"
                        rules={[{ required: true, message: '请选择关联的 devops 项目' }]}
                    >
                        <Select
                            mode="multiple"
                            allowClear
                            showSearch
                            loading={devopsLoading}
                            placeholder="请选择版本"
                            disabled={yiceRole !== YICE_ROLE.ADMIN}
                            filterOption={(input, option) =>
                                `${option?.children ?? ''}`
                                    ?.toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                        >
                            {devopsProjectList.map((item: any) => {
                                return (
                                    <Option key={item.id} value={`${item.id}`}>
                                        {item.label}
                                    </Option>
                                );
                            })}
                        </Select>
                    </Form.Item>
                    <Form.Item name="name" label="产品名称" rules={[{ required: true }]}>
                        <Input
                            placeholder="请输入产品名称"
                            maxLength={64}
                            onPressEnter={handleInputEnter}
                        />
                    </Form.Item>
                    <Form.Item
                        name="emails"
                        label="通知邮箱"
                        tooltip="产品数据周报的通知邮箱，以英文逗号分隔"
                        validateTrigger="onBlur"
                        rules={[
                            {
                                validator: (rule: any, value: any, callback: any) => {
                                    let email = '';
                                    if (
                                        value &&
                                        value?.split(',').some((item: string) => {
                                            const regex =
                                                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/g;
                                            email = item;
                                            return !regex.test(item);
                                        })
                                    ) {
                                        callback(`${email} 邮箱格式不正确`);
                                        setEmailsIsTrue(false);
                                    } else {
                                        setEmailsIsTrue(true);
                                        callback();
                                    }
                                },
                            },
                        ]}
                    >
                        <Input.TextArea
                            placeholder="请输入接收邮箱，以英文逗号分隔"
                            maxLength={256}
                            rows={3}
                            onFocus={() => setEmailsIsTrue(false)}
                        />
                    </Form.Item>
                </Form>
            </Spin>
        </Modal>
    );
}
