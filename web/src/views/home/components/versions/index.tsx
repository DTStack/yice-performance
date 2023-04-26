import { useEffect, useState } from 'react';
import { Button, DatePicker, Empty, Select, Tooltip } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import moment from 'moment';
import 'moment/dist/locale/zh-cn';
import API from '../../../../utils/api';
import VersionModal from '../versionModal';
import { IProject, IVersion } from 'typing';
import TaskTable from '../taskTable';
import ScheduleModal from '../scheduleModal';
import {
    disabledDate,
    formatTime,
    last7DaysRange,
    lastDayRange,
    parseTime,
    todayRange,
} from '../../../../utils/date';
import './style.less';

const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;

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
    const [versionId, setVersionId] = useState<number | undefined>(undefined);
    const [infoOpen, setInfoOpen] = useState<boolean>(false);
    const [scheduleOpen, setScheduleOpen] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [isDefault, setIsDefault] = useState<boolean>(false);
    const [startTime, setStartTime] = useState<string | undefined>(
        formatTime(moment().subtract(0, 'days'))
    );
    const [endTime, setEndTime] = useState<string | undefined>(
        formatTime(moment().subtract(0, 'days'), true)
    );

    useEffect(() => {
        if (projectId) {
            setVersionId(undefined);
            setIsDefault(false);
            getVersions(true);
        }
    }, [projectId]);

    // 获取版本列表
    const getVersions = (projectChanged = false) => {
        setLoading(true);
        API.getVersions({ projectId })
            .then((res) => {
                const _versionList = res.data || [];
                setVersionList(_versionList);

                // 版本全部删除后清除 versionId
                if (!_versionList?.length) {
                    setVersionId(undefined);
                    setIsDefault(false);
                } else {
                    if (projectChanged || _versionList?.length === 1) {
                        let versionIdTemp: any;
                        // 路由的 versionId 参数只使用一次
                        if (
                            Number(searchParams.get('versionId')) &&
                            sessionStorage.getItem('yice-versionId-used') !== 'yes'
                        ) {
                            versionIdTemp = Number(searchParams.get('versionId'));
                            sessionStorage.setItem('yice-versionId-used', 'yes');
                        } else {
                            versionIdTemp = _versionList?.[0]?.versionId;
                        }

                        setVersionId(versionIdTemp);
                        setIsDefault(
                            _versionList.find((item: IVersion) => item.versionId === versionIdTemp)
                                ?.isDefault || false
                        );
                    }
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // 版本变化
    const handleVersionChange = (value: string, option: any) => {
        setVersionId(Number(value));
        setIsDefault(option?.isDefault || false);
    };

    // 日期变化
    const changeDate = (value: any) => {
        // 清除选择后查询
        if (value === null) {
            setStartTime(undefined);
            setEndTime(undefined);
            setRunTime(new Date().getTime());
        } else {
            setStartTime(formatTime(value?.[0]));
            setEndTime(formatTime(value?.[1], true));
        }
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

    return (
        <>
            <div className="version-box">
                <div className="top-box">
                    <div className="search-params">
                        {versionList.length ? (
                            <>
                                <Select
                                    className="search-params-item"
                                    value={versionId ? `${versionId}` : undefined}
                                    onChange={handleVersionChange}
                                    loading={loading}
                                    placeholder="请选择版本"
                                >
                                    {versionList.map((version: IVersion) => {
                                        return (
                                            <Option
                                                key={version.versionId}
                                                value={`${version.versionId}`}
                                            >
                                                {version.name}
                                            </Option>
                                        );
                                    })}
                                </Select>
                                <RangePicker
                                    className="search-params-item"
                                    disabledDate={disabledDate}
                                    ranges={{
                                        最近7天: last7DaysRange,
                                        昨天: lastDayRange,
                                        今天: todayRange,
                                    }}
                                    value={[parseTime(startTime) as any, parseTime(endTime) as any]}
                                    onChange={changeDate}
                                    onOpenChange={(open) =>
                                        !open && setRunTime(new Date().getTime())
                                    }
                                    getPopupContainer={(triggerNode) =>
                                        triggerNode.parentElement as any
                                    }
                                />
                            </>
                        ) : null}
                    </div>

                    {/* 右上角按钮区域 */}
                    {isDefault ? null : (
                        <>
                            <Tooltip title="添加版本">
                                <Button icon={<PlusOutlined />} onClick={handleAdd} />
                            </Tooltip>
                            {versionList.length ? (
                                <>
                                    <Tooltip title="编辑版本">
                                        <Button
                                            className="left-btn"
                                            icon={<EditOutlined />}
                                            onClick={handleEdit}
                                        />
                                    </Tooltip>
                                    <Button
                                        className="left-btn"
                                        type="primary"
                                        onClick={handleSchedule}
                                    >
                                        调度
                                    </Button>
                                </>
                            ) : null}
                        </>
                    )}
                </div>

                {versionList.length ? (
                    <TaskTable
                        isDefault={isDefault}
                        versionId={versionId}
                        startTime={startTime}
                        endTime={endTime}
                        runTime={runTime}
                        setRunTime={setRunTime}
                    />
                ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
            </div>

            <VersionModal
                open={infoOpen}
                isEdit={isEdit}
                project={project}
                defaultVersionId={versionId}
                versionList={versionList}
                onCancel={(needFetch: boolean) => {
                    setInfoOpen(false);
                    // 新增的第一个版本设置为默认的 versionId
                    needFetch && getVersions(!versionList.length);
                }}
            />

            <ScheduleModal
                open={scheduleOpen}
                project={project}
                defaultVersionId={versionId}
                versionList={versionList}
                setRunTime={setRunTime}
                onCancel={() => setScheduleOpen(false)}
            />
        </>
    );
}
