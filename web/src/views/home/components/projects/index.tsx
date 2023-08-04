// import { useNavigate } from 'react-router-dom';
import { Empty, Menu } from 'antd';
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

    const items = projectList.map((item: any) => {
        return {
            label: item.name,
            key: item.projectId,
            icon: <img src={getImgUrl(`${item.appName || 'default'}.png`)} alt="" />,
        };
    });

    const handleClick = (e: any) => {
        setProject(projectList.find((item) => `${item.projectId}` === e.key));
    };

    return (
        <div className="project-box">
            {projectId && !!items.length ? (
                <Menu
                    onClick={handleClick}
                    style={{ width: 200 }}
                    defaultSelectedKeys={[`${projectId}`]}
                    mode="inline"
                    items={items}
                />
            ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
        </div>
    );
}
