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

export default function HourSelect(props: IProps) {
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
        setLoading(true);
        form.validateFields()
            .then((values) => {
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
            })
            .catch(() => {
                setLoading(false);
            });
    };

    return <Select options={scheduleTypeList} onSelect={handleScheduleType} />;
}
