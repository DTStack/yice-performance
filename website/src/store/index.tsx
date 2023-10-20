import { createContext, useState } from 'react';
import { IProject } from 'typing';

interface IContext {
    project: IProject | undefined;
    versionId: number | undefined;
    runTime: number;
    startTime: string | undefined;
    endTime: string | undefined;
    searchStr: string | undefined;
    current: number | undefined;

    setProject: Function;
    setVersionId: Function;
    setRunTime: (runTime: number) => void;
    setStartTime: Function;
    setEndTime: Function;
    setSearchStr: Function;
    setCurrent: Function;
}

export const InitContext = createContext<IContext>({
    project: undefined,
    versionId: undefined,
    runTime: 0,
    startTime: undefined,
    endTime: undefined,
    searchStr: undefined,
    current: 1,

    setProject: () => {},
    setVersionId: () => {},
    setRunTime: () => {},
    setStartTime: () => {},
    setEndTime: () => {},
    setSearchStr: () => {},
    setCurrent: () => {},
});

export const YiceContextProvider = (props: any) => {
    const [project, setProject] = useState();
    const [versionId, setVersionId] = useState();
    // runTime 更新则代表 点击了运行按钮，需要更新任务列表，页码为 1
    const [runTime, setRunTime] = useState(0);
    const [startTime, setStartTime] = useState();
    const [endTime, setEndTime] = useState();
    const [searchStr, setSearchStr] = useState();
    const [current, setCurrent] = useState(1);

    return (
        <InitContext.Provider
            value={{
                project,
                versionId,
                runTime,
                startTime,
                endTime,
                searchStr,
                current,

                setProject,
                setVersionId,
                setRunTime,
                setStartTime,
                setEndTime,
                setSearchStr,
                setCurrent,
            }}
        >
            {props.children}
        </InitContext.Provider>
    );
};
