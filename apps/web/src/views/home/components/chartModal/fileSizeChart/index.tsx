import { useEffect } from 'react';
import * as echarts from 'echarts';

import './style.less';

interface IProps {
    fileSizeVersions: string[];
    fileSizeList: string[];
}

export default function FileSizeChart(props: IProps) {
    const { fileSizeVersions = [], fileSizeList = [] } = props;

    useEffect(() => {
        renderChart();
    }, [fileSizeVersions]);

    const renderChart = () => {
        const chart = echarts.init(document.getElementById('file-size-container') as any);

        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow',
                },
                formatter: function (params: any) {
                    let relVal = params[0].name;
                    params.forEach((param: any) => {
                        const { data, seriesName } = param;
                        relVal +=
                            '<br/>' +
                            param.marker +
                            `${seriesName}` +
                            `<span style='font-weight:500;margin-left: 10px'>${data}MB</span>`;
                    });

                    return relVal;
                },
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true,
            },
            toolbox: {
                feature: {
                    saveAsImage: { show: true },
                },
            },
            xAxis: {
                type: 'value',
                name: '构建产物大小(MB)',
                nameTextStyle: {
                    padding: [0, 0, 0, -80],
                },
                axisLine: {
                    show: true,
                },
            },
            yAxis: {
                type: 'category',
                data: fileSizeVersions,
                name: '数栈版本',
                axisLine: {
                    show: true,
                },
            },
            series: [
                {
                    name: '构建产物大小(众位数)',
                    type: 'bar',
                    data: fileSizeList,
                    label: {
                        show: true,
                        position: 'right',
                        formatter: '{c}MB',
                    },
                },
            ],
        };
        chart.setOption(option);
    };

    return <div id="file-size-container" className="file-size-container"></div>;
}
