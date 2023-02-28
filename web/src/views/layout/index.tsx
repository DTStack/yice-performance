import { Outlet } from 'react-router-dom';
import './style.less';

export default function Layout(props: any) {
    return (
        <div className="app-content">
            {props.children}
            <Outlet />
        </div>
    );
}
