import React, { useEffect, useMemo, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import Modal from "react-bootstrap/Modal";
import { Button } from "react-bootstrap";
import { AMPFieldWrapper } from "../common/AMPFieldWrapper";
import { AMPTextArea } from "../common";
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
  REJECT_WORK_ORDER_BY_ID,
} from "../common/const";
import { ampJsonAjax } from "../common/utils/ampAjax";
import { AMPToastConsts } from "../common/const/AMPToastConst";
import AMPLoader from "../common/AMPLoader";

const rejectWorkOrderAjax$ = (URL, { errorHandler }) =>
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
export const RejectWorkOrderModal = ({
  offset,
  pageCount,
  perPage,
  ajaxParams,
  ajaxSearchParams,
  searchPumpObs$,
  showRejectWorkOrderModal,
  closeRejectModal,
}) => {
  const { handleSubmit, reset, watch, control, register } = useForm({});
  const [loader, setLoader] = useState(false);
  const ajaxRejectWorkOrder$ = useMemo(() => {
    return rejectWorkOrderAjax$(
      DEFAULT_BASE_URL + VERSION + REJECT_WORK_ORDER_BY_ID,
      {
        errorHandler: (error) => {
          setLoader(false);
          toast.error(AMPToastConsts.WORK_ORDER_REJECT_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);

  useObservableCallback(ajaxRejectWorkOrder$, (response) => {
    if (response?.status) {
      setLoader(false);
      searchPumpObs$.next({
        index: offset,
        pageSize: perPage,
        ajaxParams: ajaxParams,
        ajaxSearchParams: ajaxSearchParams,
      });
      toast.success(AMPToastConsts.WORK_ORDER_REJECT_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
      closeRejectModal();
    } else {
      setLoader(false);
      toast.error(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });

  const onSubmit = (formData) => {
    const ajaxParams = {
      workOrderID: showRejectWorkOrderModal?.id,
      rejectionComment: formData?.rejectionComment,
    };
    setLoader(true);
    ajaxRejectWorkOrder$.next(ajaxParams);
  };
  return (
    <>
      <Modal
        show
        onHide={closeRejectModal}
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
              Are you sure you want to reject this Work Order "
              <span className="font-weight-bold mx-0 px-0">
                {showRejectWorkOrderModal?.workorderNumber}
              </span>
              "?
            </p>

            <AMPFieldWrapper
              colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
              // label="Comment"
              controlId="rejectionComment"
              name="rejectionComment"
              placeholder="Write Something..."
            >
              <AMPTextArea ref={register} />
            </AMPFieldWrapper>
          </Modal.Body>

          <Modal.Footer>
            <Button
              type="button"
              variant="secondary"
              onClick={closeRejectModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Reject
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
};
