import React, { useEffect, useMemo, useState, useRef } from "react";
import { Redirect, useHistory } from "react-router-dom";
import {
  AMPModal,
  AMPModalHeader,
  AMPModalBody,
  AMPModalFooter,
} from "../common/AMPModal";
import { Row, Col, Button, Table } from "react-bootstrap";
import AMPLoader from "../common/AMPLoader";
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
  GET_INSPECTION_STATUS,
  CHANGE_TO_NOTAPPLICABLE_STATUS,
  CHANGE_TO_APPLICABLE_STATUS,
} from "../common/const";
import { ampJsonAjax } from "../common/utils/ampAjax";
import { AMPToastConsts } from "../common/const/AMPToastConst";
import { useAccessState } from "../../utils/AppContext/loginContext";
import { AMPInspectionEnum } from "../common/const/AMPEnum";
import { AMPInspectionStatus } from "../common/const/AMPInspectionStatus";
import AMPFlexBetween from "../common/AMPFlex/AMPFlexBetween";

//Get inspection type status
const getInspectionStatusAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax
        .get(DEFAULT_BASE_URL + VERSION + GET_INSPECTION_STATUS + param?.id + "/" + param?.partTypeId)
        .pipe(
          map((xhrResponse) => {
            const filteredData = xhrResponse?.response?.content?.data?.map(
              (itm, idx) => {
                const [data] = AMPInspectionEnum?.filter((item) => {
                  if (item?.id === itm?.inspectionTypeId) return itm;
                });
                return { ...itm, data };
              }
            );
            const opmData = xhrResponse?.response?.content?.opmPartTypeInspection;
            return { filteredData, opmData };
          }),
          catchError((error) => {
            return throwError(error);
          })
        )
    )
  );

const changeToNotApplicableStatusAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.put(URL + params?.inspectionDetailId + "/" + params?.requestedById).pipe(
        map((xhrResponse) => {
          return { ...xhrResponse.response, params };
        }),
        catchError((error) => {
          console.error("Error in update Inspection Status", error);
          errorHandler(error.response);
          return [];
        })
      )
    )
  ); // ENd of line
const changeToApplicableStatusAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.put(URL + params?.inspectionDetailId + "/" + params?.requestedById).pipe(
        map((xhrResponse) => {
          return { ...xhrResponse.response, params };
        }),
        catchError((error) => {
          console.error("Error in update Inspection Status", error);
          errorHandler(error.response);
          return [];
        })
      )
    )
  ); // ENd of line
// Status Modal
export const AssetStatusModal = (props) => {
  const context = useAccessState();

  const {
    closeStatusModal,
    showAssetStatusModal,
    workId,
    workOrderNumber,
    status,
  } = props;
  const history = useHistory();
  const [isLoading, setLoader] = useState(false);
  const [inspectionResult, setInspectionResult] = useState();
  const [statusResult, setStatusResult] = useState();
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [statusType, setStatusType] = useState();
  const [inspectionDetailId, setInspectionDetailId] = useState();
  const [opmTabDetails, setOpmTabDetails] = useState();

  //Get all Inspection type api call ends

  const ajaxInspectionStatusObsv$ = useMemo(() => {
    return getInspectionStatusAjaxObs$();
  }, []);

  useObservableCallback(
    ajaxInspectionStatusObsv$,
    (response) => {
      if (response) {
        const filtereData = response?.filteredData?.map((itm, idex) => {
          // if (itm?.isApplicable===false) {
          //   return {
          //     ...itm,
          //     statusColor: "#6e6f70 !important",
          //   };
          // }
          if (itm?.status === 1) {
            return {
              ...itm,
              statusColor: "bg-dark",
            };
          } else if (itm?.status === 2) {
            return {
              ...itm,
              statusColor: "bg-primary",
            };
          } else if (itm?.status === 3) {
            return {
              ...itm,
              statusColor: "bg-success",
            };
          } else if (itm?.status === 4) {
            return {
              ...itm,
              statusColor: "bg-danger",
            };
          } else if (itm?.status === 5) {
            return {
              ...itm,
              statusColor: "bg-warning",
            };
          } else if (itm?.status === 6 || itm?.status === 7) {
            return {
              ...itm,
              statusColor: "bg-info",
            };
          }

        });
        setStatusResult(filtereData);
        setOpmTabDetails(response?.opmData);
      }
      setLoader(false);
    },
    null,
    []
  );
  useEffect(() => {
    ajaxInspectionStatusObsv$.next({
      id: showAssetStatusModal?.data?.workorderAssetId,
      partTypeId: showAssetStatusModal?.data?.partTypeId,
    });
    setLoader(true);
  }, [ajaxInspectionStatusObsv$]);
  const [isApplicable, setIsAppicable] = useState(true);
  const [inspectionTypeId, setInsppectionTypeId] = useState(true);

  // Change to applicable status api
  const changeToNotApplicableStatus$ = useMemo(() => {
    return changeToNotApplicableStatusAjax$(
      DEFAULT_BASE_URL + VERSION + CHANGE_TO_NOTAPPLICABLE_STATUS,
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
  useObservableCallback(changeToNotApplicableStatus$, (response) => {
    if (!response?.status) {
      toast.error(response.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      if (response?.message === "Failed To Update.") {
        toast.error(response.message, {
          position: toast.POSITION.TOP_CENTER,
        });
      } else {
        toast.success(response?.params?.inspectionName + " inspection " + AMPToastConsts.MOVE_TO_NOT_APPLICABLE_INSPECTION, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    }
  }, [])
  // Change to applicable status api
  const changeToApplicableStatus$ = useMemo(() => {
    return changeToApplicableStatusAjax$(
      DEFAULT_BASE_URL + VERSION + CHANGE_TO_APPLICABLE_STATUS,
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
  useObservableCallback(changeToApplicableStatus$, (response) => {
    if (!response?.status) {
      toast.error(response.message, {
        position: toast.POSITION.TOP_CENTER,
      });

    } else {
      toast.success(response?.params?.inspectionName + " inspection " + AMPToastConsts.MOVE_TO_APPLICABLE_INSPECTION, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  }, [])


  const toggleEnabled = (e, idx, inspectionTypeId, inspectionDetailId, isApplicable, inspectionName) => {
    let isInspectionApplicable = !isApplicable;
    let tempStatusResult = statusResult?.map((item, index) => {
      if (item?.inspectionDetailId === inspectionDetailId) {
        return {
          ...item,
          isApplicable: isInspectionApplicable
        }
      } else {
        return item;
      }
    })
    if (isInspectionApplicable === false) {
      changeToNotApplicableStatus$.next({
        inspectionDetailId: inspectionDetailId,
        requestedById: parseInt(context?.userId),
        inspectionName
      })
    }
    else {
      changeToApplicableStatus$.next({
        inspectionDetailId: inspectionDetailId,
        requestedById: parseInt(context?.userId),
        inspectionName
      })
    }
    setStatusResult(tempStatusResult)
  }

  const moveToInspectionForm = (
    type,
    status,
    inspectionDetailId,
    inspectionLevelId,
    inspectionTypeId
  ) => {
    history.push({
      pathname: `/Pump/inspectionForm`,
      state: {
        data: showAssetStatusModal?.data,
        inspectionTypeStatus: status,
        type: type,
        workId: workId,
        inspectionDetailId: inspectionDetailId,
        inspectionLevelId: inspectionLevelId,
        inspectionTypeId: inspectionTypeId,
        visualInspectionDetailId: statusResult[0]?.inspectionDetailId,
        workOrderNumber: workOrderNumber,
        status: status,
        serviceCenterId: showAssetStatusModal?.serviceCenterId,
        opmTabDetails: opmTabDetails
      },
    });
  };
  $('.custom-control-label').attr('style', 'font-size: 8px !important');
  return (
    <>
      <AMPModal
        show
        onHide={closeStatusModal}
        size="lg"
      >
        <AMPLoader isLoading={isLoading} />
        <AMPModalHeader>
          {props.modalName} for{" "}
          {showAssetStatusModal?.data?.manufacturerSerialNumber}
        </AMPModalHeader>

        <AMPModalBody>
          <div>
            <Table striped bordered hover size="sm" className="bg-light">
              <thead>
                <tr>
                  <th></th>
                  <th className="text-center">Inspection Date</th>
                  <th className="text-center">Inspected By</th>
                </tr>
              </thead>
              <tbody className="fn-14">
                {statusResult?.length > 0 && statusResult?.map((itm, idx, elem) => (
                  <tr key={itm?.data?.id}>
                    <td className="text-center">
                      <AMPFlexBetween>
                        <React.Fragment>
                          <Button
                            variant="secondary"
                            className={`${itm?.statusColor} mr-2  inspection-btn-wd ${itm.inspectionDetailId === 26 || itm.inspectionDetailId === 27}? `}
                            size="md"
                            onClick={(e) => {
                              moveToInspectionForm(
                                itm?.data,
                                itm?.status,
                                itm?.inspectionDetailId,
                                itm?.inspectionLevelId,
                                itm?.inspectionTypeId,
                              );
                            }}
                            disabled={
                              (itm?.inspectionTypeId === 1 &&
                                !context?.features?.includes("INS-VISUAL")) ||
                              ((itm?.inspectionTypeId === 10 ||
                                itm?.inspectionTypeId === 14) &&
                                !context?.features?.includes("INS-DIS")) ||
                              ((itm?.inspectionTypeId === 11 ||
                                itm?.inspectionTypeId === 16) &&
                                !context?.features?.includes("INS-ASY")) ||
                              ((itm?.inspectionTypeId === 13 ||
                                itm?.inspectionTypeId === 20) &&
                                !context?.features?.includes("INS-PW")) ||
                              ((itm?.inspectionTypeId === 12 ||
                                itm?.inspectionTypeId === 23) &&
                                !context?.features?.includes("INS-FINAL")) ||
                              ((itm?.inspectionTypeId === 8 ||
                                itm?.inspectionTypeId === 15) &&
                                !context?.features?.includes("INS-PAINT")) ||
                              ((itm?.inspectionTypeId === 17 ||
                                itm?.inspectionTypeId === 19) &&
                                !context?.features?.includes("INS-AIR")) ||
                              (itm?.inspectionTypeId === 18 &&
                                !context?.features?.includes("INS-PER")) ||
                              (itm?.inspectionTypeId === 22 &&
                                !context?.features?.includes("INS-DATATAG")) ||
                              (itm?.inspectionTypeId === 24 &&
                                !context?.features?.includes("INS-OPMPRE")) ||
                              (itm?.inspectionTypeId === 25 &&
                                !context?.features?.includes("INS-OPMPOST")) ||
                              (itm?.inspectionTypeId === 26 &&
                                !context?.features?.includes("INS-TR")) ||
                              (itm?.inspectionTypeId === 26 && !itm.isApplicable) ||
                              (itm?.inspectionTypeId === 27 && !itm.isApplicable) ||
                              (itm?.inspectionTypeId === 27 &&
                                !context?.features?.includes("INS-TI") && !itm.isApplicable) ||
                              (itm?.inspectionLevelId !== 3 &&
                                itm?.data?.id !== 1 &&
                                elem[idx - 1]?.status !== 3 && elem[idx - 1]?.isApplicable) ||
                              (itm?.inspectionLevelId === 3 &&
                                itm?.data?.id !== 24 &&
                                elem[idx - 1]?.status !== 3 && elem[idx - 1]?.isApplicable) ||
                              (itm?.inspectionLevelId !== 3
                                && itm?.inspectionTypeId !== 1
                                && elem[idx - 1]?.status !== 3
                                && elem[idx - 1]?.isApplicable) ||
                              (itm?.status !== 3 && !itm?.isApplicable) ||
                              itm?.status === 5 ||
                              (showAssetStatusModal?.data?.status === "SCRAP"
                                && itm?.data?.id !== 24
                                && itm?.status === 1)
                            }
                          >
                            {itm?.data?.value}
                          </Button>
                          {(itm?.inspectionLevelId !== 3
                            && itm?.inspectionTypeId !== 1
                            && itm?.inspectionTypeId !== 12
                            && itm?.inspectionTypeId !== 23) && <div>
                              <label className="fn-8 m-0">Not Applicable</label>
                              <div className="custom-control custom-switch pt-0 min_height_none">
                                <input type="checkbox"
                                  className="custom-control-input"
                                  id={`customSwitch1${itm?.inspectionTypeId}`}
                                  //type="switch"
                                  checked={!itm?.isApplicable}
                                  disabled={(elem[idx - 1]?.status !== 3
                                    && elem[idx - 1]?.isApplicable)
                                    || (elem[idx + 1]?.status !== 3
                                      && !elem[idx + 1]?.isApplicable)
                                    || (itm?.status === 3)
                                    || (itm?.status !== 3 && elem[idx + 1]?.status === 3
                                      && !itm?.isApplicable)
                                  }
                                  onChange={(e) => toggleEnabled(
                                    e,
                                    idx,
                                    itm?.inspectionTypeId,
                                    itm.inspectionDetailId,
                                    itm?.isApplicable,
                                    itm?.data?.value
                                  )}
                                />
                                <label
                                  className="custom-control-label"
                                  htmlFor={`customSwitch1${itm?.inspectionTypeId}`}></label>
                              </div><div></div></div>}
                        </React.Fragment>
                      </AMPFlexBetween>
                    </td>
                    <td className="text-center">{itm?.completionDate}</td>
                    <td className="text-center">{itm?.inspectedBy}</td>
                  </tr>
                )
                )}
              </tbody>
            </Table>
          </div>
          <Col md={12} sm={12} lg={12} xs={12}>
            <Row>
              <Col md={12} sm={12} lg={12} xs={12}>
                <Row>
                  {AMPInspectionStatus?.map((itm, idx, elem) => {
                    return (
                      <Col md={12} sm={12} lg={3} xs={12}>
                        <span
                          className={`${itm?.statusColor} box ml-0 mt-0 mb-0 mr-1`}
                        ></span>
                        {itm?.value}
                      </Col>
                    );
                  })}
                </Row>
              </Col>
            </Row>
          </Col>
        </AMPModalBody>
        <AMPModalFooter></AMPModalFooter>
      </AMPModal>
    </>
  );
};
