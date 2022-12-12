import React, { Component } from "react";
import { Segment, Input, Button } from "semantic-ui-react";
import { connect } from "react-redux";
import firebase from "../../firebase";
import FileModal from "./FileModal";
import { v4 as uuidv4 } from "uuid";
import { Picker, emojiIndex } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

export class MessagesForm extends Component {
  state = {
    message: "",
    loading: false,
    errors: [],
    modal: false,
    storageRef: firebase.storage().ref(),
    uploadTask: null,
    uploadState: "",
    percentageUploaded: 0,
    typingRef: firebase.database().ref("typing"),
    emojiPicker: false,
  };
  componentWillUnmount() {
    if (this.state.uploadTask !== null) {
      this.state.uploadTask.cancel();
      this.setState({ uploadTask: null });
    }
  }
  openModal = () => this.setState({ modal: true });
  closeModal = () => this.setState({ modal: false });
  handleChange = (event) =>
    this.setState({ [event.target.name]: event.target.value });
  sendMessage = async () => {
    const { getMessagesRef, currentChannel, currentUser } = this.props;
    const { message, typingRef } = this.state;
    if (message.trim()) {
      this.setState({ loading: true });
      try {
        await getMessagesRef()
          .child(currentChannel.id)
          .push()
          .set(this.createMessage());
        this.setState({ message: "", loading: false, errors: [] }, () =>
          typingRef.child(currentChannel.id).child(currentUser.uid).remove()
        );
      } catch (error) {
        console.log(error);
        this.setState({
          loading: false,
          errors: this.state.errors.concat(error),
        });
      }
    } else {
      this.setState({
        errors: this.state.errors.concat({ message: "add a message" }),
      });
    }
  };
  createMessage = (fileUrl = null) => {
    const { currentUser } = this.props;
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: currentUser.uid,
        name: currentUser.displayName,
        avatar: currentUser.photoURL,
      },
    };
    if (fileUrl !== null) {
      message["image"] = fileUrl;
    } else {
      message["content"] = this.state.message;
    }
    return message;
  };
  getPath = () => {
    const { isPrivateChannel, currentChannel } = this.props;
    if (isPrivateChannel) {
      return `chat/private/${currentChannel.id}`;
    } else {
      return `chat/public`;
    }
  };
  uploadFile = async (file, metadata) => {
    const { currentChannel, getMessagesRef } = this.props;
    const pathToUpload = currentChannel.id;
    const ref = getMessagesRef();
    const filePath = `${this.getPath()}/${uuidv4()}.jpg`;
    this.setState(
      {
        uploadState: "uploading",
        uploadTask: this.state.storageRef.child(filePath).put(file, metadata),
      },
      () => {
        this.state.uploadTask.on(
          "state_changed",
          (snap) => {
            const percentageUploaded = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            this.setState({ percentageUploaded });
          },
          (err) => {
            console.log(err);
            this.setState({
              errors: this.state.errors.concat(err),
              uploadState: "error",
              uploadTask: null,
            });
          },
          () => {
            this.state.uploadTask.snapshot.ref
              .getDownloadURL()
              .then(async (downloadUrl) => {
                await this.sendFileMessage(downloadUrl, ref, pathToUpload);
                this.closeModal();
              })
              .catch((err) => {
                console.log(err);
                this.setState({
                  errors: this.state.errors.concat(err),
                  uploadState: "error",
                  uploadTask: null,
                });
              });
          }
        );
      }
    );
  };
  sendFileMessage = async (fileUrl, ref, pathToUpload) => {
    try {
      await ref.child(pathToUpload).push().set(this.createMessage(fileUrl));
      this.setState({ uploadState: "done" });
    } catch (error) {
      console.log(error);
      this.setState({ errors: this.state.errors.concat(error) });
    }
  };
  handleKeyUp = () => {
    const { message, typingRef } = this.state;
    const { currentChannel, currentUser } = this.props;

    if (message !== "") {
      typingRef
        .child(currentChannel.id)
        .child(currentUser.uid)
        .set(currentUser.displayName);
    } else {
      typingRef.child(currentChannel.id).child(currentUser.uid).remove();
    }
  };
  handleTogglePicker = () => {
    this.setState({ emojiPicker: !this.state.emojiPicker });
  };
  handleAddEmoji = (emoji) => {
    const oldMessage = this.state.message;
    const newMessage = this.colonToUnicode(`${oldMessage} ${emoji.colons} `);
    this.setState({ message: newMessage });
    setTimeout(() => this.messageInputRef.focus(), 0);
  };
  colonToUnicode = (message) => {
    return message.replace(/:[A-Za-z0-9_+-]+:/g, (x) => {
      x = x.replace(/:/g, "");
      let emoji = emojiIndex.emojis[x];
      if (typeof emoji !== "undefined") {
        let unicode = emoji.native;
        if (typeof unicode !== "undefined") {
          return unicode;
        }
      }
      x = ":" + x + ":";
      return x;
    });
  };
  render() {
    const { modal, emojiPicker } = this.state;
    return (
      <Segment className="message__form">
        {emojiPicker && (
          <Picker
            set="apple"
            className="emojiPicker"
            title="Pick your emoji"
            emoji="point_up"
            onSelect={this.handleAddEmoji}
          />
        )}
        <Input
          fluid
          name="message"
          style={{ marginBottom: "0.7em" }}
          ref={(node) => (this.messageInputRef = node)}
          label={
            <Button
              icon={emojiPicker ? "close" : "add"}
              content={emojiPicker ? "Close" : null}
              onClick={this.handleTogglePicker}
            />
          }
          labelPosition="left"
          placeholder="Write your Message"
          onChange={this.handleChange}
          onKeyUp={this.handleKeyUp}
          className={
            this.state.errors.some((error) => error.message.includes("message"))
              ? "error"
              : ""
          }
          value={this.state.message}
        />
        <Button.Group icon widths="2">
          <Button
            color="orange"
            content="Add Reply"
            labelPosition="left"
            icon="edit"
            onClick={this.sendMessage}
            loading={this.state.loading}
            disabled={this.state.message.trim().length === 0}
          />
          <Button
            color="teal"
            content="Upload Media"
            labelPosition="right"
            icon="cloud upload"
            onClick={this.openModal}
          />
          <FileModal
            uploadFile={this.uploadFile}
            closeModal={this.closeModal}
            modal={modal}
            uploadState={this.state.uploadState}
            percentageUploaded={this.state.percentageUploaded}
          />
        </Button.Group>
      </Segment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    currentChannel: state.channel.currentChannel,
    currentUser: state.user.currentUser,
    isPrivateChannel: state.channel.isPrivateChannel,
  };
};

export default connect(mapStateToProps)(MessagesForm);
