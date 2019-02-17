import React, { Component } from 'react';

import {Redirect} from 'react-router-dom';

export class ReaderIDCollection extends Component {
    constructor(props) {
        super(props);
        
        this.testURL = "http://wx.jlcclib.com/wechat/obtainYlist?openId=of_"

        this.state = {
            valid: null,
            readerID: "",
            redirect: false
        }
    }

    testVadility() {
        let fullURL = this.testURL + this.state.readerID;
        fetch(fullURL).then((response) => {
            return response.text();
        }).then((response) => {
            // split string by special character (multiple spaces, comma, semicolumn, tab)
            let splitString = response.split(/[\s,;\t\n]+/);
            this.setState({
                valid: splitString.includes("openId")
            });
        });
    }

    handleChange(event) {
        let value = event.target.value;
        let fieid = event.target.name;
        let change = this.state;
        change[fieid] = value;
        this.setState(change);
    }

    // we need clear button!
    render() {
        if(!this.props.agree) {
            return <Redirect to="/" />
        }
        if(this.state.redirect) {
            return <Redirect to="/seat-selection"/>
        }
        return(
            <div className="collection-page-container">
                <div className="full-bloom">
                    <div className="collection-page-title-panel" >
                        <h1>读者序列号检测</h1>

                        <button className="button-item btn btn-danger" onClick={() => {
                            this.props.setValueHandler("condition", false);
                        }} >取消</button>
                    </div>
                    <div> 
                        {this.state.valid === false &&
                            <div className="alert alert-danger">此读者序列号为无效序列号</div>
                        }
                        {this.state.valid === true &&
                            <div className="alert alert-success">此读者序列号为有效序列号</div>
                        }
                        <div> 
                            <input className="form-control"
                                name="readerID"
                                value={this.state.readerID}
                                onChange={(event) => {
                                    this.handleChange(event);
                                    this.setState({
                                        valid: null
                                    })
                                }}
                                placeholder="例如：G7jlCSEOE6r1oXLK2gp1_HlRg"/>
                        </div>
                    </div>
                    
                    <div className="collection-page-button-panel">
                        <button className="button-item btn btn-primary" onClick={() => {
                            this.testVadility(this.state.readerID);
                        }}>检测读者序列号</button>

                        <button className="button-item btn btn-success" disabled={!this.state.valid}
                            onClick={() => {
                                this.props.setValueHandler("userID", this.state.readerID);
                                this.setState({
                                    redirect: true
                                })
                            }}
                        >进入抢座系统</button>
                    </div>
                </div>

                <div className="full-bloom open-id-wiki">
                    <h2>何为读者序列号？</h2>
                    <p>此序列号是根据您的读书证号所自动产生的一组字符串，您可用该序列号来预约/离开座位。</p>
                </div>

                <div className="full-bloom open-id-help">
                    <h2>如何获取读者序列号？</h2>
                    <ul>
                        <li>首先在手机中进入您的自修室微信预约程序主菜单。</li>
                        <li>然后用任意浏览器打开该网站。</li>
                        <li>观察这个网址，您会发现在"code=_of"后有一组字符串。</li>
                        <li>将这个字符串复制，这就是您的读者序列号。</li>
                        <li>(在您更换读书证或更改微信绑定帐号时，需重新检查您的读者序列号。)</li>
                    </ul>
                </div>
            </div>
        );
    }
}