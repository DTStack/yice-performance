import { Route, Routes } from 'react-router-dom';

import NotFound from './components/notFound';
import About from './views/about';
import Home from './views/home';
import Layout from './views/layout';

export default function Routers() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}
