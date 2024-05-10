import React, { useEffect, useMemo, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { Form } from "react-bootstrap";
import {
  AMPModal,
  AMPModalHeader,
  AMPModalBody,
  AMPModalFooter,
} from "../common/AMPModal";
import * as yup from "yup";
import { AMPFieldWrapper } from "../common/AMPFieldWrapper";
import { Row, Col, Button, Table, Container } from "react-bootstrap";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { GrCloudDownload } from "react-icons/gr";
import { RiDeleteBin6Line } from "react-icons/ri";
import { AMPFile } from "../common/AMPFile";
import { AMPFormValidation } from "../common/AMPFormValidation";
import { Link, withRouter, Redirect, useLocation } from "react-router-dom";
import {
  GET_LOCATION_TO_MOVE_IN_WORKORDER,
  DEFAULT_BASE_URL,
  VERSION,
  MOVE_IN_WORKORDER,
  CHANGE_PO_STATUS,
} from "../common/const";
import { AMPFormLayout } from "../common/AMPFormLayout";
import { AMPTextArea, AMPTextBox } from "../common";
import { AMPTextBoxReadOnly } from "../common/AMPTextBoxReadOnly";
import {
  RECEIVING_DOCUMENT_LIMIT,
  RECEIVING_DOCUMENT_LIMIT_MSG,
} from "../common/const/limits";
import AMPLoader from "../common/AMPLoader";
import { toast } from "react-toastify";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";
import Select, { components } from "react-select";
import { ampJsonAjax } from "../common/utils/ampAjax";
import { useAccessState } from "../../utils/AppContext/loginContext";
import { AMPValidation } from "../common/AMPAuthorization/AMPValidation";


const changePOStatusAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.put(URL, params).pipe(
        map((xhrResponse) => {
          return { ...xhrResponse.response, params };
        }),
        catchError((error) => {
          console.error("Error in update Receiving Form", error);
          errorHandler(error.response);
          return [];
        })
      )
    )
  ); // ENd of line
export const ChangeWOrkOrderPOStatusModal = ({
  isCheck,
  closeWOrkOrderPOStatusModel,
  modalName,
  checkedData,
  setShowChangeWOrkOrderPOStatusModal,
  offset,
  perPage,
  ajaxParams,
  ajaxSearchParams,
  searchPumpObs$,
  setIsCheck,
  setCheckedData,
  ...props
}) => {
  const context = useAccessState()

  const { handleSubmit, reset, watch, control, register, errors } = useForm({
    hub: { label: "", value: "" }
  });
  const [loader, setLoader] = useState(false)
  const [destinationLocation, setDestinationLocation] = useState([])
  const [showHubRequiredError, setShowHubRequiredError] = useState(false);

  // Move Work Order
  const changePOStatus$ = useMemo(() => {
    return changePOStatusAjax$(
      DEFAULT_BASE_URL + VERSION + CHANGE_PO_STATUS,
      {
        errorHandler: (error) => {
          toast.error(response?.message, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  /* Observer for update response from ajax request */
  useObservableCallback(changePOStatus$, (response) => {
    if (!response?.status) {
      setLoader(false);
      toast.error(response.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      setShowChangeWOrkOrderPOStatusModal(false);
      if (ajaxParams && offset) {
        searchPumpObs$.next({
          index: offset,
          pageSize: perPage,
          ajaxParams: ajaxParams,
          ajaxSearchParams: ajaxSearchParams,
        });
        setLoader(false);
      }
      setIsCheck([]);
      setCheckedData([]);
      setShowHubRequiredError(false)
      toast.success(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  }, [])


  const changePOStatus = (formData) => {
    const ajaxParams = {
      status: !checkedData[0]?.isPOApproved,
      workorderIds: isCheck,
      requestedById: parseInt(context?.userId)
    }
    setLoader(true);
    changePOStatus$.next(ajaxParams);
  };

  return (
    <>
      <AMPModal
        show
        onHide={closeWOrkOrderPOStatusModel}
        size="md"
        backdrop="static"
        centered
      >
        <AMPLoader isLoading={loader} />
        <AMPModalHeader>{modalName}</AMPModalHeader>
        <form onSubmit={handleSubmit(changePOStatus)}>
          <AMPModalBody>
            <div className="text-info text-center text-bold">Following Work order's PO status can be change to <h8 className="text-primary">{checkedData[0]?.isPOApproved === true ? 'Not Received' : 'Received'}</h8> PO Status</div>
            <div>
              {checkedData?.map((item) => {
                return (<div className="font-weight-bold text-center">{item?.workorderNumber}</div>)
              })}
            </div>
          </AMPModalBody>
          <AMPModalFooter>
            <Button type="submit" variant="secondary" className="px-5">
              Submit
            </Button>
          </AMPModalFooter>
        </form>
      </AMPModal>
    </>
  );
};
