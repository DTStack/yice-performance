import { useEffect, useState } from 'react';
import * as echarts from 'echarts';

import './style.less';

interface IProjectChartSeries {
    name: string;
    type: string;
    data: number[];
    smooth: boolean;
    taskIds: number[];
}

/** 子产品性能评分趋势接口结果 */
export interface IProjectChartData {
    taskList: IProjectChartSeries[];
    versionNameList: string[];
    maxLength: number;
}

interface IProps {
    data: IProjectChartData;
}

export default function ProjectChart(props: IProps) {
    const { data } = props;
    const { taskList, versionNameList, maxLength } = data || {};
    // echarts 顶部选择展示的版本
    const [legendSelectedMap, setLegendSelectedMap] = useState({});

    useEffect(() => {
        if (versionNameList?.length) {
            const _map = { ...legendSelectedMap };
            for (let i = 0; i < versionNameList.length; i++) {
                // 默认选择前三个
                _map[versionNameList[i]] = i < 3;
            }
            setLegendSelectedMap(_map);
        }
    }, [taskList]);

    useEffect(() => {
        renderChart();
    }, [legendSelectedMap]);

    const renderChart = () => {
        let chart = echarts.init(document.getElementById('project-container') as any);

        const hasOldSelected = Object.keys(legendSelectedMap).some(
            (key) => !versionNameList.includes(key)
        );
        // echarts line legend 的 data 和 selected 变化后还有之前的 selected
        if (hasOldSelected) {
            chart.dispose();
            chart = echarts.init(document.getElementById('project-container') as any);
        }

        const xAxisData = [];
        for (let i = 0; i < maxLength; i++) {
            xAxisData.push(`第${i + 1}次`);
        }
        const yMin = Math.min(...(taskList.map((item) => item.data).flat(Infinity) as number[]));

        const option = {
            tooltip: {
                trigger: 'axis',
                formatter: function (params: any) {
                    let relVal = params[0].name;
                    params.forEach((param: any) => {
                        const value = taskList[param.seriesIndex]?.data?.[param.dataIndex];
                        const taskId = taskList[param.seriesIndex]?.taskIds?.[param.dataIndex];
                        const seriesName = param.seriesName;
                        relVal +=
                            '<br/>' +
                            param.marker +
                            `[${taskId}]${seriesName}` +
                            `<span style='font-weight:500;margin-left: 10px'>${value}分</span>`;
                    });

                    return relVal;
                },
            },
            // echarts 顶部选择展示的版本
            legend: {
                data: versionNameList,
                selected: legendSelectedMap,
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true,
            },
            toolbox: {
                feature: {
                    saveAsImage: {
                        title: '保存为图片',
                    },
                },
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: xAxisData,
            },
            yAxis: {
                type: 'value',
                min: yMin > 20 ? 20 : 0,
            },
            series: taskList,
        };

        chart.setOption(option);

        // echarts 顶部展示的版本变化
        chart.on('legendselectchanged', function (params: any) {
            setLegendSelectedMap(params?.selected || {});
        });
    };

    return <div id="project-container" className="project-container"></div>;
}
