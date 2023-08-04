import { useEffect } from 'react';
import * as echarts from 'echarts';
import { ITask } from 'typing';

import './style.less';

interface IProps {
    data: ITask[];
    legendSelected: any;
    setLegendSelected: (legendSelected: any) => void;
}

export default function ProjectChart(props: IProps) {
    const { data = [], legendSelected = {}, setLegendSelected } = props;

    useEffect(() => {
        renderChart(data);
    }, [data?.length]);

    const renderChart = (data: ITask[]) => {
        const productChart = echarts.init(document.getElementById('container') as any);

        const versionIds = Array.from(new Set(data.map((task: ITask) => task.versionId)));
        const versionNames = Array.from(new Set(data.map((task: ITask) => task.versionName)));

        let legendSelectedTemp = {};
        if (Object.keys(legendSelected)?.length) {
            legendSelectedTemp = legendSelected;
        } else {
            versionNames.forEach((name: any, idx: number) => {
                legendSelectedTemp[name] = idx < 2;
            });
        }

        const option = {
            tooltip: {
                trigger: 'axis',
            },
            // echarts 顶部选择展示的版本
            legend: {
                data: versionNames,
                selected: legendSelectedTemp,
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
                data: Array.from(new Set(data.map((task: ITask) => task.startAt))),
            },
            yAxis: {
                type: 'value',
                // min: Math.min.apply(null, [1, 2, 3]),
            },
            series: versionIds.map((versionId: any) => {
                return {
                    name: data.find((task: ITask) => task.versionId === versionId)?.versionName,
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
            }),
        };
        productChart.setOption(option);

        // echarts 顶部展示的版本变化
        productChart.on('legendselectchanged', function (params: any) {
            setLegendSelected?.(params?.selected || {});
        });
    };

    return <div id="container" className="product-container"></div>;
}
