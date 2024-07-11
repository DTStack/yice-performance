import { useContext, useEffect, useState } from 'react';
import { Empty, Input, message } from 'antd';
import { IProject } from 'typing';

import { YICE_ROLE } from '../../const/role';
import { InitContext } from '../../store';
import { getImgUrl, httpPattern } from '../../utils';
import API from '../../utils/api';
import Projects from './components/projects';
import Versions from './components/versionList';
import './style.less';

const { Search } = Input;

function Home() {
    const {
        project,
        setProject,
        setVersionId,
        setRunTime,
        setStartTime,
        setEndTime,
        setSearchStr,
        setCurrent,
    } = useContext(InitContext);

    const [projectList, setProjectList] = useState<any[]>([]);
    const [running, setRunning] = useState<boolean>(false);
    const [searchUrl, setSearchUrl] = useState<string | undefined>(undefined);
    const [clickCount, setClickCount] = useState(0);

    useEffect(() => {
        getProjects();
    }, []);

    // 设置权限的点击方式
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

            // 如果 router-params-projectId 中有值，则使用；没有则使用 yice-active-projectId 中的值，还没有则默认 res.data 第一个
            let _projectId = sessionStorage.getItem('router-params-projectId') || undefined;
            if (_projectId) {
                // url 带了 projectId 参数
                sessionStorage.removeItem('router-params-projectId');
                sessionStorage.setItem('yice-active-projectId', `${_projectId}`);
            } else {
                // url 没带参数
                _projectId = sessionStorage.getItem('yice-active-projectId') || undefined;
            }

            setProject(
                res.data?.find((project: IProject) => project.projectId === Number(_projectId)) ||
                    res.data?.[0]
            );
        });
    };

    // 输入框的回车事件
    const handleInputEnter = (e: any) => {
        // 中文输入法输入时回车，keyCode 是 229；光标在输入框直接回车，keyCode 是 13
        !running && e.keyCode === 13 && handleRun((e?.target as any)?.value);
    };

    // 点击了检测按钮
    const handleRun = (url: string) => {
        if (!httpPattern.test(url)) {
            message.warning('请输入以 http(s) 开头的检测地址');
            return;
        }

        setRunning(true);
        API.createTask({ url })
            .then(() => {
                // 点击顶部输入框后的运行按钮，应当清除搜索条件，切换到汇总的项目下，请求 taskList
                if (project?.name !== '汇总') {
                    const project = projectList.find(
                        (project: IProject) => project.name === '汇总'
                    );
                    setProject(project);
                    sessionStorage.setItem('yice-active-projectId', `${project.projectId}`);
                }
                setVersionId(undefined);
                setStartTime(undefined);
                setEndTime(undefined);
                setSearchStr(undefined);
                setSearchUrl(undefined);
                setCurrent(1);

                setRunTime(new Date().getTime());
                // 输入地址的检测，版本名为“自定义地址”，检测后跳转到汇总
                message.success('操作完成，请在左侧『汇总』的任务列表查看');
            })
            .finally(() => {
                setRunning(false);
            });
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
                    <div>
                        {process.env.NODE_ENV === 'staging' ? '【测试服】' : ''}易测性能检测平台
                    </div>
                </div>
                <Search
                    className="run-input"
                    placeholder="请输入待检测的地址，以 http(s) 开头"
                    enterButton="+"
                    value={searchUrl}
                    loading={running}
                    onChange={(e) => setSearchUrl((e?.target as any)?.value)}
                    onSearch={handleRun} // 按钮事件
                    onPressEnter={handleInputEnter}
                />
            </div>

            <div className="content">
                <div className={projectList.length ? 'box' : 'box empty'}>
                    {projectList.length ? (
                        <>
                            <Projects projectList={projectList} getProjects={getProjects} />
                            <Versions />
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
