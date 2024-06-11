import { Route, Routes } from 'react-router-dom';

import NotFound from './components/notFound';
import Home from './views/home';
import Layout from './views/layout';
import Redirect from './views/redirect';
import { YiceContextProvider } from './store';

export default function Routers() {
    return (
        <YiceContextProvider>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="redirect" element={<Redirect />} />
                    {/* <Route path="*" element={<NotFound />} /> */}
                </Route>
            </Routes>
        </YiceContextProvider>
    );
}
