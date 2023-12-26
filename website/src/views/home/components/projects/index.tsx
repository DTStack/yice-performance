import { useContext, useState } from 'react';
import { EditOutlined } from '@ant-design/icons';
import { Empty, Menu } from 'antd';
import { IProject } from 'typing';

import { YICE_ROLE } from '../../../../const/role';
import { InitContext } from '../../../../store';
import { getImgUrl } from '../../../../utils';
import ProjectModal from '../projectModal';
import './style.less';

interface IProps {
    projectList: any[];
    getProjects: Function;
}

export default function Projects(props: IProps) {
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
    const [open, setOpen] = useState<boolean>(false);
    const [editProject, setEditProject] = useState<IProject | undefined>(undefined);
    const { projectId } = project || {};
    const { projectList = [], getProjects } = props;

    const yiceRole = localStorage.getItem('yice-role');

    const items = projectList.map((item: any) => {
        return {
            key: item.projectId,
            icon: (
                <>
                    <img src={getImgUrl(`${item.appName || 'default'}.png`)} alt="" />
                    <div className="name">{item.name}</div>
                    {yiceRole === YICE_ROLE.ADMIN && item.name !== '汇总' ? (
                        <EditOutlined className="edit-icon" onClick={(e) => handleEdit(e, item)} />
                    ) : null}
                </>
            ),
        };
    });

    // 编辑项目
    const handleEdit = (e: any, item: IProject) => {
        setEditProject(item);
        setOpen(true);
        e.stopPropagation();
    };

    // 切换项目 应当先清除搜索条件：搜索内容、versionId、起止日期、current，再更新 projectId，并请求 taskList
    const handleClick = (e: any) => {
        const project = projectList.find((item) => `${item.projectId}` === e.key);

        setVersionId(undefined);
        setStartTime(undefined);
        setEndTime(undefined);
        setSearchStr(undefined);
        setCurrent(1);
        setProject(project);
        sessionStorage.setItem('yice-active-projectId', `${project.projectId}`);

        setRunTime(new Date().getTime());
    };

    return (
        <div className="project-box">
            {projectId && !!items.length ? (
                <Menu
                    onClick={handleClick}
                    style={{ width: 200 }}
                    selectedKeys={[`${projectId}`]}
                    mode="inline"
                    items={items}
                />
            ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}

            <ProjectModal
                open={open}
                project={editProject}
                onCancel={() => {
                    setOpen(false);
                    setEditProject(undefined);
                    getProjects();
                }}
            />
        </div>
    );
}
