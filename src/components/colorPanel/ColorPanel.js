import React, { Component } from "react";
import {
  Sidebar,
  Menu,
  Divider,
  Button,
  Modal,
  Label,
  Icon,
  Segment,
} from "semantic-ui-react";
import firebase from "../../firebase";
import { SliderPicker } from "react-color";
import { connect } from "react-redux";
import { setColors } from "../../redux/actions";

export class ColorPanel extends Component {
  state = {
    modal: false,
    primary: "",
    secondary: "",
    usersRef: firebase.database().ref("users"),
    loading: false,
    userColors: [],
  };
  componentDidMount() {
    const { currentUser } = this.props;
    const { usersRef } = this.state;
    if (currentUser) {
      const userColors = [];
      usersRef.child(`${currentUser.uid}/colors`).on("child_added", (snap) => {
        userColors.unshift(snap.val());
        this.setState({ userColors: userColors });
      });
    }
  }
  componentWillUnmount() {
    if (this.props.currentUser) {
      this.state.usersRef.child(`${this.props.currentUser.uid}/colors`).off();
    }
  }
  openModal = () => this.setState({ modal: true });
  closeModal = () => this.setState({ modal: false });
  handlePrimary = (hex) => this.setState({ primary: hex });
  handleSecondary = (hex) => this.setState({ secondary: hex });
  handleSaveColors = async () => {
    const { primary, secondary, usersRef } = this.state;
    const { currentUser } = this.props;
    if (primary && secondary) {
      try {
        this.setState({ loading: true });
        await usersRef.child(`${currentUser.uid}/colors`).push().update({
          primary,
          secondary,
        });
        this.setState({ loading: false });
        this.closeModal();
      } catch (error) {
        console.log(error);
        this.setState({ loading: false });
      }
    }
  };
  render() {
    const { modal, primary, secondary, loading, userColors } = this.state;

    return (
      <Sidebar
        as={Menu}
        icon="labeled"
        inverted
        vertical
        visible
        width="very thin"
      >
        <Divider />
        <Button icon="add" size="small" color="blue" onClick={this.openModal} />
        {userColors.length > 0 &&
          userColors.map((color) => (
            <React.Fragment key={Math.random()}>
              <Divider />
              <div
                style={{ cursor: "pointer" }}
                className="color__container"
                onClick={() =>
                  this.props.setColors(color.primary, color.secondary)
                }
              >
                <div
                  className="color__square"
                  style={{ background: color.primary }}
                >
                  <div
                    className="color__overlay"
                    style={{ background: color.secondary }}
                  ></div>
                </div>
              </div>
            </React.Fragment>
          ))}
        <Modal basic onClose={this.closeModal} open={modal}>
          <Modal.Header>Choose App Colors</Modal.Header>
          <Modal.Content>
            <Segment inverted>
              <Label content="Primary Color" />
              <br />
              <br />
              <SliderPicker
                color={primary}
                onChange={(color) => this.handlePrimary(color.hex)}
              />
            </Segment>
            <Segment inverted>
              <Label content="Secondary Color" />
              <br />
              <br />
              <SliderPicker
                color={secondary}
                onChange={(color) => this.handleSecondary(color.hex)}
              />
            </Segment>
          </Modal.Content>
          <Modal.Actions>
            <Button
              inverted
              color="green"
              loading={loading}
              onClick={this.handleSaveColors}
            >
              <Icon name="checkmark" />
              Save Colors
            </Button>
            <Button inverted color="red" onClick={this.closeModal}>
              <Icon name="remove" />
              Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Sidebar>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.user.currentUser,
  };
};

export default connect(mapStateToProps, { setColors })(ColorPanel);
