import React, { useEffect, useMemo, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import Modal from "react-bootstrap/Modal";
import { Row, Col, Button } from "react-bootstrap";

export const AMPUpdateConfirmBox = (props) => {
  const { onConfirmSubmit, showConfirmModal, closeModal, confirmationMessage } =
    props;

  return (
    <>
      <Modal
        show
        onHide={closeModal}
        backdrop="static"
        className="delete-modal-bg"
      >
        <Modal.Header className="bg-blue" closeButton>
          <Modal.Title></Modal.Title>
        </Modal.Header>
        <Modal.Body>{confirmationMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => onConfirmSubmit(showConfirmModal)}
          >
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
