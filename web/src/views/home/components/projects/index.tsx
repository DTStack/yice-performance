import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImgUrl } from '../../../../utils';
import './style.less';

function Projects() {
    const navigate = useNavigate();
    const [projectList, setProjectList] = useState<any[]>([]);

    useEffect(() => {
        setProjectList([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    }, []);

    /** 点击了项目 */
    const handleProject = (item: any) => {
        navigate(`/about`, { state: { id: item } });
        console.log(1112, item);
    };

    return (
        <div className="project-box">
            {projectList.map((item) => {
                return (
                    <div className="project-item" key={item} onClick={() => handleProject(item)}>
                        <img src={getImgUrl('batch.svg')} alt="" />
                        <div className="name">{item}</div>
                    </div>
                );
            })}
        </div>
    );
}

export default Projects;
