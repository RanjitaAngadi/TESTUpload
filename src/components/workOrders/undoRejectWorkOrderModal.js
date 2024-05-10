import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "react-bootstrap/Modal";
import { Button } from "react-bootstrap";
import { AMPFieldWrapper } from "../common/AMPFieldWrapper";
import { AMPTextBox } from "../common";
import { toast } from "react-toastify";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject } from "rxjs";
import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";
import {
  DEFAULT_BASE_URL,
  VERSION,
  REJECT_WORK_ORDER_BY_ID,
  UNDO_REJECT_WORK_ORDER_BY_ID,
} from "../common/const";
import { ampJsonAjax } from "../common/utils/ampAjax";
import { AMPToastConsts } from "../common/const/AMPToastConst";
import AMPLoader from "../common/AMPLoader";

const undoRejectWorkOrderAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.put(URL, params).pipe(
        map((xhrResponse) => {
          return xhrResponse.response;
        }),
        catchError((error) => {
          console.error("Error in Rejecting Work Order", error);
          errorHandler(error.response);
          return [];
        })
      )
    )
  );
export const UndoRejectWorkOrderModal = ({
  offset,
  pageCount,
  perPage,
  ajaxParams,
  ajaxSearchParams,
  searchPumpObs$,
  showUndoRejectWorkOrderModal,
  closeUndoRejectModal,
}) => {
  const { handleSubmit, reset, setValue,watch, control, register,errors } = useForm({
  });
  useEffect(() => {
    setValue("workOrderNumber", showUndoRejectWorkOrderModal?.workorderNumber)
}, [])

  const [loader, setLoader] = useState(false);
  const ajaxUndoRejectWorkOrder$ = useMemo(() => {
    return undoRejectWorkOrderAjax$(
      DEFAULT_BASE_URL + VERSION + UNDO_REJECT_WORK_ORDER_BY_ID,
      {
        errorHandler: (error) => {
          setLoader(false);
          toast.error(AMPToastConsts.WORK_ORDER_UNDO_REJECT_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);

  useObservableCallback(ajaxUndoRejectWorkOrder$, (response) => {
    if (response?.status) {
      setLoader(false);
      searchPumpObs$.next({
        index: offset,
        pageSize: perPage,
        ajaxParams: ajaxParams,
        ajaxSearchParams: ajaxSearchParams,
      });
      toast.success(AMPToastConsts.WORK_ORDER_UNDO_REJECT_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
      closeUndoRejectModal();
    } else {
      setLoader(false);
      toast.error(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });

  const onSubmit = (formData) => {
    const ajaxParams = {
      workOrderID: showUndoRejectWorkOrderModal?.id,
      workOrderNumber: formData?.workOrderNumber?.toUpperCase(),
      //workOrderNumber: showUndoRejectWorkOrderModal?.workorderNumber
    };
    setLoader(true);
    ajaxUndoRejectWorkOrder$.next(ajaxParams);
  };

  const numberRestriction = (event) => {
    const regex = new RegExp("^[a-zA-Z0-9-_]+$");
    const key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    if (!regex.test(key)) {
      event.preventDefault();
      return false;
    }
  }
  
  return (
    <>
      <Modal
        show
        onHide={closeUndoRejectModal}
        backdrop="static"
        className="delete-modal-bg"
      >
        <Modal.Header className="bg-blue" closeButton>
          <Modal.Title></Modal.Title>
        </Modal.Header>
        <AMPLoader isLoading={loader} />
        <form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <p>
              Are you sure you want to undo reject this Work Order "
              <span className="font-weight-bold mx-0 px-0">
                {showUndoRejectWorkOrderModal?.workorderNumber}
              </span>
              "?
            </p>

            <AMPFieldWrapper
              colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
              label="Work Order Number"
              controlId="workOrderNumber"
              name="workOrderNumber"
              required="true"
              fieldValidation={errors?.workOrderNumber}
            >
              <AMPTextBox
                      className="text-uppercase"
                      onKeyPress={(e) => numberRestriction(e)}
                      ref={register({ required: true })}
                      
                    />
            </AMPFieldWrapper>
          </Modal.Body>

          <Modal.Footer>
            <Button
              type="button"
              variant="secondary"
              onClick={closeUndoRejectModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Undo Reject
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
};
