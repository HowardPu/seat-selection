import React, { Component } from 'react';

import {Redirect} from 'react-router-dom';

import {FormGroup, Label, Input} from 'reactstrap';

export class Disclaimer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            agree: false,
            redirect: false,
            cancel: false
        }
    }

    render() {
        if(this.state.cancel) {
            return(<Redirect to="/"/>);
        }
        if(this.state.redirect) {
            return(<Redirect to="/id-collecter"/>);
        }
        let color = "danger";
        let description = "您需勾选“我已阅读免责声明”"
        if(this.state.agree) {
            color = "success";
            description = "进入智能选座系统";
        }
        return(
            <div className="disclaimer-page-container full-bloom">
                <div>
                    <h1>免责声明</h1>
                    
                    <ul className="disclaimer-list"> 
                        <li>您需要首先激活长春市图书馆微信抢座。</li>
                        <li>您需要开启您浏览器的<a href="https://en.wikipedia.org/wiki/Cross-origin_resource_sharing" target="_blank" rel="noopener noreferrer">跨來源資源共享</a>功能。</li>
                        <li>此系统并不能100%确保您想要的座位。</li>
                        <li>此系统可能会根据抢座机制的改变而失效。</li>
                        <li>根据长春市图书馆规章制度，使用本系统时可能会承担读书卡被禁用的风险。</li>
                        <li>您需承担免责声明中的所有情况以及尚未提及的所有结果.</li>
                    </ul>

                    <FormGroup check>
                        <Label check>
                            <Input type="checkbox" onClick={() => {
                                this.setState({
                                    agree: !this.state.agree
                                })
                            }}/>
                            我已阅读免责声明。
                        </Label>
                    </FormGroup>
                </div>

                <div className="disclaimer-button-panel cancel-button" > 
                    <button className="button-item btn btn-primary" onClick={() => {
                        this.setState({
                            cancel: true
                        });
                    }}>取消</button>

                    <button disabled={!this.state.agree} className={"button-item btn btn-" + color + " confirm-button"} onClick={() => {
                        this.props.setValueHandler("condition", true);
                        this.setState({
                            redirect: true
                        })
                    }}>{description}</button>
                </div>
            </div>
        );
    }
}