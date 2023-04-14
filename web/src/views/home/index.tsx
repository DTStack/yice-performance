import { useEffect, useState } from 'react';
import { Input, message } from 'antd';
import Projects from './components/projects';
import { httpPattern } from '../../utils';
import API from '../../utils/api';
import Versions from './components/versions';
import { IProject } from 'typing';
import './style.less';

const { Search } = Input;

function Home() {
    const [project, setProject] = useState<IProject>();
    const [projectList, setProjectList] = useState<any[]>([]);
    const [running, setRunning] = useState<boolean>(false);
    const [search, setSearch] = useState<string>('');
    // runTime 更新则代表 点击了运行按钮，需要更新任务列表
    const [runTime, setRunTime] = useState<number>(0);

    useEffect(() => {
        getProjects();
    }, []);

    const getProjects = () => {
        API.getProjects().then((res) => {
            setProjectList(res.data || []);
            setProject(res.data?.[0]);
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
                setRunTime(new Date().getTime());
                setSearch('');
                message.success('操作成功，请在『其他』的任务列表查看');
            })
            .finally(() => {
                setRunning(false);
            });
    };

    return (
        <div className="home-content">
            <div className="top-content">
                <div className="top-bg"></div>
                <Search
                    className="run-input"
                    placeholder="请输入待检测的地址，以 http(s) 开头"
                    enterButton="开始检测"
                    autoFocus
                    value={search}
                    loading={running}
                    onChange={(e) => setSearch((e?.target as any)?.value)}
                    onSearch={handleRun} // 按钮事件
                    onPressEnter={(e) => !running && handleRun((e?.target as any)?.value)}
                />
            </div>

            <div className="content">
                <div className="box">
                    <Projects
                        projectId={project?.projectId}
                        projectList={projectList}
                        setProject={(project: IProject) => setProject(project)}
                    />

                    <Versions project={project} runTime={runTime} setRunTime={setRunTime} />
                </div>
            </div>
        </div>
    );
}

export default Home;
