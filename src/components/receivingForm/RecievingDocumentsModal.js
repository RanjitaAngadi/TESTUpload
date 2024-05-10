import React, { useEffect, useState, useRef,useMemo } from "react";
import { appendErrors, Controller, useForm } from "react-hook-form";
import ReactGA from 'react-ga';
import {
  AMPModal,
  AMPModalHeader,
  AMPModalBody,
  AMPModalFooter,
} from "../common/AMPModal";
import { AMPFieldWrapper } from "../common/AMPFieldWrapper";
import { Row, Col, Button, Table, Container } from "react-bootstrap";
import { AMPFile } from "../common/AMPFile";
import { Redirect, useLocation } from "react-router-dom";
import {
  UPLOAD_PICKUP_DOCUMENT_BY_WORKORDERASSETID,
} from "../common/const";
import { AMPFormLayout } from "../common/AMPFormLayout";
import {
  RECEIVING_DOCUMENT_LIMIT,
  RECEIVING_DOCUMENT_LIMIT_MSG,
} from "../common/const/limits";
import Select from "react-select";
import AMPLoader from "../common/AMPLoader";
import { toast } from "react-toastify";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import {
  DEFAULT_BASE_URL,
  VERSION,
  UPLOAD_DOCUMENT_URL,
  POST_WORKORDER_DOCUMENT,
  UPLOAD_INSPECTION_DOCUMENT,
  POST_BILLING_DOCUMENT,
  ConstVariable,
  GET_WORKORDER_DOCUMENT_BY_CATEGORYID,
} from "../common/const";
import { ampJsonAjax } from "../common/utils/ampAjax";
import { AMPToastConsts } from "../common/const/AMPToastConst";
import AMPFlexStart from "../common/AMPFlex/AMPFlexStart";
import { DeleteModal } from "../common/DeleteModal";
import { useAccessState } from "../../utils/AppContext/loginContext";
import AMPAuthorization from "../common/AMPAuthorization/AMPAuthorization";
import AMPTooltip from "../common/AMPTooltip";
import { AMPMessage } from "../common/const/AMPMessage";
import * as yup from "yup";
import { AMPValidation } from "../common/AMPAuthorization/AMPValidation";
import { AMPTextBox } from "../common";
import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";

//calling categorybyId api
const getDropdownByCategaoryIdAjaxObs$=()=>
   new Subject().pipe(
    mergeMap((param)=>
      ampJsonAjax.get(DEFAULT_BASE_URL + VERSION+GET_WORKORDER_DOCUMENT_BY_CATEGORYID).pipe(
        map((xhrResponse)=>{
          const filteredData = xhrResponse.response.content.map((item) => {
            return {
              label: item.categoryName,
              value: item.id,
            };
          });
          return filteredData;
        }),
        catchError((error)=>{
          return throwError(error);
        })
      )
   )
  ); 

const uploadDocumentAjaxObsv$ = (body, endURL) =>
  ampJsonAjax.postFile(DEFAULT_BASE_URL + VERSION + endURL, body).pipe(
    map((xhrResponse) => {
      return { ...xhrResponse.response };
    }),
    catchError((error) => {
      return throwError(error);
    })
  );

export const RecievingDocumentsForm = ({
  modalName,
  wOrderId,
  state,
  setState,
  isInspection,
  loader,
  setLoader,
  documentList,
  ajaxDocumentListObsv$,
  ajaxDocumentDownloadObsv$,
  showDeleteModal,
  setShowDeleteModal,
  deleteDocument$,
  pickupId,
  isPickup,
  isCreate,
  categoryname,
  
  ...props
}) => {
  const context = useAccessState();
  const params = new window.URLSearchParams(window.location.search);
  const locationRef = useLocation();
  const workId = locationRef?.state?.id || params.get("workOrderId");
  const status = locationRef?.state?.status || params.get("status");
  const isReceiving = locationRef?.state?.isReceiving;
  const isWorkorder = locationRef?.state?.isWorkorder;
  const isBilling = locationRef?.state?.isBilling;
  const statusInfo = locationRef?.state?.statusInfo;

  const workorderNumber = locationRef?.state?.workorderNumber

  const inspectionTypeStatus = locationRef?.state?.inspectionTypeStatus;

  const [showUploadDocumentModal, setShowUploadDocumentModal] = useState(false);
  const openUploadDocumentModal = () => setShowUploadDocumentModal(true);
  const closeUploadDocumentModal = () => setShowUploadDocumentModal(false);

  const closeDocumentModal = () => {
    setState(true);
    props.closeDocumentModal();
  };
  // For google analytics purpose
  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, [])
  useEffect(() => {
    if (ajaxDocumentListObsv$ && !isInspection && !isPickup && !isBilling) {
      ajaxDocumentListObsv$.next(wOrderId);
    
      setLoader(true);
    }
    if (isPickup) {
      ajaxDocumentListObsv$.next([pickupId]);
      setLoader(true);
    }
    if (isBilling) {
      ajaxDocumentListObsv$.next([wOrderId]);
      setLoader(true);
    }

  }, [ajaxDocumentListObsv$]);

  const onDocumentDownload = (id, name) => {
    setLoader(true);
    console.log(ajaxDocumentDownloadObsv$)
    ajaxDocumentDownloadObsv$.next({
      id: id,
      name: name,
    });
  };

  const closeDeleteModal = () => {
    setShowDeleteModal("");
  };
  const onDelete = (id) => {
    setShowDeleteModal(id);
  };
  const onConfirmDelete = (id) => {
    if (isPickup) {
      deleteDocument$.next({ id: id, pickupId: [pickupId] });
    } else {
      deleteDocument$.next({ id: id, wOrderId: wOrderId });
    }
  };


  // // //adding category dropdown
  // const category=[
  //   {label:"Oil Sample Data",value:1},
  //   {label:"Other",value:2},
  // ];
  const [categoryList, setCategoryList] = useState([]);
  
 
  return (
    <>
      {state &&
        !isPickup && !isBilling && (
          <Redirect
            to={{
              pathname: `/Pump/${isReceiving ? `UpdateReceivingFullForm` : `EditWorkOrder`
                }`,
              state: {
                isCreate: false,
                id: workId,
                status: status,
              },
            }}
          />
        )}
      {showUploadDocumentModal ? (
        <UploadDocumentModal
          wOrderId={wOrderId}
          workId={workId}
          ajaxDocumentListObsv$={ajaxDocumentListObsv$}
          setLoader={setLoader}
          modalName="Upload Document"
          closeUploadDocumentModal={closeUploadDocumentModal}
          isInspection={isInspection}
          context={context}
          isPickup={isPickup}
          pickupId={pickupId}
          isWorkorder={isWorkorder}
          isBilling={isBilling}
          categoryList={categoryList}
          setCategoryList={setCategoryList}
        />
      ) : (
        <AMPModal
          show
          onHide={closeDocumentModal}
          size="xl"
          backdrop="static"
          centered
        >
          <AMPModalHeader>
            {modalName}
            {(isBilling && workorderNumber) && ` (${workorderNumber}) `}
          </AMPModalHeader>
          <AMPModalBody>
            <Container fluid>
              <AMPLoader isLoading={loader} />
              <div
                id="results"
                className="form-container mx-0 pt-2 bg-form pb-2"
              >
                <AMPAuthorization
                  hasToken={
                    isReceiving
                      ? context?.features?.includes("RE-EDIT")
                      : context?.features?.includes("WO-EDIT")
                  }
                >
                  <Row>
                    <Col>
                      {documentList?.length < RECEIVING_DOCUMENT_LIMIT ? (
                        <>
                          {((!isInspection &&
                            isReceiving &&
                            status !== ConstVariable?.RJCT) ||
                            (!isInspection &&
                              !isReceiving &&
                              isWorkorder &&
                              status !== ConstVariable?.RJCT) ||
                            (!isInspection &&
                              !isReceiving &&
                              !isWorkorder &&
                              isBilling &&
                              status !== ConstVariable?.RJCT) ||
                            (isPickup &&
                              context?.features?.includes("PIC-ENTRY")) ||
                            (isInspection && inspectionTypeStatus !== 3)) && (
                              <div className="float-right btn-control-action-icons-group mb-1">
                                <button
                                  aria-label="Add"
                                  name="Add"
                                  type="button"
                                  className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                                  onClick={openUploadDocumentModal}
                                >
                                  <AMPTooltip text="Add New">
                                    <svg
                                      fill="rgb(11, 26, 88)"
                                      viewBox="0 0 510 510"
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="svg-inline--fa amp-svg-icon amp-svg-add fa-w-16 amp-icon"
                                    >
                                      <path
                                        d="M256,0C114.844,0,0,114.844,0,256s114.844,256,256,256s256-114.844,256-256S397.156,0,256,0z M256,490.667
                                   C126.604,490.667,21.333,385.396,21.333,256S126.604,21.333,256,21.333S490.667,126.604,490.667,256S385.396,490.667,256,490.667
                                     z"
                                      ></path>
                                      <path
                                        d="M394.667,245.333h-128v-128c0-5.896-4.771-10.667-10.667-10.667s-10.667,4.771-10.667,10.667v128h-128
                                     c-5.896,0-10.667,4.771-10.667,10.667s4.771,10.667,10.667,10.667h128v128c0,5.896,4.771,10.667,10.667,10.667
                                   s10.667-4.771,10.667-10.667v-128h128c5.896,0,10.667-4.771,10.667-10.667S400.563,245.333,394.667,245.333z"
                                      ></path>
                                    </svg>
                                  </AMPTooltip>
                                </button>
                              </div>
                            )}
                        </>
                      ) : (
                        <div className="receiving-limit-msg">
                          {RECEIVING_DOCUMENT_LIMIT_MSG}
                        </div>
                      )}
                    </Col>
                  </Row>
                </AMPAuthorization>
                {documentList?.length > 0 &&
                  <Table
                    striped
                    bordered
                    hover
                    responsive
                    size="sm"
                    className="bg-light"
                  >
                    <thead>
                      <tr>
                        <th>Title</th>
                        {isWorkorder && <th>Category</th>}
                        <th>Uploaded On</th>
                        <th>Uploaded By</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody className="fn-14">
                      {documentList?.map((document) => (
                        <tr key={document.id}>
                          <td>{document?.name}</td>
                          {/* <td>
                          {isWorkorder && categoryList.map((cat)=>(
                            //console.log(cat.label)
                             //cat?.label
                             cat.categoryName.map((ct)=>
                             {ct})
                          ) )
                          }
                          </td> */}
                       {isWorkorder && <td>{categoryList[0]?.label || categoryList[1]?.label}</td>}
                          {/* {isWorkorder && <td key={categoryList.value}>{categoryList[0]?.label ? categoryList[0]?.label:categoryList[1]?.label}</td>} */}
                          <td>{document?.uploadedDate}</td>
                          <td>{document?.uploadBy}</td>
                          <td>
                            <AMPFlexStart>
                              <button
                                aria-label="Download"
                                name="Download"
                                type="button"
                                className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                                onClick={() => onDocumentDownload(document?.id, document?.name)}
                              >
                                <AMPTooltip text="Download">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    fill="currentColor"
                                    className="bi bi-cloud-download"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M4.406 1.342A5.53 5.53 0 0 1 8 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 0 1 0-1h2.688C13.979 10 15 8.988 15 7.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 2.825 10.328 1 8 1a4.53 4.53 0 0 0-2.941 1.1c-.757.652-1.153 1.438-1.153 2.055v.448l-.445.049C2.064 4.805 1 5.952 1 7.318 1 8.785 2.23 10 3.781 10H6a.5.5 0 0 1 0 1H3.781C1.708 11 0 9.366 0 7.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383z" />
                                    <path d="M7.646 15.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 14.293V5.5a.5.5 0 0 0-1 0v8.793l-2.146-2.147a.5.5 0 0 0-.708.708l3 3z" />
                                  </svg>
                                </AMPTooltip>
                              </button>

                              <AMPAuthorization
                                hasToken={
                                  isReceiving
                                    ? context?.features?.includes("RE-EDIT")
                                    : context?.features?.includes("WO-EDIT")
                                }
                              >
                                <>
                                  {((!isInspection &&
                                    isReceiving &&
                                    status !== ConstVariable?.RJCT) ||
                                    (!isInspection &&
                                      !isReceiving &&
                                      isWorkorder &&
                                      status !== ConstVariable?.RJCT) ||
                                    (!isInspection &&
                                      !isReceiving &&
                                      !isWorkorder &&
                                      isBilling &&
                                      status !== ConstVariable?.RJCT) ||
                                    (isPickup &&
                                      context?.features?.includes(
                                        "PIC-ENTRY"
                                      )) ||
                                    (isInspection &&
                                      inspectionTypeStatus !== 3)) && (
                                      <>
                                        <button
                                          aria-label="Delete"
                                          name="Delete"
                                          type="button"
                                          className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                                          onClick={() => onDelete(document.id)}
                                        >
                                          <AMPTooltip text="Delete">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              width="20"
                                              height="20"
                                              fill="currentColor"
                                              className="svg-inline--fa amp-svg-icon amp-svg-delete fa-w-13 amp-icon"
                                              viewBox="0 0 16 16"
                                            >
                                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                              <path
                                                fillRule="evenodd"
                                                d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                                              />
                                            </svg>
                                          </AMPTooltip>
                                        </button>
                                      </>
                                    )}
                                </>
                              </AMPAuthorization>
                            </AMPFlexStart>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                }
                {!loader && documentList?.length === 0 && (
                  <Row>
                    <Col className="text-center text-danger">No Data Found</Col>
                  </Row>
                )}
                {showDeleteModal && (
                  <DeleteModal
                    confirmationMessage={AMPMessage.DEL_DOCUMENT_CONFIRM}
                    showDeleteModal={showDeleteModal}
                    onConfirmDelete={onConfirmDelete}
                    closeModal={closeDeleteModal}
                  />
                )}
              </div>
            </Container>
          </AMPModalBody>
          <AMPModalFooter>
          </AMPModalFooter>
        </AMPModal>
      )}
    </>
  );
};

export const UploadDocumentModal = ({
  wOrderId,
  workId,
  ajaxDocumentListObsv$,
  modalName,
  closeUploadDocumentModal,
  isInspection,
  context,
  isPickup,
  pickupId,
  isWorkorder,
  isBilling,
  categoryList,
  setCategoryList,
  ...props
}) => {
  const defaultValues = {
    uploadFile: "",
    docName: "",
  };

  const { handleSubmit, reset, watch, control, register ,errors} = useForm({
    defaultValues,
  });
  const DOCUMENT_SUPPORTED_FORMATS = ["application/pdf"];

  const [loader, setLoader] = useState(false);

  const [fileError, setFileError] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const fileRef = useRef(null);
  const formRef = useRef(null);
  const handleSubmitDocument = (formData) => {
    console.log("formdata:",formData)
    if(isWorkorder && !formData?.categoryname?.value){
      setdropDownError("This field is required");
    }else setdropDownError(false);
    if (formData.document?.length <1) {
      setFileError("This field is required");
    } else if (formData.document?.length > 1) {
      setFileError("Cannot upload more than 1 file");
    } else if (formData.document[0]?.size > 1000000) {
      setFileError("File should not exceed 1MB");
    } else if (
      !DOCUMENT_SUPPORTED_FORMATS.includes(formData.document[0]?.type)
    ) {
      setFileError("Accept only .pdf file");
    } else {
      setFileError(false);
      
      let endURL = "";
      const body = new FormData();
      if (isInspection) {
        endURL = UPLOAD_INSPECTION_DOCUMENT;
        body.append("InspectionDetailId", wOrderId);
        body.append("RequestedById", context?.userId);
      } else if (isPickup) {
        endURL = UPLOAD_PICKUP_DOCUMENT_BY_WORKORDERASSETID;
        body.append("PickUpId", [pickupId]);
      } else if (isWorkorder) {
        endURL = POST_WORKORDER_DOCUMENT;
        body.append("WorkOrderId", wOrderId);
        body.append("CategoryId",formData.categoryname.value);
      } else if (isBilling) {
        endURL = POST_BILLING_DOCUMENT;
        body.append("BillingId", wOrderId);
      } else {
        endURL = UPLOAD_DOCUMENT_URL;
        body.append("WorkOrderId", wOrderId);
        
      }
      body.append("Document", formData.document[0]);
      setLoader(true);
      const uploadSubscribe = uploadDocumentAjaxObsv$(body, endURL).subscribe(
        (response) => {
          toast.success(AMPToastConsts.DOCUMENT_UPLOAD_SUCCESS, {
            position: toast.POSITION.TOP_CENTER,
          });
          setLoader(false);
          if (isBilling) {
            ajaxDocumentListObsv$.next([wOrderId]);
          } else {
            ajaxDocumentListObsv$.next(!isPickup ? wOrderId : [pickupId]);
          }
          props.setLoader(true);
          closeUploadDocumentModal();
        },
        (error) => {
          setLoader(false);
          toast.error(AMPToastConsts.DOCUMENT_UPLOAD_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
        () => {
          uploadSubscribe.unsubscribe();
        }
      );

    }
    
  };

 
 const [dropdownError, setdropDownError] = useState(false);
 const ajaxDropDownbyCategoryObsv$ = useMemo(() => {
  return getDropdownByCategaoryIdAjaxObs$();
  }, []);
  useObservableCallback(
  ajaxDropDownbyCategoryObsv$,
  (response) => {
    setLoader(false);      
    setCategoryList(response);
  },
  []
);

useEffect(()=>{
  if(ajaxDropDownbyCategoryObsv$)
  ajaxDropDownbyCategoryObsv$.next();
},[ajaxDropDownbyCategoryObsv$])
  
  return (
    <>
      <AMPModal
        show
        onHide={closeUploadDocumentModal}
        size="lg"
        backdrop="static"
        centered
      >
        <AMPModalHeader>{modalName}</AMPModalHeader>
        <form onSubmit={handleSubmit(handleSubmitDocument)}>
          <AMPModalBody>
            <Container fluid>
              <AMPLoader isLoading={loader} />
              <div id="results" className="form-container2 bg-form">
                <Row>
                  <Col className="mb-2">
                    <AMPFormLayout>
                      <AMPFieldWrapper
                            className="mt-1 p-0"
                            colProps={{
                                md: 6,
                                sm: 12,
                                lg: 6,
                                xs: 12,
                            }}
                            label="Category"
                            controlId="categoryName"
                            name="categoryname"
                            required={true}
                            fieldValidationCustom={dropdownError ? dropdownError: false}
                            >
                          <Controller
                                as={Select}
                                control={control}
                                options={categoryList}
                                onChange={([selected]) => {
                                    return { value: selected };
                                }}
                            />
                      </AMPFieldWrapper>
                      
                     
                      <AMPFieldWrapper
                        className="p-0 mt-1"
                        colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
                        label=" File"
                        controlId="document"
                        name="document"
                        required={true}
                        alwaysFloat
                        fieldValidationCustom={fileError ? fileError : false}
                      >
                        
                        <AMPFile ref={register} />
                      </AMPFieldWrapper>
                    </AMPFormLayout>
                  </Col>
                </Row>
              </div>
            </Container>
          </AMPModalBody>
          <AMPModalFooter>
            <Button type="submit" variant="secondary" className="px-5">
              Upload
            </Button>
          </AMPModalFooter>
        </form>
      </AMPModal>
    </>
  );
};
