import { useEffect, useState } from 'react';
import { Button, Empty, Modal, Spin, Tabs, message } from 'antd';
import API from '../../../../utils/api';
import VersionModal from '../versionModal';
import { IProject, IVersion } from 'typing';
import './style.less';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import TaskTable from '../taskTable';

interface IProps {
    project: IProject | undefined;
}

export default function Versions(props: IProps) {
    const { project } = props;
    const { projectId } = project || {};
    const [versionList, setVersionList] = useState<IVersion[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [runLoading, setRunLoading] = useState<boolean>(false);
    const [isDefault, setIsDefault] = useState<boolean>(false);
    const [versionId, setVersionId] = useState<number | undefined>(undefined);
    // runTime 更新则代表 点击了运行按钮，需要更新任务列表
    const [runTime, setRunTime] = useState<number>(0);

    useEffect(() => {
        if (projectId) {
            setVersionId(undefined);
            getVersions(true);
        }
    }, [projectId]);

    useEffect(() => {
        setIsDefault(versionList.some((item) => !item.closable));
    }, [versionList]);

    // 获取版本列表
    const getVersions = (projectChanged = false) => {
        setLoading(true);
        API.getVersions({ projectId })
            .then((res) => {
                setVersionList(res.data || []);
                projectChanged && setVersionId(res.data?.[0]?.versionId);
                // 版本全部删除后清除 versionId
                !res.data?.length && setVersionId(undefined);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const renderItems = () => {
        return versionList.map((item: any) => {
            return {
                label: item.name,
                closable: item.closable,
                key: `${item.versionId}`,
                children: (
                    <TaskTable isDefault={isDefault} versionId={versionId} runTime={runTime} />
                ),
            };
        });
    };

    const onChange = (newActiveKey: string) => {
        setVersionId(Number(newActiveKey));
    };

    // 新增按钮
    const handleAdd = () => {
        setIsEdit(false);
        setOpen(true);
    };
    // 编辑按钮
    const handleEdit = () => {
        setIsEdit(true);
        setOpen(true);
    };
    // 新增或删除 tab
    const handleEditTab = (targetKey: any, action: 'add' | 'remove') => {
        if (action === 'remove') {
            // 删除版本
            Modal.confirm({
                title: '是否删除该版本？',
                icon: <ExclamationCircleOutlined />,
                onOk() {
                    API.deleteVersion({ versionId: targetKey }).then(() => {
                        getVersions();
                        message.success('操作成功！');
                    });
                },
            });
        }
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
            });
    };

    const renderButtons = () => {
        return isDefault ? null : (
            <>
                <Button onClick={handleAdd}>新增</Button>
                {!!versionList.length && (
                    <>
                        <Button style={{ marginLeft: 12 }} onClick={handleEdit}>
                            编辑
                        </Button>
                        <Button
                            type="primary"
                            style={{ marginLeft: 12 }}
                            loading={runLoading}
                            onClick={handleRun}
                        >
                            运行
                        </Button>
                    </>
                )}
            </>
        );
    };

    return (
        <>
            <div className="version-box">
                <Spin spinning={loading}>
                    <Tabs
                        hideAdd
                        type="editable-card"
                        items={renderItems()}
                        activeKey={`${versionId}`}
                        tabBarExtraContent={renderButtons()}
                        onChange={onChange}
                        onEdit={handleEditTab}
                    />
                </Spin>
                {!versionList.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
            </div>

            <VersionModal
                open={open}
                isEdit={isEdit}
                project={project}
                versionId={versionId}
                onCancel={(needFetch: boolean) => {
                    setOpen(false);
                    // 新增的第一个版本设置为默认的 versionId
                    needFetch && getVersions(!versionList.length);
                }}
            />
        </>
    );
}
