// import { useNavigate } from 'react-router-dom';
import { IProject } from 'typing';
import { getImgUrl } from '../../../../utils';
import './style.less';

interface IProps {
    projectId: number | undefined;
    projectList: any[];
    setProject: (project: IProject) => void;
}

export default function Projects(props: IProps) {
    const { projectId, projectList = [], setProject } = props;
    // const navigate = useNavigate();
    // navigate(`/about`, { state: { id: item } });

    return (
        <div className="project-box">
            {projectList.map((item) => {
                return (
                    <div
                        className={`project-item ${projectId === item.projectId ? 'active' : ''}`}
                        key={item.projectId}
                        onClick={() => setProject(item)}
                    >
                        <img src={getImgUrl(`${item.appName || 'default'}.png`)} alt="" />
                        <div className="name">{item.name}</div>
                    </div>
                );
            })}
        </div>
    );
}
