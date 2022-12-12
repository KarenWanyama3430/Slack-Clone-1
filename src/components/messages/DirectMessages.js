import React, { Component } from "react";
import { Menu, Icon } from "semantic-ui-react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../redux/actions";

export class DirectMessages extends Component {
  state = {
    users: [],
    usersRef: firebase.database().ref("users"),
    connectedRef: firebase.database().ref(".info/connected"),
    prescenceRef: firebase.database().ref("prescence"),
  };
  componentDidMount() {
    const { currentUser } = this.props;
    if (this.props.currentUser) {
      let loadedUsers = [];

      this.state.usersRef.on("child_added", (snapshot) => {
        if (currentUser.uid !== snapshot.key) {
          let user = snapshot.val();
          user["uid"] = snapshot.key;
          user["status"] = "offline";
          loadedUsers.push(user);
          this.setState({ users: loadedUsers });
        }
      });
    }
    this.state.connectedRef.on("value", (snap) => {
      if (snap.val() === true) {
        const ref = this.state.prescenceRef.child(currentUser.uid);
        ref.set(true);
        ref.onDisconnect().remove((err) => {
          if (err !== null) {
            console.log(err);
          }
        });
      }
    });
    this.state.prescenceRef.on("child_added", (snap) => {
      //add active to user status
      if (currentUser.uid !== snap.key) {
        this.addStatusToUser(snap.key);
      }
    });

    this.state.prescenceRef.on("child_removed", (snap) => {
      //remove active from user status
      if (currentUser.uid !== snap.key) {
        this.addStatusToUser(snap.key, false);
      }
    });
  }
  componentWillUnmount() {
    this.state.usersRef.off();
    this.state.prescenceRef.off();
    this.state.connectedRef.off();
  }
  addStatusToUser = (userId, connected = true) => {
    const updatedUsers = this.state.users.reduce((acc, user) => {
      if (user.uid === userId) {
        user["status"] = `${connected ? "online" : "offline"}`;
      }
      return acc.concat(user);
    }, []);
    this.setState({ users: updatedUsers });
  };
  changeChannel = (user) => {
    const { currentUser, setCurrentChannel, setPrivateChannel } = this.props;
    const channelId =
      currentUser.uid &&
      (currentUser.uid > user.uid
        ? `${currentUser.uid}/${user.uid}`
        : `${user.uid}/${currentUser.uid}`);
    const channelData = {
      id: channelId,
      name: user.name,
    };
    setCurrentChannel(channelData);
    setPrivateChannel(true);
  };
  render() {
    const { users } = this.state;
    const { currentChannel, currentUser } = this.props;

    const currentChannelId = currentChannel && currentChannel.id;
    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="mail" /> DIRECT MESSAGES
          </span>{" "}
          ({users.length})
        </Menu.Item>
        {users.map((user) => (
          <Menu.Item
            key={user.uid}
            onClick={() => this.changeChannel(user)}
            style={{ opacity: 0.7, fontStyle: "italic" }}
            active={
              `${currentUser.uid}/${user.uid}` === currentChannelId ||
              `${user.uid}/${currentUser.uid}` === currentChannelId
            }
          >
            <Icon
              name="circle"
              color={user.status === "online" ? "green" : "red"}
            />
            @ {user.name}
          </Menu.Item>
        ))}
      </Menu.Menu>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user.currentUser,
    currentChannel: state.channel.currentChannel,
  };
};

export default connect(mapStateToProps, {
  setCurrentChannel,
  setPrivateChannel,
})(DirectMessages);
