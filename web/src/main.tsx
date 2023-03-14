import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import './main.less';

import Routers from './routers';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <ConfigProvider locale={zhCN}>
        <BrowserRouter>
            <Routers />
        </BrowserRouter>
    </ConfigProvider>
);
