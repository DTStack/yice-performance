import { useEffect, useState } from 'react';
import { Modal, Form, Input, message, Button, DatePicker, Select } from 'antd';
import API from '../../../../utils/api';
import moment from 'moment';
import './style.less';

const { RangePicker } = DatePicker;

interface IProps {
    open: boolean;
    versionId: number | undefined;
    versionName: string | undefined;
    onCancel: (needFetch: any) => void;
    setRunTime: (runTime: number) => void;
}

export default function ScheduleModal(props: IProps) {
    const { open, versionId, versionName, onCancel, setRunTime } = props;
    const [form] = Form.useForm();
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
    const [runLoading, setRunLoading] = useState<boolean>(false);
    const scheduleTypeList = [
        { label: '分钟', value: 'minute' },
        { label: '小时', value: 'hour' },
        { label: '天', value: 'day' },
    ];

    useEffect(() => {
        if (open) {
            form.resetFields();
        }
    }, [open]);

    // 运行按钮
    const handleRun = () => {
        setRunLoading(true);
        API.createTask({ versionId })
            .then(() => {
                setRunTime(new Date().getTime());
                message.success('操作成功，请在任务列表查看');
            })
            .finally(() => {
                setRunLoading(false);
                onCancel(true);
            });
    };

    // 确定按钮
    const handleOk = () => {
        setConfirmLoading(true);
        form.validateFields()
            .then((values) => {
                // 去除值为空字符串的字段
                const params = Object.keys(values)
                    .filter((key) => values[key] !== '')
                    .reduce((acc, key) => ({ ...acc, [key]: values[key] }), {});
                // beginDate: values.beginDate[0].format('YYYY-MM-DD')

                API[open ? 'updateVersion' : 'createVersion']({
                    ...params,
                    versionId,
                })
                    .then(() => {
                        message.success('保存成功！');
                        onCancel(false);
                    })
                    .finally(() => {
                        setConfirmLoading(false);
                    });
            })
            .catch(() => {
                setConfirmLoading(false);
            });
    };

    const renderButtons = () => {
        return (
            <div className="btn-box">
                <Button type="primary" loading={runLoading} onClick={handleRun}>
                    立即运行
                </Button>

                <div>
                    <Button onClick={onCancel}>取消</Button>
                    <Button type="primary" loading={confirmLoading} onClick={handleOk}>
                        确定
                    </Button>
                </div>
            </div>
        );
    };

    // 选择某个调度周期
    const handleScheduleType = (value: any) => {
        console.log(111, value);
    };

    return (
        <Modal
            title={`${versionName}调度信息`}
            open={open}
            forceRender
            destroyOnClose
            footer={renderButtons()}
        >
            <Form form={form} labelCol={{ span: 5 }} wrapperCol={{ span: 18 }} name="Form">
                <Form.Item
                    name="startDate"
                    label="生效日期"
                    rules={[{ required: true, message: '生效日期不能为空' }]}
                    initialValue={[moment('2001-01-01'), moment('2001-01-01').add(120, 'years')]}
                >
                    <RangePicker format="YYYY-MM-DD" placeholder={['开始时间', '结束时间']} />
                </Form.Item>
                <Form.Item
                    name="scheduleType"
                    label="调度周期"
                    // initialValue={`${scheduleConf?.scheduleType}`}
                    rules={[
                        {
                            required: true,
                            message: '调度周期必选',
                        },
                    ]}
                >
                    <Select
                        placeholder="请选择绑定的 devops 实例"
                        options={scheduleTypeList}
                        onSelect={handleScheduleType}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
