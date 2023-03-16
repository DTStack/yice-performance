import axios from 'axios';
import { message } from 'antd';

// 创建 axios 实例
const instance = axios.create({
    baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:4000/api/v1' : '/api/v1',
    timeout: 30_000,
});

// 设置 post 请求头
// axios.defaults.headers.post['Content-Type'] = 'application/json'

// 请求拦截
// instance.interceptors.request.use(
//     (config) => {
//         const accessToken = store.getters['user/accessToken'];
//         accessToken && (config.headers.Authorization = `Bearer ${accessToken}`);
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// 响应拦截
instance.interceptors.response.use(
    (res) => {
        if (res.status === 200) {
            if (res.data.code !== 200) {
                console.log('code error not 200', res);
                message.error(res.data.message);
                return Promise.reject(res);
            }
            return Promise.resolve(res.data);
        } else {
            console.log('status error', res);
            return Promise.reject(res);
        }
    },
    (error) => {
        console.log('response error', error);
        message.error(error.message);
        return Promise.reject(error);
    }
);

export default instance;
