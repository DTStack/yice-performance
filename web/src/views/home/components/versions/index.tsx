import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EditOutlined, LineChartOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, DatePicker, Empty, Input, Select, Tooltip } from 'antd';
import { IProject, IVersion } from 'typing';
// import moment from 'moment';
import 'moment/dist/locale/zh-cn';

import API from '../../../../utils/api';
import {
    disabledDate,
    formatTime,
    last7DaysRange,
    last30DaysRange,
    lastDayRange,
    parseTime,
    todayRange,
} from '../../../../utils/date';
import ChartModal from '../chartModal';
import PatchDataModal from '../patchDataModal';
import ScheduleModal from '../scheduleModal';
import TaskTable from '../taskTable';
import VersionModal from '../versionModal';
import './style.less';

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
    const [versionId, setVersionId] = useState<number | undefined | null>(undefined);
    const [infoOpen, setInfoOpen] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [scheduleOpen, setScheduleOpen] = useState<boolean>(false);
    const [chartOpen, setChartOpen] = useState<boolean>(false);
    const [patchDataOpen, setPatchDataOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [isDefault, setIsDefault] = useState<boolean>(false);
    const [searchStr, setSearchStr] = useState<string | undefined>(undefined);
    const [startTime, setStartTime] = useState<string | undefined>(
        // formatTime(moment().subtract(0, 'days'))
        undefined
    );
    const [endTime, setEndTime] = useState<string | undefined>(
        // formatTime(moment().subtract(0, 'days'), true)
        undefined
    );

    useEffect(() => {
        if (projectId) {
            // 切换项目要清空版本名称的输入
            setSearchStr(undefined);

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
                        let versionIdTemp = versionId;
                        // 路由的 versionId 参数在当前返回的版本列表里，则使用；反之不使用，对应的场景是已经切换到其他项目了
                        const _versionId = Number(searchParams.get('versionId'));
                        if (
                            _versionId &&
                            _versionList.some(
                                (version: IVersion) => version.versionId === _versionId
                            )
                        ) {
                            versionIdTemp = _versionId;
                        } else {
                            // 为了保证默认不选择版本时，切换项目也能触发 taskTable 的 versionId 变化监听，从而请求任务列表
                            if (versionIdTemp === undefined) {
                                versionIdTemp = null;
                            } else if (versionIdTemp === null) {
                                versionIdTemp = undefined;
                            } else {
                                versionIdTemp = null;
                            }
                        }

                        // 在汇总页，仅有一个版本，此时要把 versionId 传给后端
                        const _isDefault =
                            _versionList?.length === 1 &&
                            _versionList.some((item: IVersion) => item.isDefault);
                        _isDefault && (versionIdTemp = _versionList?.[0]?.versionId);
                        setVersionId(versionIdTemp);
                        setIsDefault(_isDefault);
                    }
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // 版本变化
    const handleVersionChange = (value: string, option: any) => {
        setVersionId(value ? Number(value) : undefined);
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
    // 性能趋势按钮
    const handleChart = () => {
        setChartOpen(true);
    };
    // 补数据按钮
    const handlePatchData = () => {
        setPatchDataOpen(true);
    };
    // 调度按钮
    const handleSchedule = () => {
        setScheduleOpen(true);
    };

    // 版本名称输入框内容变化
    const handleInputChange = (e: any) => {
        const value = e?.target?.value;
        setSearchStr(value);
        // allowClear, clear 事件的响应
        if (e.type === 'click' && value === '') {
            setRunTime(new Date().getTime());
        }
    };
    // 输入框的回车事件
    const handleInputEnter = (e: any) => {
        // 中文输入法输入时回车，keyCode 是 229；光标在输入框直接回车，keyCode 是 13
        e.keyCode === 13 && setRunTime(new Date().getTime());
    };

    return (
        <>
            <div className="version-box">
                <div className="top-box">
                    <div className="search-params">
                        {versionList.length ? (
                            <>
                                <Input
                                    className="search-params-item"
                                    value={searchStr}
                                    maxLength={100}
                                    allowClear
                                    placeholder="搜索 taskId 或版本名称"
                                    onChange={handleInputChange}
                                    onPressEnter={handleInputEnter}
                                />

                                {!isDefault && (
                                    <Select
                                        className="search-params-item"
                                        value={versionId ? `${versionId}` : undefined}
                                        onChange={handleVersionChange}
                                        loading={loading}
                                        allowClear
                                        placeholder="请选择版本"
                                        options={versionList.map((item: IVersion) => {
                                            return {
                                                label: item.name,
                                                value: `${item.versionId}`,
                                                isDefault: item.isDefault,
                                            };
                                        })}
                                    />
                                )}

                                <RangePicker
                                    className="search-params-item"
                                    disabledDate={disabledDate}
                                    ranges={{
                                        最近30天: last30DaysRange,
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
                                    <Tooltip title="性能趋势">
                                        <Button
                                            className="left-btn"
                                            icon={<LineChartOutlined />}
                                            onClick={handleChart}
                                        />
                                    </Tooltip>
                                    <Button className="left-btn" onClick={handlePatchData}>
                                        补数据
                                    </Button>
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
                        versionListLoading={loading}
                        projectId={projectId}
                        versionId={versionId}
                        searchStr={searchStr}
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
                versionList={versionList}
                defaultVersionId={versionId ?? versionList[0]?.versionId}
                onCancel={(needFetch: boolean) => {
                    setInfoOpen(false);
                    // 新增的第一个版本设置为默认的 versionId
                    needFetch && getVersions(!versionList.length);
                }}
            />

            <ChartModal
                open={chartOpen}
                project={project}
                versionList={versionList}
                onCancel={() => setChartOpen(false)}
            />

            <PatchDataModal
                open={patchDataOpen}
                project={project}
                versionList={versionList}
                setRunTime={setRunTime}
                onCancel={() => setPatchDataOpen(false)}
            />

            <ScheduleModal
                open={scheduleOpen}
                project={project}
                versionList={versionList}
                defaultVersionId={versionId ?? versionList[0]?.versionId}
                setRunTime={setRunTime}
                onCancel={() => setScheduleOpen(false)}
            />
        </>
    );
}
