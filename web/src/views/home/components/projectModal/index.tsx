import { useEffect, useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { ProjectInfo } from 'typing';
import { httpPattern } from '../../../../utils';
import API from '../../../../utils/api';

interface IProps {
    open: boolean;
    projectInfo: ProjectInfo;
    onCancel: any;
}

function ProjectModal(props: IProps) {
    const { open, projectInfo, onCancel } = props;
    const { projectId } = projectInfo;
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setTimeout(() => {
            form.setFieldsValue(projectInfo);
        }, 200);
    }, [open]);

    const handleOk = () => {
        setLoading(true);
        form.validateFields()
            .then((values) => {
                // 去除值为空字符串的字段
                const params = Object.keys(values)
                    .filter((key) => values[key] !== '')
                    .reduce((acc, key) => ({ ...acc, [key]: values[key] }), {});
                API.updateProject({ ...params, projectId })
                    .then(() => {
                        message.success('保存成功！');
                        onCancel(true);
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            })
            .catch(() => {
                setLoading(false);
            });
    };

    return (
        <Modal
            title="项目配置"
            open={open}
            confirmLoading={loading}
            onOk={handleOk}
            onCancel={onCancel}
            forceRender
            destroyOnClose
        >
            <Form form={form} layout="vertical" name="Form">
                <Form.Item name="name" label="项目名称" rules={[{ required: true }]}>
                    <Input allowClear placeholder="请输入项目名称" />
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

export default ProjectModal;
