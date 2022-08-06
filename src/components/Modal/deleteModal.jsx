import React from "react";
import "../../App.scss";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

const DeleteModal = (props) => {
  if (!props.showModal) {
    return null;
  }
  return (
    <Modal isOpen={props.showModal} className="modal-app">
      <ModalHeader toggle={props.cancelToggle}>DELETE</ModalHeader>
      <ModalBody className="text-center">
        {props.data.image ? (
          <div>
            <img src={props.data.image} width="150px" alt={props.data.image} />
          </div>
        ) : (
          ""
        )}
        <div className="text-delete">Are you want to delete this item ?</div>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={props.deleteData}>
          delete
        </Button>
        <Button color="secondary" onClick={props.cancelToggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteModal;
