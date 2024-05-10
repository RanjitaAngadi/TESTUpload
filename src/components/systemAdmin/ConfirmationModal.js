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

import { AMPToastConsts } from "../common/const/AMPToastConst";
import { ampJsonAjax } from "../common/utils/ampAjax";

// Delete Questionnaire
const bulkUpdateQuestionnaireAjax$ = (URL) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.delete(URL + "/" + params.id).pipe(
        map((xhrResponse) => {
          return xhrResponse;
        }),
        catchError((error) => {
          console.error("Error in create Questionnaire", error);
          errorHandler(error.response);
          return [];
        })
      )
    )
  ); // ENd of line

export const ConfirmationModal = (props) => {
  const {
    closeConfirmModal,
    questionByPartAndInspectionObs$,
    setShowConfirmModal,
    params,
    showConfirmModal,
    confirmationMessage,
  } = props;
  const bulkUpdateQuestionnaire$ = useMemo(() => {
    return bulkUpdateQuestionnaireAjax$(
      DEFAULT_BASE_URL +
        VERSION +
        GET_QUESTIONNAIRE_BY_PART_INSPECTION_OR_SAVE_QUESTIONNAIRE,
      {
        errorHandler: (error) => {
          toast.error(AMPToastConsts.QUESTIONNAIRE_DELETE_ERROR, {
            // Set to 15sec
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  });
  useObservableCallback(bulkUpdateQuestionnaire$, (response) => {
    questionByPartAndInspectionObs$.next({
      partId: selectedQuestionResult.params.partId,
      inspectionTypeId: selectedQuestionResult.params.inspectionTypeId || null,
    });
    setShowDeleteModal("");
    toast.success(AMPToastConsts.QUESTIONNAIRE_DELETED_ERROR, {
      position: toast.POSITION.TOP_CENTER,
    });
    //setShowNewForm(false);
  });
  const closeModal = () => {
    props.closeConfirmModal();
  };

  const { handleSubmit, reset, watch, control, register } = useForm({});

  const onBulkUpdate = (id) => {
    bulkUpdateQuestionnaire$.next({ id: id });
  };
  return (
    <>
      <Modal show onHide={closeModal}>
        <Modal.Header className="bg-blue" closeButton>
          <Modal.Title></Modal.Title>
        </Modal.Header>
        <Modal.Body>{confirmationMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => onDelete(showConfirmModal)}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
