import React, { useContext, useEffect, useState } from 'react';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    CopyOutlined,
    ExclamationCircleOutlined,
    MinusCircleOutlined,
    PictureOutlined,
    SyncOutlined,
} from '@ant-design/icons';
import { Button, message, Modal, Popconfirm, Popover, Switch, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import copy from 'copy-to-clipboard';
import moment from 'moment';
import { ITask } from 'typing';

import {
    getScoreColor,
    TASK_STATUS,
    TASK_STATUS_TEXT,
    TASK_TRIGGER_TYPE_TEXT,
} from '../../../../const';
import { YICE_ROLE } from '../../../../const/role';
import { InitContext } from '../../../../store';
import API from '../../../../utils/api';
import { durationTime } from '../../../../utils/date';
import ResultModal from '../resultModal';
import './style.less';

interface IPros {
    // versionList 接口请求时，表格也需要 loading
    versionListLoading: boolean;
}

interface ISorter {
    columnKey: string | undefined;
    order: string | undefined;
}

let autoRefreshTimer: NodeJS.Timer | undefined;

export default function TaskTable(props: IPros) {
    const {
        project,
        versionId,
        runTime,
        startTime,
        endTime,
        searchStr,
        current,
        setRunTime,
        setCurrent,
    } = useContext(InitContext);

    const { projectId } = project || {};
    const { versionListLoading } = props;
    const [taskList, setTaskList] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [pageSize, setPageSize] = useState<number>(20);
    const [total, setTotal] = useState<number>(0);
    const [sorter, setSorter] = useState<ISorter | undefined>(undefined);
    const [triggerType, setTriggerType] = useState<number[] | undefined>(undefined);
    const [status, setStatus] = useState<number[] | undefined>(undefined);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [taskInfo, setTaskInfo] = useState<any>({});
    const [resultModalOpen, setResultModalOpen] = useState<boolean>(false);
    const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

    const yiceRole = localStorage.getItem('yice-role');

    useEffect(() => {
        fetchData();
    }, [runTime]);

    useEffect(() => {
        if (autoRefresh) {
            handleAutoRefreshData();
            autoRefreshTimer = setInterval(handleAutoRefreshData, 10_000);
        } else {
            autoRefreshTimer && clearInterval(autoRefreshTimer);
            autoRefreshTimer = undefined;
        }
    }, [autoRefresh]);

    useEffect(() => {
        if (autoRefresh) {
            autoRefreshTimer && clearInterval(autoRefreshTimer);
            autoRefreshTimer = undefined;
            autoRefreshTimer = setInterval(handleAutoRefreshData, 10_000);
        }
    }, [projectId, versionId]);

    const handleAutoRefreshData = () => {
        setRunTime(new Date().getTime());
    };

    /**
     * 获取任务列表的数据 taskList
     * 注意：仅通过改变 runTime 来触发获取 taskList, 用法: setRunTime(new Date().getTime())
     *
     * 1. projectId 从 undefined 变为有值后，此时应当清除 versionId，并请求 taskList
     * 2. 点击顶部输入框后的运行按钮，应当清除搜索条件，切换到汇总的项目下，请求 taskList
     * 3. 版本变化应清除搜索框的内容，将 current 置为 1，再请求 taskList
     * 4. projects 切换 project 时，此时应当先清除搜索条件：搜索内容、versionId、起止日期、current，再更新 projectId，并请求 taskList
     * 5. 搜索 taskId 或版本名称时，应当将 current 置为 1，再请求 taskList
     * 6. 起止日期变化时，应当将 current 置为 1，再请求 taskList
     */
    const fetchData = () => {
        if (!projectId && !versionId) return;
        if (versionListLoading || loading) return;

        setLoading(true);
        const params = {
            projectId,
            versionId,
            searchStr,
            current,
            pageSize,
            sorter,
            triggerType,
            status,
            startTime,
            endTime,
        };
        API.getTasks(params)
            .then((res) => {
                const { data, total } = res.data;
                setTaskList(data || []);
                setSelectedRowKeys(
                    selectedRowKeys.filter((key) =>
                        data.map((item: ITask) => item.taskId).includes(key)
                    )
                );
                setTotal(total);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // 尝试运行
    const handleTryRun = (item: any) => {
        API.tryRunTask({ taskId: item.taskId })
            .then(() => {
                message.success('操作完成！');
            })
            .finally(() => {
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
                message.success('操作完成！');
            })
            .finally(() => {
                fetchData();
            });
    };

    // 查看结果
    const handleResult = (item: any) => {
        setTaskInfo(item);
        setResultModalOpen(true);
    };

    // 再次检测
    const handleTryAgain = (item: any) => {
        API.tryTaskAgain({ taskId: item.taskId }).then(() => {
            message.success('操作完成！');
            fetchData();
        });
    };

    const getScoreDiv = (score: number) => {
        const scoreColor = getScoreColor(score);
        return <div className={`score ${scoreColor}`}>{score}</div>;
    };

    // 自动刷新
    const handleAutoRefresh = (checked: boolean) => {
        setAutoRefresh(checked);
    };

    const columns: ColumnsType<any> = [
        {
            title: 'taskId',
            dataIndex: 'taskId',
            key: 'taskId',
            width: 90,
            fixed: 'left',
        },
        {
            title: '版本名称',
            dataIndex: 'versionName',
            key: 'versionName',
            width: 140,
            fixed: 'left',
            ellipsis: { showTitle: false },
            render: (text) => (
                <Tooltip placement="topLeft" title={text}>
                    {text}
                </Tooltip>
            ),
        },
        {
            title: '检测地址',
            dataIndex: 'url',
            key: 'url',
            width: 200,
            ellipsis: { showTitle: false },
            render: (text) => (
                <Tooltip placement="topLeft" title={text}>
                    <a href={text} target="_blank" rel="noreferrer">
                        {text}
                    </a>
                </Tooltip>
            ),
        },
        {
            title: '检测得分',
            dataIndex: 'score',
            key: 'score',
            width: 100,
            sorter: true,
            render: (text) => {
                return text ? <div className="table-color-content">{getScoreDiv(text)}</div> : '-';
            },
        },
        {
            title: '检测耗时',
            dataIndex: 'duration',
            key: 'duration',
            width: 120,
            render: (text) => (text ? durationTime(text) : '-'),
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
            title: '创建时间',
            dataIndex: 'createAt',
            key: 'createAt',
            width: 200,
            render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-'),
        },
        {
            title: '任务状态',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            fixed: 'right',
            filters: TASK_STATUS_TEXT,
            render: (status, record: ITask) => {
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

                if ([TASK_STATUS.CANCEL, TASK_STATUS.FAIL].includes(status)) {
                    return (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {failReason ? (
                                <Tooltip title={failReason}>
                                    <span>
                                        {tag}
                                        <CopyOutlined onClick={() => copy(failReason)} />
                                    </span>
                                </Tooltip>
                            ) : (
                                tag
                            )}
                        </div>
                    );
                } else if ([TASK_STATUS.SUCCESS].includes(status)) {
                    return record.previewImg ? (
                        <span>
                            {tag}
                            <Popover
                                content={<img style={{ width: 200 }} src={record.previewImg} />}
                            >
                                <PictureOutlined />
                            </Popover>
                        </span>
                    ) : (
                        tag
                    );
                } else {
                    return tag;
                }
            },
        },
        {
            title: () => {
                return (
                    <div className="action-title">
                        <span className="title">操作</span>
                        <Tooltip title="每 10 秒自动刷新" placement="bottom">
                            <Switch
                                // checkedChildren="自动刷新"
                                // unCheckedChildren="自动刷新"
                                loading={versionListLoading || loading}
                                checked={autoRefresh}
                                onChange={handleAutoRefresh}
                            />
                        </Tooltip>
                        <SyncOutlined
                            spin={versionListLoading || loading}
                            onClick={() => {
                                setCurrent(1);
                                setRunTime(new Date().getTime());
                            }}
                        />
                    </div>
                );
            },
            key: 'action',
            width: 160,
            fixed: 'right',
            render: (_text, record: ITask) => {
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
                        <>
                            <Popconfirm
                                title="该任务将重新加入任务队列，是否继续？"
                                onConfirm={() => handleTryRun(record)}
                            >
                                <a>尝试运行</a>
                            </Popconfirm>
                            <Popconfirm
                                title={<div>取消检测后可以再次检测，是否继续？</div>}
                                onConfirm={() => handleCancel(record)}
                            >
                                <a style={{ marginLeft: 12 }}>取消检测</a>
                            </Popconfirm>
                        </>
                    );
                } else if (status === TASK_STATUS.RUNNING) {
                    return '--';
                } else if (status === TASK_STATUS.FAIL) {
                    return tryAgainBtn;
                } else if (status === TASK_STATUS.SUCCESS) {
                    return (
                        <div>
                            <a style={{ marginRight: 12 }} onClick={() => handleResult(record)}>
                                查看结果
                            </a>
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

    // 批量取消
    const handleBatchCancel = () => {
        const hasCanNotCancel = taskList
            .filter((task: any) => selectedRowKeys.includes(task.taskId))
            .some((task: any) => ![TASK_STATUS.WAITING].includes(task.status));

        Modal.confirm({
            title: `确定要取消运行选中的 ${selectedRowKeys.length} 条数据吗？${
                hasCanNotCancel ? '（只有等待中的任务可以被取消）' : ''
            }`,
            icon: <ExclamationCircleOutlined />,
            onOk() {
                API.batchTask({ taskIds: selectedRowKeys, operation: 'cancel' }).then(() => {
                    message.success('操作完成！');
                    setSelectedRowKeys([]);
                    fetchData();
                });
            },
        });
    };
    // 批量重试
    const handleBatchRetry = () => {
        const hasCanNotRetry = taskList
            .filter((task: any) => selectedRowKeys.includes(task.taskId))
            .some((task: any) => ![TASK_STATUS.CANCEL, TASK_STATUS.FAIL].includes(task.status));

        Modal.confirm({
            title: `确定要重新运行选中的 ${selectedRowKeys.length} 条数据吗？${
                hasCanNotRetry ? '（只有取消检测和检测失败的任务可以重试）' : ''
            }`,
            icon: <ExclamationCircleOutlined />,
            onOk() {
                API.batchTask({ taskIds: selectedRowKeys, operation: 'retry' }).then(() => {
                    message.success('操作完成！');
                    setSelectedRowKeys([]);
                    fetchData();
                });
            },
        });
    };
    // 批量置无效
    const handleBatchUnUseful = () => {
        const hasSuccess = taskList
            .filter((task: any) => selectedRowKeys.includes(task.taskId))
            .some((task: any) => task.status === TASK_STATUS.SUCCESS);

        Modal.confirm({
            title: `确定要将选中的 ${selectedRowKeys.length} 条数据置为无效数据吗？`,
            content: `无效数据在图表中不展示${hasSuccess ? '' : '，仅检测完成的数据能被置为无效'}`,
            icon: <ExclamationCircleOutlined />,
            onOk() {
                API.batchTask({ taskIds: selectedRowKeys, operation: 'unUseful' }).then(() => {
                    message.success('操作完成！');
                    setSelectedRowKeys([]);
                    setCurrent(1);
                    setRunTime(new Date().getTime());
                });
            },
        });
    };
    // 批量删除
    const handleBatchDelete = () => {
        const hasRunning = taskList
            .filter((task: any) => selectedRowKeys.includes(task.taskId))
            .some((task: any) => task.status === TASK_STATUS.RUNNING);

        Modal.confirm({
            title: `确定要删除选中的 ${selectedRowKeys.length} 条数据吗？${
                hasRunning ? '（运行中的任务不会被删除）' : ''
            }`,
            icon: <ExclamationCircleOutlined />,
            onOk() {
                API.batchTask({ taskIds: selectedRowKeys, operation: 'delete' }).then(() => {
                    message.success('操作完成！');
                    setSelectedRowKeys([]);
                    setCurrent(1);
                    setRunTime(new Date().getTime());
                });
            },
        });
    };

    // 表格的分页、筛选
    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
        setCurrent(pagination?.current);
        setPageSize(pagination?.pageSize);

        const { columnKey, order: _order } = sorter;
        const order = _order === 'ascend' ? 'ASC' : _order === 'descend' ? 'DESC' : undefined;
        setSorter({ columnKey, order });

        setTriggerType(filters?.triggerType);
        setStatus(filters?.status);
        setSelectedRowKeys([]);

        setRunTime(new Date().getTime());
    };

    // 点击行选择
    const selectRow = (record: ITask) => {
        const _selectedRowKeys = [...selectedRowKeys];
        if (_selectedRowKeys.includes(record.taskId)) {
            _selectedRowKeys.splice(_selectedRowKeys.indexOf(record.taskId), 1);
        } else {
            _selectedRowKeys.push(record.taskId);
        }
        setSelectedRowKeys(_selectedRowKeys);
    };
    // 点击 checkbox 勾选
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };
    const pagination = {
        current,
        pageSize,
        total,
        pageSizeOptions: ['20', '50', '100', '200'],
        showSizeChanger: true,
        showTotal: (total: number) => `共 ${total} 条数据`,
    };
    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    return (
        <>
            <Table
                className="task-table"
                rowKey="taskId"
                size="middle"
                loading={versionListLoading || loading}
                columns={columns}
                dataSource={taskList}
                pagination={pagination}
                rowSelection={rowSelection}
                scroll={{
                    x: 1570,
                    y: 'calc(100vh - 160px - 24px - 56px - 48px - 48px - 16px)',
                }}
                onChange={handleTableChange}
                onRow={(record: ITask) => ({
                    onClick: (e: any) => {
                        // TODO 双击某个元素时也会触发、选择内容时也会触发
                        // 拦截按钮的点击事件、failReason 的复制
                        if (
                            ['A', 'svg'].includes(e?.target?.tagName) ||
                            (e?.target?.tagName === 'SPAN' &&
                                ['取 消', '确 定'].includes(e?.target?.innerHTML))
                        ) {
                            return;
                        }
                        selectRow(record);
                    },
                })}
            />

            {taskList.length ? (
                <div className="select-content">
                    <div className="count">当前选中：{selectedRowKeys.length}</div>
                    <Button disabled={!selectedRowKeys.length} onClick={handleBatchCancel}>
                        批量取消
                    </Button>
                    <Button disabled={!selectedRowKeys.length} onClick={handleBatchRetry}>
                        批量重试
                    </Button>
                    {false && (
                        <Button disabled={!selectedRowKeys.length} onClick={handleBatchUnUseful}>
                            批量置无效
                        </Button>
                    )}
                    {yiceRole === YICE_ROLE.ADMIN && (
                        <Button
                            danger
                            disabled={!selectedRowKeys.length}
                            onClick={handleBatchDelete}
                        >
                            批量删除
                        </Button>
                    )}
                </div>
            ) : null}

            <ResultModal
                open={resultModalOpen}
                taskInfo={taskInfo}
                onCancel={() => setResultModalOpen(false)}
            />
        </>
    );
}
