import React, { Component } from "react";
import {
  Menu,
  Icon,
  Modal,
  Form,
  Input,
  Button,
  Label,
} from "semantic-ui-react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../redux/actions";

export class Channels extends Component {
  state = {
    channels: [],
    channel: null,
    messagesRef: firebase.database().ref("messages"),
    notifications: [],
    modal: false,
    channelName: "",
    channelDetails: "",
    channelsRef: firebase.database().ref("channels"),
    typingRef: firebase.database().ref("typing"),
  };
  componentDidMount() {
    let loadedChannels = [];
    this.state.channelsRef.on("child_added", (snapshot) => {
      loadedChannels.push(snapshot.val());
      this.setState({ channels: loadedChannels }, () =>
        this.props.setCurrentChannel(this.state.channels[0])
      );
      this.setState({ channel: this.state.channels[0] });
      this.addNotificationListeners(snapshot.key);
    });
  }
  componentWillUnmount() {
    this.state.channelsRef.off();
    this.state.channels.forEach((channel) => {
      this.state.messagesRef.child(channel.id).off();
    });
  }
  addNotificationListeners = (channelId) => {
    this.state.messagesRef.child(channelId).on("value", (snap) => {
      if (this.state.channel) {
        this.handleNotifications(
          channelId,
          this.state.channel.id,
          this.state.notifications,
          snap
        );
      }
    });
  };
  handleNotifications = (channelId, currentChannelId, notifications, snap) => {
    let lastTotal = 0;
    let index = notifications.findIndex(
      (notification) => notification.id === channelId
    );
    if (index !== -1) {
      if (channelId !== currentChannelId) {
        lastTotal = notifications[index].total;
        if (snap.numChildren() - lastTotal > 0) {
          notifications[index].count = snap.numChildren() - lastTotal;
        }
      }
      notifications[index].lastKnownTotal = snap.numChildren();
    } else {
      notifications.push({
        id: channelId,
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        count: 0,
      });
    }
    this.setState({ notifications });
  };
  openModal = () => this.setState({ modal: true });
  closeModal = () => this.setState({ modal: false });
  handleChange = (event) =>
    this.setState({ [event.target.name]: event.target.value });
  handleSubmit = (event) => {
    event.preventDefault();
    if (this.isFormValid(this.state)) {
      this.addChannel();
    }
  };
  isFormValid = ({ channelName, channelDetails }) =>
    channelName.trim() && channelDetails.trim();

  addChannel = async () => {
    const { channelName, channelDetails, channelsRef } = this.state;
    const { currentUser } = this.props;
    const key = channelsRef.push().key;

    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: currentUser.displayName,
        avatar: currentUser.photoURL,
      },
    };
    await channelsRef.child(key).update(newChannel);
    this.setState({ channelName: "", channelDetails: "", modal: false });
  };
  changeChannel = (channel) => {
    const { currentUser, currentChannel } = this.props;
    const { typingRef } = this.state;
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
    typingRef.child(currentChannel.id).child(currentUser.uid).remove();
    this.setState({ channel });
    this.clearNotifications();
  };
  clearNotifications = () => {
    let index = this.state.notifications.findIndex(
      (notification) => notification.id === this.state.channel.id
    );
    if (index !== -1) {
      let updatedNotifications = [...this.state.notifications];
      updatedNotifications[index].total = this.state.notifications[
        index
      ].lastKnownTotal;
      updatedNotifications[index].count = 0;
      this.setState({ notifications: updatedNotifications });
    }
  };
  getNotificationCount = (channel) => {
    let count = 0;
    this.state.notifications.forEach((notification) => {
      if (notification.id === channel.id) {
        count = notification.count;
      }
    });
    if (count > 0) return count;
  };
  render() {
    const { channels, modal, channelName, channelDetails } = this.state;
    const { currentChannel } = this.props;
    return (
      <React.Fragment>
        <Menu.Menu className="menu">
          <Menu.Item>
            <span>
              <Icon name="exchange" /> CHANNELS
            </span>{" "}
            ({channels.length}){" "}
            <Icon
              name="add"
              style={{ cursor: "pointer" }}
              onClick={this.openModal}
            />
          </Menu.Item>
          {/* DISPLAY CHANNELS */}
          {channels.length > 0 &&
            currentChannel &&
            channels.map((channel) => (
              <Menu.Item
                key={channel.id}
                onClick={() => this.changeChannel(channel)}
                name={channel.name}
                style={{ opacity: 0.7 }}
                active={currentChannel.id === channel.id}
              >
                {this.getNotificationCount(channel) && (
                  <Label color="red">
                    {this.getNotificationCount(channel)}
                  </Label>
                )}
                # {channel.name}
              </Menu.Item>
            ))}
        </Menu.Menu>

        {/* ADD CHANNEL MODAL */}
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Add a Channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Name of Channel"
                  name="channelName"
                  value={channelName}
                  onChange={this.handleChange}
                />
              </Form.Field>
              <Form.Field>
                <Input
                  fluid
                  label="About the Channel"
                  name="channelDetails"
                  value={channelDetails}
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={this.handleSubmit} color="green" inverted>
              <Icon name="checkmark" /> Add
            </Button>
            <Button color="red" onClick={this.closeModal} inverted>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  let currentUser;
  if (state.user.currentUser) {
    currentUser = state.user.currentUser;
  }

  return {
    currentUser: currentUser,
    currentChannel: state.channel.currentChannel,
  };
};

export default connect(mapStateToProps, {
  setCurrentChannel,
  setPrivateChannel,
})(Channels);
