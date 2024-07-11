import { useEffect, useState } from 'react';
import { Button, DatePicker, Empty, Modal, Select, Spin, Tabs } from 'antd';
import { isEqual } from 'lodash';
import { IBuild, IProject, IVersion } from 'typing';

import API from '../../../../utils/api';
import {
    disabledDate,
    formatTime,
    last7DaysRange,
    last30DaysRange,
    last90DaysRange,
    last180DaysRange,
    lastDayRange,
    parseTime,
    todayRange,
} from '../../../../utils/date';
import BuildChart from './buildChart';
import FileSizeChart from './fileSizeChart';
import ProjectChart, { IProjectChartData } from './projectChart';
import './style.less';

const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;

interface IProps {
    open: boolean;
    project: IProject | undefined;
    versionList: IVersion[];
    onCancel: () => void;
}

export default function ChartModal(props: IProps) {
    const { open, project, versionList, onCancel } = props;
    const [projectChartLoading, setProjectChartLoading] = useState<boolean>(false);
    const [fileSizeChartLoading, setFileSizeChartLoading] = useState<boolean>(false);
    const [buildChartLoading, setBuildChartLoading] = useState<boolean>(false);
    const [tabActiveKey, setTabActiveKey] = useState<string>('project');
    // 性能分数趋势图
    const [projectChartData, setProjectChartData] = useState<IProjectChartData>();
    // 构建产物大小分析图
    const [fileSizeVersions, setFileSizeVersions] = useState<string[]>([]);
    const [fileSizeList, setFileSizeList] = useState<string[]>([]);
    // 版本构建性能图
    const [buildVersions, setBuildVersions] = useState<string[]>([]);
    const [buildChartData, setBuildChartData] = useState<IBuild[]>([]);

    const [dateRange, setDateRange] = useState<any[]>([undefined, undefined]);

    useEffect(() => {
        const [startTimeInitialValue, endTimeInitialValue] = last7DaysRange;
        setDateRange(
            open
                ? [formatTime(startTimeInitialValue), formatTime(endTimeInitialValue, true)]
                : [undefined, undefined]
        );
    }, [open]);

    // 切换 tab 时改变默认的时间范围让下方监听 dateRange 的 useEffect 去请求数据；如果和当时间范围相同则直接请求数据
    useEffect(() => {
        if (open) {
            let daysRange;
            if (tabActiveKey === 'project') {
                isEqual(dateRange, last7DaysRange)
                    ? getProjectChart()
                    : (daysRange = last7DaysRange);
            } else if (tabActiveKey === 'file-size') {
                isEqual(dateRange, last30DaysRange)
                    ? getFileSizeChart()
                    : (daysRange = last30DaysRange);
            } else if (tabActiveKey === 'version-build') {
                isEqual(dateRange, last7DaysRange) ? getBuildChart() : (daysRange = last7DaysRange);
            }

            const [startTimeInitialValue, endTimeInitialValue] = daysRange;
            setDateRange([
                formatTime(startTimeInitialValue),
                formatTime(endTimeInitialValue, true),
            ]);
        }
    }, [tabActiveKey]);

    // 时间范围改变会更新 chart 数据
    useEffect(() => {
        if (open) {
            if (tabActiveKey === 'project') {
                getProjectChart();
            } else if (tabActiveKey === 'file-size') {
                getFileSizeChart();
            } else if (tabActiveKey === 'version-build') {
                getBuildChart();
            }
        }
    }, [dateRange]);

    // 获取子产品所有版本的性能分数
    const getProjectChart = () => {
        setProjectChartLoading(true);
        const [startTime, endTime] = dateRange;
        API.getProjectChart({ projectId: project?.projectId, startTime, endTime })
            .then((res) => {
                setProjectChartData(res.data || {});
            })
            .finally(() => {
                setProjectChartLoading(false);
            });
    };

    // 构建产物大小分析图
    const getFileSizeChart = () => {
        setFileSizeChartLoading(true);
        const [startTime, endTime] = dateRange;
        API.getFileSizeChart({ projectId: project?.projectId, startTime, endTime })
            .then((res) => {
                const { fileSizeVersions, fileSizeList } = res.data || {};

                setFileSizeVersions(fileSizeVersions);
                setFileSizeList(fileSizeList);
            })
            .finally(() => {
                setFileSizeChartLoading(false);
            });
    };

    // 获取子产品版本构建性能图
    const getBuildChart = () => {
        setBuildChartLoading(true);
        const [startTime, endTime] = dateRange;
        API.getBuildChart({ projectId: project?.projectId, startTime, endTime })
            .then((res) => {
                const { buildVersions, data } = res.data || {};

                setBuildVersions(buildVersions);

                setBuildChartData(data);
            })
            .finally(() => {
                setBuildChartLoading(false);
            });
    };

    // 日期变化
    const changeDate = (value: any) => {
        const [startTime, endTime] = value || [undefined, undefined];
        setDateRange([formatTime(startTime), formatTime(endTime, true)]);
    };

    // 子产品性能评分趋势图
    const renderProjectChart = () => {
        return (
            <Spin spinning={projectChartLoading}>
                {projectChartData?.versionNameList?.length ? (
                    <ProjectChart data={projectChartData} />
                ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
            </Spin>
        );
    };

    // 构建产物大小分析图
    const renderFileSizeChart = () => {
        return (
            <Spin spinning={fileSizeChartLoading}>
                {fileSizeVersions.length ? (
                    <FileSizeChart
                        fileSizeVersions={fileSizeVersions}
                        fileSizeList={fileSizeList}
                    />
                ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
            </Spin>
        );
    };

    // 版本构建性能图
    const renderBuildChart = () => {
        return (
            <Spin spinning={buildChartLoading}>
                {buildVersions.length ? (
                    <BuildChart data={buildChartData} buildVersions={buildVersions} />
                ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
            </Spin>
        );
    };

    const tabItems = [
        { label: '性能评分趋势图', key: 'project', children: renderProjectChart() },
        {
            label: '构建产物大小分析图',
            key: 'file-size',
            disabled: true,
            children: renderFileSizeChart(),
        },
        {
            label: '版本构建性能图',
            key: 'version-build',
            disabled: true,
            children: renderBuildChart(),
        },
    ];

    const tabBarExtraContent = () => {
        return (
            <div className="search-params">
                {versionList.length ? (
                    <>
                        {tabActiveKey === 'version' && (
                            <Select
                                placeholder="请选择版本"
                                // onChange={getVersion}
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
                        )}
                        <RangePicker
                            disabledDate={disabledDate}
                            allowClear={false}
                            ranges={{
                                最近180天: last180DaysRange,
                                最近90天: last90DaysRange,
                                最近30天: last30DaysRange,
                                最近7天: last7DaysRange,
                                昨天: lastDayRange,
                                今天: todayRange,
                            }}
                            value={[parseTime(dateRange[0]) as any, parseTime(dateRange[1]) as any]}
                            onChange={changeDate}
                            getPopupContainer={(triggerNode) => triggerNode.parentElement as any}
                        />
                    </>
                ) : null}
            </div>
        );
    };

    const handleCancel = () => {
        onCancel();

        setTimeout(() => {
            setProjectChartData(undefined);
            setFileSizeVersions([]);
            setFileSizeList([]);
            setBuildVersions([]);
            setBuildChartData([]);
            setTabActiveKey('project');
        }, 200);
    };

    return (
        <Modal
            width={1000}
            title={`性能趋势（${project?.name}）`}
            className="chart-modal"
            open={open}
            forceRender
            destroyOnClose
            onCancel={handleCancel}
            footer={[
                <Button type="primary" key="back" onClick={handleCancel}>
                    关闭
                </Button>,
            ]}
        >
            <Tabs
                onChange={setTabActiveKey}
                items={tabItems}
                activeKey={tabActiveKey}
                type="card"
                className="chart-tab-content"
                tabBarExtraContent={tabBarExtraContent()}
            />
        </Modal>
    );
}
