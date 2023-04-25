import { useEffect, useState } from 'react';
import { Modal, Form, Input, message, Select, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { httpPattern } from '../../../../utils';
import API from '../../../../utils/api';
import { IProject } from 'typing';
import './style.less';

interface IProps {
    open: boolean;
    isEdit: boolean;
    project: IProject | undefined;
    versionId: number | undefined;
    onCancel: (needFetch: any) => void;
}

export default function VersionModal(props: IProps) {
    const { open, isEdit, project, versionId, onCancel } = props;
    const { projectId, appName, devopsProjectIds } = project || {};
    const [form] = Form.useForm();
    const [fetching, setFetching] = useState<boolean>(false);
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
        setFetching(true);
        API.getShiLis({ devopsProjectIds })
            .then((res) => {
                setDevopsShiLiList(
                    res.data?.map((item: any) => {
                        return {
                            label: item.label,
                            value: item.id,
                        };
                    }) || []
                );
            })
            .finally(() => {
                setFetching(false);
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

    // 删除版本
    const handleDelete = () => {
        Modal.confirm({
            title: '是否删除该版本？',
            icon: <ExclamationCircleOutlined />,
            onOk() {
                API.deleteVersion({ versionId }).then(() => {
                    onCancel(true);
                    message.success('操作成功！');
                });
            },
        });
    };

    // 输入框的回车事件
    const handleInputEnter = (e: any) => {
        // 中文输入法输入时回车，keyCode 是 229；光标在输入框直接回车，keyCode 是 13
        !loading && e.keyCode === 13 && handleOk();
    };

    const footerRender = () => {
        return (
            <div className="footer-btn">
                <div className="btn-box">
                    {isEdit ? (
                        <Button danger onClick={handleDelete}>
                            删除
                        </Button>
                    ) : null}
                </div>
                <Button onClick={onCancel}>取消</Button>
                <Button type="primary" loading={loading} onClick={handleOk}>
                    确定
                </Button>
            </div>
        );
    };

    return (
        <Modal
            title="子产品版本信息"
            open={open}
            forceRender
            destroyOnClose
            onCancel={onCancel}
            footer={footerRender()}
        >
            <Form form={form} labelCol={{ span: 5 }} wrapperCol={{ span: 18 }} name="Form">
                <Form.Item name="devopsShiLiId" label="绑定实例">
                    <Select
                        allowClear
                        placeholder="请选择绑定的 devops 实例"
                        disabled={isEdit}
                        options={devopsShiLiList}
                        loading={fetching}
                        onSelect={handleSelect}
                    />
                </Form.Item>
                <Form.Item name="name" label="版本名称" rules={[{ required: true }]}>
                    <Input
                        allowClear
                        placeholder="请输入版本名称"
                        onPressEnter={handleInputEnter}
                    />
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
