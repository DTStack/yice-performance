import { useEffect, useState } from 'react';
import { Form, InputNumber, message, Modal, Select, Switch } from 'antd';
import { IProject, IVersion } from 'typing';

import API from '../../../../utils/api';

interface IProps {
    open: boolean;
    project: IProject | undefined;
    versionList: IVersion[];
    setRunTime: (runTime: number) => void;
    onCancel: () => void;
}

export default function PatchDataModal(props: IProps) {
    const { open, project, versionList, onCancel, setRunTime } = props;
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (open) {
            form.resetFields();
        }
    }, [open]);

    // 确定按钮
    const handleOk = () => {
        form.validateFields().then((values) => {
            setLoading(true);
            API.patchData({ projectId: project?.projectId, ...values })
                .then(() => {
                    setRunTime(new Date().getTime());
                    message.success('操作完成，请在任务列表查看');
                    onCancel();
                })
                .finally(() => {
                    setLoading(false);
                });
        });
    };

    return (
        <Modal
            width={500}
            title={`补数据（${project?.name}）`}
            open={open}
            forceRender
            destroyOnClose
            confirmLoading={loading}
            onOk={handleOk}
            onCancel={onCancel}
        >
            <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} name="Form">
                <Form.Item
                    name="versionIds"
                    label="版本"
                    rules={[{ required: true, message: '请选择版本' }]}
                >
                    <Select
                        mode="multiple"
                        allowClear
                        placeholder="请选择版本"
                        options={versionList.map((item: IVersion) => {
                            return {
                                label: `${item.name}${item.isFreeze === 1 ? '(已冻结)' : ''}`,
                                value: item.versionId,
                            };
                        })}
                    />
                </Form.Item>
                <Form.Item
                    name="time"
                    label="补数据次数"
                    rules={[{ required: true }]}
                    initialValue={5}
                >
                    <InputNumber min={1} max={20} precision={0} placeholder="请输入补数据次数" />
                </Form.Item>
                <Form.Item
                    name="includeIsFreeze"
                    label="已冻结的版本"
                    rules={[{ required: true }]}
                    initialValue={false}
                    valuePropName="checked"
                >
                    <Switch checkedChildren="补数据" unCheckedChildren="不补" />
                </Form.Item>
            </Form>
        </Modal>
    );
}
