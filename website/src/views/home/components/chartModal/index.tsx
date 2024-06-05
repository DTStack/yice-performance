import { useEffect, useState } from 'react';
import { Button, DatePicker, Empty, Modal, Select, Spin, Tabs } from 'antd';
import { IBuild, IProject, ITask, IVersion } from 'typing';

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
import ProjectChart from './projectChart';
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
    // 子产品性能趋势图 echarts 顶部选择展示的版本
    const [legendSelected, setLegendSelected] = useState({});
    const [projectChartData, setProjectChartData] = useState<ITask[]>([]);
    // 构建产物大小分析图
    const [fileSizeVersions, setFileSizeVersions] = useState<string[]>([]);
    const [fileSizeList, setFileSizeList] = useState<string[]>([]);
    // 版本构建性能图
    const [buildVersions, setBuildVersions] = useState<string[]>([]);
    const [buildChartData, setBuildChartData] = useState<IBuild[]>([]);
    const [dates, setDates] = useState<any[]>([undefined, undefined]);
    const [startTime, setStartTime] = useState<string | undefined>(undefined);
    const [endTime, setEndTime] = useState<string | undefined>(undefined);

    useEffect(() => {
        // 打开弹框时默认选择最近七天的日期
        const [startTimeInitialValue, endTimeInitialValue] = last7DaysRange;
        setStartTime(open ? formatTime(startTimeInitialValue) : undefined);
        setEndTime(open ? formatTime(endTimeInitialValue, true) : undefined);
    }, [open]);
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
    }, [tabActiveKey, startTime]);

    // 获取子产品所有版本的性能分数
    const getProjectChart = () => {
        setProjectChartLoading(true);
        API.getProjectChart({ projectId: project?.projectId, startTime, endTime })
            .then((res) => {
                const data = res.data || [];

                // 默认选择靠前的三个版本进行展示
                const selectedVersionNames = Object.keys(legendSelected).filter(
                    (item) => legendSelected[item]
                );
                const versionNames = Array.from(
                    new Set(data.map((task: ITask) => task.versionName))
                );
                const legendSelectedTemp = {};
                if (!selectedVersionNames.length) {
                    versionNames.forEach((name: any, idx: number) => {
                        legendSelectedTemp[name] = idx < 3;
                    });
                    setLegendSelected(legendSelectedTemp);
                }

                setProjectChartData(data);
            })
            .finally(() => {
                setProjectChartLoading(false);
            });
    };

    // 构建产物大小分析图
    const getFileSizeChart = () => {
        setFileSizeChartLoading(true);
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
        setDates(value || [undefined, undefined]);
        // 清除选择后查询
        if (value === null) {
            setStartTime(undefined);
            setEndTime(undefined);
        }
    };

    // 打开弹框时初始化日期
    const onOpenChange = (open: boolean) => {
        if (!open) {
            setStartTime(formatTime(dates?.[0]));
            setEndTime(formatTime(dates?.[1], true));
        }
    };

    // 子产品性能趋势图
    const renderProjectChart = () => {
        return (
            <Spin spinning={projectChartLoading}>
                {projectChartData.length ? (
                    <ProjectChart
                        data={projectChartData}
                        legendSelected={legendSelected}
                        setLegendSelected={setLegendSelected}
                    />
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
        { label: '性能趋势图', key: 'project', children: renderProjectChart() },
        { label: '构建产物大小分析图', key: 'file-size', children: renderFileSizeChart() },
        { label: '版本构建性能图', key: 'version-build', children: renderBuildChart() },
    ];
    const onTabChange = (key: string) => {
        setTabActiveKey(key);
    };

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
                            ranges={{
                                最近180天: last180DaysRange,
                                最近90天: last90DaysRange,
                                最近30天: last30DaysRange,
                                最近7天: last7DaysRange,
                                昨天: lastDayRange,
                                今天: todayRange,
                            }}
                            value={[parseTime(startTime) as any, parseTime(endTime) as any]}
                            onChange={changeDate}
                            onOpenChange={onOpenChange}
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
            setProjectChartData([]);
            setLegendSelected({});
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
                onChange={onTabChange}
                items={tabItems}
                activeKey={tabActiveKey}
                type="card"
                tabBarExtraContent={tabBarExtraContent()}
            />
        </Modal>
    );
}
