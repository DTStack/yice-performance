import { useEffect } from 'react';
import * as echarts from 'echarts';
import { ITask } from 'typing';
import './style.less';

interface IProps {
    data: ITask[];
}

export default function ProjectChart(props: IProps) {
    const { data = [] } = props;

    useEffect(() => {
        renderChart(data);
    }, [data?.length]);

    const renderChart = (data: ITask[]) => {
        const productChart = echarts.init(document.getElementById('container') as any);

        const versionIds = Array.from(new Set(data.map((task: ITask) => task.versionId)));
        const versionNames = Array.from(new Set(data.map((task: ITask) => task.versionName)));

        const legendSelected = {};
        versionNames.forEach((name: any, idx: number) => {
            legendSelected[name] = idx < 2;
        });

        const option = {
            tooltip: {
                trigger: 'axis',
            },
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
                data: Array.from(new Set(data.map((task: ITask) => task.createAt))),
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
        // console.log(111, JSON.stringify(option));
    };

    return <div id="container" className="product-container"></div>;
}
