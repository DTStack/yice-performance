import { useEffect, useState } from 'react';
import { Modal, Descriptions, Button } from 'antd';
import API from '../../../../utils/api';
import { getScoreColor } from '../../../../const';
import './style.less';

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
        { key: 'FCP', label: '首次内容渲染时长' },
        { key: 'SI', label: '首次展现平均值' },
        { key: 'LCP', label: '最大内容绘制时间' },
        { key: 'TTI', label: '可交互时间' },
        { key: 'TBT', label: '总阻塞时间' },
        { key: 'CLS', label: '累计布局样式偏移' },
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
            width={800}
        >
            <Descriptions bordered labelStyle={{ width: 180 }}>
                <Descriptions.Item label="检测得分" span={2}>
                    {score ? (
                        <div className="color-content">
                            {getScoreDiv(score)}
                            {score} 分
                        </div>
                    ) : (
                        '-'
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="检测时长" span={2}>
                    <div className="color-content">{duration} ms</div>
                </Descriptions.Item>

                {list.map((item) => {
                    return (
                        <Descriptions.Item key={item.key} label={item.label} span={2}>
                            {`${
                                performances.find(
                                    (performance: any) => performance.name === item.key
                                )?.time
                            } ms`}
                        </Descriptions.Item>
                    );
                })}

                <Descriptions.Item label="查看报告原件" span={3}>
                    <a target="_blank" href={reportUrl} rel="noreferrer">
                        {`${location.origin}${reportUrl}`}
                    </a>
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    );
}

export default ReportModal;
