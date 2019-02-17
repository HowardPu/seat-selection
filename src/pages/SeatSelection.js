import React, { Component } from 'react';
import Select from 'react-select';
import { HashRouter as Router, Route, Switch, Redirect} from 'react-router-dom';


// there are two ways for the user to select seats:
// 1: self-selection system
//      the user goes into the system before most of other competetors,
//      and then easily gets the desired seat.

// 2: auto-selection system
//      this system will based on the user's preference to help selecting the seat

// how to enter those systems:
// self-selection: once the user clicks the "进入图书馆选座系统" button, then the user can enter the seat selection page
// auto-selection system: the user first clicks the "进入智能抢座系统" button, then the user can enter the setting pages,
// then the system will select seats based on those preferences.


export class SeatSelection extends Component {
    constructor(props) {
        super(props);
        
        // states:
        // redirectToAutoSelection: direct to the auto seat selection if it is true
        this.state = {
            redirectToAutoSelection: false,
            selfSeatSelectionStatus: null
        }
    }
    
    render() {
        if(!this.props.userID || !this.props.agree) {
            return <Redirect to="/"/>
        }

        if(this.state.redirectToAutoSelection) {
            return <Redirect to="/auto-selection"/>
        }
        
        let selfSeatSelection = "尚未进入座位预约网站";
        let selfSelectionColor = "bg-secondary text-white";

        if(this.state.selfSeatSelectionStatus === true) {
            selfSeatSelection = "成功进入选座网站";
            selfSelectionColor = "bg-success text-white";
        } else if(this.state.selfSeatSelectionStatus === false) {
            selfSeatSelection = "读取失败";
            selfSelectionColor = "bg-success text-danger";
        }

        return(
            <div className="seat-selection-page-container">
                <div className="full-bloom seat-selection-page-title-panel" >
                    <h1>智能抢座系统。</h1>
                    <button className="button-item btn btn-danger" onClick={() => {
                        this.props.setValueHandler("userID", null);
                        this.props.setValueHandler("condition", false);
                    }}>退出</button>
                </div>

                <div className="selection-page-options-panel"> 
                    <div className="full-bloom option-item">
                        <strong>本选项可让您进入自修室座位阅览网址，允许您先人一步获取想要的座位。</strong>
                        <ul className="warning-list">请注意
                            <li>尽管您可以提前进入座位阅览网址，第二日的座位预约的开放时间大约在晚上8点30分10秒到20秒左右。</li>
                            <li>若您长时间未在微信上登陆（一周），您需在手机上先登陆方可有效。</li>
                            <li>若您只选到了当天的座位，10秒左右座位会被清空。</li>
                            <li>若座位阅览网址上显示“系统暂时无法受理，请重新尝试”的话，请刷新网页直到出现座位，但继续刷新会使当前网址失效。</li>
                        </ul>

                        <div className="self-selection-panel" >
                            <button className="button-item btn btn-primary" onClick={() => {
                                this.props.getRoomEnterSerial((serial) => {
                                    if(serial) {
                                        let seatViewURL = this.props.anatomy.domain + "/" + this.props.anatomy.selectJSPPath + "?" + this.props.anatomy.serialQuery
                                                            + serial + "&" + this.props.anatomy.openIDQuery + this.props.userID + "&" + this.props.anatomy.roomNameQuery +
                                                            this.props.anatomy.roomNameUnknown + "&" + this.props.anatomy.yuelanshiIDQuery + this.props.anatomy.firstFloorRoomID;
                                        window.open(seatViewURL, '_blank');
                                        this.setState({
                                            selfSeatSelectionStatus: true
                                        })
                                    } else {
                                        this.setState({
                                            selfSeatSelectionStatus: false
                                        })
                                    }
                                });    
                            }}>开始自助选座</button>
                            <div className={selfSelectionColor + " seat-self-selection-status"}>{"状态：" + selfSeatSelection}</div>
                        </div>
                    </div>

                    <div className="full-bloom option-item">
                        <div> 
                            <strong>本选项可根据您的座位倾向，使本系统为您选择座位。</strong>
                            <ul className="warning-list">请注意 
                                <li>若您长时间未在微信上登陆（一周），您需在手机上先登陆方可有效。</li>
                                <li>抢座系统有抢不到座位的风险，使用时须谨慎。</li>
                            </ul>
                        </div> 
                        <button className="button-item btn btn-primary" onClick={() => {
                            this.setState({
                                redirectToAutoSelection: true
                            })
                        }}>自动选座系统</button>
                    </div>
                </div>
            </div>
        );
    }
}


// test: K7jqkljf7t_mngoLy9edHTQq4

// test2: K7jlCSEOE8r1oXHL2gp1_HlRg
export class AutoSeatSelectionPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            back: false,
            firstPreference: {label: "无", value: ""},
            secondPreference: {label: "无", value: ""},
            thirdPreference: {label: "停止抢座", value: ""},
            automationStart: false,

            isSuccess: false,
            failReason: null
        }

        this.seatOptions = [{label: "无", value: ""}];
        for(let i = 1; i <= 208; i++) {
            let label = i + " ("
            if(this.isSingle(i)) {
                label += "单座" + ")"
            } else {
                label += "双座" + ")"
            }
            this.seatOptions.push(
                {label: label, value: i}
            );
        }

        this.seatOptionsRange = [{label: "无", value: ""}];
        for(let i = 1; i <= 20; i++) {
            let start = (i - 1) * 10 + 1;
            let end = i * 10;
            this.seatOptionsRange.push({
                label: start + " ~ " + end,
                value: {start: start, end: end}
            });
        }

        this.monthConverter = {
            Jan: "01", Feb: "02", Mar: "03",
            Apr: "04", May: "05", Jun: "06",
            Jul: "07", Aug: "08", Sep: "09",
            Oct: "10", Nov: "11", Dec: "12"
        }

        this.seatPriority = null;
        this.pause = false;
        this.firstPause = false;
        this.firstStart = false;

        this.seatOptionsRange.push({label: 201 + " ~ " + 208, value: {start: 201, end: 208}});
        
        this.searchSeatAndReserveLoop = this.searchSeatAndReserveLoop.bind(this);
        this.checkVadility = this.checkVadility.bind(this);
        this.leaveSeat = this.leaveSeat.bind(this);

        this.firstLog = null;
    }

    // test: K7jlCSEOE8r1oXHL2gp1_HlRg
    componentDidUpdate(prevState) {
        if(this.state.automationStart && (this.state.automationStart !== prevState.automationStart)) {
            this.creatLogPiece(this.getCurrntTime() + " --- 开始预约");
            let currentTime = this.getCurrentHourAndMinute();
            if(/*currentTime.hour >= 20 && currentTime.minute >= 20*/ true) {
                this.searchSeatAndReserveLoop();
            } else {
                this.creatLogPiece(this.getCurrntTime() + " --- 当前时间不能进行预约座位");
                this.creatLogPiece(this.getCurrntTime() + " --- 请于20点20分后打开该程序");
                this.creatLogPiece("请点击终止预约按钮");
            }
        }
    }

    reservePiece(targetSeat, priority) {
        this.creatLogPiece(this.getCurrntTime() + " --- 找到目标");
        this.creatLogPiece(this.getCurrntTime() + " --- 开始预约第" + targetSeat + "号座位 （第" + priority + "目标）");
        this.reserveSeat(targetSeat, (response) => {
            this.getReserveResult(response, (response) => {
                let judgement = this.judgeReserveResult(response);
                if(!judgement.isReserveSuccess) {
                    this.creatLogPiece(this.getCurrntTime() + " --- 因为" + judgement.reason + ", 预约失败");
                    if(judgement.reason !== "仅预约当天座位") {
                        if(this.state.automationStart) {
                            this.searchSeatAndReserveLoop();
                        }
                    } else {
                        this.creatLogPiece(this.getCurrntTime() + " --- 开始离开座位");
                        this.leaveSeat(() => this.searchSeatAndReserveLoop());
                    }
                } else {
                    this.creatLogPiece(this.getCurrntTime() + " --- 成功预约第二天座位");
                    if(priority === 1) {
                        this.creatLogPiece(this.getCurrntTime() + " --- 第1目标完成，任务结束");
                        this.creatLogPiece("请点击终止预约按钮");
                    } else {
                        this.creatLogPiece(this.getCurrntTime() + " --- 第" + priority + "目标完成，继续抢座");
                        this.seatPriority = priority;
                        this.searchSeatAndReserveLoop();
                    }
                }
            });
        })
    }

    // test REAL! : K7jkgpyHxQQISesAWzGx53DfU
    searchSeatAndReserveLoop() {
        if(this.pause) {
            console.log("paused");
            setTimeout(() => {
                if(this.firstPause) {
                    this.creatLogPiece(this.getCurrntTime() + " --- 开始停止自动预约系统");
                    this.creatLogPiece(this.getCurrntTime() + " ---------------------");
                    this.creatLogPiece(this.getCurrntTime() + " --- 暂停成功");
                    this.firstPause = false;
                    setTimeout(() => {
                        this.searchSeatAndReserveLoop();
                    });
                }
                if(!this.firstStart) {
                    this.creatLogPiece(this.getCurrntTime() + " --- 暂停中");
                }
                this.searchSeatAndReserveLoop();
            }, 3000);
        } else {
            if(this.firstStart) {
                this.firstStart = false;
                this.creatLogPiece(this.getCurrntTime() + " ---------------------");
                this.creatLogPiece(this.getCurrntTime() + " --- 重新开始自动预约系统");
            }
            this.creatLogPiece(this.getCurrntTime() + " --- 开始搜索座位");
            this.props.getRoomEnterSerial((serial) => {
                if(!serial) {
                    this.showMachenismError();
                } else {
                    this.findAllPossibleSeats(serial, (possibleSeats) => {
                        let targetSeat = null;
                        let priority = null;
                        if(this.state.firstPreference.value !== "") {
                            if(possibleSeats.includes(this.state.firstPreference.value)) {
                                targetSeat = this.state.firstPreference.value;
                                priority = 1;
                            }
                        }
                        if(targetSeat === null && this.state.secondPreference.value !== "") {
                            for(let start = this.state.secondPreference.value.start; 
                                    start <= this.state.secondPreference.value.end; start++) {
                                if(possibleSeats.includes(start)) {
                                    targetSeat = start;
                                    priority = 2;
                                }
                            }
                        }
                        if(targetSeat === null && this.state.thirdPreference.value !== "") {
                            if(this.state.thirdPreference.value === "single") {
                                possibleSeats.forEach((seat) => {
                                    if(this.isSingle(seat)) {
                                        console.log("call");
                                        targetSeat = seat;
                                        priority = 3;
                                    }
                                });
                            } else if (this.state.thirdPreference.value === "double") {
                                possibleSeats.forEach((seat) => {
                                    if(!this.isSingle(seat)) {
                                        targetSeat = seat;
                                        priority = 3;
                                    }
                                });
                            } else {
                                if(possibleSeats.length > 0) {
                                    targetSeat = possibleSeats[0];
                                    priority = 3;
                                }
                            }
                        }
                        console.log("target : " + targetSeat);
                        console.log("priority : " + priority);
                        if(targetSeat && (this.seatPriority === null || priority < this.seatPriority)) {
                            if(this.seatPriority && priority < this.seatPriority) {
                                this.seatPriority = null;
                                this.leaveSeat(() => {
                                    this.reservePiece(targetSeat, priority);
                                });
                            } else {
                                this.reservePiece(targetSeat, priority);
                            }
                        } else {
                            this.creatLogPiece(this.getCurrntTime() + " --- 尚未出现目标座位");
                            if(this.state.thirdPreference.value === "") {
                                this.creatLogPiece(this.getCurrntTime() + " --- 因为失去目标，本系统停止预约座位");
                                this.creatLogPiece("请点击终止预约按钮");
                            } else {
                                if(this.checkBefore21PM() && this.state.automationStart) {
                                    this.creatLogPiece(this.getCurrntTime() + " --- 重新开始搜索座位");
                                    this.searchSeatAndReserveLoop();
                                }
                            }
                        }
                    });
                    
                }
            });
        }
    }

    leaveSeat(callback) {
        let leaveURL = this.props.anatomy.domain + "/" + this.props.anatomy.leavePath 
                        + "?" + this.props.anatomy.openIDQuery + this.props.userID;
        fetch(leaveURL).then((response) => {
            return response.text();
        }).then((response) => {
            if(response.includes("取消预定！") || response.includes("阅览室：无信息！")) {
                this.creatLogPiece(this.getCurrntTime() + " --- 离开座位成功");
                if(this.state.automationStart) {
                    callback();
                }
            } else {
                this.creatLogPiece(this.getCurrntTime() + " --- 离开座位失败");
                this.creatLogPiece(this.getCurrntTime() + " --- 重新尝试离开座位");
                this.leaveSeat(callback);
            }
        });
    }


    findAllPossibleSeats(serial, callback) {
        fetch(this.getSeatViewURL(serial)).then((response) => {
            return response.text();
        }).then((response) => {
            let splitByLine = response.split("\n");
            let possibleSeats = [];
            splitByLine.forEach((line) => {
                if(line.includes("onclick=\"dianji(")) {
                    let lineSplit = line.split(">");
                    if(lineSplit[1]) {
                        let secondSplit = lineSplit[1].split("<");
                        if(secondSplit[0]) {                    
                            possibleSeats.push(parseInt(secondSplit[0], 10));
                        }
                    }
                }
            });
            console.log(possibleSeats);
            callback(possibleSeats);
        });
    }

    judgeReserveResult(result) {
        if(result.includes("您的位置在")) {
            return ({
                isReserveSuccess: false,
                reason: "当天座位尚未解除"
            })
        } else if(result.includes("终端机刷卡")) {
            let today = this.getCurrntTime().split(" ")[0];
            console.log(today);
            if(result.includes(today)) {
                return({
                    isReserveSuccess: false,
                    reason: "仅预约当天座位"
                });
            } else {
                return({
                    isReserveSuccess: true,
                    reason: "成功预约第二天座位"
                })
            }
        } else if(result.includes("排队")) {
            return({
                isReserveSuccess: false,
                reason: "正在预约其他座位"
            });
        } else if(result.includes("该座位已经被预约")) {
            return({
                isReserveSuccess: false,
                reason: "该座位已经被他人预约"
            });
        } else if(result.includes("已预约" /*not sure*/)) {
            return({
                isReserveSuccess: false,
                reason: "您已经成功预约座位"
            })
        } else {
            this.showMachenismError();
            return(null);
        }
    }

    creatLogPiece(text) {
        let logRef = document.getElementById("reservation-log");
        if(logRef) {
            let logPiece = document.createElement('li');
            let textNode = document.createTextNode(text);
            logPiece.appendChild(textNode);
            if(!this.firstLog) {
                logRef.appendChild(logPiece);
            } else {
                logRef.insertBefore(logPiece, this.firstLog);
            }
            this.firstLog = logPiece;
        }
    }

    getReserveSeatURL(seatNum) {
        return this.props.anatomy.domain + "/" + this.props.anatomy.reservePath + "?"
                    + this.props.anatomy.roomIDQuery + this.props.anatomy.firstFloorRoomID + "&" 
                    + this.props.anatomy.openIDQuery + this.props.userID + "&" 
                    + this.props.anatomy.seatNumQuery + seatNum;
    }

    getSeatViewURL(serial) {
        return this.props.anatomy.domain + "/" + this.props.anatomy.selectJSPPath + "?" + this.props.anatomy.serialQuery
                    + serial + "&" + this.props.anatomy.openIDQuery + this.props.userID + "&" + this.props.anatomy.roomNameQuery +
                    this.props.anatomy.roomNameUnknown + "&" + this.props.anatomy.yuelanshiIDQuery + this.props.anatomy.firstFloorRoomID;
    }

    isSingle(number) {
        return (number >= 89 && number <= 110) || (number >= 191 && number <= 208);
    }

    // this piece will reserve the seat of first preference and then pass the result URL into callback function
    reserveSeat(seatNum, callback) {
        let reserveURL = this.getReserveSeatURL(seatNum);
        console.log(reserveURL);
        fetch(reserveURL).then((response) => {
            return response.text();
        }).then((response) => {
            console.log(response);
            callback(response);
        });
    }

    // this piece will process the result and then pass the result into next function
    getReserveResult(redirectSite, callback) {
        let serialSplit = redirectSite.split("serialNo=");
        if(serialSplit[1]) {
            this.checkVadility(serialSplit[1], () => {
                let resultURL = this.props.anatomy.domain + "/" + this.props.anatomy.selectJSPPath + "?" 
                                    + this.props.anatomy.serialQuery + serialSplit[1];
                fetch(resultURL).then((response) => {
                    return response.text();
                }).then((response) => {
                    // result page
                    let urlSplit = response.split("<a href=\"\" class=\"\" ");
                    if(urlSplit[1]) {
                        let nextSplit = urlSplit[1];
                        let secondSplit = nextSplit.split("</a>");
                        if(secondSplit[0]) {
                            let finalSplit = secondSplit[0].split(">");
                            if(finalSplit[1]) {
                                let result = finalSplit[1];
                                console.log(result);
                                callback(result);
                            } else {
                                this.showMachenismError();
                            }
                        } else {
                            this.showMachenismError();
                        }
                    } else {
                        this.showMachenismError();
                    }
                }); 
            });
        } else {
            this.showMachenismError();
        }
    }

    showMachenismError() {
        this.creatLogPiece("因预约座位机制改变，本系统已经失效");
        this.creatLogPiece("请点击终止预约按钮");
    }

    checkBefore21PM() {
        let timeInfo = this.getCurrentHourAndMinute()
        if(timeInfo.hour < 21) {
            return true;
        } else {
            this.creatLogPiece("因已经过21点，继续预约已无意义，因此停止预约。");
            this.creatLogPiece("请点击取消按钮");
            return false;
        }
    }


    // this will return the current time as following format (all in numbers):
    // "full year/month/day hour/minute/second" 
    getCurrntTime() {
        let now = new Date();
        let nowToString = now.toString();
        let dateInfo = nowToString.split(" ");

        let currentTime = dateInfo[3] + "-" + this.monthConverter[dateInfo[1]] + "-" + dateInfo[2]
                            + " " + dateInfo[4]

        return currentTime;
    }

    getCurrentHourAndMinute() {
        let now = new Date();
        let nowToString = now.toString();
        let dateInfo = nowToString.split(" ");
        let timeInfo = dateInfo[4].split(":");
        return({hour: timeInfo[0], minute: timeInfo[1]});
    }

    checkVadility(serial, callback) {
        let vadilityURL = this.props.anatomy.domain + "/" + this.props.anatomy.selectSerialPath + "?" 
                            + this.props.anatomy.serialQuery + serial;
        fetch(vadilityURL).then((response) => {
            return response.text()
        }).then((response) => {
            console.log(response);
            if(response === "no") {
                this.checkVadility(serial, callback);
            } else {
                callback();
            }
        })
    }



    // Setting part
    // first: the most desired seat (only 1)
    // preference: single or double
    // if all impossible: random get seats or stop loop

    // way of seat selection
    // no count registration: register by preference, once find invalid, then quit
    // count registration: register by preference, once reserved, then if the upper are failed
    // then try those seats



    // Status part
    render() {
        if(!this.props.userID || !this.props.agree) {
            return <Redirect to="/"/>
        }

        if(this.state.back) {
            return <Redirect to="/seat-selection" />
        }

        let startButtonColor = "button-item btn btn-primary";
        let startButtonText = "请选择您想要的座位"
        let startButtonDisable = this.state.firstPreference.value === "" && 
                                 this.state.secondPreference.value === "" && 
                                 this.state.thirdPreference.value === "";
        let settingNotification = "设定";
        if(this.state.automationStart) {
            settingNotification = "";
        }

        if(!startButtonDisable) {
            startButtonColor = "button-item btn btn-success";
            startButtonText = "开始抢座";
        }
        return(
            <div className="auto-selection-page"> 
                <div className="full-bloom" > 
                    <h1>{"自动选座设定" + settingNotification}</h1>

                    <button className="button-item btn btn-danger" onClick={() => {
                        this.setState({
                            back: true,
                            automationStart: false
                        })
                        this.pause = false;
                        this.firstPause = false;
                        this.firstStart = false;
                    }}>返回</button>
                </div>
                {!this.state.automationStart &&
                    <div className="full-bloom automation-middle-part" > 
                        <div className="auto-option-item" > 
                            <h2>请选择您最想要的一个座位</h2>
                            <Select name="firstPreference"
                                options={this.seatOptions}
                                value={this.state.firstPreference}
                                onChange={(event) => {
                                    this.setState({
                                        firstPreference: event
                                    })
                                }}
                            />
                        </div>

                        <div className="auto-option-item"> 
                            <h2>其次，请选择您可以接受的座位范围</h2>
                                <Select name="secondPreference"
                                    options={this.seatOptionsRange}
                                    value={this.state.secondPreference}
                                    onChange={(event) => {
                                        this.setState({
                                            secondPreference: event
                                        })
                                    }}
                            />
                        </div>

                        <div className="auto-option-item"> 
                            <h2>若上述座位均无法获得，请选择可接受的座位的类型</h2>
                                <Select name="thirdPreference"
                                    options={[
                                        {label: "停止抢座", value: ""},
                                        {label: "任意座位", value: "any"},
                                        {label: "任意单座", value: "single"},
                                        {label: "任意双座", value: "double"}
                                    ]}
                                    value={this.state.thirdPreference}
                                    onChange={(event) => {
                                        this.setState({
                                            thirdPreference: event
                                        })
                                    }}
                            />
                        </div>
                    </div>
                }
                {this.state.automationStart && 
                    <div className="full-bloom"> 
                        <ul>当前指示：
                            <li>{"首要目标-" + this.state.firstPreference.label}</li>
                            <li>{"次要目标-" + this.state.secondPreference.label}</li>
                            <li>{"座位类型倾向：" + this.state.thirdPreference.label}</li>
                        </ul>

                        <h2>预约状态目录：</h2>
                        <ul id="reservation-log"></ul>
                    </div>
                }
                <div>
                    {!this.state.automationStart && 
                        <button className={startButtonColor + " auto-start-button"} disabled={startButtonDisable} onClick={() => {
                            this.setState({
                                automationStart: true
                            })
                            this.pause = false;
                        }}>{startButtonText}</button>
                    }
                    {this.state.automationStart && 
                        <div>
                             
                             <div id="loop-control-button"> 
                                 <div id="loop-control-status">暂停</div>
                                 <button id="loop-button"  className="button-item btn btn-primary" onClick={() => {
                                    let loopControlRef = document.getElementById("loop-control-button");
                                    let loopStatusRef = document.getElementById("loop-control-status");
                                    let buttonRef = document.getElementById("loop-button");
                                    if(!this.pause) {
                                        this.firstPause = true;
                                        this.pause = true;
                                        this.firstStart = false;
                                        loopControlRef.removeChild(loopStatusRef);
                                        let newStatus = document.createElement("div");
                                        newStatus.id = "loop-control-status";
                                        let newText = document.createTextNode("开始");
                                        newStatus.appendChild(newText);
                                        loopControlRef.insertBefore(newStatus, buttonRef);
                                        this.creatLogPiece(this.getCurrntTime() + " --- 开始暂停自动预约系统");
                                    } else {
                                        this.firstStart = true;
                                        this.firstPause = false;
                                        this.pause = false;
                                        loopControlRef.removeChild(loopStatusRef);
                                        let newStatus = document.createElement("div");
                                        newStatus.id = "loop-control-status";
                                        let newText = document.createTextNode("暂停");
                                        newStatus.appendChild(newText);
                                        loopControlRef.insertBefore(newStatus, buttonRef);
                                    }
                                 }} >点我</button>
                             </div>
                            

                            <button className="button-item btn btn-danger auto-end-button" onClick={() => {
                                this.setState({
                                    automationStart: false
                                })
                                this.pause = false;
                                this.firstPause = false;
                                this.firstStart = false;
                                this.firstLog = false;
                            }}>终止预约</button>
                        </div>
                    }
                </div>
            </div>
        );
    }
}