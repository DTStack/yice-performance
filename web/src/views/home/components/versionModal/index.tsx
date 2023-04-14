import { useEffect, useState } from 'react';
import { Modal, Form, Input, message, Select } from 'antd';
import { httpPattern } from '../../../../utils';
import API from '../../../../utils/api';
import { IProject } from 'typing';

interface IProps {
    open: boolean;
    isEdit: boolean;
    project: IProject | undefined;
    versionId: number | undefined;
    onCancel: (needFetch: any) => void;
}

export default function VersionModal(props: IProps) {
    const { open, isEdit, project, versionId, onCancel } = props;
    const { projectId, appName, devopsProjectId } = project || {};
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);
    const [devopsShiLiList, setDevopsShiLiList] = useState<any[]>([]);

    useEffect(() => {
        if (open) {
            form.resetFields();
            isEdit && getVersion();
            getShiLis();
        }
    }, [open]);

    const getVersion = () => {
        API.getVersion({ versionId }).then((res) => {
            setTimeout(() => {
                form.setFieldsValue(res.data || {});
            }, 200);
        });
    };

    // 获取项目下的 devops 实例列表
    const getShiLis = () => {
        API.getShiLis({ devopsProjectId }).then((res) => {
            setDevopsShiLiList(
                res.data?.map((item: any) => {
                    return {
                        label: item.label,
                        value: item.id,
                    };
                }) || []
            );
        });
    };

    // 选择了某个 devops 实例
    const handleSelect = (value: any) => {
        const { label: name } = devopsShiLiList.find((item) => item.value === value) || {};
        API.getDevopsUrl({ shiliId: value }).then(({ data = {} }) => {
            const { portalfront: url, uicfront: loginUrl, username, password } = data;
            form.setFieldsValue({
                name,
                url: `${url}/${appName}/#/`,
                loginUrl,
                username,
                password,
            });
        });
    };

    const handleOk = () => {
        form.validateFields().then((values) => {
            setLoading(true);
            // 去除值为空字符串的字段
            const params = Object.keys(values)
                .filter((key) => values[key] !== '')
                .reduce((acc, key) => ({ ...acc, [key]: values[key] }), {});

            API[isEdit ? 'updateVersion' : 'createVersion']({
                ...params,
                projectId,
                versionId,
            })
                .then(() => {
                    message.success('保存成功！');
                    onCancel(true);
                })
                .finally(() => {
                    setLoading(false);
                });
        });
    };

    return (
        <Modal
            title="子产品版本信息"
            open={open}
            confirmLoading={loading}
            forceRender
            destroyOnClose
            onOk={handleOk}
            onCancel={onCancel}
        >
            <Form form={form} labelCol={{ span: 5 }} wrapperCol={{ span: 18 }} name="Form">
                <Form.Item name="devopsShiLiId" label="绑定实例">
                    <Select
                        allowClear
                        placeholder="请选择绑定的 devops 实例"
                        disabled={isEdit}
                        options={devopsShiLiList}
                        onSelect={handleSelect}
                    />
                </Form.Item>
                <Form.Item name="name" label="版本名称" rules={[{ required: true }]}>
                    <Input allowClear placeholder="请输入版本名称" />
                </Form.Item>
                <Form.Item
                    name="url"
                    label="检测地址"
                    rules={[
                        { required: true },
                        { pattern: httpPattern, message: '请输入以 http(s) 开头的检测地址' },
                    ]}
                >
                    <Input allowClear placeholder="请输入检测地址" />
                </Form.Item>
                <Form.Item name="loginUrl" label="登录地址">
                    <Input allowClear placeholder="请输入登录地址" />
                </Form.Item>
                <Form.Item name="username" label="用户名">
                    <Input allowClear placeholder="请输入用户名" />
                </Form.Item>
                <Form.Item name="password" label="用户密码">
                    <Input allowClear placeholder="请输入用户密码" />
                </Form.Item>
            </Form>
        </Modal>
    );
}
