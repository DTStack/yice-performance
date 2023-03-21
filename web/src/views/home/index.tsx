import { useEffect, useState } from 'react';
import { Input, message } from 'antd';
import Projects from './components/projects';
import TaskTable from './components/taskTable';
import { httpPattern } from '../../utils';
import API from '../../utils/api';
import './style.less';

const { Search } = Input;

function Home() {
    const [projectList, setProjectList] = useState<any[]>([]);
    const [running, setRunning] = useState<boolean>(false);
    // 最后一次点击开始检测的时间戳
    const [runTime, setRunTime] = useState<number>(0);

    useEffect(() => {
        getProjects();
    }, []);

    const getProjects = () => {
        API.getProjects().then((res) => {
            setProjectList(res.data || []);
        });
    };

    /** 点击了检测按钮 */
    const handleRun = (url: string) => {
        if (!httpPattern.test(url)) {
            message.warning('请输入以 http(s) 开头的检测地址');
            return;
        }

        setRunning(true);
        API.createTask({ url })
            .then(() => {
                message.success('成功，请在任务列表查看');
                setRunTime(new Date().getTime());
            })
            .finally(() => {
                setRunning(false);
            });
    };

    return (
        <div className="home-content">
            <div className="top-bg"></div>
            <Search
                className="run-input"
                placeholder="请输入待检测的地址，以 http(s) 开头"
                enterButton="开始检测"
                autoFocus
                loading={running}
                onSearch={handleRun}
                onPressEnter={(e) => !running && handleRun((e?.target as any)?.value)}
            />

            <Projects
                projectList={projectList}
                getProjects={getProjects}
                onSetRunTime={(time) => setRunTime(time)}
            />
            <TaskTable projectList={projectList} runTime={runTime} />
        </div>
    );
}

export default Home;
