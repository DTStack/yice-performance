import { useSearchParams, useLocation } from 'react-router-dom';
import './style.less';

function About() {
    const { state } = useLocation();
    const [searchParams] = useSearchParams();
    console.log(searchParams.get('id'), state);
    return <div>About</div>;
}

export default About;
