import React, { Component } from "react";
import { Menu } from "semantic-ui-react";
import UserPanel from "./UserPanel";
import Channels from "./Channels";
import DirectMessages from "../messages/DirectMessages";
import { connect } from "react-redux";
import Starred from "./Starred";
import { Redirect } from "react-router-dom";

export class SidePanel extends Component {
  render() {
    const { currentUser, primaryColor } = this.props;
    if (!currentUser) {
      return <Redirect to="/login" />;
    } else {
      return (
        <Menu
          size="large"
          inverted
          fixed="left"
          vertical
          style={{ background: primaryColor, fontSize: "1.2rem" }}
        >
          <UserPanel primaryColor={primaryColor} />
          {currentUser && <Starred currentUser={currentUser} />}
          <Channels />
          {currentUser && (
            <DirectMessages currentUser={currentUser} key={currentUser.uid} />
          )}
        </Menu>
      );
    }
  }
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user.currentUser,
  };
};

export default connect(mapStateToProps)(SidePanel);
