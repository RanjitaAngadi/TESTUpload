import React, { useState, useEffect, useRef, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Redirect, useLocation } from "react-router-dom";
import {
  RecievingDocumentsForm,
} from "./RecievingDocumentsModal";
import ReceivingPicturesModal from "./ReceivingPicturesModal";
import ReceivingAssetsModal from "./ReceivingAssetsModal";
import {
  GET_OPM_WORK_ORDER_SERIAL_NUMBER,
  GET_WORK_ORDER_SERIAL_NUMBER,
} from "../common/const";
import { toast } from "react-toastify";
import { AMPToastConsts } from "../common/const/AMPToastConst";

import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import ReactGA from 'react-ga';
import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";
import {
  DEFAULT_BASE_URL,
  VERSION,
  GET_ALL_LOCATION,
  GET_ALL_MANUFACTURER,
  GET_ALL_PART_TYPE,
  GET_WORK_ORDER_TYPES,
  ADD_PICTURE_URL,
  GET_RECEIVING_PICTURE_LIST,
  GET_RECEIVING_PICTURE,
  DELETE_RECEIVING_PICTURE,

  GET_DOCUMENT_LIST_BY_WORKORDER,
  DOWNLOAD_DOCUMENT_BY_ID,
  DELETE_DOCUMENT_BY_ID,
} from "../common/const";
import { ampJsonAjax, ampOctetStreamAjax } from "../common/utils/ampAjax";

import {
  AccessProvider,
  useAccessDispatch,
  useAccessState,
} from "../../utils/AppContext/loginContext";
import AMPTooltip from "../common/AMPTooltip";
import { CreateOrUpdateReceivingForm } from "./CreateOrUpdateReceivingForm";
import { OrganizationModal } from "./OrganizationModal";
import { SignatureModal } from "./SignatureModal";

// Asset Attributes Api call
const getAllLocationListAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax.get(DEFAULT_BASE_URL + VERSION + GET_ALL_LOCATION +"/"+param).pipe(
        map((xhrResponse) => {
          const filteredData = xhrResponse.response.content.map((item) => {
            return {
              label: item.name.toUpperCase(),
              value: item.id,
              locationHierarchyLevelId: item.locationHierarchyLevelId
            };
          });
          return filteredData;
        }),
        catchError((error) => {
          return throwError(error);
        })
      )
    )
  );

const getAllManufacturerListAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax.get(DEFAULT_BASE_URL + VERSION + GET_ALL_MANUFACTURER).pipe(
        map((xhrResponse) => {
          const filteredData = xhrResponse.response.content.map((item) => {
            return {
              label: item.value,
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
  );

const getAllPartTypeListAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax.get(DEFAULT_BASE_URL + VERSION + GET_ALL_PART_TYPE).pipe(
        map((xhrResponse) => {
          const filteredData = xhrResponse.response.content.map((item) => {
            return {
              label: item.name,
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
  );
// Fetching Work Order types
const getWorkOrderTypesAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax.get(DEFAULT_BASE_URL + VERSION + GET_WORK_ORDER_TYPES).pipe(
        map((xhrResponse) => {
          const filteredData = xhrResponse.response.content.map((item) => {
            return {
              label: item.value,
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
  );

// retrieving pictures list
const getPictureListAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax
        .get(
          DEFAULT_BASE_URL +
          VERSION +
          GET_RECEIVING_PICTURE_LIST +
          param.wOrderId
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
// Upload Signature
const uploadSignatureAjaxObsv$ = (body) =>
  ampJsonAjax.postFile(DEFAULT_BASE_URL + VERSION + ADD_PICTURE_URL, body).pipe(
    map((xhrResponse) => {
      props.ajaxPictureListObsv$.next({ workOrderId: props.workOrderId });
      props.setIsPictureLoading(true);
      return { ...xhrResponse.response };
    }),
    catchError((error) => {
      return throwError(error);
    })
  );

// documents
const getDocumentListAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax
        .get(
          DEFAULT_BASE_URL + VERSION + GET_DOCUMENT_LIST_BY_WORKORDER + params
        )
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
        .get(DEFAULT_BASE_URL + VERSION + DOWNLOAD_DOCUMENT_BY_ID + params.id)
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

const ReceivingFullForm = (props) => {
  const locationRef = useLocation();
  const workId = locationRef?.state?.id || params?.get("workOrderId");
  const status = locationRef?.state?.status || params?.get("status");
  const [showSearch, setMoveToSearch] = useState(false);
  const backForm = locationRef?.state?.backForm;
  const params = new window.URLSearchParams(window.location.search);
  const showAssetOrReceivingOrWorkForBack =
    locationRef?.state?.showAssetOrReceivingOrWorkForBack;
  /* autofill pump work order number field and work order type when redirection from Disassembly level 1 and level 2 inspection*/
  
  const inspectionWorkOrderNumber = locationRef?.state?.linkedWorkorderNumber || null; 
  // after redirection from Disassembly level 1 and level 2 inspection pump work order type autofill with inspection related work order number

  const inspectionType = locationRef?.state?.inspectionType || null; 
  // after redirection from Disassembly level 1 and level 2 inspection work order type autofill woth OPM

  const [showAssetModal, setShowAssetModal] = useState();
  const [showReceivingForm, setShowReceivingForm] = useState(false);

  const isCreate = locationRef?.state?.isCreate;

  const moveToBack = () => {
    if (showAssetOrReceivingOrWorkForBack) {
      setMoveToSearch("Asset");
      setShowAssetModal("");
    } else {
      setMoveToSearch("Receive");
    }
  };
  // For google analytics purpose
  useEffect(()=>{
    ReactGA.pageview(window.location.pathname + window.location.search);
  },[])
  return (
    <div className="mb-5">
      {showSearch === "Receive" && (
        <Redirect
          to={{
            pathname: `/Pump/receivings`,
          }}
        />
      )}
      {backForm === "workOrder" && showSearch === "Asset" && (
        <Redirect
          to={{
            pathname: `/Pump/EditWorkOrder`,
            state: {
              isCreate: false,
              id: workId,
              status: status,
              inspectionType: inspectionType || null,
              inspectionWorkOrderNumber: inspectionWorkOrderNumber || null,
            },
          }}
        />
      )}
      {backForm === "Receiving" && showSearch === "Asset" && !showAssetModal && (
        <Redirect
          to={{
            pathname: `/Pump/UpdateReceivingFullForm`,
            state: {
              isCreate: false,
              id: workId,
              status: status,
              inspectionType: inspectionType || null,
              linkedWorkorderNumber: inspectionWorkOrderNumber || null,
            },
          }}
        />
      )}
      <p>
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
          {isCreate && !showAssetOrReceivingOrWorkForBack && (
            <span className="receiving-tag mx-1">Create Receiving Form</span>
          )}
          {!isCreate && !showAssetOrReceivingOrWorkForBack && (
            <span className="receiving-tag mx-1">Edit Receiving Form</span>
          )}
          {!isCreate && showAssetOrReceivingOrWorkForBack && (
            <span className="receiving-tag mx-1">Asset Form</span>
          )}
        </div>
      </p>
      <ReceivingFormResults
        isCreate={isCreate}
        showAssetModal={showAssetModal}
        setShowAssetModal={setShowAssetModal}
        setShowReceivingForm={setShowReceivingForm}
        setMoveToSearch={setMoveToSearch}
        inspectionWorkOrderNumber={inspectionWorkOrderNumber}
        inspectionType={inspectionType}
      />
    </div>
  );
};

const ReceivingFormResults = (props) => {
  const { handleSubmit, reset, watch, control, register, setValue, getValues } =
    useForm({});

  const {
    isCreate,
    setShowReceivingForm,
    setShowAssetModal,
    showAssetModal,
    inspectionWorkOrderNumber,
    inspectionType,
  } = props;
  const locationRef = useLocation();
  const workId = locationRef?.state?.id || params?.get("workOrderId");
  const status = locationRef?.state?.status || params?.get("status");
  const params = new window.URLSearchParams(window.location.search);
  const showAssetOrReceivingOrWorkForBack =
    locationRef?.state?.showAssetOrReceivingOrWorkForBack;

  const context = useAccessState();
  let loggedUserName = `${context.firstName} ${context?.lastName}`;

  const [showUpdateCall, setUpdateCall] = useState(false);
  const [showOrganizationModal, setShowOrganizationntModal] = useState(false);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  const [state, setState] = useState(false);

  // signature
  const [signUrl, setSignUrl] = useState(null);
  const openSignatureModal = () => setShowSignatureModal(true);
  const closeSignatureModal = () => setShowSignatureModal(false);

  //  ---------------------

  // for receiving asset modal
  const openAssetModal = (id) => {
    setState(false);
    setShowAssetModal(id);
    setShowReceivingForm(isCreate);
  };
  const closeAssetModal = () => {
    setUpdateCall(true);
    setShowAssetModal("");
  };

  // For Open Organization Modal
  const openOrganizationModal = () => {
    setShowOrganizationntModal(true);
  };
  const closeOrganizationModal = () => setShowOrganizationntModal(false);
  // ----------------------------
  // for receiving picture modal
  const openPictureModal = (id) => {
    setState(false);
    setShowPictureModal(id);
  };
  const closePictureModal = () => setShowPictureModal("");
  // ----------------------------
  // for receiving document modal
  const openDocumentModal = (id) => {
    setState(false);
    setShowDocumentModal(id);
  };
  const closeDocumentModal = () => setShowDocumentModal("");

  const ajaxLocationObsv$ = useMemo(() => {
    return getAllLocationListAjaxObs$();
  }, []);
  const location = useObservable(ajaxLocationObsv$, []);
  const ajaxManufacturerObsv$ = useMemo(() => {
    return getAllManufacturerListAjaxObs$();
  }, []);
  const manufacturer = useObservable(ajaxManufacturerObsv$, []);

  const ajaxPartTypeObsv$ = useMemo(() => {
    return getAllPartTypeListAjaxObs$();
  }, []);
  const partType = useObservable(ajaxPartTypeObsv$, []);

  // Fetching WOrk Order types
  const ajaxWOTypesObsv$ = useMemo(() => {
    return getWorkOrderTypesAjaxObs$();
  }, []);
  const workOrderType = useObservable(ajaxWOTypesObsv$, []);

  useEffect(() => {
    if (ajaxLocationObsv$) ajaxLocationObsv$.next(context?.userType);
    //if (ajaxOrganizationObsv$) ajaxOrganizationObsv$.next();
    if (ajaxManufacturerObsv$) ajaxManufacturerObsv$.next();
    if (ajaxPartTypeObsv$) ajaxPartTypeObsv$.next();
    if (ajaxWOTypesObsv$) ajaxWOTypesObsv$.next();
  }, [
    ajaxLocationObsv$,
    // ajaxOrganizationObsv$,
    ajaxManufacturerObsv$,
    ajaxPartTypeObsv$,
    ajaxWOTypesObsv$,
  ]);

  useEffect(() => {
    register({ name: "serviceCenter" });
  }, [register]);

  const [isWorkOrderNumberLoading, setIsWorkOrderNumberLoading] =
    useState(false);
  const [organizationGroupId, setOrganizationGroupId] = useState();
  const [organizationGroup, setOrganizationGroup] = useState({});
  const [organizationData, setOrganizationData] = useState();
  const [customerId, setCustomerId] = useState();
  const [isWorkOrderNumberGenerated, setIsWorkOrderNumberGenerated] =
    useState();
  const getWorkOrderNumberAjaxObs$ = () =>
    new Subject().pipe(
      mergeMap((param) =>
        ampJsonAjax
          .get(DEFAULT_BASE_URL + VERSION + GET_WORK_ORDER_SERIAL_NUMBER)
          .pipe(
            map((xhrResponse) => {
              setIsWorkOrderNumberLoading(false);
              setIsWorkOrderNumberGenerated(xhrResponse.response.content);
            }),
            catchError((error) => {
              setIsWorkOrderNumberLoading(false);
              return throwError(error);
            })
          )
      )
    );

  const getOPMWorkOrderNumberAjaxObs$ = () =>
    new Subject().pipe(
      mergeMap((param) =>
        ampJsonAjax
          .get(DEFAULT_BASE_URL + VERSION + GET_OPM_WORK_ORDER_SERIAL_NUMBER)
          .pipe(
            map((xhrResponse) => {
              setIsWorkOrderNumberLoading(false);

              setIsWorkOrderNumberGenerated(xhrResponse.response.content);
            }),
            catchError((error) => {
              setIsWorkOrderNumberLoading(false);
              return throwError(error);
            })
          )
      )
    );
  const ajaxGenerateWorkOrderNumberObsv$ = useMemo(() => {
    return getWorkOrderNumberAjaxObs$();
  }, []);
  useObservableCallback(ajaxGenerateWorkOrderNumberObsv$, (response) => { });
  const ajaxGenerateWorkOrderNumberForOPMObsv$ = useMemo(() => {
    return getOPMWorkOrderNumberAjaxObs$();
  }, []);
  useObservableCallback(
    ajaxGenerateWorkOrderNumberForOPMObsv$,
    (response) => { }
  );

  const onClearRecievingForm = () => { };

  // pictures constants
  const [loader, setLoader] = useState(false);
  const [pictureList, setPictureList] = useState([]);

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

  // retrieving pictures list
  const ajaxPictureListObsv$ = useMemo(() => {
    return getPictureListAjaxObs$();
  }, []);
  useObservableCallback(ajaxPictureListObsv$, (response) => {
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

  // view picture
  const ajaxPictureByIdObsv$ = useMemo(() => {
    return getPictureByIdAjaxObs$(
      DEFAULT_BASE_URL + VERSION + GET_RECEIVING_PICTURE,
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

  // delete picture
  const deletePicture$ = useMemo(() => {
    return deletePictureAjax$(
      DEFAULT_BASE_URL + VERSION + DELETE_RECEIVING_PICTURE,
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
      ajaxPictureListObsv$.next({ wOrderId: workId });
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
      setDocumentList(response?.content?.data);
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

  // delete document
  const deleteDocument$ = useMemo(() => {
    return deleteDocumentAjax$(
      DEFAULT_BASE_URL + VERSION + DELETE_DOCUMENT_BY_ID,
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

  return (
    <div id="results" className="form-container bg-form">
      {!showAssetOrReceivingOrWorkForBack && (
        <CreateOrUpdateReceivingForm
          isCreate={isCreate}
          control={control}
          location={location}
          setIsWorkOrderNumberLoading={setIsWorkOrderNumberLoading}
          isWorkOrderNumberLoading={isWorkOrderNumberLoading}
          signUrl={signUrl}
          openSignatureModal={openSignatureModal}
          ajaxGenerateWorkOrderNumberObsv$={ajaxGenerateWorkOrderNumberObsv$}
          ajaxGenerateWorkOrderNumberForOPMObsv$={
            ajaxGenerateWorkOrderNumberForOPMObsv$
          }
          isWorkOrderNumberGenerated={isWorkOrderNumberGenerated}
          workOrderType={workOrderType}
          loggedUserName={loggedUserName}
          openPictureModal={openPictureModal}
          openDocumentModal={openDocumentModal}
          openAssetModal={openAssetModal}
          openOrganizationModal={openOrganizationModal}
          organizationGroupId={organizationGroupId}
          customerId={customerId}
          setOrganizationData={setOrganizationData}
          organizationData={organizationData}
          setSignUrl={setSignUrl}
          state={state}
          showAssetOrReceivingOrWorkForBack={showAssetOrReceivingOrWorkForBack}
          inspectionWorkOrderNumber={inspectionWorkOrderNumber}
          inspectionType={inspectionType}
        />
      )}
      {showOrganizationModal && (
        <OrganizationModal
          modalName="Change Organization Details"
          closeOrganizationModal={closeOrganizationModal}
          setOrganizationGroupId={setOrganizationGroupId}
          setCustomerId={setCustomerId}
          setOrganizationData={setOrganizationData}
          setOrganizationGroup={setOrganizationGroup}
          organizationGroup={organizationGroup}
          context={context}
        />
      )}
      {showAssetOrReceivingOrWorkForBack && (
        <ReceivingAssetsModal
          modalName="Assets"
          wOrderId={workId}
          location={location}
          manufacturer={manufacturer}
          partType={partType}
          closeAssetModal={closeAssetModal}
          workId={workId}
          state={state}
          setState={setState}
          showUpdateCall={showUpdateCall}
        />
      )}
      {showPictureModal && (
        <ReceivingPicturesModal
          modalName="Receiving Pictures"
          wOrderId={showPictureModal}
          closePictureModal={closePictureModal}
          workId={workId}
          status={status}
          state={state}
          loader={loader}
          setLoader={setLoader}
          pictureList={pictureList}
          ajaxPictureListObsv$={ajaxPictureListObsv$}
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
          modalName="Receiving Documents"
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
      {showSignatureModal && (
        <SignatureModal
          modalName="Add Signature"
          workId={workId}
          setSignUrl={setSignUrl}
          closeSignatureModal={closeSignatureModal}
          uploadSignatureAjaxObsv$={uploadSignatureAjaxObsv$}
        />
      )}
    </div>
  );
};
export default ReceivingFullForm;
