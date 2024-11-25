import { useEffect, useState } from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Select, Spin } from 'antd';
import { IProject, IVersion } from 'typing';

import { YICE_ROLE } from '../../../../const/role';
import { httpPattern } from '../../../../utils';
import API from '../../../../utils/api';
import './style.less';

interface IProps {
    open: boolean;
    isEdit: boolean;
    project: IProject | undefined;
    versionList: IVersion[];
    defaultVersionId: number | null | undefined;
    handleVersionChange: Function;
    onCancel: (needFetch: boolean) => void;
}

export default function VersionModal(props: IProps) {
    const { open, isEdit, project, versionList, defaultVersionId, handleVersionChange, onCancel } =
        props;
    const { projectId, appName, devopsProjectIds } = project || {};
    const [form] = Form.useForm();
    const [formLoading, setFormLoading] = useState<boolean>(false);
    const [shiliFetching, setShiliFetching] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [devopsShiLiId, setDevopsShiLiId] = useState<number | undefined>(undefined);
    const [envList, setEnvList] = useState<any[]>([]);
    const [envGroupList, setEnvGroupList] = useState<any[]>([]);

    // hostList 的 value 需要和 hostUrlList 的 value 同步修改
    const hostList = [
        { label: '7.0.x', value: 100_000 },
        { label: '6.3.x', value: 100_001 },
    ];

    const yiceRole = localStorage.getItem('yice-role');

    useEffect(() => {
        if (open) {
            form.resetFields();
            isEdit && getVersion();
            getShiLis();
        }
    }, [open]);

    const getVersion = () => {
        setFormLoading(true);
        const versionId = form.getFieldValue('versionId') || defaultVersionId;
        API.getVersion({ versionId })
            .then((res) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { versionId: _versionId, ...version } = res.data || {};
                setDevopsShiLiId(res?.data?.devopsShiLiId);
                setTimeout(() => {
                    form.setFieldsValue(version);
                }, 200);
            })
            .finally(() => {
                setFormLoading(false);
            });
    };

    // 获取项目下的环境列表
    const getShiLis = () => {
        setShiliFetching(true);
        API.getShiLis({ devopsProjectIds })
            .then((res) => {
                const devopsEnvList =
                    res.data?.map((item: any) => {
                        return {
                            label: item.label,
                            value: item.id,
                        };
                    }) || [];
                setEnvList(hostList.concat(devopsEnvList));
                setEnvGroupList([
                    { label: '主机环境', options: hostList },
                    {
                        label: 'devops 环境',
                        options: devopsEnvList,
                    },
                ]);
            })
            .finally(() => {
                setShiliFetching(false);
            });
    };

    // 选择了某个环境
    const handleSelect = (value: any) => {
        setFormLoading(true);
        setDevopsShiLiId(value);
        const { label: name } = envList.find((item) => item.value === value) || {};
        API.getDevopsUrl({ shiliId: value })
            .then(({ data = {} }) => {
                const { portalfront: url, loginUrl, username, password } = data;
                form.setFieldsValue({
                    name,
                    url: `${url}/${appName}/#/`,
                    loginUrl: `${loginUrl}`,
                    username,
                    password,
                });
            })
            .finally(() => {
                setFormLoading(false);
            });
    };

    const handleCancel = (e: any) => {
        setDevopsShiLiId(undefined);
        onCancel(typeof e === 'boolean' ? e : false);
    };

    const handleOk = () => {
        form.validateFields().then((values) => {
            setSaving(true);
            // 去除值为空字符串的字段
            const params = Object.keys(values)
                .filter((key) => values[key] !== '')
                .reduce((acc, key) => ({ ...acc, [key]: values[key] }), {});

            API[isEdit ? 'updateVersion' : 'createVersion']({
                ...params,
                projectId,
            })
                .then(() => {
                    message.success('保存成功！');
                    handleCancel(true);
                })
                .finally(() => {
                    setSaving(false);
                });
        });
    };

    // 删除版本
    const handleDelete = () => {
        const versionId = form.getFieldValue('versionId') || defaultVersionId;
        Modal.confirm({
            title: '是否删除该版本？',
            icon: <ExclamationCircleOutlined />,
            onOk() {
                setDeleting(true);
                API.deleteVersion({ versionId })
                    .then(() => {
                        // 删除版本后重新获取任务列表
                        handleVersionChange(undefined);

                        handleCancel(true);
                        message.success('操作完成！');
                    })
                    .finally(() => {
                        setDeleting(false);
                    });
            },
        });
    };

    // 输入框的回车事件
    const handleInputEnter = (e: any) => {
        // 中文输入法输入时回车，keyCode 是 229；光标在输入框直接回车，keyCode 是 13
        !saving && e.keyCode === 13 && handleOk();
    };

    const footerRender = () => {
        const loading = deleting || saving || formLoading;
        return (
            <div className="footer-btn">
                {isEdit && yiceRole === YICE_ROLE.ADMIN ? (
                    <Button danger loading={loading} onClick={handleDelete}>
                        删除
                    </Button>
                ) : null}
                <Button onClick={handleCancel}>取消</Button>
                <Button type="primary" loading={loading} onClick={handleOk}>
                    确定
                </Button>
            </div>
        );
    };

    const devopsShiLiIdDeleted =
        isEdit &&
        envList.length &&
        devopsShiLiId &&
        !envList.map((item) => item.value).includes(devopsShiLiId);
    const validateStatus = devopsShiLiIdDeleted ? 'error' : '';
    const help = devopsShiLiIdDeleted ? '当前绑定环境已被删除' : '';

    return (
        <Modal
            title={`${isEdit ? '编辑' : '新增'}版本（${project?.name}）`}
            open={open}
            forceRender
            destroyOnClose
            onCancel={handleCancel}
            footer={footerRender()}
        >
            <Spin spinning={formLoading}>
                <Form form={form} labelCol={{ span: 5 }} wrapperCol={{ span: 18 }} name="Form">
                    {isEdit ? (
                        <Form.Item
                            name="versionId"
                            label="版本"
                            rules={[{ required: true }]}
                            initialValue={defaultVersionId ? `${defaultVersionId}` : undefined}
                        >
                            <Select
                                loading={formLoading}
                                placeholder="请选择版本"
                                onChange={getVersion}
                                options={versionList.map((item: IVersion) => {
                                    return {
                                        label: `${item.name}${
                                            item.isFreeze === 1 ? '(已冻结)' : ''
                                        }`,
                                        value: `${item.versionId}`,
                                    };
                                })}
                            />
                        </Form.Item>
                    ) : null}
                    <Form.Item
                        name="devopsShiLiId"
                        label="绑定环境"
                        validateStatus={validateStatus}
                        help={help}
                    >
                        <Select
                            allowClear
                            placeholder="请选择绑定的环境"
                            options={envGroupList}
                            loading={shiliFetching}
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
                        <Input
                            allowClear
                            placeholder="请输入检测地址"
                            onPressEnter={handleInputEnter}
                        />
                    </Form.Item>
                    <Form.Item name="loginUrl" label="登录地址">
                        <Input allowClear placeholder="请输入登录地址" />
                    </Form.Item>
                    <Form.Item name="username" label="用户名">
                        <Input allowClear placeholder="请输入用户名" />
                    </Form.Item>
                    <Form.Item name="password" label="用户密码">
                        <Input
                            allowClear
                            placeholder="请输入用户密码"
                            onPressEnter={handleInputEnter}
                        />
                    </Form.Item>
                    {/* 暂时隐藏 服务端已经通过两个 versionSort 方法进行排序 */}
                    {/* <Form.Item
                        name="sort"
                        label=" 排序序号"
                        tooltip="序号数字越大越靠前"
                        rules={[{ required: true }]}
                        initialValue={1}
                    >
                        <InputNumber min={1} max={20} precision={0} placeholder="请输入排序序号" />
                    </Form.Item> */}
                </Form>
            </Spin>
        </Modal>
    );
}
