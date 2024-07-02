import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';

import { YICE_ROLE } from './const/role';
import Routers from './routers';
import './main.less';

import { version } from '../package.json';

const yiceRole = localStorage.getItem('yice-role');
!yiceRole && localStorage.setItem('yice-role', YICE_ROLE.USER);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <ConfigProvider locale={zhCN}>
        <BrowserRouter>
            <Routers />
        </BrowserRouter>
    </ConfigProvider>
);

window.console.log(
    `%cApp current version: v${version}`,
    'font-family: Cabin, Helvetica, Arial, sans-serif;text-align: left;font-size:32px;color:#B21212;'
);
