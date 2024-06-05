import instance from './axios';

export default {
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

    // 版本相关
    getVersions(params?: any) {
        return instance.get('/version/getVersions', { params });
    },
    getVersion(params?: any) {
        return instance.get('/version/getVersion', { params });
    },
    createVersion(data: any) {
        return instance.post('/version/createVersion', data);
    },
    updateVersion(data: any) {
        return instance.post('/version/updateVersion', data);
    },
    updateScheduleConf(data: any) {
        return instance.post('/version/updateScheduleConf', data);
    },
    deleteVersion(data: any) {
        return instance.post('/version/deleteVersion', data);
    },
    previewCron(data: any) {
        return instance.post('/version/previewCron', data);
    },
    patchData(data: any) {
        return instance.post('/version/patchData', data);
    },

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
    batchTask(data: any) {
        return instance.post('/task/batchTask', data);
    },
    tryTaskAgain(data: any) {
        return instance.post('/task/tryTaskAgain', data);
    },
    tryRunTask(data: any) {
        return instance.post('/task/tryRunTask', data);
    },
    // 检查结果文件是否存在
    checkFileExists(data: any) {
        return instance.post('/task/checkFileExists', data);
    },

    // 性能指标相关
    getPerformancesByTaskId(params: any) {
        return instance.get('/performance/getPerformancesByTaskId', { params });
    },

    // 图表相关
    getProjectChart(params: any) {
        return instance.get('/chart/getProjectChart', { params });
    },
    getFileSizeChart(params: any) {
        return instance.get('/chart/getFileSizeChart', { params });
    },
    getBuildChart(params: any) {
        return instance.get('/chart/getBuildChart', { params });
    },

    // devops 相关
    getShiLis(params?: any) {
        return instance.get('/devops/getShiLis', { params });
    },
    getDevopsUrl(params?: any) {
        return instance.get('/devops/getDevopsUrl', { params });
    },
    getDevopsProjectList(params?: any) {
        return instance.get('/devops/getDevopsProjectList', { params });
    },

    // 数据周报 - 邮件
    sendProjectMail(data: any) {
        return instance.post('/email/send', data);
    },
};
