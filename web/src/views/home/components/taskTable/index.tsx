import React, { useEffect, useState } from 'react';
import { Table, Tag, Divider, Popconfirm, Tooltip, message } from 'antd';
import moment from 'moment';
import type { ColumnsType } from 'antd/es/table';
import API from '../../../../utils/api';
import { getScoreColor, TASK_STATUS, TASK_STATUS_TEXT } from '../../../../const';
import { SyncOutlined } from '@ant-design/icons';
import ReportModal from '../reportModal';
import './style.less';

interface IPros {
    runTime: number;
}

function TaskTable(props: IPros) {
    const { runTime } = props;
    const [taskList, setTaskList] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [current, setCurrent] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);
    const [status, setStatus] = useState<number[] | undefined>(undefined);
    const [taskInfo, setTaskInfo] = useState<any>({});
    const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
    const pageSize = 10;

    useEffect(() => {
        fetchData();
    }, [runTime, current, status]);

    const fetchData = () => {
        setLoading(true);
        const params = { current, pageSize, status };
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

    const handleTableChange = (pagination: any, filters: any) => {
        setCurrent(pagination?.current);
        setStatus(filters?.status);
    };

    // 尝试运行
    const handleTryRun = (item: any) => {
        API.tryRunTask({ taskId: item.taskId }).then(() => {
            message.success('操作成功！');
            fetchData();
        });
    };

    // 置失败
    const handleSetFail = (item: any) => {
        API.updateTask({
            taskId: item.taskId,
            status: TASK_STATUS.FAIL,
            failReason: '手动置失败',
        }).then(() => {
            message.success('操作成功！');
            fetchData();
        });
    };

    // 重试
    const handleRetry = (item: any) => {
        API.retryTask({ taskId: item.taskId }).then(() => {
            message.success('操作成功！');
            fetchData();
        });
    };

    // 查看报告
    const handleReport = (item: any) => {
        setTaskInfo(item);
        setReportModalOpen(true);
    };

    const getScoreDiv = (score: string | number) => {
        const className = getScoreColor(score);
        return <div className={className}></div>;
    };

    const columns: ColumnsType<object> = [
        {
            title: '关联项目',
            dataIndex: 'projectName',
            key: 'projectName',
            width: 160,
            render: (text) => text || '-',
        },
        {
            title: '检测地址',
            dataIndex: 'url',
            key: 'url',
            width: 280,
            ellipsis: {
                showTitle: false,
            },
            render: (text) => (
                <Tooltip placement="topLeft" title={text}>
                    {text}
                </Tooltip>
            ),
        },
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
            title: '检测时长',
            dataIndex: 'duration',
            key: 'duration',
            width: 140,
            render: (text) => (text ? `${text} ms` : '-'),
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
            width: 120,
            filters: TASK_STATUS_TEXT,
            render: (status) => {
                let color = '';
                switch (status) {
                    case TASK_STATUS.WAITING:
                        color = 'volcano';
                        break;
                    case TASK_STATUS.RUNNING:
                        color = 'blue';
                        break;
                    case TASK_STATUS.FAIL:
                        color = 'red';
                        break;
                    case TASK_STATUS.SUCCESS:
                        color = 'green';
                        break;
                    case TASK_STATUS.SET_FAIL:
                        color = 'red';
                        break;
                }

                return (
                    <Tag color={color}>
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
                if (status === TASK_STATUS.WAITING) {
                    return (
                        <Popconfirm
                            title="尝试运行该任务将重新加入任务队列，是否尝试运行？"
                            onConfirm={() => handleTryRun(record)}
                        >
                            <a>尝试运行</a>
                        </Popconfirm>
                    );
                } else if (status === TASK_STATUS.RUNNING) {
                    return (
                        <Popconfirm
                            title="由于系统原因该任务可能已经失效，置失败后可以重试"
                            onConfirm={() => handleSetFail(record)}
                        >
                            <a>置失败</a>
                        </Popconfirm>
                    );
                } else if (status === TASK_STATUS.FAIL) {
                    return (
                        <div>
                            <Tooltip title={failReason}>
                                <a>报错信息</a>
                            </Tooltip>
                            <Divider type="vertical" />
                            <Popconfirm
                                title="重试该任务将重新检测，确认重试？"
                                onConfirm={() => handleRetry(record)}
                            >
                                <a>重试</a>
                            </Popconfirm>
                        </div>
                    );
                } else if (status === TASK_STATUS.SUCCESS) {
                    return (
                        <div>
                            <a onClick={() => handleReport(record)}>查看报告</a>
                            <Divider type="vertical" />
                            <Popconfirm
                                title="再次检测将重新运行该任务，确认？"
                                onConfirm={() => handleRetry(record)}
                            >
                                <a>再次检测</a>
                            </Popconfirm>
                        </div>
                    );
                } else if (status === TASK_STATUS.SET_FAIL) {
                    return (
                        <Popconfirm
                            title="重试该任务将重新检测，确认重试？"
                            onConfirm={() => handleRetry(record)}
                        >
                            <a>重试</a>
                        </Popconfirm>
                    );
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

export default TaskTable;
