import { useEffect } from 'react';
import * as echarts from 'echarts';
import { ITask } from 'typing';

import './style.less';

interface IProps {
    data: ITask[];
    // echarts 顶部选择展示的版本
    legendSelected: any;
    setLegendSelected: (legendSelected: any) => void;
}

export default function ProjectChart(props: IProps) {
    const { data = [], legendSelected, setLegendSelected } = props;

    useEffect(() => {
        if (data?.length) {
            const selectedVersionNames = Object.keys(legendSelected).filter(
                (item) => legendSelected[item]
            );
            const versionIds = Array.from(new Set(data.map((task: ITask) => task.versionId)));
            const versionNames = Array.from(new Set(data.map((task: ITask) => task.versionName)));

            const series = versionIds.map((versionId: any) => {
                return {
                    name:
                        data.find((task: ITask) => task.versionId === versionId)?.versionName || '',
                    type: 'line',
                    data: data
                        .filter((task: ITask) => task.versionId === versionId)
                        .map((task: ITask) => task.score),
                    smooth: true,
                    // 右侧显示名称
                    // endLabel: {
                    //     show: true,
                    //     formatter: function (params: any) {
                    //         return params.seriesName;
                    //     },
                    // },
                };
            });

            const maxLength = Math.max.apply(
                null,
                series
                    .filter((item) => selectedVersionNames.includes(item.name))
                    .map((item) => item.data.length)
            );
            const xAxisData = [];
            for (let i = 0; i < maxLength; i++) {
                xAxisData.push(`第${i + 1}次`);
            }

            renderChart(versionNames, xAxisData, series);
        }
    }, [data?.length, legendSelected]);

    const renderChart = (versionNames: any, xAxisData: string[], series: any[]) => {
        const productChart = echarts.init(document.getElementById('container') as any);

        const option = {
            tooltip: {
                trigger: 'axis',
            },
            // echarts 顶部选择展示的版本
            legend: {
                data: versionNames,
                selected: legendSelected,
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
                // min: Math.min.apply(null, [1, 2, 3]),
            },
            series,
        };
        productChart.setOption(option);

        // echarts 顶部展示的版本变化
        productChart.on('legendselectchanged', function (params: any) {
            setLegendSelected(params?.selected || {});
        });
    };

    return <div id="container" className="product-container"></div>;
}
