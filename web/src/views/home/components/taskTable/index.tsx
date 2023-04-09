import React, { useEffect, useState } from 'react';
import { Table, Tag, Divider, Popconfirm, Tooltip, message } from 'antd';
import moment from 'moment';
import type { ColumnsType } from 'antd/es/table';
import API from '../../../../utils/api';
import {
    getScoreColor,
    TASK_STATUS,
    TASK_STATUS_TEXT,
    TASK_TRIGGER_TYPE_TEXT,
} from '../../../../const';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    MinusCircleOutlined,
    SyncOutlined,
} from '@ant-design/icons';
import ReportModal from '../reportModal';
import './style.less';

interface IPros {
    versionId: number | undefined;
    runTime: number;
}

export default function TaskTable(props: IPros) {
    const { versionId, runTime } = props;
    const [taskList, setTaskList] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [current, setCurrent] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);
    const [triggerType, setTriggerType] = useState<number[] | undefined>(undefined);
    const [status, setStatus] = useState<number[] | undefined>(undefined);
    const [taskInfo, setTaskInfo] = useState<any>({});
    const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
    const pageSize = 10;

    useEffect(() => {
        fetchData();
    }, [versionId, runTime, current, triggerType, status]);

    const fetchData = () => {
        setLoading(true);
        const params = { versionId, current, pageSize, triggerType, status };
        API.getTasks(params)
            .then((res) => {
                const { data, total } = res.data;
                setTaskList(data || []);
                setTotal(total);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // 表格的分页、筛选
    const handleTableChange = (pagination: any, filters: any) => {
        setCurrent(pagination?.current);
        setTriggerType(filters?.triggerType);
        setStatus(filters?.status);
    };

    // 尝试运行
    const handleTryRun = (item: any) => {
        API.tryRunTask({ taskId: item.taskId }).then(() => {
            message.success('操作成功！');
            fetchData();
        });
    };

    // 取消检测
    const handleCancel = (item: any) => {
        API.updateTask({
            taskId: item.taskId,
            status: TASK_STATUS.CANCEL,
            failReason: '手动取消检测',
        })
            .then(() => {
                message.success('操作成功！');
            })
            .finally(() => {
                fetchData();
            });
    };

    // 查看报告
    const handleReport = (item: any) => {
        setTaskInfo(item);
        setReportModalOpen(true);
    };

    // 再次检测
    const handleTryAgain = (item: any) => {
        API.tryTaskAgain({ taskId: item.taskId }).then(() => {
            message.success('操作成功！');
            fetchData();
        });
    };

    const getScoreDiv = (score: number) => {
        const className = getScoreColor(score);
        return <div className={className}></div>;
    };

    const columns: ColumnsType<any> = [
        // {
        //     title: '版本名称',
        //     dataIndex: 'versionName',
        //     key: 'versionName',
        //     width: 100,
        //     ellipsis: { showTitle: false },
        // },
        // {
        //     title: '检测地址',
        //     dataIndex: 'url',
        //     key: 'url',
        //     width: 280,
        //     ellipsis: { showTitle: false },
        //     render: (text) => (
        //         <Tooltip placement="topLeft" title={text}>
        //             <a href={text} target="_blank" rel="noreferrer">
        //                 {text}
        //             </a>
        //         </Tooltip>
        //     ),
        // },
        {
            title: '检测得分',
            dataIndex: 'score',
            key: 'score',
            width: 140,
            render: (text) => {
                return text ? (
                    <div className="color-content">
                        {getScoreDiv(text)}
                        {text} 分
                    </div>
                ) : (
                    '-'
                );
            },
        },
        {
            title: '检测耗时',
            dataIndex: 'duration',
            key: 'duration',
            width: 140,
            render: (text) => (text ? `${text} ms` : '-'),
        },
        {
            title: '触发方式',
            dataIndex: 'triggerType',
            key: 'triggerType',
            width: 110,
            filters: TASK_TRIGGER_TYPE_TEXT,
            render: (triggerType) =>
                TASK_TRIGGER_TYPE_TEXT.find((item) => item.value === triggerType)?.text,
        },
        {
            title: '创建时间',
            dataIndex: 'createAt',
            key: 'createAt',
            width: 220,
            render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: '任务状态',
            dataIndex: 'status',
            key: 'status',
            width: 110,
            filters: TASK_STATUS_TEXT,
            render: (status) => {
                let icon, color;
                switch (status) {
                    case TASK_STATUS.WAITING:
                        icon = <ClockCircleOutlined />;
                        color = 'warning';
                        break;
                    case TASK_STATUS.RUNNING:
                        icon = <SyncOutlined spin />;
                        color = 'processing';
                        break;
                    case TASK_STATUS.FAIL:
                        icon = <CloseCircleOutlined />;
                        color = 'error';
                        break;
                    case TASK_STATUS.SUCCESS:
                        icon = <CheckCircleOutlined />;
                        color = 'success';
                        break;
                    case TASK_STATUS.CANCEL:
                        icon = <MinusCircleOutlined />;
                        color = 'default';
                        break;
                }

                return (
                    <Tag icon={icon} color={color}>
                        {TASK_STATUS_TEXT.find((item) => item.value === status)?.text}
                    </Tag>
                );
            },
        },
        {
            title: () => {
                return (
                    <div className="action-title">
                        <span>操作</span>
                        <SyncOutlined spin={loading} onClick={fetchData} />
                    </div>
                );
            },
            key: 'action',
            width: 240,
            render: (_text, record: any) => {
                const { status, failReason } = record;
                const tryAgainBtn = (
                    <Popconfirm
                        title="再次检测将新建检测任务，是否继续？"
                        onConfirm={() => handleTryAgain(record)}
                    >
                        <a>再次检测</a>
                    </Popconfirm>
                );

                if (status === TASK_STATUS.WAITING) {
                    return (
                        <Popconfirm
                            title="尝试运行将会把该任务重新加入任务队列，是否继续？"
                            onConfirm={() => handleTryRun(record)}
                        >
                            <a>尝试运行</a>
                        </Popconfirm>
                    );
                } else if (status === TASK_STATUS.RUNNING) {
                    return (
                        <Popconfirm
                            title={<div>取消检测后可以再次检测，是否继续？</div>}
                            onConfirm={() => handleCancel(record)}
                        >
                            <a>取消检测</a>
                        </Popconfirm>
                    );
                } else if (status === TASK_STATUS.FAIL) {
                    return (
                        <div>
                            <Tooltip title={failReason}>
                                <a>报错信息</a>
                            </Tooltip>
                            <Divider type="vertical" />
                            {tryAgainBtn}
                        </div>
                    );
                } else if (status === TASK_STATUS.SUCCESS) {
                    return (
                        <div>
                            <a onClick={() => handleReport(record)}>查看报告</a>
                            <Divider type="vertical" />
                            {tryAgainBtn}
                        </div>
                    );
                } else if (status === TASK_STATUS.CANCEL) {
                    return tryAgainBtn;
                } else {
                    return '--';
                }
            },
        },
    ];

    const pagination = {
        pageSize,
        total,
    };

    return (
        <React.Fragment>
            <Table
                className="task-table"
                rowKey="taskId"
                size="small"
                loading={loading}
                columns={columns}
                dataSource={taskList}
                pagination={pagination}
                onChange={handleTableChange}
            />

            <ReportModal
                open={reportModalOpen}
                taskInfo={taskInfo}
                onCancel={() => setReportModalOpen(false)}
            />
        </React.Fragment>
    );
}
