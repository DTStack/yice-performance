import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Empty, Input, message } from 'antd';
import { IProject } from 'typing';

import { YICE_ROLE } from '../../const/role';
import { getImgUrl, httpPattern } from '../../utils';
import API from '../../utils/api';
import Projects from './components/projects';
import Versions from './components/versions';
import './style.less';

const { Search } = Input;

function Home() {
    const [searchParams] = useSearchParams();
    const [project, setProject] = useState<IProject>();
    const [projectList, setProjectList] = useState<any[]>([]);
    const [running, setRunning] = useState<boolean>(false);
    const [search, setSearch] = useState<string>('');
    // runTime 更新则代表 点击了运行按钮，需要更新任务列表，页码为 1
    const [runTime, setRunTime] = useState<number>(0);
    const [clickCount, setClickCount] = useState(0);

    useEffect(() => {
        getProjects();
    }, []);

    useEffect(() => {
        let timer: any;

        if (clickCount > 0) {
            // 一秒钟内没有继续点击，则重置点击次数
            timer = setTimeout(() => {
                setClickCount(0);
            }, 1000);
        }

        // 处理三次点击的操作
        if (clickCount === 3) {
            setClickCount(0);
            clearTimeout(timer);

            const yiceRole = localStorage.getItem('yice-role');
            const role = yiceRole === YICE_ROLE.USER ? YICE_ROLE.ADMIN : YICE_ROLE.USER;
            localStorage.setItem('yice-role', role);
            message.success(`已切换为『${role === YICE_ROLE.ADMIN ? '管理员' : '用户'}』权限`);
        }

        return () => {
            clearTimeout(timer); // 在组件卸载或重新渲染时清除定时器
        };
    }, [clickCount]);

    const getProjects = () => {
        API.getProjects().then((res) => {
            setProjectList(res.data || []);
            setProject(
                res.data?.find(
                    (project: IProject) =>
                        project.projectId ===
                        Number(
                            searchParams.get('projectId') ||
                                sessionStorage.getItem('yice-active-projectId')
                        )
                ) || res.data?.[0]
            );
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
                // 输入地址的检测，版本名为“自定义地址”，检测后跳转到汇总
                setProject(projectList.find((project: IProject) => project.name === '汇总'));
                message.success('操作完成，请在『汇总』的任务列表查看');
            })
            .finally(() => {
                setRunning(false);
            });
    };

    const handleSelectProject = (project: IProject) => {
        sessionStorage.setItem('yice-active-projectId', `${project.projectId}`);
        setProject(project);
    };

    // 输入框的回车事件
    const handleInputEnter = (e: any) => {
        // 中文输入法输入时回车，keyCode 是 229；光标在输入框直接回车，keyCode 是 13
        !running && e.keyCode === 13 && handleRun((e?.target as any)?.value);
    };

    const handleClick = () => {
        setClickCount((prevClickCount) => prevClickCount + 1);
    };

    return (
        <div className="home-content">
            <div className="top-content">
                <div className="top-bg"></div>
                <div className="logo-box">
                    <img src={getImgUrl('', '/logo.png')} alt="" onClick={handleClick} />
                    <div>易测性能检测平台</div>
                </div>
                <Search
                    className="run-input"
                    placeholder="请输入待检测的地址，以 http(s) 开头"
                    enterButton="+"
                    value={search}
                    loading={running}
                    onChange={(e) => setSearch((e?.target as any)?.value)}
                    onSearch={handleRun} // 按钮事件
                    onPressEnter={handleInputEnter}
                />
            </div>

            <div className="content">
                <div className={projectList.length ? 'box' : 'box empty'}>
                    {projectList.length ? (
                        <>
                            <Projects
                                projectId={project?.projectId}
                                projectList={projectList}
                                setProject={(project: IProject) => handleSelectProject(project)}
                            />

                            <Versions project={project} runTime={runTime} setRunTime={setRunTime} />
                        </>
                    ) : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;
