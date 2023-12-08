import { useEffect, useState } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Descriptions, Image, Modal, Tooltip } from 'antd';
import moment from 'moment';
import { ITask } from 'typing';

import { getScoreColor } from '../../../../const';
import API from '../../../../utils/api';
import './style.less';

interface IProps {
    open: boolean;
    taskInfo: ITask;
    onCancel: any;
}

function ResultModal(props: IProps) {
    const { open, taskInfo, onCancel } = props;
    const { taskId, startAt, score, duration, reportPath, previewImg } = taskInfo;
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
                <Button type="primary" key="back" onClick={onCancel}>
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
                {previewImg && (
                    <Descriptions.Item label="结果的首屏图片预览" span={2}>
                        <Image
                            src={previewImg}
                            style={{ maxHeight: 200 }}
                            fallback="data:image/png;base64,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"
                        />
                    </Descriptions.Item>
                )}
            </Descriptions>
        </Modal>
    );
}

export default ResultModal;
