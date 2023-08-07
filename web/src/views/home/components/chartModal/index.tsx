import { useEffect, useState } from 'react';
import { Button, DatePicker, Empty, Modal, Select, Spin, Tabs } from 'antd';
import { IProject, ITask, IVersion } from 'typing';

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
import ProjectChart from '../projectChart';
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
    const [tabActiveKey, setTabActiveKey] = useState<string>('project');
    const [projectChartData, setProjectChartData] = useState<ITask[]>([]);
    const [startTime, setStartTime] = useState<string | undefined>(undefined);
    const [endTime, setEndTime] = useState<string | undefined>(undefined);
    // echarts 顶部选择展示的版本
    const [legendSelected, setLegendSelected] = useState({});

    useEffect(() => {
        if (open) {
            getProjectChart();
        } else {
            setStartTime(undefined);
            setEndTime(undefined);
        }
    }, [open, startTime, endTime]);

    // 获取子产品所有版本的性能分数
    const getProjectChart = () => {
        setProjectChartLoading(true);
        API.getProjectChart({ projectId: project?.projectId, startTime, endTime })
            .then((res) => {
                const data = res.data || [];

                // 默认选择靠前的两个版本进行展示
                const selectedVersionNames = Object.keys(legendSelected).filter(
                    (item) => legendSelected[item]
                );
                const versionNames = Array.from(
                    new Set(data.map((task: ITask) => task.versionName))
                );
                const legendSelectedTemp = {};
                if (!selectedVersionNames.length) {
                    versionNames.forEach((name: any, idx: number) => {
                        legendSelectedTemp[name] = idx < 2;
                    });
                    setLegendSelected(legendSelectedTemp);
                }

                setProjectChartData(data);
            })
            .finally(() => {
                setProjectChartLoading(false);
            });
    };

    // 日期变化
    const changeDate = (value: any) => {
        // 清除选择后查询
        if (value === null) {
            setStartTime(undefined);
            setEndTime(undefined);
        } else {
            setStartTime(formatTime(value?.[0]));
            setEndTime(formatTime(value?.[1], true));
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

    const tabItems = [
        { label: '子产品性能趋势图', key: 'project', children: renderProjectChart() },
        { label: '版本性能图', key: 'version', disabled: true, children: renderProjectChart() },
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
                                最近30天: last30DaysRange,
                                最近7天: last7DaysRange,
                                昨天: lastDayRange,
                                今天: todayRange,
                            }}
                            value={[parseTime(startTime) as any, parseTime(endTime) as any]}
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
            setProjectChartData([]);
            setLegendSelected({});
        }, 200);
    };

    return (
        <Modal
            width={1000}
            title="性能趋势"
            className="chart-modal"
            open={open}
            forceRender
            destroyOnClose
            onCancel={handleCancel}
            footer={[
                <Button key="back" onClick={handleCancel}>
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
