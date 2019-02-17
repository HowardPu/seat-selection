import React, { Component } from 'react';

import './App.css';

import { HashRouter as Router, Route, Switch } from 'react-router-dom';

import {Main} from './pages/main';
import {Disclaimer} from './pages/disclaimer';
import {ReaderIDCollection} from './pages/idCollection';
import {SeatSelection} from './pages/SeatSelection';
import {AutoSeatSelectionPage} from './pages/SeatSelection';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      condition: false,
      userID: null
    }
    
    this.anatomy = {
      domain: "http://wx.jlcclib.com/wechat",

      obtainListPath: "obtainYlist",
      obtainSeatInfoPath: "obtainAllSeatInfo",
      selectSerialPath: "selectSerialNo",
      selectJSPPath: "selectSerialNoToJsp",
      reservePath: "reserve",
      leavePath: "leave",

      roomIDQuery: "id=",
      roomNameQuery: "name=",
      openIDQuery: "openId=of_",
      serialQuery: "serialNo=",
      yuelanshiIDQuery: "yuelanshiId=",
      showIDQuery: "id=",
      seatNumQuery: "seatno=",

      firstFloorRoomID: "402881b14586df4a014586e28aae0000",
      firstFloorName: "一楼读者自修区",
      roomNameUnknown: "???????"
    }

    this.setValueHandler = this.setValue.bind(this);

    this.getRoomEnterSerial = this.getRoomEnterSerial.bind(this);
  }

  setValue(field, value) {
    let state = this.state;
    state[field] = value;
    this.setState(state);
  }

  // test: K7jqkljf7t_mngoLy9edHTQq4

  // this function will find the serial number for the page to see all seats
  // once the serve has registered this serial
  getRoomEnterSerial(callback) {
    if(this.state.userID) {
      let siteForRoomEnteringSerial = this.anatomy.domain + "/" + this.anatomy.obtainSeatInfoPath + "?" + this.anatomy.roomIDQuery 
                                      + this.anatomy.firstFloorRoomID + "&" + this.anatomy.openIDQuery + this.state.userID + "&" 
                                      + this.anatomy.roomNameQuery + this.anatomy.firstFloorName;
      fetch(siteForRoomEnteringSerial).then((response) => {
        return response.text();
      }).then((response) => {
        console.log(response);
        let serial = response.split("serialNo=");
        if(serial[1]) {
          this.checkVadility(serial[1], callback);
        } else {
          callback(null);
        }
      });
    } else {
      callback(null);
    }
  }


  // three states
  checkVadility(serial, callback) {
    let vadilityURL = this.anatomy.domain + "/" + this.anatomy.selectSerialPath + "?" 
                        + this.anatomy.serialQuery + serial;
    console.log(vadilityURL);
    fetch(vadilityURL).then((response) => {
        return response.text()
    }).then((response) => {
        console.log(response);
        if(response === "no") {
            this.checkVadility(serial, callback);
        } else {
            callback(serial);
        }
    })
  }

  render() {
    return (
      <Router> 
        <Switch>
          <Route exact path="/" component={Main} />
          <Route path="/disclaimer" render={(routerProps) => {
            return <Disclaimer {...routerProps} setValueHandler={this.setValueHandler}/>;
          }} />
          <Route path="/id-collecter" render={(routerProps) => {
            return <ReaderIDCollection {...routerProps} setValueHandler={this.setValueHandler} agree={this.state.condition}/>;
          }} />
          <Route path="/seat-selection" render={(routerProps) => {
            return <SeatSelection {...routerProps} setValueHandler={this.setValueHandler}  
                                    userID={this.state.userID} agree={this.state.condition}
                                    getRoomEnterSerial={this.getRoomEnterSerial} anatomy={this.anatomy}
            />;
          }} />
          <Route path= {"/auto-selection"} render={(routerProps) => {
            return <AutoSeatSelectionPage {...routerProps} 
              userID={this.state.userID} setValueHandler={this.setValueHandler} agree={this.state.condition} 
                      anatomy={this.anatomy} getRoomEnterSerial={this.getRoomEnterSerial}/>
          }}/>
        </Switch>
      </Router>
    );
  }
}

export default App;
