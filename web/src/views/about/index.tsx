import { useState } from 'react';
import { Input, message } from 'antd';
import { useSearchParams, useLocation } from 'react-router-dom';
import './style.less';

function About() {
    const { state } = useLocation();
    const [searchParams] = useSearchParams();
    console.log(1113, searchParams.get('id'), state);
    return <div>About</div>;
}

export default About;
