import { useContext, useEffect, useState } from 'react';
import { EditOutlined, LineChartOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, DatePicker, Empty, Input, Select, Tooltip } from 'antd';
import { IVersion } from 'typing';
import 'moment/dist/locale/zh-cn';

import { YICE_ROLE } from '../../../../const/role';
import { InitContext } from '../../../../store';
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
import { PatchDataIcon, ScheduleIcon } from './icon';
import './style.less';

const RangePicker = DatePicker.RangePicker;

export default function Versions() {
    const {
        project,
        versionId,
        startTime,
        endTime,
        searchStr,
        setVersionId,
        setRunTime,
        setStartTime,
        setEndTime,
        setSearchStr,
        setCurrent,
    } = useContext(InitContext);

    const { projectId } = project || {};
    const [versionList, setVersionList] = useState<IVersion[]>([]);
    const [versionOpen, setVersionOpen] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [scheduleOpen, setScheduleOpen] = useState<boolean>(false);
    const [chartOpen, setChartOpen] = useState<boolean>(false);
    const [patchDataOpen, setPatchDataOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [isDefault, setIsDefault] = useState<boolean>(false);

    const yiceRole = localStorage.getItem('yice-role');

    // 切换项目时获取版本列表
    useEffect(() => {
        projectId && getVersions(true);
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
                        // 如果 router-params_versionId 中有值，则使用
                        const _versionId =
                            sessionStorage.getItem('router-params_versionId') || undefined;
                        if (_versionId) {
                            sessionStorage.removeItem('router-params_versionId');
                            setVersionId(_versionId);
                        }

                        // 在汇总页，仅有一个版本
                        const _isDefault =
                            _versionList?.length === 1 &&
                            _versionList.some((item: IVersion) => item.isDefault);
                        setIsDefault(_isDefault);
                    }
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // 版本变化 应清除搜索框的内容，将 current 置为 1，再请求 taskList
    const handleVersionChange = (value: string, option?: any) => {
        setVersionId(value ? Number(value) : undefined);
        setSearchStr(undefined);
        setCurrent(1);
        setIsDefault(option?.isDefault || false);

        setRunTime(new Date().getTime());
    };

    // 起止日期变化 应当将 current 置为 1，再请求 taskList
    const changeDate = (value: any) => {
        // 清除选择后查询
        if (value === null) {
            setStartTime(undefined);
            setEndTime(undefined);
        } else {
            setStartTime(formatTime(value?.[0]));
            setEndTime(formatTime(value?.[1], true));
        }

        setCurrent(1);
        setRunTime(new Date().getTime());
    };

    // 新增按钮
    const handleAdd = () => {
        setIsEdit(false);
        setVersionOpen(true);
    };
    // 编辑按钮
    const handleEdit = () => {
        setIsEdit(true);
        setVersionOpen(true);
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

    // 版本名称输入框内容变化 搜索 taskId 或版本名称时，应当将 current 置为 1，再请求 taskList
    const handleInputChange = (e: any) => {
        const value = e?.target?.value;
        setSearchStr(value || undefined);
        // 设置了 allowClear, clear 事件的响应
        if (e.type === 'click' && value === '') {
            setCurrent(1);
            setRunTime(new Date().getTime());
        }
    };
    // 输入框的回车事件 搜索 taskId 或版本名称时，应当将 current 置为 1，再请求 taskList
    const handleInputEnter = (e: any) => {
        // 中文输入法输入时回车，keyCode 是 229；光标在输入框直接回车，keyCode 是 13
        if (e.keyCode === 13) {
            setCurrent(1);
            setRunTime(new Date().getTime());
        }
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
                                    getPopupContainer={(triggerNode) =>
                                        triggerNode.parentElement as any
                                    }
                                />
                            </>
                        ) : null}
                    </div>

                    {/* 右上角按钮区域 */}
                    {isDefault ? null : (
                        <div className="btn-box">
                            <Tooltip title="添加版本">
                                <Button icon={<PlusOutlined />} onClick={handleAdd} />
                            </Tooltip>
                            {versionList.length ? (
                                <>
                                    {yiceRole === YICE_ROLE.ADMIN && (
                                        <Tooltip title="编辑版本">
                                            <Button icon={<EditOutlined />} onClick={handleEdit} />
                                        </Tooltip>
                                    )}
                                    <Tooltip title="性能趋势">
                                        <Button
                                            icon={<LineChartOutlined />}
                                            onClick={handleChart}
                                        />
                                    </Tooltip>

                                    <Tooltip title="补数据">
                                        <Button
                                            icon={<PatchDataIcon />}
                                            onClick={handlePatchData}
                                        />
                                    </Tooltip>
                                    <Tooltip title="调度">
                                        <Button icon={<ScheduleIcon />} onClick={handleSchedule} />
                                    </Tooltip>
                                </>
                            ) : null}
                        </div>
                    )}
                </div>

                {versionList.length ? (
                    <TaskTable versionListLoading={loading} />
                ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
            </div>

            <VersionModal
                open={versionOpen}
                isEdit={isEdit}
                project={project}
                versionList={versionList}
                defaultVersionId={versionId ?? versionList[0]?.versionId}
                handleVersionChange={handleVersionChange}
                onCancel={(needFetch: boolean) => {
                    setVersionOpen(false);
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
