import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { getImgUrl } from '../../../../utils';
import './style.less';

interface IProps {
    projectList: any[];
    getProjects: () => void;
    onSetRunTime: (time: number) => void;
}

function Projects(props: IProps) {
    const { projectList = [] } = props;
    // const navigate = useNavigate();
    // navigate(`/about`, { state: { id: item } });
    const [active, setActive] = useState(undefined);

    // 选择项目
    const handleProject = (item: any) => {
        console.log(111, item);
        setActive(item.projectId);
    };

    return (
        <div className="project-box">
            {projectList.map((item) => {
                return (
                    <div
                        className={`project-item ${active === item.projectId ? 'active' : ''}`}
                        key={item.projectId}
                        onClick={() => handleProject(item)}
                    >
                        <img src={getImgUrl(item.logo || 'batch.png')} alt="" />
                        <div className="name">{item.name}</div>
                    </div>
                );
            })}
        </div>
    );
}

export default Projects;
