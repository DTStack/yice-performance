import React, { useEffect, useState } from 'react';
import { Table, Tag, Popconfirm, Tooltip, message } from 'antd';
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
    QuestionCircleOutlined,
    SyncOutlined,
} from '@ant-design/icons';
import ReportModal from '../reportModal';
import './style.less';

interface IPros {
    isDefault: boolean;
    versionId: number | undefined;
    runTime: number;
}

export default function TaskTable(props: IPros) {
    const { isDefault, versionId, runTime } = props;
    const [taskList, setTaskList] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [current, setCurrent] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);
    const [triggerType, setTriggerType] = useState<number[] | undefined>(undefined);
    const [status, setStatus] = useState<number[] | undefined>(undefined);
    const [taskInfo, setTaskInfo] = useState<any>({});
    const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
    const pageSize = 20;

    useEffect(() => {
        versionId && fetchData();
    }, [versionId, runTime, current, triggerType, status]);

    const fetchData = () => {
        setLoading(true);
        const params = { isDefault, versionId, current, pageSize, triggerType, status };
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
            current === 1 ? fetchData() : setCurrent(1);
        });
    };

    const getScoreDiv = (score: number) => {
        const className = getScoreColor(score);
        return <div className={className}></div>;
    };

    const columns: ColumnsType<any> = [
        {
            title: '检测得分',
            dataIndex: 'score',
            key: 'score',
            width: 120,
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
            width: 120,
            render: (text) => (text ? `${Math.round(text / 1000)} s` : '-'),
        },
        {
            title: '开始检测时间',
            dataIndex: 'startAt',
            key: 'startAt',
            width: 200,
            render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-'),
        },
        {
            title: '触发方式',
            dataIndex: 'triggerType',
            key: 'triggerType',
            width: 120,
            filters: TASK_TRIGGER_TYPE_TEXT,
            render: (triggerType) =>
                TASK_TRIGGER_TYPE_TEXT.find((item) => item.value === triggerType)?.text,
        },
        {
            title: '任务状态',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            fixed: 'right',
            filters: TASK_STATUS_TEXT,
            render: (status, record) => {
                const { failReason } = record;
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

                const tag = (
                    <Tag icon={icon} color={color}>
                        {TASK_STATUS_TEXT.find((item) => item.value === status)?.text}
                    </Tag>
                );

                return status === TASK_STATUS.FAIL ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {tag}
                        <Tooltip title={failReason}>
                            <QuestionCircleOutlined />
                        </Tooltip>
                    </div>
                ) : (
                    tag
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
            width: 100,
            fixed: 'right',
            render: (_text, record: any) => {
                const { status } = record;
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
                    return tryAgainBtn;
                } else if (status === TASK_STATUS.SUCCESS) {
                    return (
                        <div>
                            <a onClick={() => handleReport(record)}>查看报告</a>
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
    if (isDefault) {
        columns.splice(
            0,
            0,
            {
                title: '版本名称',
                dataIndex: 'versionName',
                key: 'versionName',
                width: 140,
                fixed: 'left',
                ellipsis: { showTitle: true },
            }
            // {
            //     title: '检测地址',
            //     dataIndex: 'url',
            //     key: 'url',
            //     width: 220,
            //     ellipsis: { showTitle: false },
            //     render: (text) => (
            //         <Tooltip placement="topLeft" title={text}>
            //             <a href={text} target="_blank" rel="noreferrer">
            //                 {text}
            //             </a>
            //         </Tooltip>
            //     ),
            // }
        );
    }

    const pagination = {
        current,
        pageSize,
        total,
    };

    return (
        <React.Fragment>
            <Table
                className="task-table"
                rowKey="taskId"
                size="middle"
                loading={loading}
                columns={columns}
                dataSource={taskList}
                pagination={pagination}
                scroll={{
                    x: isDefault ? 800 : 920,
                    y: 'calc(100vh - 16vh - 50px - 32px - 68px - 24px - 32px - 47px)',
                }}
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
