import React, { useEffect, useMemo, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import Modal from "react-bootstrap/Modal";
import { toast } from "react-toastify";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";
import {
  DEFAULT_BASE_URL,
  VERSION,
  GET_QUESTIONNAIRE_BY_PART_INSPECTION_OR_SAVE_QUESTIONNAIRE,
} from "../common/const";
import { Row, Col, Button } from "react-bootstrap";

export const DeleteModal = (props) => {
  const { onConfirmDelete, showDeleteModal, closeModal, confirmationMessage } =
    props;

  const { handleSubmit, reset, watch, control, register } = useForm({});
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
            onClick={() => onConfirmDelete(showDeleteModal)}
          >
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
