import { useEffect, useState } from 'react';
import { Modal, Descriptions, Button, Tooltip } from 'antd';
import API from '../../../../utils/api';
import { getScoreColor } from '../../../../const';
import './style.less';
import { QuestionCircleOutlined } from '@ant-design/icons';

interface IProps {
    open: boolean;
    taskInfo: any;
    onCancel: any;
}

function ReportModal(props: IProps) {
    const { open, taskInfo, onCancel } = props;
    const { taskId, score, duration, reportUrl } = taskInfo;
    const [performances, setPerformances] = useState<any[]>([]);
    const list = [
        { key: 'FCP', label: '首次内容渲染时长', desc: '页面最新出现的内容渲染时长' },
        { key: 'SI', label: '首次展现平均值', desc: '页面内容可见填充的速度' },
        {
            key: 'LCP',
            label: '最大内容绘制时间',
            desc: '页面核心内容呈现时间，不采用 loading 状态的数据',
        },
        { key: 'TTI', label: '可交互时间', desc: '用户是否会体验到卡顿' },
        { key: 'TBT', label: '总阻塞时间', desc: '主线程被阻塞的时间，无法作出输入响应' },
        { key: 'CLS', label: '累计布局样式偏移', desc: '到加载完成布局的偏移量' },
    ];

    useEffect(() => {
        taskId && fetchData();
    }, [taskId]);

    const fetchData = () => {
        API.getPerformancesByTaskId({ taskId }).then((res) => {
            setPerformances(res.data || []);
        });
    };

    const getScoreDiv = (score: string | number) => {
        const className = getScoreColor(score);
        return <div className={className}></div>;
    };

    return (
        <Modal
            title="查看报告"
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
                            <div>耗时：{performance?.time} ms</div>
                            <div>得分：{performance?.score} 分</div>
                            <div>权重：{performance?.weight}%</div>
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
                                {performance?.time} ms
                            </Tooltip>
                        </Descriptions.Item>
                    );
                })}

                <Descriptions.Item label="查看报告原件" span={2}>
                    <a target="_blank" href={reportUrl} rel="noreferrer">
                        {`${location.origin}${reportUrl}`}
                    </a>
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    );
}

export default ReportModal;
