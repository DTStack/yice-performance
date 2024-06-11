import { useEffect, useState } from 'react';
import { Select } from 'antd';
import * as echarts from 'echarts';
import { IBuild } from 'typing';

import './style.less';

interface IProps {
    data: IBuild[];
    buildVersions: string[];
}

export default function BuildChart(props: IProps) {
    const { data = [], buildVersions } = props;
    const [version, setVersion] = useState<string>('');

    useEffect(() => {
        if (buildVersions.length && !version) {
            setVersion(buildVersions[0]);
        } else {
            renderChart();
        }
    }, [buildVersions]);

    useEffect(() => {
        renderChart();
    }, [version]);

    const handleVersionChange = (version: string) => {
        setVersion(version);
    };

    const renderChart = () => {
        const chart = echarts.init(document.getElementById('build-container') as any);
        const _data = data?.filter((item) => item.version === version);

        const xData = Array.from({ length: _data.length }, (_v, i) => `第${i + 1}次`);
        const durationList = _data?.map((item) => item.duration);
        const fileSizeList = _data?.map((item) => item.fileSize);

        const option = {
            tooltip: {
                trigger: 'axis',
                formatter: function (params: any) {
                    const idx = xData.findIndex((item) => item === params[0].name);
                    let relVal = _data[idx]?.branch;
                    params.forEach((param: any) => {
                        const { data, seriesName } = param;
                        if (seriesName === '构建时长') {
                            relVal +=
                                '<br/>' +
                                param.marker +
                                `${seriesName}` +
                                `<span style='font-weight:500;margin-left: 10px'>${data}秒</span>`;
                        } else if (seriesName === '构建产物大小') {
                            relVal +=
                                '<br/>' +
                                param.marker +
                                `${seriesName}` +
                                `<span style='font-weight:500;margin-left: 10px'>${data}MB</span>`;
                        }
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
            legend: {
                data: ['构建产物大小', '构建时长'],
            },
            xAxis: [
                {
                    type: 'category',
                    axisTick: {
                        alignWithLabel: true,
                    },
                    data: xData,
                },
            ],
            yAxis: [
                {
                    type: 'value',
                    name: '构建产物大小(MB)',
                    position: 'right',
                    alignTicks: true,
                    min: 0,
                    max: 70,
                    interval: 14,
                    axisLine: {
                        show: true,
                    },
                },
                {
                    type: 'value',
                    name: '构建时长(秒)',
                    position: 'left',
                    alignTicks: true,
                    min: 0,
                    max: 400,
                    interval: 80,
                    axisLine: {
                        show: true,
                    },
                },
            ],
            series: [
                {
                    name: '构建产物大小',
                    type: 'bar',
                    data: fileSizeList,
                    label: {
                        show: true,
                        position: 'top',
                    },
                },
                {
                    name: '构建时长',
                    type: 'line',
                    yAxisIndex: 1,
                    data: durationList,
                    label: {
                        show: true,
                        position: 'top',
                    },
                },
            ],
        };
        chart.setOption(option);
    };

    return (
        <>
            <Select
                className="version-select"
                placeholder="请选择数栈版本"
                value={version}
                onChange={handleVersionChange}
                options={buildVersions.map((version: string) => {
                    return {
                        label: version,
                        value: version,
                    };
                })}
            />
            <div id="build-container" className="build-container"></div>;
        </>
    );
}
