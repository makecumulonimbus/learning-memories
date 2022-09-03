import React from "react";
import "../../App.scss";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Row,
  Col,
  Form,
  Label,
  FormGroup,
} from "reactstrap";

const uploadFile = () => {
  document.querySelector("#fileButton").click();
};

const AppModal = (props) => {
  if (!props.showModal) {
    return null;
  }

  return (
    <Modal isOpen={props.showModal} className="modal-app">
      <Form onSubmit={(e) => props.submit(e)}>
        <ModalHeader toggle={props.cancelToggle}>{props.mode}</ModalHeader>
        <ModalBody>
          <Row>
            <Col lg="4" sm="4" xs="12">
              <FormGroup>
                <Label for="Image">Image (700*700)</Label>
                <div className="uploadForm">
                  <img
                    className="preview"
                    width="130px"
                    onClick={uploadFile}
                    alt={props.imgPreview}
                    src={
                      props.imgPreview
                        ? props.imgPreview
                        : "https://www.spu.ac.th/uploads/webfac/f000000/contents/20180312145944OSQuw1m.jpg"
                    }
                  ></img>
                  <i
                    className="fa fa-upload uploadImage"
                    onClick={uploadFile}
                  ></i>
                  <Input
                    type="file"
                    id="fileButton"
                    name="file"
                    hidden
                    onChange={(e) => props.changeForm("image", e)}
                  />
                </div>
              </FormGroup>
            </Col>
            <Col lg="8" sm="8" xs="12">
              <FormGroup>
                <Label for="Name">Name</Label>
                <Input
                  type="text"
                  name="nameApp"
                  autoComplete="off"
                  required
                  placeholder="app name"
                  defaultValue={props.form.name}
                  onChange={(e) => props.changeForm("name", e)}
                />
              </FormGroup>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" type="submit">
            Save
          </Button>
          <Button color="secondary" onClick={props.cancelToggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default AppModal;
