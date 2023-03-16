import instance from './axios';

export default {
    // 任务相关
    getTasks(params: any) {
        return instance.get('/task/getTasks', { params });
    },
    getTask(params: any) {
        return instance.get('/task/getTask', { params });
    },
    createTask(data: any) {
        return instance.post('/task/createTask', data);
    },
    updateTask(data: any) {
        return instance.post('/task/updateTask', data);
    },
    tryTaskAgain(data: any) {
        return instance.post('/task/tryTaskAgain', data);
    },
    tryRunTask(data: any) {
        return instance.post('/task/tryRunTask', data);
    },

    // 项目相关
    getProjects(params?: any) {
        return instance.get('/project/getProjects', { params });
    },
    getProject(params: any) {
        return instance.get('/project/getProject', { params });
    },
    updateProject(data: any) {
        return instance.post('/project/updateProject', data);
    },

    // 性能指标相关
    getPerformancesByTaskId(params: any) {
        return instance.get('/performance/getPerformancesByTaskId', { params });
    },
};
