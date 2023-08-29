import { useEffect, useState } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Descriptions, Modal, Tooltip } from 'antd';
import moment from 'moment';

import { getScoreColor } from '../../../../const';
import API from '../../../../utils/api';
import './style.less';

interface IProps {
    open: boolean;
    taskInfo: any;
    onCancel: any;
}

function ResultModal(props: IProps) {
    const { open, taskInfo, onCancel } = props;
    const { taskId, startAt, score, duration, reportPath } = taskInfo;
    const [performances, setPerformances] = useState<any[]>([]);
    const [fileExists, setFileExists] = useState<boolean>(false);

    const list = [
        {
            key: 'FCP',
            label: '首次内容渲染时长',
            desc: '用于记录页面首次绘制文本、图片、非空白 Canvas 或 SVG 的时间。',
        },
        { key: 'SI', label: '首次展现平均值', desc: '页面内容可见填充的速度' },
        {
            key: 'LCP',
            label: '最大内容绘制时间',
            desc: '用于记录视窗内最大的元素绘制的时间，该时间会随着页面渲染变化而变化，因为页面中的最大元素在渲染过程中可能会发生改变，另外该指标会在用户第一次交互后停止记录。',
        },
        {
            key: 'TTI',
            label: '可交互时间',
            desc: (
                <>
                    测量页面所有资源加载成功并能够可靠地快速响应用户输入的时间。通常是发生在页面依赖的资源已经加载完成，此时浏览器可以快速响应用户交互的时间。指标的计算过程，需要满足以下几个条件：
                    <div>1、从 FCP 指标后开始计算；</div>
                    <div>
                        2、持续 5 秒内无长任务（执行时间超过 50ms）且无两个以上正在进行中的 GET
                        请求；
                    </div>
                    <div>3、往前回溯至 5 秒前的最后一个长任务结束的时间。</div>
                </>
            ),
        },
        {
            key: 'TBT',
            label: '总阻塞时间',
            desc: '记录在 FCP 到 TTI 之间所有长任务的阻塞时间总和，TBT = FCP 和 TTI 之间发生的每个长任务的「阻塞时间」总和。',
        },
        { key: 'CLS', label: '累计布局样式偏移', desc: '记录了页面上非预期的位移波动' },
    ];

    useEffect(() => {
        taskId && fetchData();
    }, [taskId]);

    const fetchData = () => {
        API.getPerformancesByTaskId({ taskId }).then((res) => {
            setPerformances(res.data || []);
        });
        API.checkFileExists({ reportPath }).then(({ data }) => {
            setFileExists(data || false);
        });
    };

    const getScoreDiv = (score: number) => {
        const className = getScoreColor(score);
        return <div className={className}></div>;
    };

    const _reportPath =
        process.env.NODE_ENV === 'development'
            ? `http://localhost:4000${reportPath}`
            : `${location.origin}${reportPath}`;

    return (
        <Modal
            title={`查看结果（${taskInfo.versionName}）`}
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="back" onClick={onCancel}>
                    关闭
                </Button>,
            ]}
            destroyOnClose
            width={1000}
        >
            <Descriptions bordered column={2} labelStyle={{ width: 220 }}>
                <Descriptions.Item label="taskId">{taskId}</Descriptions.Item>
                <Descriptions.Item label="开始检测时间">
                    {moment(startAt).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>

                <Descriptions.Item label="检测得分">
                    {score ? (
                        <div className="color-content">
                            {getScoreDiv(score)}
                            {score} 分
                        </div>
                    ) : (
                        '-'
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="检测耗时">
                    <div className="color-content">{duration} ms</div>
                </Descriptions.Item>

                {list.map((item) => {
                    const performance = performances.find(
                        (performance: any) => performance.name === item.key
                    );
                    const detail = (
                        <div>
                            <div>耗时：{performance?.duration || '--'} ms</div>
                            <div>得分：{performance?.score || '--'} 分</div>
                            <div>权重：{performance?.weight || '--'}%</div>
                        </div>
                    );
                    return (
                        <Descriptions.Item
                            key={item.key}
                            label={
                                <div className="descriptions-item-label">
                                    <div>
                                        <span>{item.label}</span>
                                        <span>&nbsp;({item.key})&nbsp;</span>
                                    </div>
                                    <Tooltip title={item.desc}>
                                        <QuestionCircleOutlined />
                                    </Tooltip>
                                </div>
                            }
                        >
                            <Tooltip title={detail} placement="right">
                                {performance?.duration || '--'} ms
                            </Tooltip>
                        </Descriptions.Item>
                    );
                })}

                <Descriptions.Item label="查看报告" span={2}>
                    {fileExists ? (
                        <a target="_blank" href={_reportPath} rel="noreferrer">
                            {_reportPath}
                        </a>
                    ) : (
                        <Tooltip title="报告文件不存在" placement="right">
                            --
                        </Tooltip>
                    )}
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    );
}

export default ResultModal;
