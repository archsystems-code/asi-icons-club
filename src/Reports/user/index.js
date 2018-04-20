import React, { Component } from "react";
import axios from "axios";
import Skeleton from 'react-loading-skeleton';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from "material-ui/Table";
import RaisedButton from 'material-ui/RaisedButton';

import Header from "./list/header";
import TotalUsers from "../components/TotalUsers";
import Leader from "../components/Leader";
import Orders from "../components/TotalOrders";
import AvgSessionLength from "../components/AvgSessionLength";

class UserReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        prospect: [""],
        total_results: null
      },
      leaderInfo: null,
      totalOrders: null,
      gaData: {}
    };
  }

  componentDidMount() {
    axios
      .get("https://icons-club-metrics.herokuapp.com/analytics")
      .then(response => {
        this.setState({ gaData: response.data });
      });
    axios
      .get("https://icons-club-metrics.herokuapp.com/orders")
      .then(response => {
        this.setState({ totalOrders: response.data.total_orders });
      });
    axios
      .get("https://icons-club-metrics.herokuapp.com/members")
      .then(response => {
        this.setState({ data: response.data });
        let leaders = [];
        let leaderboard = {};
        this.state.data.prospect.map(prospect => {
          return Object.keys(prospect).map(key => {
            switch (key) {
              case "Account_Executive":
                return leaders.push(prospect[key]);

              default:
                return null;
            }
          });
        });
        for (var index = 0; index < leaders.length; index++) {
          var num = leaders[index];
          leaderboard[num] = leaderboard[num] ? leaderboard[num] + 1 : 1;
        }
        if (Object.keys(leaderboard).length > 0) {
          let leadersArray = Object.keys(leaderboard).map(
            key => leaderboard[key]
          );
          let leader = Object.keys(leaderboard).find(
            key =>
              leaderboard[key] ===
              leadersArray.sort((a, b) => {
                return b - a;
              })[0]
          );
          let sortedLeaderboard = Object.keys(leaderboard).sort((a, b) => {
            return leaderboard[b] - leaderboard[a];
          });
          this.setState({
            leaderInfo: {
              leader: leader,
              leaderTotal: leaderboard[leader],
              leaderboard: sortedLeaderboard,
              leaderboardObject: leaderboard
            }
          });
        }
      });
  }

  showUsers() {
    Array.from(document.getElementsByClassName("usersTable")).map(table => {
      return (table.style.display = "table");
    });
    Array.from(document.getElementsByClassName("leaderboard")).map(table => {
      return (table.style.display = "none");
    });
  }

  showLeaderboard() {
    Array.from(document.getElementsByClassName("usersTable")).map(table => {
      return (table.style.display = "none");
    });
    Array.from(document.getElementsByClassName("leaderboard")).map(table => {
      return (table.style.display = "table");
    });
  }

  sortByColumn(event) {
    const sortProperty = event.target.dataset.id;
    const sortedData = this.state.data.prospect.sort(function(a, b) {
      if (a[sortProperty] && b[sortProperty]) {
        let typeA = a[sortProperty].toUpperCase();
        let typeB = b[sortProperty].toUpperCase();
        if (typeA < typeB) {
          return -1;
        }
        if (typeA > typeB) {
          return 1;
        }
      }
      return 0;
    });
    this.setState({
      data: {
        prospect: sortedData,
        total_results: this.state.data.total_results
      }
    });
  }

  render() {
    const body = this.state.data.prospect.length > 1
      ? this.state.data.prospect
          .filter(member => {
            if (member.company) {
              return !member.company.includes("Architectural Systems");
            } else {
              return null;
            }
          })
          .map(prospect => {
            let rowBody = Object.keys(prospect).map(key => {
              switch (key) {
                case "first_name":
                  return (
                    <TableRowColumn key={key}>
                      {prospect[key] + " " + prospect["last_name"]}
                    </TableRowColumn>
                  );

                case "email":
                  return (
                    <TableRowColumn key={key}>{prospect[key]}</TableRowColumn>
                  );

                case "company":
                  return (
                    <TableRowColumn key={key}>{prospect[key]}</TableRowColumn>
                  );

                case "job_title":
                  return (
                    <TableRowColumn key={key}>{prospect[key]}</TableRowColumn>
                  );

                case "Account_Executive":
                  return (
                    <TableRowColumn key={key}>{prospect[key]}</TableRowColumn>
                  );

                default:
                  return null;
              }
            });
            return (
              <TableRow key={prospect.id ? prospect.id : 42}>
                {rowBody}
              </TableRow>
            );
          })
      : <Skeleton />;
    const leaderboardBody = this.state.leaderInfo
      ? this.state.leaderInfo.leaderboard.map((person, index) => {
          return (
            <TableRow key={index}>
              <TableRowColumn>{index + 1}</TableRowColumn>
              <TableRowColumn>{person}</TableRowColumn>
              <TableRowColumn>
                {this.state.leaderInfo.leaderboardObject[person]}
              </TableRowColumn>
            </TableRow>
          );
        })
      : null;
    const paperStyle = {
      height: 150,
      width: 150,
      margin: "0 auto",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      cursor: "pointer"
    };
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <TotalUsers total={this.state.data} style={paperStyle}/>
          <Leader info={this.state.leaderInfo} style={paperStyle}/>
          <Orders total={this.state.totalOrders} style={paperStyle} />
          <AvgSessionLength gaData={this.state.gaData} style={paperStyle} />
        </div>
        <div style={{margin: "20px 0"}}>
          <RaisedButton label="Leader Board" onClick={this.showLeaderboard} backgroundColor="#d88c2b" labelColor="#ffffff" />
        </div>
        <Table className="leaderboard" style={{ display: "none" }}>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn> </TableHeaderColumn>
              <TableHeaderColumn> Name</TableHeaderColumn>
              <TableHeaderColumn> Members </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {leaderboardBody}
          </TableBody>
        </Table>
      </div>
    );
  }
}

export default UserReport;
