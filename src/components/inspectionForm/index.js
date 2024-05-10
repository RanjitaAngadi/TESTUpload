import React, { useState, useEffect, useMemo } from "react";
import ReactGA from 'react-ga';
import { useForm, Controller } from "react-hook-form";
import ReactDOM from "react-dom";
import { Redirect, useLocation, Link, useHistory } from "react-router-dom";
import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import { ampJsonAjax, ampOctetStreamAjax } from "../common/utils/ampAjax";
import { AMPTextArea } from "../common";
import { toast } from "react-toastify";
import AMPFieldSet from "../common/AMPFieldSet";
import { AMPFieldWrapper } from "../common/AMPFieldWrapper";
import { AMPTab } from "../common/AMPTab";
import ReceivingPicturesModal from "../receivingForm/ReceivingPicturesModal";
import { Row, Col, Button, Table, Image, Container } from "react-bootstrap";
import InspectionFullForm from "./InspectionFullForm";
import {
  DEFAULT_BASE_URL,
  VERSION,
  SUBMIT_INSPECTION,
  SERVICE_CENTER_GAUGE,
  RETRIEVAL_INSPECTION_PICTURE,
  GET_INSPECTION_QUESTIONNAIRE,
  DELETE_INSPECTION_PICTURE_BY_ID_URL,
  RETRIEVAL_VIEW_INSPECTION_PICTURE_BY_ID_URL,
  GET_PARTTYPE_IMAGE,
  SUBMIT_COMMENT,
  GET_COMMENT_INSPECTION,
  GET_INSPECTION_DOCUMENT_LIST,
  DOWNLOAD_INSPECTION_DOCUMENT,
  DELETE_INSPECTION_DOCUMENT,
  GET_CYLINDER_DETAILS,
  GET_CENTER_LINE_DETAILS,
  GET_LINE_BORE_DETAILS,
  GET_BEARING_BORE_DIAMETER_DETAILS,
  ConstVariable,
  AMPMessage,
} from "../common/const";
import { AMPToastConsts } from "../common/const/AMPToastConst";
import AMPTooltip from "../common/AMPTooltip";
import AMPLoader from "../common/AMPLoader";
import AssemblyClearanceOrTorqueRange from "./AssemblyClearanceOrTorqueRange";
import AssemblyTorqueRange from "./AssemblyTorqueRange";
import { RecievingDocumentsForm } from "../receivingForm/RecievingDocumentsModal";
import { AssemblyPartDetails } from "./AssemblyPartDetails";
import { AMPErrorAlert } from "../common/AMPAlert";
import { ReplacementComponent } from "./ReplacementComponent";
import { useAccessState } from "../../utils/AppContext/loginContext";
import complete_icon from "../../styles/images/complete_icon.png";
import { BearingBoreDiameterDetails } from "./BearingBoreDiameterDetails";
import { LineBoreDetails } from "./LineBoreDetails";
import { CylinderDetails } from "./CylinderDetails";
import { CenterLineDetails } from "./CenterLineDetails";
import useUnsavedChangesWarning from "../common/hooks/useUnsavedChangesWarning";
import { AMPUpdateConfirmBox } from "../common/AMPUpdateConfirmBox";
import AMPAlertConfirmBox from "../common/AMPAlertConfirmBox";

// Get inspection Questionnaire api starts
const getInspectionQuestionnaireAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax
        .get(
          DEFAULT_BASE_URL +
          VERSION +
          GET_INSPECTION_QUESTIONNAIRE +
          params?.inspectionDetailId +
          "/" +
          params?.partTypeId +
          "/" +
          params?.inspectionTypeId +
          "/" +
          params?.index
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
// Get inspection Questionnaire api ends
// delete picture api starts
const deletePictureAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.delete(URL + params.id).pipe(
        map((xhrResponse) => {
          return xhrResponse?.response;
        }),
        catchError((error) => {
          console.error("Error in delete Picture", error);
          errorHandler(error.response);
          return [];
        })
      )
    )
  );
// delete picture api ends
//On Update New Questionnaire api starts
const submitInspectionAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.put(URL, params).pipe(
        map((xhrResponse) => {
          return xhrResponse;
        }),
        catchError((error) => {
          console.error("Error in submit inspection", error);
          errorHandler(error.response);
          return [];
        })
      )
    )
  ); // ENd of line

//On Submit Comment api starts
const submitCommentAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax
        .post(
          URL + "/" + params.inspectionDetailId + "/" + params?.RequestedById,
          {
            comment: params.comment,
          }
        )
        .pipe(
          map((xhrResponse) => {
            return xhrResponse;
          }),
          catchError((error) => {
            console.error("Error in submit comment", error);
            errorHandler(error.response);
            return [];
          })
        )
    )
  ); // ENd of line
// view picture by id api starts
const getPictureByIdAjaxObs$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax.get(URL + param.id).pipe(
        map((xhrResponse) => {
          return xhrResponse?.response;
        }),
        catchError((error) => {
          errorHandler(error.response);
          return [];
        })
      )
    )
  ); // view picture by id api ends

// view part Type image api starts
const getPartTypeImageAjaxObs$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax
        .get(
          URL +
          +param.partTypeId +
          "/" +
          param.pressureRatingId +
          "/" +
          param.serviceId +
          "/" +
          param.sizeId +
          "/" +
          param.styleId +
          "/" +
          param.variationId
        )
        .pipe(
          map((xhrResponse) => {
            return xhrResponse?.response;
          }),
          catchError((error) => {
            errorHandler(error.response);
            return [];
          })
        )
    )
  ); // view part Type image api ends

//Get all service gauge api starts
const getAllServiceCenterGaugeAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax
        .get(
          DEFAULT_BASE_URL + VERSION + SERVICE_CENTER_GAUGE + param + "/Value"
        )
        .pipe(
          map((xhrResponse) => {
            const filteredData = xhrResponse.response.content.map((item) => {
              return {
                label: item.gaugeId,
                value: item.id,
              };
            });
            return filteredData;
          }),
          catchError((error) => {
            return throwError(error);
          })
        )
    )
  ); //Get all service gauge api ends
//get inspection type picture list api starts
const getInspectionPictureListAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax
        .get(
          DEFAULT_BASE_URL +
          VERSION +
          RETRIEVAL_INSPECTION_PICTURE +
          param?.inspectionResponseId
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
  ); //get inspection type picture list api ends

//get inspection comment api starts
const getInspectionCommentAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax
        .get(
          DEFAULT_BASE_URL +
          VERSION +
          GET_COMMENT_INSPECTION +
          param.inspectionDetailId
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
  ); //get inspection comment api ends

// documents
const getDocumentListAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax
        .get(DEFAULT_BASE_URL + VERSION + GET_INSPECTION_DOCUMENT_LIST + params)
        .pipe(
          map((xhrResponse) => {
            return { ...xhrResponse?.response };
          }),
          catchError((error) => {
            return throwError(error);
          })
        )
    )
  );

const getDocumentDownloadAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((params) =>
      ampOctetStreamAjax
        .get(
          DEFAULT_BASE_URL + VERSION + DOWNLOAD_INSPECTION_DOCUMENT + params.id
        )
        .pipe(
          map((xhrResponse) => {
            return { ...xhrResponse, params };
          }),
          catchError((error) => {
            return throwError(error);
          })
        )
    )
  );

const deleteDocumentAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.delete(URL + params.id).pipe(
        map((xhrResponse) => {
          return { ...xhrResponse?.response, params };
        }),
        catchError((error) => {
          console.error("Error in delete document", error);
          errorHandler(error.response);
          return [];
        })
      )
    )
  );

// Bearing Bore Diameter Details
const getBearingBoreDiamenterDetailListAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax
        .get(URL + params?.inspectionDetailId + "/" + params?.partTypeId)
        .pipe(
          map((xhrResponse) => {
            return xhrResponse.response;
          }),
          catchError((error) => {
            errorHandler(error.response);
            return [];
          })
        )
    )
  );

// Line Bore Details
const getLineBoreDetailListAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax
        .get(URL + params?.inspectionDetailId + "/" + params?.partTypeId)
        .pipe(
          map((xhrResponse) => {
            return xhrResponse.response;
          }),
          catchError((error) => {
            errorHandler(error.response);
            return [];
          })
        )
    )
  );

// Center Line Details
const getCenterLineDetailListAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax
        .get(URL + params?.inspectionDetailId + "/" + params?.partTypeId)
        .pipe(
          map((xhrResponse) => {
            return xhrResponse.response;
          }),
          catchError((error) => {
            errorHandler(error.response);
            return [];
          })
        )
    )
  );

// Cylinder Details
const getCylinderDetailListAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax
        .get(URL + params?.inspectionDetailId + "/" + params?.partTypeId)
        .pipe(
          map((xhrResponse) => {
            return xhrResponse.response;
          }),
          catchError((error) => {
            errorHandler(error.response);
            return [];
          })
        )
    )
  );

const InspectionForm = () => {
  const { register, handleSubmit, watch, errors, setValue } = useForm({});
  const context = useAccessState();
  const locationRef = useLocation();
  const data = locationRef?.state?.data;
  const type = locationRef?.state?.type;
  const workId = locationRef?.state?.workId;
  const status = locationRef?.state?.status;
  const inspectionDetailId = locationRef?.state?.inspectionDetailId;
  const inspectionLevelId = locationRef?.state?.inspectionLevelId
  const inspectionTypeId = locationRef?.state?.inspectionTypeId
  const visualInspectionDetailId = locationRef?.state?.visualInspectionDetailId;
  const workOrderNumber = locationRef?.state?.workOrderNumber;
  const serviceCenterId = locationRef?.state?.serviceCenterId;
  const inspectionTypeStatus = locationRef?.state?.inspectionTypeStatus;
  const opmTabDetails = locationRef?.state?.opmTabDetails;
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [activeKey, setActiveKey] = useState();
  const [loader, setLoader] = useState(false);
  const [loaderData, setLoaderData] = useState(false);
  const [imageLoader, setPartTypeImageLoader] = useState(false);
  const [state, setState] = useState(false);
  const [showMoveToBack, setMoveToBack] = useState(false);
  const [active, setActive] = useState(0);
  const [stateIndex, setIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const [perPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [pictureList, setPictureList] = useState();
  const [inspectionQuickLinks, setInspectionQuickLinks] = useState();
  const [showInspectionPreviewPage, setInspectionPreviewPage] = useState();
  const [questionIndex, setQuestionIndex] = useState();
  const [paginationQuestionnaire, setPaginatedQuestionnaire] = useState(0);
  const [totalPageCount, setTotalPageCount] = useState(0);
  const [partTypeImageResult, setPartTypeImageResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState();
  const [showErrorMessage, setShowErrorMessage] = useState("");

  const [inspectionLevelIdForApiCall, setInspectionLevelIdForApiCall] = useState();

  const [isReplacementRequired, setIsReplacementRequired] = useState(false)

  const [alertErrorMessage, setAlertErrorMessage] = useState("initial");
  const [showStayMessage, setStayMessage] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPicture, setShowPicture] = useState({
    show: false,
    url: "",
    title: "",
  });
  const [partTypeImage, setPartTypeImage] = useState();
  const [documentList, setDocumentList] = useState([]);
  const [isError, setIsError] = useState(false);
  let history = useHistory();
  // For google analytics purpose
  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, [])
  const handleClick = (e) => {
    const index = parseInt(e.target.id, 0);
    if (index !== active) {
      setActive(index);
    }
  };

  const openPictureModal = (id) => {
    setState(false);
    setShowPictureModal(id);
  };
  const closePictureModal = () => {
    setShowPictureModal("");
  };

  const [showDeleteModal, setShowDeleteModal] = useState();

  // Bearing Bore Diameter Details Observables start

  const [bearingBoreData, setBearingBoreData] = useState(ConstVariable?.INIT);

  const ajaxBearingBoreDiamenterListObsv$ = useMemo(() => {
    return getBearingBoreDiamenterDetailListAjax$(
      DEFAULT_BASE_URL + VERSION + GET_BEARING_BORE_DIAMETER_DETAILS,
      {
        errorHandler: (error) => {
          setLoader(false);
          toast.error(AMPToastConsts.GET_PART_DETAILS_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  useObservableCallback(ajaxBearingBoreDiamenterListObsv$, (response) => {
    if (response) {
      setBearingBoreData(response?.content);
      setLoader(false);
    } else {
      setLoader(false);
      setBearingBoreData([]);
    }
  });

  useEffect(() => {
    if (
      data?.partTypeId &&
      inspectionDetailId &&
      (type?.id === 24 || type?.id === 25) &&
      opmTabDetails?.isBearingBoreApplicable
    ) {
      setLoader(true);
      ajaxBearingBoreDiamenterListObsv$.next({
        partTypeId: data?.partTypeId,
        inspectionDetailId,
      });
    }
  }, [
    data?.partTypeId,
    inspectionDetailId,
    type?.id,
    opmTabDetails?.isBearingBoreApplicable,
  ]);

  // Bearing Bore Diameter Details Observables end

  // Line Bore Details Observables start
  const [lineBoreData, setLineBoreData] = useState(ConstVariable?.INIT);

  const ajaxLineBoreDetailListObsv$ = useMemo(() => {
    return getLineBoreDetailListAjax$(
      DEFAULT_BASE_URL + VERSION + GET_LINE_BORE_DETAILS,
      {
        errorHandler: (error) => {
          setLoader(false);
          toast.error(AMPToastConsts.GET_PART_DETAILS_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  useObservableCallback(ajaxLineBoreDetailListObsv$, (response) => {
    if (response?.status) {
      setLineBoreData(response?.content);
      setLoader(false);
    } else {
      setLoader(false);
      setLineBoreData([]);
      toast.error(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });

  useEffect(() => {
    if (
      data?.partTypeId &&
      inspectionDetailId &&
      (type?.id === 24 || type?.id === 25) &&
      opmTabDetails?.isLineBoreReadingApplicable
    ) {
      setLoader(true);
      ajaxLineBoreDetailListObsv$.next({
        partTypeId: data?.partTypeId,
        inspectionDetailId: inspectionDetailId,
      });
    }
  }, [
    data?.partTypeId,
    inspectionDetailId,
    type?.id,
    opmTabDetails?.isLineBoreReadingApplicable,
  ]);

  // Line Bore Details Observables end

  // Center Line Details Observables start

  const [centerLineData, setCenterLineData] = useState(ConstVariable?.INIT);

  const ajaxCenterLineDetailListObsv$ = useMemo(() => {
    return getCenterLineDetailListAjax$(
      DEFAULT_BASE_URL + VERSION + GET_CENTER_LINE_DETAILS,
      {
        errorHandler: (error) => {
          setLoader(false);
          toast.error(AMPToastConsts.FETCH_CENTER_LINE_DETAILS_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  useObservableCallback(ajaxCenterLineDetailListObsv$, (response) => {
    if (response?.status) {
      setCenterLineData(response?.content);
      setLoader(false);
    } else {
      setLoader(false);
      setCenterLineData([]);
    }
  });

  useEffect(() => {
    if (
      data?.partTypeId &&
      inspectionDetailId &&
      (type?.id === 24 || type?.id === 25) &&
      opmTabDetails?.isCenterlineApplicable
    ) {
      setLoader(true);
      ajaxCenterLineDetailListObsv$?.next({
        partTypeId: data?.partTypeId,
        inspectionDetailId,
      });
    }
  }, [
    data?.partTypeId,
    inspectionDetailId,
    type?.id,
    opmTabDetails?.isCenterlineApplicable
  ])


  // Center Line Details Observables end

  // Cylinder Reading Observables start

  const [cylinderReading, setCylinderReading] = useState(ConstVariable?.INIT);

  const ajaxCylinderListObsv$ = useMemo(() => {
    return getCylinderDetailListAjax$(
      DEFAULT_BASE_URL + VERSION + GET_CYLINDER_DETAILS,
      {
        errorHandler: (error) => {
          setLoader(false);
          toast.error(AMPToastConsts.GET_PART_DETAILS_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  useObservableCallback(ajaxCylinderListObsv$, (response) => {
    if (response?.status) {
      setCylinderReading(response?.content);
      setLoader(false);
    } else {
      setLoader(false);
      setCylinderReading([]);
    }
  });

  useEffect(() => {
    if (
      data?.partTypeId &&
      inspectionDetailId &&
      (type?.id === 24 || type?.id === 25) &&
      opmTabDetails?.isCylinderReadingApplicable
    ) {
      setLoader(true);
      ajaxCylinderListObsv$.next({
        partTypeId: data?.partTypeId,
        inspectionDetailId,
      });
    }
  }, [
    data?.partTypeId,
    inspectionDetailId,
    type?.id,
    opmTabDetails?.isCylinderReadingApplicable,
  ]);

  // retrieving inspection pictures list
  const ajaxInspectionPictureListObsv$ = useMemo(() => {
    return getInspectionPictureListAjaxObs$();
  }, []);
  useObservableCallback(ajaxInspectionPictureListObsv$, (response) => {
    if (response?.status) {
      setLoader(false);
      setPictureList(response?.content);
    } else {
      setLoader(false);
      toast.error(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });

  // retrieving inspection comment
  const ajaxInspectionCommentObsv$ = useMemo(() => {
    return getInspectionCommentAjaxObs$();
  }, []);
  useObservableCallback(ajaxInspectionCommentObsv$, (response) => {
    if (response?.status) {
      setLoader(false);
      setValue("comment", response?.content[0]?.comment);
    } else {
      setLoader(false);
      toast.error(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });
  useEffect(() => {
    if (inspectionDetailId) {
      ajaxInspectionCommentObsv$.next({
        inspectionDetailId: inspectionDetailId,
      });
    }
  }, [ajaxInspectionCommentObsv$, inspectionDetailId]);
  // // For Update Work Order Form
  const submitInspection$ = useMemo(() => {
    return submitInspectionAjax$(
      DEFAULT_BASE_URL + VERSION + SUBMIT_INSPECTION,
      {
        errorHandler: (error) => {
          toast.error(AMPToastConsts.COMPLETE_INSPECTION_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  /* Observer for update response from ajax request */
  useObservableCallback(submitInspection$, (response) => {
    if (!response?.status) {
      toast.error(response.response.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      //fetch section
      setLoader(false);
      toast.success(AMPToastConsts.UPDATE_INSPECTION_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
      history.push({
        pathname: `/Pump/EditWorkOrder`,
        state: {
          isCreate: false,
          id: workId,
          status: status,
        },
      });
    }
  }); // ENd of line

  // // For Submit Comment tab
  const submitComment$ = useMemo(() => {
    return submitCommentAjax$(DEFAULT_BASE_URL + VERSION + SUBMIT_COMMENT, {
      errorHandler: (error) => {
        toast.error(AMPToastConsts.SUBMIT_COMMENT_ERROR, {
          position: toast.POSITION.TOP_CENTER,
        });
      },
    });
  }, []);
  /* Observer for update response from ajax request */
  useObservableCallback(submitComment$, (response) => {
    if (!response?.status) {
      toast.error(response.response.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      //fetch section
      setLoader(false);
      toast.success(AMPToastConsts.SUBMIT_COMMENT_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  }); // ENd of line
  const onSubmit = (formData) => {
    setLoader(true);
    if (formData?.comment) {
      submitComment$.next({
        inspectionDetailId: inspectionDetailId,
        comment: formData?.comment,
        RequestedById: parseInt(context?.userId),
      });
    }
  };
  const onCompleteInspection = (formData) => {
    if (
      (type?.id === 24 || type?.id === 25) &&
      opmTabDetails?.isBearingBoreApplicable &&
      paginationQuestionnaire?.isRespondedYes !== true &&
      bearingBoreData?.some(
        (i) => i?.readings[0]?.inspectionBoreDetailId === ConstVariable?.DID
      )
    ) {
      setIsError(
        "All bearing bore readings are mandatory to complete the inspection check."
      );
    } else if (
      (type?.id === 24 || type?.id === 25) &&
      opmTabDetails?.isLineBoreReadingApplicable &&
      paginationQuestionnaire?.isRespondedYes !== true &&
      lineBoreData?.some(
        (i) => i?.readings[0]?.inspectionBoreDetailId === ConstVariable?.DID
      )
    ) {
      setIsError(
        "All line bore readings are mandatory to complete the inspection check."
      );
    } else if (
      (type?.id === 24 || type?.id === 25) &&
      opmTabDetails?.isCenterlineApplicable &&
      paginationQuestionnaire?.isRespondedYes !== true &&
      centerLineData?.some(
        (i) => i?.inspectionBoreDetailId === ConstVariable?.DID
      )
    ) {
      setIsError(
        "All center line readings are mandatory to complete the inspection check."
      );
    } else if (
      (type?.id === 24 || type?.id === 25) &&
      opmTabDetails?.isCylinderReadingApplicable &&
      paginationQuestionnaire?.isRespondedYes !== true &&
      cylinderReading?.some(
        (i) => i?.inspectionCylinderDetailId === ConstVariable?.DID
      )
    ) {
      setIsError(
        "All cylinder readings are mandatory to complete the inspection check."
      );
    } else if ((type?.id === 18 ||
      (type?.id === 24 && paginationQuestionnaire?.isRespondedYes !== true)) &&
      documentList?.length === 0) {
      setIsError("Please upload at least 1 document");
    } else {
      setIsError(false);
      const ajaxParams = {
        workorderAssetId: data?.workorderAssetId,
        inspectionTypeId: type?.id,
        requestedById: parseInt(context?.userId),
        assetStatus:
          paginationQuestionnaire?.isRespondedYes === true
            ? ConstVariable?.SCRAP
            : data?.assetStatusId,
        manufacturerSerialNumber: data?.manufacturerSerialNumber,
        ServiceCenterId: serviceCenterId,
        IsReplacementRequired:  isReplacementRequired
      };
      setLoader(true);
      submitInspection$.next(ajaxParams);
    }
  };

  const [gauge, setGauge] = useState([]);
  const [completed, setCompleted] = useState();
  const [inspectionStatus, setInspectionStatus] = useState();
  const [showDocumentModal, setShowDocumentModal] = useState();
  const serviceCenterGaugeObsv$ = useMemo(() => {
    return getAllServiceCenterGaugeAjaxObs$();
  }, []);
  useObservableCallback(
    serviceCenterGaugeObsv$,
    (response) => {
      setLoader(false);
      setGauge(response);
    },
    []
  );
  useEffect(() => {
    if (serviceCenterId) {
      serviceCenterGaugeObsv$.next(serviceCenterId);
    }
  }, [serviceCenterId]);

  //Get Inspection Questionnaire api starts
  const ajaxInspectionQuestionnaireObsv$ = useMemo(() => {
    return getInspectionQuestionnaireAjaxObs$();
  }, []);
  useObservableCallback(
    ajaxInspectionQuestionnaireObsv$,
    (response) => {
      if (response?.status) {
        if (response?.content?.totalcount > 0) {
          setLoader("");
          setLoaderData("");
        } else if (response?.content?.totalcount == 0) {
          setLoader("No Data Found");
          setLoaderData("No Data Found");
        } else if (response?.message === "Inspection Completed.") {
          setLoader("Questionnaire Submitted Successfully");
          setCompleted(response?.message);
        }

        if (
          response?.content?.data &&
          response?.content?.data[0]?.numberofPic > 0
        ) {
          setShowErrorMessage("");
        }
        setPaginatedQuestionnaire(
          response?.content?.data
            ? response?.content?.data[0]
            : response?.content
        );
        setSelectedAnswer(response?.content?.data[0]?.response);
        setInspectionStatus(response?.content?.inspectionStatus);
        setInspectionQuickLinks({
          id: response?.content?.data[0]?.responseId,
          questionId: response?.content?.data[0]?.questionId,
          response: response?.content?.data[0]?.response,
        });

        setCompleted(response?.message);
        //}
        setTotalPageCount(response?.content?.totalcount);
        setQuestionIndex(
          response?.content?.questionIndex === 0
            ? 1
            : response?.content?.questionIndex
        );
        setPageCount(Math.ceil(response?.content?.totalcount / perPage));
      }
    },
    []
  ); // Get Inspection Questionnaire api ends

  // Get part type Image id starts
  const ajaxPartTypeImageObs$ = useMemo(() => {
    return getPartTypeImageAjaxObs$(
      DEFAULT_BASE_URL + VERSION + GET_PARTTYPE_IMAGE,
      {
        errorHandler: (error) => {
          setPartTypeImageLoader(false);

          toast.error(AMPToastConsts.PICTURE_VIEW_BY_ID_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  useObservableCallback(
    ajaxPartTypeImageObs$,
    (response) => {
      setPartTypeImageLoader(false);
      setPartTypeImageResult(response);
    },
    []
  );

  useEffect(() => {
    if (data?.partTypeId) {
      setLoader("loading");
      ajaxInspectionQuestionnaireObsv$.next({
        inspectionDetailId: inspectionDetailId,
        partTypeId: data?.partTypeId,
        inspectionTypeId: type?.id,
        index: offset,
      });
    }
  }, [data?.partTypeId, offset, showPictureModal]);
  useEffect(() => {
    if (ajaxPartTypeImageObs$) {
      setPartTypeImageLoader("loading");
      ajaxPartTypeImageObs$.next({
        partTypeId: data?.partTypeId,
        pressureRatingId: data?.pressureRatingId,
        serviceId: data?.serviceId,
        sizeId: data?.sizeId,
        styleId: data?.styleId,
        variationId: data?.designationId,
      });
    }
  }, [ajaxPartTypeImageObs$]);

  // view picture
  const ajaxPictureByIdObsv$ = useMemo(() => {
    return getPictureByIdAjaxObs$(
      DEFAULT_BASE_URL + VERSION + RETRIEVAL_VIEW_INSPECTION_PICTURE_BY_ID_URL,
      {
        errorHandler: (error) => {
          setLoader(false);
          setShowPicture({
            show: false,
            url: "",
            title: "",
          });
          toast.error(AMPToastConsts.PICTURE_VIEW_BY_ID_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  useObservableCallback(ajaxPictureByIdObsv$, (response) => {
    if (response?.status) {
      setLoader(false);
      setShowPicture({
        show: true,
        url: response?.content?.fileBinary,
        title: response?.content?.name,
      });
    } else {
      setLoader(false);
      setShowPicture({
        show: false,
        url: "",
        title: "",
      });
      toast.error(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });

  // delete picture
  const deletePicture$ = useMemo(() => {
    return deletePictureAjax$(
      DEFAULT_BASE_URL + VERSION + DELETE_INSPECTION_PICTURE_BY_ID_URL,
      {
        errorHandler: (error) => {
          toast.error(AMPToastConsts.PICTURE_DELETE_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  });
  useObservableCallback(deletePicture$, (response) => {
    if (response?.status) {
      setShowDeleteModal("");
      ajaxInspectionPictureListObsv$.next({
        inspectionResponseId:
          paginationQuestionnaire?.responseId || inspectionResponseId,
      });
      setLoader(true);
      toast.success(AMPToastConsts.PICTURE_DELETE_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      setShowDeleteModal("");
      toast.error(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });

  // documents
  const ajaxDocumentListObsv$ = useMemo(() => {
    return getDocumentListAjaxObs$();
  }, []);

  useObservableCallback(
    ajaxDocumentListObsv$,
    (response) => {
      setIsError(false);
      setLoader(false);
      setDocumentList(response?.content?.data);
    },
    []
  );

  useEffect(() => {
    if (
      ajaxDocumentListObsv$ &&
      inspectionDetailId &&
      (type?.id === 17 || type?.id === 18 || type?.id === 19 || type?.id === 24)
    ) {
      ajaxDocumentListObsv$.next(inspectionDetailId);
      setLoader(true);
    }
  }, [ajaxDocumentListObsv$, inspectionDetailId, type?.id]);

  const ajaxDocumentDownloadObsv$ = useMemo(() => {
    return getDocumentDownloadAjaxObs$();
  }, []);

  useObservableCallback(
    ajaxDocumentDownloadObsv$,
    (response) => {
      downloadFile(response?.response, `${response?.params?.name}.pdf`);
      setLoader(false);
      toast.success(AMPToastConsts.DOCUMENT_DOWNLOAD_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
    },
    []
  );
  const downloadFile = (contentData, fileName) => {
    let blob = new Blob([contentData], { type: contentData.type });
    if (typeof window.navigator.msSaveBlob !== "undefined") {
      //IE workaround
      window.navigator.msSaveBlob(blob, fileName);
    } else {
      let url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }
  };

  const deleteDocument$ = useMemo(() => {
    return deleteDocumentAjax$(
      DEFAULT_BASE_URL + VERSION + DELETE_INSPECTION_DOCUMENT,
      {
        errorHandler: (error) => {
          toast.error(AMPToastConsts.DOCUMENT_DELETE_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  });
  useObservableCallback(deleteDocument$, (response) => {
    if (response?.status) {
      setShowDeleteModal("");
      ajaxDocumentListObsv$.next(response?.params?.wOrderId);
      setLoader(true);
      toast.success(AMPToastConsts.DOCUMENT_DELETE_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      toast.error(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });

  //Part Type header section
  const PartTypeHeader = () => {
    return (
      <AMPFieldSet fieldBgColor="bg_lightGrey p-0">
        <Row>
          <Col lg={10} md={10} sm={8} xs={10} className="mb-4 mt-2">
            <div className="mb-4 mt-2">
              <div>
                <span className="font-weight-bold">Work Order Number:</span>
                {workOrderNumber}
              </div>
              <div>
                <span className="font-weight-bold">Serial Number:</span>
                {data?.manufacturerSerialNumber}
              </div>
              <div>
                <span className="font-weight-bold">Part Number:</span>
                {data?.partTypeName} ({data?.description})
              </div>
            </div>
          </Col>
          <Col lg={2} md={2} sm={4} xs={2}>
            {partTypeImageResult?.status === false ? (
              <img
                className="img_partType_gif"
                src={
                  // window.location.origin +
                  // "/Pump" +
                  "src/styles/images/noImage.png"
                }
              />
            ) : (
              <img
                className="img_partType_gif"
                src={partTypeImageResult?.content?.uploadedImage}
              />
            )}
          </Col>
        </Row>
      </AMPFieldSet>
    );
  };
  const moveToBack = () => {
    setMoveToBack(true);
    history.push({
      pathname: `/Pump/EditWorkOrder`,
      state: {
        isCreate: false,
        id: workId,
        status: status,
      },
    });
  };

  // for receiving document modal
  const openDocumentModal = (id) => {
    setState(false);
    setShowDocumentModal(id);
  };
  const closeDocumentModal = () => {
    setShowDocumentModal("");
  };
  const hidePicture = () => {
    setShowPicture({
      show: false,
      url: "",
      title: "",
    });
  };


  const [showData, setShowData] = useState("0");
  const onConfirmSubmit = () => {
    setShowData(showConfirmModal)
    setShowConfirmModal(false);
    setAlertErrorMessage(false)
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setStayMessage(true);
  };
  const handleSelect = (key) => {
    if (alertErrorMessage !== true) {
      setShowData(key);
    } else {
      setShowConfirmModal(key);
    }
  };


  return (
    <div className="mb-5">
      {loader === "loading" ||
        (imageLoader === "loading" && (
          <AMPLoader isLoading={loader || imageLoader} />
        ))}
      <div className="float-left btn-control-action-icons-group ml-2">
        <button
          aria-label="Back"
          name="Back"
          type="button"
          className="amp-button button-mini mt-2 icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-lg"
          onClick={moveToBack}
        >
          <AMPTooltip text="Back" placement="bottom">
            <svg
              fill="currentColor"
              viewBox="0 0 512 512"
              xmlns="http://www.w3.org/2000/svg"
              className="svg-inline--fa ifx-svg-icon ifx-svg-back fa-w-16 ifx-icon"
            >
              <path
                d="M256,0C114.844,0,0,114.844,0,256s114.844,256,256,256s256-114.844,256-256S397.156,0,256,0z M256,490.667
 C126.604,490.667,21.333,385.396,21.333,256S126.604,21.333,256,21.333S490.667,126.604,490.667,256S385.396,490.667,256,490.667
 z"
              ></path>
              <path
                d="M394.667,245.333H143.083l77.792-77.792c4.167-4.167,4.167-10.917,0-15.083c-4.167-4.167-10.917-4.167-15.083,0l-96,96
 c-4.167,4.167-4.167,10.917,0,15.083l96,96c2.083,2.083,4.813,3.125,7.542,3.125c2.729,0,5.458-1.042,7.542-3.125
 c4.167-4.167,4.167-10.917,0-15.083l-77.792-77.792h251.583c5.896,0,10.667-4.771,10.667-10.667S400.563,245.333,394.667,245.333
 z"
              ></path>
            </svg>
          </AMPTooltip>
        </button>
      </div>
      <p>
        <span className="receiving-tag">
          {type?.value}
          {inspectionTypeStatus === 3 && (
            <img
              className="mx-2 mb-1"
              src={complete_icon}
              alt=""
              width="24"
              height="24"
            />
          )}
        </span>
      </p>
      <div id="results" className="form-container bg-form p-2 mb-4">
        {PartTypeHeader()}
        {isError && <AMPErrorAlert show={true}>{isError}</AMPErrorAlert>}
        <AMPFieldSet fieldBgColor="bg_lightGrey pl-0 pr-0 pt-0">
          <AMPTab
            className="pt-5"
            activeKey={showData}
            handleSelect={(e) => handleSelect(e)}
            onChange={(v) => {
              if ((alertErrorMessage !== true)) {
                setActiveKey(v);
              } else {
                setShowConfirmModal(true);
              }
            }}
          >
            <div name="Questionnaire">
              <InspectionFullForm
                data={data}
                openPictureModal={openPictureModal}
                type={type}
                partTypeId={data?.partTypeId}
                inspectionDetailId={inspectionDetailId}
                setPageCount={setPageCount}
                pageCount={pageCount}
                setPaginatedQuestionnaire={setPaginatedQuestionnaire}
                paginationQuestionnaire={paginationQuestionnaire}
                questionIndex={questionIndex}
                totalPageCount={totalPageCount}
                setTotalPageCount={setTotalPageCount}
                ajaxInspectionQuestionnaireObsv$={
                  ajaxInspectionQuestionnaireObsv$
                }
                setOffset={setOffset}
                offset={offset}
                setInspectionQuickLinks={setInspectionQuickLinks}
                inspectionQuickLinks={inspectionQuickLinks}
                setInspectionPreviewPage={setInspectionPreviewPage}
                showInspectionPreviewPage={showInspectionPreviewPage}
                status={status}
                workOrderNumber={workOrderNumber}
                serviceCenterId={serviceCenterId}
                workId={workId}
                loader={loader}
                setLoader={setLoader}
                setSelectedAnswer={setSelectedAnswer}
                selectedAnswer={selectedAnswer}
                completed={completed}
                inspectionStatus={inspectionStatus}
                showErrorMessage={showErrorMessage}
                setShowErrorMessage={setShowErrorMessage}
                setLoaderData={setLoaderData}
                loaderData={loaderData}
                opmTabDetails={opmTabDetails}
                inspectionTypeId={inspectionTypeId}
                inspectionTypeStatus={inspectionTypeStatus}
                setInspectionLevelIdForApiCall={setInspectionLevelIdForApiCall}
              />
            </div>
            {/* level 1 inspection tab starts */}

            {(type?.id === 1 || type?.id === 14) && (
              <div
                name="Replacement Components"
                disabled={completed !== "Inspection Completed."}
              >
                <ReplacementComponent
                  inspectionLevelIdForApiCall={inspectionLevelIdForApiCall}
                  inspectionLevelId={inspectionLevelId}
                  inspectionTypeId={inspectionTypeId}
                  partTypeId={data?.partTypeId}
                  partTypeName={data?.partTypeName}
                  inspectionDetailId={inspectionDetailId}
                  visualInspectionDetailId={
                    type?.id === 14 ? visualInspectionDetailId : ""
                  }
                  inspectionTypeStatus={inspectionTypeStatus}
                  type={type}
                  completed={completed}
                  alertErrorMessage={alertErrorMessage}
                  setAlertErrorMessage={setAlertErrorMessage}
                  setIsReplacementRequired={setIsReplacementRequired}
                />
              </div>
            )}
            {type?.id === 16 && (
              <div
                name="Part Details"
                disabled={completed !== "Inspection Completed."}
              >
                <AssemblyPartDetails
                  // type="partDetails"
                  title="Part Details"
                  partTypeId={data?.partTypeId}
                  customerId={data?.customerId}
                  manufacturerId={data?.manufacturerId}
                  inspectionDetailId={inspectionDetailId}
                  inspectionTypeStatus={inspectionTypeStatus}
                  type={type}
                  completed={completed}
                  alertErrorMessage={alertErrorMessage}
                  setAlertErrorMessage={setAlertErrorMessage}
                />
              </div>
            )}
            {(type?.id === 11 || type?.id === 16) && (
              <div
                name="Clearance Range Details"
                disabled={completed !== "Inspection Completed."}
              >
                <AssemblyClearanceOrTorqueRange
                  // type="clearance"
                  title="Clearance Range Details"
                  partTypeId={data?.partTypeId}
                  customerId={data?.customerId}
                  manufacturerId={data?.manufacturerId}
                  inspectionDetailId={inspectionDetailId}
                  gauge={gauge}
                  inspectionTypeStatus={inspectionTypeStatus}
                  type={type}
                  completed={completed}
                  alertErrorMessage={alertErrorMessage}
                  setAlertErrorMessage={setAlertErrorMessage}
                />
              </div>
            )}
            {(type?.id === 11 || type?.id === 16) && (
              <div
                name="Torque Range Details"
                disabled={completed !== "Inspection Completed."}
              >
                <AssemblyTorqueRange
                  // type="torque"
                  title="Torque Range Details"
                  partTypeId={data?.partTypeId}
                  customerId={data?.customerId}
                  manufacturerId={data?.manufacturerId}
                  inspectionDetailId={inspectionDetailId}
                  gauge={gauge}
                  inspectionTypeStatus={inspectionTypeStatus}
                  type={type}
                  completed={completed}
                  alertErrorMessage={alertErrorMessage}
                  setAlertErrorMessage={setAlertErrorMessage}
                />
              </div>
            )}

            {/* Level 1 Inspection Tabs ENds */}
            {(type?.id === 24 || type?.id === 25) && (opmTabDetails?.isBearingBoreApplicable === true) && (

              <div
                name="Bearing Bore Diameter Reading"
                disabled={completed !== "Inspection Completed." || (paginationQuestionnaire?.inspectionType === "OPMInspection" && paginationQuestionnaire?.isRespondedYes === true)}
              >
                <BearingBoreDiameterDetails
                  // title="Bearing Bore Diameter Details"
                  partTypeId={data?.partTypeId}
                  loader={loader}
                  setLoader={setLoader}
                  bearingBoreData={bearingBoreData}
                  setBearingBoreData={setBearingBoreData}
                  inspectionDetailId={inspectionDetailId}
                  inspectionTypeStatus={inspectionTypeStatus}
                  type={type}
                  completed={completed}
                  setIsError={setIsError}
                  alertErrorMessage={alertErrorMessage}
                  setAlertErrorMessage={setAlertErrorMessage}
                />
              </div>
            )}
            {(type?.id === 24 || type?.id === 25) && (opmTabDetails?.isLineBoreReadingApplicable === true) && (
              <div
                name="Line Bore Reading"
                disabled={completed !== "Inspection Completed." || (paginationQuestionnaire?.inspectionType === "OPMInspection" && paginationQuestionnaire?.isRespondedYes === true)}
              >
                <LineBoreDetails
                  // title="Line Bore Details"
                  partTypeId={data?.partTypeId}
                  loader={loader}
                  setLoader={setLoader}
                  lineBoreData={lineBoreData}
                  setLineBoreData={setLineBoreData}
                  inspectionDetailId={inspectionDetailId}
                  inspectionTypeStatus={inspectionTypeStatus}
                  type={type}
                  completed={completed}
                  setIsError={setIsError}
                  alertErrorMessage={alertErrorMessage}
                  setAlertErrorMessage={setAlertErrorMessage}
                />
              </div>)}
            {(type?.id === 24 || type?.id === 25) && (opmTabDetails?.isCenterlineApplicable === true) && (
              <div
                name="Center Line Reading"
                disabled={completed !== "Inspection Completed." || (paginationQuestionnaire?.inspectionType === "OPMInspection" && paginationQuestionnaire?.isRespondedYes === true)}
              >
                <CenterLineDetails
                  // title="Center Line Details"
                  partTypeId={data?.partTypeId}
                  loader={loader}
                  setLoader={setLoader}
                  centerLineData={centerLineData}
                  setCenterLineData={setCenterLineData}
                  inspectionDetailId={inspectionDetailId}
                  inspectionTypeStatus={inspectionTypeStatus}
                  type={type}
                  completed={completed}
                  setIsError={setIsError}
                  alertErrorMessage={alertErrorMessage}
                  setAlertErrorMessage={setAlertErrorMessage}
                />
              </div>)}
            {(type?.id === 24 || type?.id === 25) && (opmTabDetails?.isCylinderReadingApplicable === true) && (
              <div
                name="Cylinder Reading"
                disabled={completed !== "Inspection Completed." || (paginationQuestionnaire?.inspectionType === "OPMInspection" && paginationQuestionnaire?.isRespondedYes === true)}
              >
                <CylinderDetails
                  // title="Cylinder Details"
                  partTypeId={data?.partTypeId}
                  loader={loader}
                  setLoader={setLoader}
                  cylinderReading={cylinderReading}
                  setCylinderReading={setCylinderReading}
                  inspectionDetailId={inspectionDetailId}
                  inspectionTypeStatus={inspectionTypeStatus}
                  type={type}
                  completed={completed}
                  setIsError={setIsError}
                  alertErrorMessage={alertErrorMessage}
                  setAlertErrorMessage={setAlertErrorMessage}
                />

              </div>)}
            {(type?.id === 17 ||
              type?.id === 18 ||
              type?.id === 19 ||
              type?.id === 24) && (
                <div
                  name={
                    type?.id === 24
                      ? "Power Frame and Repair (Document Upload)"
                      : "Upload Documents"
                  }
                  disabled={completed !== "Inspection Completed." || paginationQuestionnaire?.isRespondedYes === true}
                >
                  <div className="text-center pt-2 font-weight-bold">
                    Upload Documents
                  </div>
                  <div className="text-center pt-2 font-weight-bold">
                    <Link
                      to={{
                        pathname: "",
                        state: {
                          isCreate: false,
                          id: data?.workorderAssetId,
                          status: status,
                          isReceiving: false,
                          isBilling: false,
                          data: data,
                          type: type,
                          workId: workId,
                          inspectionDetailId: inspectionDetailId,
                          workOrderNumber: workOrderNumber,
                          serviceCenterId: serviceCenterId,
                          inspectionTypeStatus: inspectionTypeStatus,
                          type: type,
                          completed: completed,
                          opmTabDetails: opmTabDetails,
                        },
                      }}
                      onClick={() => openDocumentModal(inspectionDetailId)}
                    >
                      Documents ({documentList?.length})
                    </Link>
                  </div>
                </div>
              )}
            <div name="Comments" commentClass="bg_dark-blue">
              <form onSubmit={handleSubmit(onSubmit)}>
                <AMPFieldSet fieldBgColor="bg_lightGrey">
                  <AMPFieldWrapper
                    colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                    label="Comment"
                    controlId="comment"
                    name="comment"
                  >
                    <AMPTextArea ref={register} />
                  </AMPFieldWrapper>
                  {inspectionTypeStatus !== 3 && (
                    <div className="float-right mt-2">
                      <Button
                        type="submit"
                        variant="success"
                        className="mr-2 form-button p-1"
                        size="xs"
                      >
                        Save Comment
                      </Button>
                    </div>
                  )}
                </AMPFieldSet>
              </form>
            </div>
          </AMPTab>
        </AMPFieldSet>
        {((!paginationQuestionnaire &&
          completed === "Inspection Completed." &&
          inspectionTypeStatus !== 3) ||
          (paginationQuestionnaire?.inspectionType === "OPMInspection" &&
            completed === "Inspection Completed." &&
            paginationQuestionnaire?.statusId !== 3)) && (
            <div className="float-right p-3 mb-5">
              <Button
                type="submit"
                variant="primary"
                className="mb-2"
                size="xs"
                onClick={() => {
                  onCompleteInspection();
                }}
              >
                Complete {type?.value}
              </Button>
            </div>
          )}
        {showPictureModal && (
          <ReceivingPicturesModal
            modalName="Inspection Pictures"
            wOrderId={showPictureModal}
            closePictureModal={closePictureModal}
            state={state}
            // showPicture={false}
            loader={loader}
            setLoader={setLoader}
            isInspection={true}
            pictureList={pictureList}
            ajaxPictureByIdObsv$={ajaxPictureByIdObsv$}
            ajaxInspectionPictureListObsv$={ajaxInspectionPictureListObsv$}
            inspectionResponseId={
              inspectionQuickLinks?.id !== ConstVariable?.DID
                ? inspectionQuickLinks?.id
                : paginationQuestionnaire?.responseId
            }
            paginationQuestionnaire={paginationQuestionnaire}
            showPicture={showPicture}
            hidePicture={hidePicture}
            showDeleteModal={showDeleteModal}
            setShowDeleteModal={setShowDeleteModal}
            deletePicture$={deletePicture$}
            setState={setState}
          />
        )}
        {showDocumentModal && (
          <RecievingDocumentsForm
            modalName="Inspection Documents"
            isInspection={inspectionDetailId}
            wOrderId={showDocumentModal}
            closeDocumentModal={closeDocumentModal}
            state={state}
            setState={setState}
            loader={loader}
            setLoader={setLoader}
            documentList={documentList}
            ajaxDocumentListObsv$={ajaxDocumentListObsv$}
            ajaxDocumentDownloadObsv$={ajaxDocumentDownloadObsv$}
            showDeleteModal={showDeleteModal}
            setShowDeleteModal={setShowDeleteModal}
            deleteDocument$={deleteDocument$}
          />
        )}
      </div>
      {showConfirmModal && (
        <AMPAlertConfirmBox
          modalName=""
          confirmationMessage={AMPMessage?.UNSAVED_ALERT_MESSAGE}
          closeModal={closeConfirmModal}
          showConfirmModal={showConfirmModal}
          setShowConfirmModal={setShowConfirmModal}
          onConfirmSubmit={onConfirmSubmit}
        />
      )}
    </div>
  );
};
export default InspectionForm;
