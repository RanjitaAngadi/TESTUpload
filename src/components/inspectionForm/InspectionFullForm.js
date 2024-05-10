import React, { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Row,
  Col,
  Button,
  Table,
  Image,
  Container,
  Card,
} from "react-bootstrap";
import { Redirect, useLocation, Link } from "react-router-dom";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import AMPFieldSet from "../common/AMPFieldSet";
import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";
import {
  DEFAULT_BASE_URL,
  VERSION,
  GET_INSPECTION_QUESTIONNAIRE,
  ConstVariable,
  SAVE_INSPECTION_QUESTIONNAIRE,
  SAVE_FINAL_QUESTIONNAIRE,
  GET_PREVIEW_INSPECTION_QUESTIONNAIRE,
  FormValidation,
} from "../common/const";
import { ampJsonAjax } from "../common/utils/ampAjax";
import AMPLoader from "../common/AMPLoader";
import { toast } from "react-toastify";
import { AMPToastConsts } from "../common/const/AMPToastConst";
import InspectionPreveiwPage from "./InspectionPreveiwPage";
import { AMPErrorAlert } from "../common/AMPAlert";

import {
  AccessProvider,
  useAccessDispatch,
  useAccessState,
} from "../../utils/AppContext/loginContext";
import { AMPUpdateConfirmBox } from "../common/AMPUpdateConfirmBox";

const getPreveiwInspectionAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax
        .get(
          DEFAULT_BASE_URL +
          VERSION +
          GET_PREVIEW_INSPECTION_QUESTIONNAIRE +
          params
        )
        .pipe(
          map((xhrResponse) => {
            return xhrResponse?.response;
          }),
          catchError((error) => {
            return throwError(error);
          })
        )
    )
  );
//On create New Questionnaire
const saveInspectionQuestionnaireAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax
        .post(
          URL +
          params?.ajaxParams?.inspectionDetailId +
          "/" +
          params?.ajaxParams?.partTypeId +
          "/" +
          params?.ajaxParams?.questionId +
          "/" +
          params?.ajaxParams?.isSelected +
          "/" +
          params?.RequestedById
        )
        .pipe(
          map((xhrResponse) => {
            return xhrResponse?.response;
          }),
          catchError((error) => {
            console.error("Error in saving Questionnaire", error);
            errorHandler(error.response);
            return [];
          })
        )
    )
  ); // ENd of line
//On create New Questionnaire
const saveFinalQuestionnaireAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax
        .put(URL + param?.inspectionDetailId + "/" + param?.RequestedById)
        .pipe(
          map((xhrResponse) => {
            return xhrResponse?.response;
          }),
          catchError((error) => {
            console.error("Error in saving Questionnaire", error);
            errorHandler(error.response);
            return [];
          })
        )
    )
  ); // ENd of line
const InspectionFullForm = (props) => {
  const locationRef = useLocation();
  const opmTabDetails = locationRef?.state?.opmTabDetails;
  const {
    data,
    openPictureModal,
    type,
    partTypeId,
    inspectionDetailId,
    setTotalPageCount,
    setPageCount,
    pageCount,
    setPaginatedQuestionnaire,
    paginationQuestionnaire,
    totalPageCount,
    ajaxInspectionQuestionnaireObsv$,
    setOffset,
    offset,
    setInspectionQuickLinks,
    inspectionQuickLinks,
    questionIndex,
    showInspectionPreviewPage,
    setInspectionPreviewPage,
    status,
    workOrderNumber,
    serviceCenterId,
    workId,
    loader,
    setLoader,
    selectedAnswer,
    setSelectedAnswer,
    completed,
    inspectionStatus,
    showErrorMessage,
    setShowErrorMessage,
    setLoaderData,
    loaderData,
    inspectionTypeId,
    inspectionTypeStatus,
    setInspectionLevelIdForApiCall,
  } = props;
  const context = useAccessState();
  const { register, handleSubmit, watch, errors } = useForm({});
  // const [loader, setLoader] = useState(false);
  const [stateIndex, setIndex] = useState(0);
  const [previewInspectionList, setPreveiwInspectionList] = useState();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [perPage] = useState(1);

  const onSubmit = (formData) => { };

  const onPrevCall = (from) => {
    setShowErrorMessage("");
    setInspectionQuickLinks();
    if (from) {
      setInspectionPreviewPage(false);
      setLoader(true);
      ajaxInspectionQuestionnaireObsv$.next({
        inspectionDetailId: inspectionDetailId,
        partTypeId: data?.partTypeId,
        inspectionTypeId: type?.id,
        index: questionIndex,
      });
      //setOffset(questionIndex);
    } else {
      setLoader("loading");
      //setOffset(questionIndex - 1);
      ajaxInspectionQuestionnaireObsv$.next({
        inspectionDetailId: inspectionDetailId,
        partTypeId: data?.partTypeId,
        inspectionTypeId: type?.id,
        index: questionIndex - 1,
      });
    }
  };
  const onNextCall = (e) => {
    if (inspectionQuickLinks?.id === ConstVariable?.DID) {
      setShowErrorMessage(
        "Please Select Yes Or No Befor Moving to Next Questionnaire"
      );
    } else if (
      paginationQuestionnaire?.isPictureToBeAdded &&
      paginationQuestionnaire?.numberofPic === 0
    ) {
      setShowErrorMessage("Please add pictures");
    } else {
      setShowErrorMessage("");
      setInspectionQuickLinks();
      setOffset(questionIndex + 1);
      setLoader("loading");
      ajaxInspectionQuestionnaireObsv$.next({
        inspectionDetailId: inspectionDetailId,
        partTypeId: data?.partTypeId,
        inspectionTypeId: type?.id,
        index: questionIndex + 1,
      });
    }
  };
  const onPreviewCall = () => {
    if (inspectionQuickLinks?.id === ConstVariable?.DID) {
      setShowErrorMessage(
        "Please Select Yes Or No Befor Moving to Next Questionnaire"
      );
    } else if (
      paginationQuestionnaire?.isPictureToBeAdded &&
      paginationQuestionnaire?.numberofPic === 0
    ) {
      setShowErrorMessage("Please add pictures");
    } else {
      setShowErrorMessage("");
      setInspectionPreviewPage(true);
    }
  };
  const saveInspectionQuestionnaire$ = useMemo(() => {
    return saveInspectionQuestionnaireAjax$(
      DEFAULT_BASE_URL + VERSION + SAVE_INSPECTION_QUESTIONNAIRE,
      {
        errorHandler: (error) => {
          toast.error(AMPToastConsts.QUESTIONNAIRE_CREATE_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  /* Observer for save response from ajax request */
  useObservableCallback(saveInspectionQuestionnaire$, (response) => {
    if (!response?.status) {
      toast.error(response.response.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      setInspectionQuickLinks(response?.content);
      toast.success(AMPToastConsts.QUESTIONNAIRE_CREATE_RULE_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });

  // Save Final Questionnaire submit
  const saveFinalQuestionnaire$ = useMemo(() => {
    return saveFinalQuestionnaireAjax$(
      DEFAULT_BASE_URL + VERSION + SAVE_FINAL_QUESTIONNAIRE,
      {
        errorHandler: (error) => {
          toast.error(AMPToastConsts.FINAL_QUESTIONNAIRE_SUBMIT_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  /* Observer for save Final Questionnaire response from ajax request */
  useObservableCallback(saveFinalQuestionnaire$, (response) => {
    if (!response?.status) {
      toast.error(response.response.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      ajaxInspectionQuestionnaireObsv$.next({
        inspectionDetailId: inspectionDetailId,
        partTypeId: data?.partTypeId,
        inspectionTypeId: type?.id,
        index: 0,
      });

      setInspectionPreviewPage(false);
      setTotalPageCount(0);
      toast.success(AMPToastConsts.FINAL_QUESTIONNAIRE_SUBMIT_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
      closeConfirmModal();
    }
  }); // api ends

  const onQuestionSubmit = (isSelected, id) => {
    if (isSelected === "2") {
      setShowErrorMessage("");
    }
    setSelectedAnswer(isSelected);
    const ajaxParams = {
      inspectionDetailId: inspectionDetailId,
      partTypeId: partTypeId,
      questionId: id,
      isSelected: isSelected,
    };
    saveInspectionQuestionnaire$.next({
      ajaxParams,
      RequestedById: parseInt(context?.userId),
    });
  };
  const onQuestionnaireFinalSubmit = () => {
    if ((type?.id === 24 || type?.id === 25) && previewInspectionList?.some(
      (el) => el.questionAnswer === 1
    )) {
      setShowConfirmModal(true);
    }
    else {
      onConfirmSubmit();
    }
  };
  const onConfirmSubmit = () => {
    saveFinalQuestionnaire$.next({
      inspectionDetailId,
      RequestedById: parseInt(context?.userId),
    });
  }
  const closeConfirmModal = () => {
    setShowConfirmModal(false);
  };
  const getPreveiwInspectionObs$ = useMemo(() => {
    return getPreveiwInspectionAjaxObs$();
  }, []);

  useObservableCallback(getPreveiwInspectionObs$, (response) => {
    if (response?.status) {
      setLoader("");
      setPreveiwInspectionList(response?.content);
      if (inspectionTypeId === 1 && inspectionTypeStatus !== 3) {
        setInspectionLevelIdForApiCall(response?.content?.every(item => item?.questionAnswer === 1) ? 18 : 19)
      }
    } else {
      setLoader("");
      toast.error(AMPToastConsts.INSPECTION_QUESTIONNAIRE_PREVIEW_FAILURE, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });
  return (
    <>
      {showErrorMessage && (
        <AMPErrorAlert show={true}>{showErrorMessage}</AMPErrorAlert>
      )}
      {loader === "loading" && <AMPLoader isLoading={loader} />}
      <form onSubmit={handleSubmit(onSubmit)}>
        {!showInspectionPreviewPage && totalPageCount > 0 ? (
          <Row>
            <Col lg="9" xs="12" sm="12" md="6">
              <div className="font-weight-bold text-center pt-2">
                <h5>
                  {questionIndex} .
                  <span>{paginationQuestionnaire?.questionText}</span>
                </h5>
                {paginationQuestionnaire?.instruction && (
                  <h6>({paginationQuestionnaire?.instruction})</h6>
                )}
              </div>

              <div className="font-weight-bold text-center pt-5">
                <Button
                  // type="submit"
                  variant="outline-secondary"
                  className="mr-2"
                  size="xs"
                  onClick={(e) => onPrevCall()}
                  disabled={questionIndex - 1 < 1}
                >
                  Previous
                </Button>
                <Button
                  // type="submit"
                  variant="primary"
                  className={
                    inspectionQuickLinks?.response === 1
                      ? "mr-2 bg-success btn"
                      : "mr-2 btn"
                  }
                  size="xs"
                  onClick={(e) =>
                    onQuestionSubmit(
                      ConstVariable.YES_REQUEST,
                      paginationQuestionnaire?.questionId
                    )
                  }
                >
                  Yes
                </Button>
                <Button
                  // type="submit"
                  variant="primary"
                  className={
                    inspectionQuickLinks?.response === 2
                      ? "mr-2 bg-success btn1"
                      : "mr-2 btn1"
                  }
                  size="xs"
                  onClick={(e) =>
                    onQuestionSubmit(
                      ConstVariable.NO_REQUEST,
                      paginationQuestionnaire?.questionId
                    )
                  }
                >
                  No
                </Button>

                {questionIndex < totalPageCount ? (
                  <Button
                    // type="submit"
                    variant="outline-secondary"
                    className=""
                    size="xs"
                    onClick={(e) => {
                      onNextCall();
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    // type="submit"
                    variant="outline-secondary"
                    className=""
                    size="xs"
                    onClick={(e) => {
                      onPreviewCall();
                    }}
                  >
                    Preview
                  </Button>
                )}
              </div>
            </Col>
            <Col md={6} sm={12} lg={3} xs={12} className="text-center ">
              <Card className="card-positioning">
                <Card.Body>
                  <Col className="side-heading" md={12} sm={12} lg={12} xs={12}>
                    Quick Links
                    <hr />
                  </Col>

                  <div>
                    <Col className="side-links" md={12} sm={12} lg={12} xs={12}>
                      {paginationQuestionnaire?.responseId !==
                        ConstVariable?.DID ||
                        (inspectionQuickLinks
                          ? inspectionQuickLinks?.id !== ConstVariable?.DID
                          : false) ? (
                        <Link
                          to={{
                            pathname: "",
                            state: {
                              isCreate: false,
                              id: data?.workorderAssetId,
                              status: status,
                              isReceiving: false,
                              isWorkorder: false,
                              data: data,
                              type: type,
                              workId: workId,
                              inspectionDetailId: inspectionDetailId,
                              workOrderNumber: workOrderNumber,
                              serviceCenterId: serviceCenterId,
                              opmTabDetails: opmTabDetails
                            },
                          }}
                          onClick={() =>
                            openPictureModal(data?.workorderAssetId)
                          }
                        >
                          Pictures ({paginationQuestionnaire?.numberofPic})
                        </Link>
                      ) : (
                        <div> Pictures</div>
                      )}
                    </Col>

                    {(type?.id == 10 || type?.id == 14) && (
                      <Col
                        className="side-links"
                        md={12}
                        sm={12}
                        lg={12}
                        xs={12}
                      >
                        {paginationQuestionnaire?.responseId !==
                          ConstVariable?.DID ||
                          (inspectionQuickLinks
                            ? inspectionQuickLinks?.id !== ConstVariable?.DID
                            : false) ? (
                          <Link
                            to={{
                              pathname: "/Pump/ReceivingFullForm",
                              state: {
                                isCreate: true,
                                inspectionType: type?.id,
                                linkedWorkorderNumber: workOrderNumber,
                                opmTabDetails: opmTabDetails
                              },
                            }}
                          >
                            Create OPM
                          </Link>
                        ) : (
                          <div> Create OPM</div>
                        )}
                      </Col>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : (
          <>
            <div className="text-center">{loader}</div>
            {!loader && <div className="text-center">{loaderData}</div>}
          </>
        )}
        {(showInspectionPreviewPage ||
          (!showInspectionPreviewPage &&
            completed === "Inspection Completed.")) && (
            <InspectionPreveiwPage
              loader={loader}
              setLoader={setLoader}
              inspectionDetailId={inspectionDetailId}
              getPreveiwInspectionObs$={getPreveiwInspectionObs$}
              previewInspectionList={previewInspectionList}
              type={type}
            />
          )}

        {showInspectionPreviewPage && (
          <div className="font-weight-bold text-center pt-5 float-right">
            <Button
              // type="submit"
              variant="outline-secondary "
              className="mr-2"
              size="xs"
              onClick={(e) => onPrevCall("fromPreview")}
              disabled={questionIndex < 1}
            >
              Previous
            </Button>

            {!(
              (type?.id === 10 ||
                type?.id === 11 ||
                type?.id === 14 ||
                type?.id === 16) &&
              previewInspectionList?.some((el) => el.questionAnswer === 2)
            ) && (
                <Button
                  type="submit"
                  variant="primary"
                  className="mr-2"
                  size="xs"
                  onClick={(e) => {
                    onQuestionnaireFinalSubmit();
                  }}
                >
                  {inspectionStatus === 6 &&
                    previewInspectionList?.some(
                      (el) => el.questionAnswer === 2
                    ) &&
                    "Submit Pass 2"}
                  {(type?.id === 12 || type?.id === 23) &&
                    inspectionStatus !== 6 &&
                    previewInspectionList?.some(
                      (el) => el.questionAnswer === 2
                    ) &&
                    "Submit Pass 1"}
                  {(((type?.id === 12 || type?.id === 23) &&
                    !previewInspectionList?.some(
                      (el) => el.questionAnswer === 2
                    )) ||
                    (type?.id !== 12 && type?.id !== 23)) &&
                    "Submit"}
                </Button>
              )}
          </div>
        )}
      </form>
      {showConfirmModal && (
        <AMPUpdateConfirmBox
          modalName=""
          confirmationMessage={
            FormValidation?.OPM_INSPECTION_RESPONSE_CONFIRMATION
          }
          closeModal={closeConfirmModal}
          showConfirmModal={showConfirmModal}
          setShowConfirmModal={setShowConfirmModal}
          onConfirmSubmit={onConfirmSubmit}
        />
      )}
    </>
  );
};
export default InspectionFullForm;
