import { useEffect, useState } from 'react';
import { Button, Empty, Spin, Tabs } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import API from '../../../../utils/api';
import VersionModal from '../versionModal';
import { IProject, IVersion } from 'typing';
import TaskTable from '../taskTable';
import ScheduleModal from '../scheduleModal';
import './style.less';

interface IProps {
    project: IProject | undefined;
    runTime: number;
    setRunTime: (runTime: number) => void;
}

export default function Versions(props: IProps) {
    const [searchParams] = useSearchParams();
    const { project, runTime, setRunTime } = props;
    const { projectId } = project || {};
    const [versionList, setVersionList] = useState<IVersion[]>([]);
    const [infoOpen, setInfoOpen] = useState<boolean>(false);
    const [scheduleOpen, setScheduleOpen] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [isDefault, setIsDefault] = useState<boolean>(false);
    const [versionId, setVersionId] = useState<number | undefined>(undefined);

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

                // 版本全部删除后清除 versionId
                if (!res.data?.length) {
                    setVersionId(undefined);
                } else {
                    if (projectChanged || res.data?.length === 1) {
                        let versionIdTemp;
                        // 路由的 versionId 参数只使用一次
                        if (
                            Number(searchParams.get('versionId')) &&
                            sessionStorage.getItem('yice-versionId-used') !== 'yes'
                        ) {
                            versionIdTemp = Number(searchParams.get('versionId'));
                            sessionStorage.setItem('yice-versionId-used', 'yes');
                        } else {
                            versionIdTemp = res.data?.[0]?.versionId;
                        }

                        setVersionId(versionIdTemp);
                    }
                }
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
                    <TaskTable
                        isDefault={!item.closable}
                        versionId={versionId}
                        runTime={runTime}
                        setRunTime={setRunTime}
                    />
                ),
            };
        });
    };

    // 切换版本
    const onChange = (newActiveKey: string) => {
        setVersionId(Number(newActiveKey));
    };

    // 新增按钮
    const handleAdd = () => {
        setIsEdit(false);
        setInfoOpen(true);
    };
    // 编辑按钮
    const handleEdit = () => {
        setIsEdit(true);
        setInfoOpen(true);
    };
    // 调度按钮
    const handleSchedule = () => {
        setScheduleOpen(true);
    };

    // 渲染右上角的操作区域
    const renderButtons = () => {
        return isDefault ? null : (
            <>
                <Button icon={<PlusOutlined />} onClick={handleAdd} />
                {!!versionList.length && (
                    <>
                        <Button className="btn-left" icon={<EditOutlined />} onClick={handleEdit} />
                        <Button className="btn-left" type="primary" onClick={handleSchedule}>
                            调度
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
                        type="card"
                        items={renderItems()}
                        activeKey={`${versionId}`}
                        tabBarExtraContent={renderButtons()}
                        onChange={onChange}
                    />
                </Spin>
                {!versionList.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
            </div>

            <VersionModal
                open={infoOpen}
                isEdit={isEdit}
                project={project}
                versionId={versionId}
                onCancel={(needFetch: boolean) => {
                    setInfoOpen(false);
                    // 新增的第一个版本设置为默认的 versionId
                    needFetch && getVersions(!versionList.length);
                }}
            />

            <ScheduleModal
                open={scheduleOpen}
                versionId={versionId}
                versionName={versionList.find((item) => item.versionId === versionId)?.name}
                project={project}
                onCancel={() => setScheduleOpen(false)}
                setRunTime={setRunTime}
            />
        </>
    );
}
