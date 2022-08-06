import React from "react";
import "../../App.scss";
import ReactQuill from "react-quill";
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

const uploadFileIndex = (index) => {
  document.querySelector("#fileButton" + index).click();
};

const TopicModal = (props) => {
  if (!props.showModal) {
    return null;
  }

  return (
    <Modal isOpen={props.showModal} className="modal-app" size="lg">
      <Form onSubmit={(e) => props.submit(e)}>
        <ModalHeader toggle={props.cancelToggle}>{props.mode}</ModalHeader>
        <ModalBody>
          <Row>
            <Col md="12">
              <FormGroup>
                <Label for="Image">Topic</Label>
                <Input
                  type="text"
                  name="name"
                  id="exampleEmail"
                  required
                  placeholder="Topic title"
                  value={props.form.topic}
                  onChange={(e) => props.changeForm("topic", e)}
                  autoComplete="off"
                />
              </FormGroup>
            </Col>
            <Col lg="3" md="4" sm="6">
              <FormGroup>
                <Label for="Name">Type</Label>
                <Input
                  type="select"
                  name="select"
                  id="exampleSelect"
                  value={props.form.type}
                  onChange={(e) => props.changeForm("type", e)}
                >
                  {props.options.map((element, index) => {
                    return <option key={index}>{element.value}</option>;
                  })}
                </Input>
              </FormGroup>
            </Col>
            <Col lg="3" md="4" sm="6">
              <FormGroup>
                <Label for="Name">Version</Label>
                <Input
                  type="text"
                  name="version"
                  id="exampleEmail"
                  placeholder="version"
                  value={props.form.version}
                  onChange={(e) => props.changeForm("version", e)}
                  autoComplete="off"
                />
              </FormGroup>
            </Col>
            <Col lg="6" md="4"></Col>

            <Col lg="3" md="4">
              <FormGroup>
                <Label for="Image">Cover</Label>
                <div className="uploadForm">
                  <img
                    className="preview"
                    width="130px"
                    onClick={uploadFile}
                    alt={props.form.preview}
                    src={
                      props.form.preview
                        ? props.form.preview
                        : "https://www.spu.ac.th/uploads/webfac/f000000/contents/20180312145944OSQuw1m.jpg"
                    }
                  ></img>
                  {props.form.preview ? (
                    <i
                      className="fa fa-trash removeImageCover"
                      onClick={() => props.removeFileCover()}
                    ></i>
                  ) : (
                    ""
                  )}
                  <i
                    className="fa fa-upload uploadImage"
                    onClick={uploadFile}
                  ></i>
                  <Input
                    type="file"
                    id="fileButton"
                    name="file"
                    hidden
                    onChange={(e) => props.changeForm("cover", e)}
                  />
                </div>
              </FormGroup>
            </Col>
            <Col lg="9" md="8">
              <FormGroup>
                <Label for="Name">Introduction</Label>
                <ReactQuill
                  modules={props.formDetail}
                  theme="snow"
                  value={props.form.intro}
                  onChange={(e) => props.changeForm("intro", e)}
                />
              </FormGroup>
            </Col>

            {props.formArray.map((element, index) => {
              return (
                <Row key={index} className="p-3 listParagraph">
                  <Col lg="12">
                    <div className="paragraph">
                      <span>Paragraph #{index + 1}</span>
                      <Button
                        size="sm"
                        color="outline-danger"
                        className="btn-remove-paragraph"
                        onClick={() => props.deleteForm(index)}
                      >
                        X
                      </Button>
                    </div>
                  </Col>
                  <Col lg="3" md="4">
                    <FormGroup>
                      <Label for="Image">Image #{index + 1}</Label>
                      <div className="uploadForm">
                        <img
                          className="preview"
                          width="130px"
                          onClick={() => uploadFileIndex(index)}
                          alt={element.preview}
                          src={
                            element.preview
                              ? element.preview
                              : "https://www.spu.ac.th/uploads/webfac/f000000/contents/20180312145944OSQuw1m.jpg"
                          }
                        ></img>
                        {element.preview ? (
                          <i
                            className="fa fa-trash removeImage"
                            onClick={() => props.removeFile(index)}
                          ></i>
                        ) : (
                          ""
                        )}

                        <i
                          className="fa fa-upload uploadImage"
                          onClick={() => uploadFileIndex(index)}
                        ></i>
                        <Input
                          type="file"
                          className="fileInput"
                          id={"fileButton" + index}
                          name="file"
                          hidden
                          onChange={(e) =>
                            props.changeFormArray("image", e, index)
                          }
                        />
                      </div>
                    </FormGroup>
                  </Col>
                  <Col lg="9" md="8">
                    <FormGroup>
                      <Label for="Name">Detail #{index + 1}</Label>
                      <ReactQuill
                        modules={props.formDetail}
                        theme="snow"
                        value={props.formArray[index].detail}
                        onChange={(e) =>
                          props.changeFormArray("detail", e, index)
                        }
                      />
                    </FormGroup>
                  </Col>
                  <Col lg="3" md="4">
                    <FormGroup>
                      <Label for="Name">Filename #{index + 1}</Label>
                      <Input
                        type="text"
                        value={props.formArray[index].filename}
                        onChange={(e) =>
                          props.changeFormArray("filename", e, index)
                        }
                        autoComplete="off"
                      />
                    </FormGroup>
                  </Col>
                  <Col lg="9" md="8">
                    <FormGroup>
                      <Label for="Name">Code #{index + 1}</Label>
                      <Input
                        type="textarea"
                        className="text-area"
                        value={props.formArray[index].code}
                        onChange={(e) =>
                          props.changeFormArray("code", e, index)
                        }
                      />
                    </FormGroup>
                  </Col>
                </Row>
              );
            })}

            <Col md="12">
              <div className="btn-paragraph text-center">
                <Button
                  size="sm"
                  color="outline-primary"
                  className="btn-add-paragraph"
                  onClick={props.addForm}
                >
                  ADD
                </Button>
              </div>
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

export default TopicModal;
