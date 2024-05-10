import React, { useState, useEffect, useRef, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import ReactGA from 'react-ga';
import { useReactToPrint } from "react-to-print";
import { toast } from "react-toastify";
import { Redirect, useLocation } from "react-router-dom";

import {
  ADD_PICKUP_PICTURE_URL,
  ADD_PICKUP_SIGNATURE_URL,
  ConstVariable,
  cursor,
  DELETE_PICKUP_BY_ID_URL,
  DELETE_PICKUP_DOCUMENT_BY_WORKORDERASSETID,
  DOWNLOAD_PICKUP_DOCUMENT_BY_WORKORDERASSETID,
  GENERATE_PICKUP_NUMBER,
  GET_PICKUP_BY_ID,
  GET_PICKUP_DOCUMENT_LIST_BY_WORKORDERASSETID,
  GET_WORK_ORDER_SERIAL_NUMBER,
  RETRIEVAL_VIEW_PICKUP_PICTURE_BY_ID_URL,
} from "../common/const";

import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";
import {
  DEFAULT_BASE_URL,
  VERSION,
  GET_ALL_LOCATION,
  GET_ALL_MANUFACTURER,
  ADD_PICTURE_URL,
  RETRIEVAL_RECEIVING_PICTURE_BY_WORK_ORDER_ID_URL,
  RETRIEVAL_PICKUP_IMAGE_URL,
  RETRIEVAL_VIEW_PICTURE_BY_ID_URL,
  DELETE_PICTURE_BY_ID_URL,
} from "../common/const";
import { ampJsonAjax, ampOctetStreamAjax } from "../common/utils/ampAjax";

import { useAccessState } from "../../utils/AppContext/loginContext";
import AMPTooltip from "../common/AMPTooltip";
import { SignatureModal } from "../receivingForm/SignatureModal";
import ReceivingPicturesModal from "../receivingForm/ReceivingPicturesModal";
import { RecievingDocumentsForm } from "../receivingForm/RecievingDocumentsModal";
import { CreateOrUpdatePickUp } from "./createOrUpdatePickUp";
import { AMPToastConsts } from "../common/const/AMPToastConst";

const getPickupPictureListAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax
        .post(DEFAULT_BASE_URL + VERSION + RETRIEVAL_PICKUP_IMAGE_URL, param)
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

// view picture
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
  );

// delete picture
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
// documents
const getDocumentListAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax
        .post(
          DEFAULT_BASE_URL +
          VERSION +
          GET_PICKUP_DOCUMENT_LIST_BY_WORKORDERASSETID,
          params
        )
        .pipe(
          map((xhrResponse) => {
            return xhrResponse.response;
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
          DEFAULT_BASE_URL +
          VERSION +
          DOWNLOAD_PICKUP_DOCUMENT_BY_WORKORDERASSETID +
          params.id
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
          console.error("Error in delete Picture", error);
          errorHandler(error.response);
          return [];
        })
      )
    )
  );
// Upload Signature
const uploadSignatureAjaxObsv$ = (body) =>
  ampJsonAjax
    .postFile(DEFAULT_BASE_URL + VERSION + ADD_PICKUP_PICTURE_URL, body)
    .pipe(
      map((xhrResponse) => {
        props.ajaxPictureListObsv$.next({ workOrderId: props.workOrderId });
        props.setIsPictureLoading(true);
        return { ...xhrResponse.response };
      }),
      catchError((error) => {
        return throwError(error);
      })
    );
//get by Pickup Id

const getPickUpByIdAjax$ = () =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax
        .post(DEFAULT_BASE_URL + VERSION + GET_PICKUP_BY_ID, params)
        .pipe(
          map((xhrResponse) => {
            return { ...xhrResponse.response, params };
          }),
          catchError((error) => {
            return throwError(error);
          })
        )
    )
  ); //ENd Of Line
//get by Pickup Id

const getGeneratedPickUpNumberAjax$ = () =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.get(DEFAULT_BASE_URL + VERSION + GENERATE_PICKUP_NUMBER).pipe(
        map((xhrResponse) => {
          return { ...xhrResponse.response, params };
        }),
        catchError((error) => {
          return throwError(error);
        })
      )
    )
  ); //ENd Of Line
const PickUpEntryForm = (props) => {
  const locationRef = useLocation();
  const workId = locationRef?.state?.id || params?.get("workOrderId");
  const params = new window.URLSearchParams(window.location.search);
  const [showSearch, setMoveToSearch] = useState(false);
  const [statusInfo, setStatus] = useState(null);
  const componentRef = useRef();
  const isCreate = locationRef?.state?.isCreate;
  const workAssetId = locationRef?.state?.WOrkorderAssetID;
  const moveToBack = () => {
    setMoveToSearch(true);
  };
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  // For google analytics purpose
  useEffect(()=>{
    ReactGA.pageview(window.location.pathname + window.location.search);
  },[])
  return (
    <div>
      {showSearch && (
        <Redirect
          to={{
            pathname: `/Pump/PickUp`,
          }}
        />
      )}
      <p>
        {statusInfo === 3 && (
          <div className="float-right mt-3 mr-4">
            <button onClick={handlePrint}>
              <i className="fa fa-print" aria-hidden="true"></i> Print
            </button>
          </div>
        )}
        <div className="mb-1 ml-2">
          <button
            aria-label="Back"
            name="Back"
            type="button"
            className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-lg"
            onClick={moveToBack}
          >
            <AMPTooltip text="Back">
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
          {isCreate && statusInfo !== 3 && (
            <span className="receiving-tag mx-1">Initiate Pickup Entry Form</span>
          )}
          {!isCreate && statusInfo !== 3 && (
            <span className="receiving-tag mx-1">Edit Pickup Entry Form</span>
          )}
          {statusInfo === 3 && (
            <span className="receiving-tag mx-1">View Pickup Entry Form</span>
          )}
        </div>
      </p>
      <PickUpEntryFormResults
        isCreate={isCreate}
        workId={workId}
        handlePrint={handlePrint}
        componentRef={componentRef}
        workAssetId={workAssetId}
        setStatus={setStatus}
        statusInfo={statusInfo}
      />
    </div>
  );
};

const PickUpEntryFormResults = (props) => {
  const { handleSubmit, reset, watch, control, register, setValue, getValues } =
    useForm({});

  const {
    isCreate,
    workId,
    handlePrint,
    componentRef,
    workAssetId,
    setStatus,
    statusInfo,
  } = props;
  const params = new window.URLSearchParams(window.location.search);
  const [pickupId, setPickUpId] = useState(ConstVariable.DID);
  const context = useAccessState();
  let loggedUserName = `${context.firstName} ${context?.lastName}`;
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  const [state, setState] = useState(false);
  
  const [signUrl, setSignUrl] = useState(null);
  const openSignatureModal = () => setShowSignatureModal(true);
  const closeSignatureModal = () => setShowSignatureModal(false);

  // for receiving picture modal
  const openPictureModal = (id) => {
    setState(false);
    setShowPictureModal(id);
  };
  const closePictureModal = () => {
    setShowPictureModal("");
    setLoader(true);
    getPickUpById$.next({
      PickupId: pickupId || ConstVariable.DID,
      WOrkorderAssetID: workAssetId,
    });
  };

  // for receiving document modal
  const openDocumentModal = (id) => {
    setState(false);
    setShowDocumentModal(id);
  };
  const closeDocumentModal = (isCreate) => {
    setShowDocumentModal("");
    setLoader(true);
    getPickUpById$.next({
      PickupId: pickupId || ConstVariable.DID,
      WOrkorderAssetID: workAssetId,
    });
  };

  //Get work order By id memo function
  const getPickUpById$ = useMemo(() => {
    return getPickUpByIdAjax$({
      errorHandler: (error) => {
        toast.error(AMPToastConsts.RECEIVING_CREATE_ERROR, {
          position: toast.POSITION.TOP_CENTER,
        });
      },
    });
  }, []);
  useEffect(() => {
    register({ name: "serviceCenter" });
  }, [register]);

  // workOrder Picture List
  const [loader, setLoader] = useState(false);
  const [workOrderPictureList, setWorkOrderPictureList] = useState([]);

  const [showPicture, setShowPicture] = useState({
    show: false,
    url: "",
    title: "",
  });
  const hidePicture = () => {
    setShowPicture({
      show: false,
      url: "",
      title: "",
    });
  };
  const [showDeleteModal, setShowDeleteModal] = useState();
  // retrieving workOrder pictures list
  const ajaxPickupPictureListObsv$ = useMemo(() => {
    return getPickupPictureListAjaxObs$();
  }, []);
  useObservableCallback(ajaxPickupPictureListObsv$, (response) => {
    if (response?.status) {
      setLoader(false);
      setWorkOrderPictureList(response?.content);
    } else {
      setLoader(false);
      toast.error(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });

  // view picture
  const ajaxPictureByIdObsv$ = useMemo(() => {
    return getPictureByIdAjaxObs$(
      DEFAULT_BASE_URL + VERSION + RETRIEVAL_VIEW_PICKUP_PICTURE_BY_ID_URL,
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
        url: response?.content?.imageUploaded,
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

  // delete Picture
  const deletePicture$ = useMemo(() => {
    return deletePictureAjax$(
      DEFAULT_BASE_URL + VERSION + DELETE_PICKUP_BY_ID_URL,
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
      ajaxPickupPictureListObsv$.next([pickupId]);
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
  // document
  const [documentList, setDocumentList] = useState([]);

  const ajaxDocumentListObsv$ = useMemo(() => {
    return getDocumentListAjaxObs$();
  }, []);

  useObservableCallback(
    ajaxDocumentListObsv$,
    (response) => {
      setLoader(false);
      setDocumentList(response);
    },
    []
  );

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

  // delete document
  const deleteDocument$ = useMemo(() => {
    return deleteDocumentAjax$(
      DEFAULT_BASE_URL + VERSION + DELETE_PICKUP_DOCUMENT_BY_WORKORDERASSETID,
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
      ajaxDocumentListObsv$.next([pickupId]);
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

  return (
    <div id="results" className="form-container bg-form">
      <CreateOrUpdatePickUp
        isCreate={isCreate}
        control={control}
        signUrl={signUrl}
        openSignatureModal={openSignatureModal}
        loggedUserName={loggedUserName}
        openPictureModal={openPictureModal}
        openDocumentModal={openDocumentModal}
        state={state}
        pickupId={pickupId}
        setPickUpId={setPickUpId}
        handlePrint={handlePrint}
        componentRef={componentRef}
        setSignUrl={setSignUrl}
        getPickUpByIdAjax$={getPickUpByIdAjax$}
        getGeneratedPickUpNumberAjax$={getGeneratedPickUpNumberAjax$}
        setStatus={setStatus}
        statusInfo={statusInfo}
        workAssetId={workAssetId}
        showPictureModal={showPictureModal}
        showDocumentModal={showDocumentModal}
        getPickUpById$={getPickUpById$}
      />

      {showPictureModal && (
        <ReceivingPicturesModal
          modalName="Pickup Pictures"
          wOrderId={showPictureModal}
          pickupId={pickupId}
          closePictureModal={closePictureModal}
          state={state}
          loader={loader}
          isPickup={true}
          setLoader={setLoader}
          pictureList={workOrderPictureList}
          ajaxPickupPictureListObsv$={ajaxPickupPictureListObsv$}
          showPicture={showPicture}
          hidePicture={hidePicture}
          ajaxPictureByIdObsv$={ajaxPictureByIdObsv$}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          deletePicture$={deletePicture$}
          setState={setState}
        />
      )}
      {showDocumentModal && (
        <RecievingDocumentsForm
          modalName="Pickup Documents"
          pickupId={showDocumentModal}
          closeDocumentModal={closeDocumentModal}
          state={state}
          isPickup={true}
          setState={setState}
          loader={loader}
          setLoader={setLoader}
          documentList={documentList}
          ajaxDocumentListObsv$={ajaxDocumentListObsv$}
          ajaxDocumentDownloadObsv$={ajaxDocumentDownloadObsv$}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          deleteDocument$={deleteDocument$}
          isCreate={isCreate}
        />
      )}
      {showSignatureModal && (
        <SignatureModal
          modalName="Add Signature"
          setSignUrl={setSignUrl}
          pickupId={pickupId}
          closeSignatureModal={closeSignatureModal}
          isPickup={true}
          uploadSignatureAjaxObsv$={uploadSignatureAjaxObsv$}
        />
      )}
    </div>
  );
};
export default PickUpEntryForm;
