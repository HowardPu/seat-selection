import React, { Component } from 'react';

import {Redirect} from 'react-router-dom';

export class Main extends Component {
    constructor(props) {
        super(props);

        this.state = {
            start: false
        }
    }

    render() {
        if(this.state.start) {
            return <Redirect to="/disclaimer"/>
        }
        return(
            <div className="main-page-container">
                
                <div className="full-bloom main-title-item">
                    <h1>长春市图书馆智能选座系统</h1> 
                </div>
                

                <div className="main-container">
                    <div className="main-item full-bloom"> 
                        <h2 className="main-item-title">快速抢座</h2>
                        <p>相对于传统的微信选座，本智能选座无反应时间，可以同时抢座，并根据长春市图书馆服务器的更新速度抢座，极大减小失手风险。</p>
                    </div>

                    <div className="main-item full-bloom"> 
                        <h2 className="main-item-title">智能抢座</h2>
                        <p>本系统可根据用户的倾向以及当前可以选择的座位进行参考，确保每位使用的用户选到目标座位</p>
                    </div>

                    <div className="main-item full-bloom"> 
                        <h2 className="main-item-title">自助抢座</h2>
                        <p>信不过你的设备？自主选座系统可让您提前进入抢座系统，先人一步获得座位。</p>
                    </div>
                </div>

                <button className="button-item btn btn-primary main-button" onClick={() => {
                    this.setState({
                        start: true
                    });
                }}>开始选座</button>
            </div>
        )
    }
}