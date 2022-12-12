import React, { Component } from "react";
import { Modal, Input, Button, Icon } from "semantic-ui-react";
import mime from "mime-types";
import ProgressBar from "./ProgressBar";
export class FileModal extends Component {
  state = {
    file: null,
    authorized: ["image/jpeg", "image/png"],
  };
  addFile = (event) =>
    event.target.files[0] && this.setState({ file: event.target.files[0] });
  sendFile = async () => {
    const { file, authorized } = this.state;
    const { uploadFile } = this.props;
    if (file !== null) {
      if (authorized.includes(mime.lookup(file.name))) {
        const metadata = { contentType: mime.lookup(file.name) };
        await uploadFile(file, metadata);

        this.setState({ file: null });
      }
    }
  };
  render() {
    const { modal, closeModal, uploadState, percentageUploaded } = this.props;

    return (
      <Modal basic open={modal} onClose={closeModal}>
        <Modal.Header>Select an Image File</Modal.Header>
        <Modal.Content>
          <Input
            onChange={this.addFile}
            fluid
            label="File types: jpg, png"
            name="file"
            type="file"
          />
        </Modal.Content>
        <Modal.Actions>
          <Button
            color="green"
            loading={uploadState === "uploading" && true}
            disabled={uploadState === "uploading" && true}
            inverted
            onClick={this.sendFile}
          >
            <Icon name="checkmark" /> Send
          </Button>
          <Button color="red" inverted onClick={closeModal}>
            <Icon name="remove" /> Cancel
          </Button>
        </Modal.Actions>
        <ProgressBar
          percentageUploaded={percentageUploaded}
          uploadState={uploadState}
        />
      </Modal>
    );
  }
}

export default FileModal;
