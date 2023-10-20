import { useContext } from 'react';
import { Empty, Menu } from 'antd';

import { InitContext } from '../../../../store';
import { getImgUrl } from '../../../../utils';
import './style.less';

interface IProps {
    projectList: any[];
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
    const { projectId } = project || {};
    const { projectList = [] } = props;

    const items = projectList.map((item: any) => {
        return {
            label: item.name,
            key: item.projectId,
            icon: <img src={getImgUrl(`${item.appName || 'default'}.png`)} alt="" />,
        };
    });

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
        </div>
    );
}
