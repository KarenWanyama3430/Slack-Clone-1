import React, { Component } from "react";
import firebase from "../../firebase";
import {
  Grid,
  Header,
  Icon,
  Dropdown,
  Image,
  Modal,
  Button,
  Input,
} from "semantic-ui-react";
import { connect } from "react-redux";
import AvatarEditor from "react-avatar-editor";

export class UserPanel extends Component {
  state = {
    modal: false,
    previewImage: "",
    croppedImage: "",
    blob: "",
    storageRef: firebase.storage().ref(),
    userRef: firebase.auth().currentUser,
    usersRef: firebase.database().ref("users"),
    metadata: {
      contentType: "image/jpeg",
    },
    uploadedCroppedImage: "",
    loading: false,
  };
  openModal = () => this.setState({ modal: true });
  closeModal = () => this.setState({ modal: false });
  dropdownOptions = () => {
    const { currentUser } = this.props;
    return [
      {
        key: "user",
        text: (
          <span>
            sign in as <strong>{currentUser.displayName} </strong>
          </span>
        ),
        disabled: true,
      },
      {
        key: "avatar",
        text: <span onClick={this.openModal}>Change Avatar</span>,
      },
      {
        key: "signout",
        text: <span onClick={this.handleSignOut}>Sign Out</span>,
      },
    ];
  };
  handleSignOut = async () => {
    await firebase.auth().signOut();
    console.log("signed out");
  };
  handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
      reader.addEventListener("load", () => {
        this.setState({ previewImage: reader.result });
      });
    }
  };
  handleCropImage = () => {
    if (this.avatarEditor) {
      this.avatarEditor.getImageScaledToCanvas().toBlob((blob) => {
        let imageUrl = URL.createObjectURL(blob);
        this.setState({
          croppedImage: imageUrl,
          blob,
        });
      });
    }
  };
  uploadCroppedImage = async () => {
    const {
      storageRef,
      userRef,
      blob,
      metadata,

      usersRef,
    } = this.state;
    this.setState({ loading: true });
    try {
      const snap = await storageRef
        .child(`avatars/user/${userRef.uid}`)
        .put(blob, metadata);
      const downloadURL = await snap.ref.getDownloadURL();
      this.setState({ uploadedCroppedImage: downloadURL });
      await userRef.updateProfile({
        photoURL: downloadURL,
      });
      console.log("User ProfilePhoto Updated");
      await usersRef.child(userRef.uid).update({ avatar: downloadURL });
      console.log("User avatar updated in the database");
      this.setState({ loading: false });
      this.closeModal();
    } catch (error) {
      this.setState({ loading: false });
      console.log(error);
    }
  };
  render() {
    return (
      <Grid style={{ background: this.props.primaryColor }}>
        <Grid.Column>
          <Grid.Row style={{ padding: "1.2em", margin: 0 }}>
            {/* APP HEADER */}
            <Header inverted floated="left" as="h2">
              <Icon name="code" />
              <Header.Content>SlackChat</Header.Content>
            </Header>
            {/* USER DROPDOWN */}
            <Header style={{ padding: "0.25em" }} as="h4" inverted>
              <Dropdown
                trigger={
                  <span>
                    <Image
                      src={this.props.currentUser.photoURL}
                      spaced="right"
                      avatar
                    />
                    {this.props.currentUser.displayName}
                  </span>
                }
                options={this.dropdownOptions()}
              />
            </Header>
          </Grid.Row>
          <Modal open={this.state.modal} basic onClose={this.closeModal}>
            <Modal.Header>Change Avatar</Modal.Header>
            <Modal.Content>
              <Input
                fluid
                type="file"
                onChange={this.handleFileChange}
                label="New Avatar"
                name="previewImage"
              />
              <Grid centered stackable columns={2}>
                <Grid.Row centered>
                  <Grid.Column className="ui center aligned grid">
                    {/* image preview */}
                    {this.state.previewImage && (
                      <AvatarEditor
                        ref={(node) => (this.avatarEditor = node)}
                        image={this.state.previewImage}
                        width={120}
                        height={120}
                        border={50}
                        scale={1.2}
                      />
                    )}
                  </Grid.Column>
                  <Grid.Column>
                    {/* cropped image preview */}

                    {this.state.croppedImage && (
                      <Image
                        style={{ margin: "3.5em auto" }}
                        width={100}
                        height={100}
                        src={this.state.croppedImage}
                      />
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Modal.Content>
            <Modal.Actions>
              {this.state.croppedImage && (
                <Button
                  color="green"
                  loading={this.state.loading}
                  onClick={this.uploadCroppedImage}
                  inverted
                >
                  <Icon name="save" />
                  Change Avatar
                </Button>
              )}
              <Button color="green" inverted onClick={this.handleCropImage}>
                <Icon name="image" />
                Preview
              </Button>
              <Button color="red" inverted onClick={this.closeModal}>
                <Icon name="remove" />
                Cancel
              </Button>
            </Modal.Actions>
          </Modal>
        </Grid.Column>
      </Grid>
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
  };
};
export default connect(mapStateToProps)(UserPanel);
