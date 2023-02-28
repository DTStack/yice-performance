import { useState } from 'react';
import { Input, message } from 'antd';
import Projects from './components/projects';
import './style.less';

const { Search } = Input;

function Home() {
    const [examining, setExamining] = useState(false);

    /** 点击了检测按钮 */
    const handleExamine = (url: string) => {
        const pattern =
            /^(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/g;
        if (!pattern.test(url)) {
            message.warning('请输入以 http(s) 开头的检测网址');
            return;
        }

        setExamining(true);
        console.log(1111, url);
    };

    return (
        <div className="home-content">
            <Search
                className="examine-input"
                placeholder="请输入待检测的网址，以 http(s) 开头"
                enterButton="开始检测"
                autoFocus
                loading={examining}
                onSearch={handleExamine}
                onPressEnter={(e) => !examining && handleExamine((e?.target as any)?.value)}
            />

            <Projects />
        </div>
    );
}

export default Home;
