import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * 1. 将 url 带的 projectId、versionId 参数保存到 router-params-projectId
 * 2. home 初始化 projectId 时，先看 router-params-projectId 中的值，有则使用且保存到 yice-active-projectId；没有则使用 yice-active-projectId 中的值，还没有则默认使用返回的 taskList 第一个。
 */
function Redirect() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    useEffect(() => {
        sessionStorage.setItem('router-params-projectId', searchParams.get('projectId') || '');
        sessionStorage.setItem('router-params_versionId', searchParams.get('versionId') || '');
        navigate(`/`, { state: { projectId: 5, versionId: 11 }, replace: true });
    }, []);

    return null;
}

export default Redirect;
