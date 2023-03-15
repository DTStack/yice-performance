import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Button, Divider, message, Popconfirm } from 'antd';
import { getImgUrl } from '../../../../utils';
import API from '../../../../utils/api';
import ProjectModal from '../projectModal';
import { ProjectInfo } from 'typing';
import './style.less';

interface IProps {
    onSetRunTime: (time: number) => void;
}

function Projects(props: IProps) {
    const { onSetRunTime } = props;
    // const navigate = useNavigate();
    const [projectList, setProjectList] = useState<any[]>([]);
    const [projectInfo, setProjectInfo] = useState<ProjectInfo>({ url: '' });
    const [projectModalOpen, setProjectModalOpen] = useState<boolean>(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        API.getProjects().then((res) => {
            setProjectList(res.data || []);
        });
    };

    const handleEdit = (item: any) => {
        // navigate(`/about`, { state: { id: item } });
        setProjectInfo(item);
        setProjectModalOpen(true);
    };

    // 点击检测
    const handleRun = (item: ProjectInfo) => {
        const { projectId } = item;
        API.createTask({ projectId }).then(() => {
            message.success('成功，请在任务列表查看');
            onSetRunTime(new Date().getTime());
        });
    };

    return (
        <React.Fragment>
            <div className="project-box">
                {projectList.map((item) => {
                    return (
                        <div className="project-item" key={item.projectId}>
                            <img src={getImgUrl(item.logo || 'batch.png')} alt="" />
                            <div className="name">{item.name}</div>
                            <div className="btn-box">
                                <Button type="link" onClick={() => handleEdit(item)}>
                                    编辑
                                </Button>
                                <Divider type="vertical" />
                                <Popconfirm
                                    title="是否检测该项目？"
                                    placement="bottomRight"
                                    onConfirm={() => handleRun(item)}
                                >
                                    <Button type="link">检测</Button>
                                </Popconfirm>
                            </div>
                        </div>
                    );
                })}
            </div>

            <ProjectModal
                projectInfo={projectInfo}
                open={projectModalOpen}
                onCancel={(needFetch: boolean) => {
                    setProjectModalOpen(false);
                    needFetch && fetchData();
                }}
            />
        </React.Fragment>
    );
}

export default Projects;
