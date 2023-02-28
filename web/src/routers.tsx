import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Layout from './views/layout';
import NotFound from './components/notFound';

import Home from './views/home';
import About from './views/about';

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
