import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import ReactGA from 'react-ga';
import { Redirect, useLocation } from "react-router-dom";
import { IoIosImages } from "react-icons/io";
import { FcCamera } from "react-icons/fc";
import { FcSwitchCamera } from "react-icons/fc";
import AMPTooltip from "../common/AMPTooltip";
import {
  AMPModal,
  AMPModalHeader,
  AMPModalBody,
  AMPModalFooter,
} from "../common/AMPModal";
import { AMPFieldWrapper } from "../common/AMPFieldWrapper";
import { Row, Col, Button, Table, Image, Container } from "react-bootstrap";
import { AMPFile } from "../common/AMPFile";
import { AMPTextArea, AMPTextBox } from "../common";
import AMPFlexStart from "../common/AMPFlex/AMPFlexStart";
import AMPFlexCenter from "../common/AMPFlex/AMPFlexCenter";
import Webcam from "react-webcam";
import { AMPFormLayout } from "../common/AMPFormLayout";
import { AMPValidation } from "../common/AMPAuthorization/AMPValidation";
import imageCompression from "browser-image-compression";
import AMPLoader from "../common/AMPLoader";
import { toast } from "react-toastify";
import Lightbox from "react-awesome-lightbox";
import "react-awesome-lightbox/build/style.css";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import {
  DEFAULT_BASE_URL,
  VERSION,
  ADD_PICTURE_URL,
  ADD_INSPECTION_PICTURE_URL,
  ADD_PICKUP_PICTURE_URL,
  POST_WORKORDER_PICTURE,
  ConstVariable,
  cursor
} from "../common/const";
import { ampJsonAjax } from "../common/utils/ampAjax";
import { AMPToastConsts } from "../common/const/AMPToastConst";

import {
  AccessProvider,
  useAccessDispatch,
  useAccessState,
} from "../../utils/AppContext/loginContext";

import {
  RECEIVING_IMAGE_LIMIT,
  RECEIVING_IMAGE_LIMIT_MSG,
  IMAGE_COMPRESSION_TYPE,
} from "../common/const/limits";
import { DeleteModal } from "../common/DeleteModal";
import AMPAuthorization from "../common/AMPAuthorization/AMPAuthorization";
import { AMPMessage } from "../common/const/AMPMessage";

const uploadPictureAjaxObsv$ = (body, endURL) =>
  ampJsonAjax.postFile(DEFAULT_BASE_URL + VERSION + endURL, body).pipe(
    map((xhrResponse) => {
      return xhrResponse?.response;
    }),
    catchError((error) => {
      return throwError(error);
    })
  );

const ReceivingPicturesModal = ({
  loader,
  setLoader,
  pictureList,
  isInspection,
  ajaxPictureListObsv$,
  showPicture,
  hidePicture,
  ajaxPictureByIdObsv$,
  showDeleteModal,
  setShowDeleteModal,
  deletePicture$,
  ajaxWorkOrderPictureListObsv$,
  ajaxInspectionPictureListObsv$,
  ajaxPickupPictureListObsv$,
  inspectionResponseId,
  paginationQuestionnaire,
  isPickup,
  pickupId,
  ...props
}) => {
  const context = useAccessState();

  const params = new window.URLSearchParams(window.location.search);
  const locationRef = useLocation();
  const workId = locationRef?.state?.id || params.get("workOrderId");
  const status = locationRef?.state?.status || params.get("status");
  const isReceiving = locationRef?.state?.isReceiving;
  const isWorkorder = locationRef?.state?.isWorkorder;
  const statusInfo = locationRef?.state?.statusInfo;

  const [showAddPictureModal, setShowAddPictureModal] = useState(false);

  const closePictureModal = () => {
    props.setState(true);
    props.closePictureModal();
  };
  const openAddPictureModal = () => setShowAddPictureModal(true);
  const closeAddPictureModal = () => setShowAddPictureModal(false);

  useEffect(() => {
    if (isReceiving && !isInspection && !isPickup) {
      setLoader(true);
      ajaxPictureListObsv$.next({
        wOrderId: props.wOrderId,
      });
    } else if (!isReceiving && !isInspection && !isPickup) {
      setLoader(true);
      ajaxWorkOrderPictureListObsv$.next({
        wOrderId: props.wOrderId,
      });
    } else if (!isReceiving && isInspection && !isPickup) {
      setLoader(true);
      ajaxInspectionPictureListObsv$.next({
        inspectionResponseId:
          paginationQuestionnaire?.responseId || inspectionResponseId,
      });
    } else if (isPickup) {
      setLoader(true);
      ajaxPickupPictureListObsv$.next([pickupId]);
    }
  }, [isReceiving]);

  const closeDeleteModal = () => {
    setShowDeleteModal("");
  };
  const onDelete = (id) => {
    setShowDeleteModal(id);
  };
  const onConfirmDelete = (id) => {
    deletePicture$.next({ id: id });
  };
  // For google analytics purpose
  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, [])
  return (
    <>
      {props.state && (
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
      {showAddPictureModal ? (
        <AddPicturesModal
          ajaxPictureListObsv$={ajaxPictureListObsv$}
          ajaxWorkOrderPictureListObsv$={ajaxWorkOrderPictureListObsv$}
          wOrderId={props.wOrderId}
          loader={loader}
          setLoader={setLoader}
          modalName="Upload Picture"
          closeAddPictureModal={closeAddPictureModal}
          isReceiving={isReceiving}
          isWorkorder={isWorkorder}
          isInspection={isInspection}
          inspectionResponseId={inspectionResponseId}
          ajaxInspectionPictureListObsv$={ajaxInspectionPictureListObsv$}
          ajaxPickupPictureListObsv$={ajaxPickupPictureListObsv$}
          isPickup={isPickup}
          pickupId={pickupId}
        />
      ) : (
        <AMPModal
          show
          onHide={closePictureModal}
          size="xl"
          backdrop="static"
          centered
        >
          <AMPModalHeader>{props.modalName}</AMPModalHeader>
          <AMPModalBody>
            <Container fluid>
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
                      {pictureList?.length < RECEIVING_IMAGE_LIMIT ? (
                        <>
                          {((!isInspection &&
                            !isWorkorder &&
                            isReceiving) ||
                            (!isInspection &&
                              !isReceiving &&
                              isWorkorder) ||
                            isInspection ||
                            (isPickup &&
                              context?.features?.includes(
                                "PIC-ENTRY"
                              ))) &&
                            status !== ConstVariable?.RJCT && (
                              <div className="float-right btn-control-action-icons-group mb-1">
                                <button
                                  aria-label="Add"
                                  name="Add"
                                  type="button"
                                  className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                                  onClick={openAddPictureModal}
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
                          {RECEIVING_IMAGE_LIMIT_MSG}
                        </div>
                      )}
                    </Col>
                  </Row>
                </AMPAuthorization>
                <AMPLoader isLoading={loader} />
                {pictureList?.length > 0 &&
                  <Table
                    striped
                    bordered
                    hover
                    size="sm"
                    responsive
                    className="bg-light"
                  >
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody className="fn-14">
                      {pictureList?.map((p) => (
                        <tr key={p.id}>
                          <td>{p.name}</td>
                          <td>{p.description}</td>
                          <td>
                            <AMPFlexStart>
                              {status !== ConstVariable?.RJCT && (
                                <>
                                  <button
                                    aria-label="View"
                                    name="View"
                                    type="button"
                                    className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                                    onClick={() => {
                                      setLoader(true);
                                      ajaxPictureByIdObsv$.next({ id: p.id });
                                    }}
                                  >
                                    <AMPTooltip text="View">
                                      <IoIosImages
                                        size="1.4em"
                                        // style={cursor}
                                        className="mr-3"
                                      />
                                    </AMPTooltip>
                                  </button>
                                </>
                              )}
                              <AMPAuthorization
                                hasToken={
                                  isReceiving
                                    ? context?.features?.includes("RE-EDIT")
                                    : context?.features?.includes("WO-EDIT")
                                }
                              >
                                <>
                                  {(isReceiving ||
                                    isWorkorder ||
                                    isInspection ||
                                    (isPickup &&
                                      context?.features?.includes(
                                        "PIC-ENTRY"
                                      ))) &&
                                    status !== ConstVariable?.RJCT && (
                                      <button
                                        aria-label="Delete"
                                        name="Delete"
                                        type="button"
                                        className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                                        onClick={() => onDelete(p.id)}
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
                                              fill-rule="evenodd"
                                              d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                                            />
                                          </svg>
                                        </AMPTooltip>
                                      </button>
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
                {showPicture.show && (
                  <Lightbox
                    image={showPicture.url}
                    title={showPicture.title}
                    onClose={hidePicture}
                    allowRotate={false}
                  />
                )}
                {!loader && pictureList?.length < 1 && (
                  <Row>
                    <Col className="text-center text-danger">No Data Found</Col>
                  </Row>
                )}
                {showDeleteModal && (
                  <DeleteModal
                    confirmationMessage={AMPMessage.DEL_PICTURE_CONFIRM}
                    showDeleteModal={showDeleteModal}
                    onConfirmDelete={onConfirmDelete}
                    closeModal={closeDeleteModal}
                  />
                )}
              </div>
            </Container>
          </AMPModalBody>
          <AMPModalFooter></AMPModalFooter>
        </AMPModal>
      )}
    </>
  );
};

export default ReceivingPicturesModal;

// new modal for adding picture
export const AddPicturesModal = ({
  ajaxPictureListObsv$,
  ajaxWorkOrderPictureListObsv$,
  wOrderId,
  loader,
  setLoader,
  modalName,
  closeAddPictureModal,
  isReceiving,
  isWorkorder,
  isInspection,
  inspectionResponseId,
  ajaxInspectionPictureListObsv$,
  ajaxPickupPictureListObsv$,
  isPickup,
  pickupId,
  ...props
}) => {
  const context = useAccessState();
  const PICTURE_SUPPORTED_FORMATS = [
    "image/jpg",
    "image/jpeg",
    "image/gif",
    "image/png",
  ];
  const webcamRef = React.useRef(null);
  const [displayFileUploadField, setDisplayFileUploadField] = useState(true);
  const [image, setImage] = useState(null);
  const [captureError, setCaptureError] = useState(false);
  const [facingMode, setFacingMode] = useState({ exact: "user" });
  const [image64, setImage64] = useState(null);
  const [pictureError, setPictureError] = useState(false);
  const { register, handleSubmit, watch, errors } = useForm({});

  const showFileUploadField = () =>
    setDisplayFileUploadField(!displayFileUploadField);
  // choose camera to open
  const reverse = (e) => {
    e.preventDefault();
    return facingMode.exact == "user"
      ? setFacingMode({ exact: "environment" })
      : setFacingMode({ exact: "user" });
  };
  const videoConstraints = {
    width: 216,
    height: 144,
    facingMode: facingMode,
  };
  // capture image
  const capture = React.useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot({
      width: 1080,
      height: 720,
    });
    const blob = await fetch(imageSrc).then((res) => res.blob());
    var imageFile = new File([blob], `image${new Date().getTime()}.jpeg`, {
      lastModified: new Date().getTime(),
      type: blob.type,
    });
    setImage64(imageSrc);
    setImage(imageFile);
    setCaptureError(false);
  }, [webcamRef]);

  useEffect(() => {
    if (displayFileUploadField) {
      setImage(null);
    }
  }, [displayFileUploadField]);

  // form submission
  const handleSubmitPicture = async (data) => {
    if (data.picture?.length === undefined && image === null) {
      setCaptureError("Please Capture the image");
    } else {
      setCaptureError(false);
      if (data.picture?.length !== undefined && data.picture?.length === 0) {
        setPictureError("This field is required");
      } else if (
        data.picture?.length !== undefined &&
        data.picture?.length > 1
      ) {
        setPictureError("Cannot upload more than 1 image");
      } else if (
        data.picture?.length !== undefined &&
        data.picture[0]?.size > 1000000
      ) {
        setPictureError("File should not exceed 1MB");
      } else if (
        data.picture?.length !== undefined &&
        !PICTURE_SUPPORTED_FORMATS.includes(data.picture[0]?.type)
      ) {
        setPictureError(
          "Only image( .jpg .jpeg .png .gif ) files are accepted"
        );
      } else {
        setPictureError(false);
        let imageDef = image !== null ? image : data.picture[0];
        let imageProperty = {
          maxSizeMB: 0.7,
          maxWidthOrHeight: 1080,
          useWebWorker: true,
        };
        let imageFile = await imageCompression(imageDef, imageProperty)
          .then((compressedBlob) => {
            compressedBlob.lastModifiedDate = new Date();
            // Convert the blob to file
            const imageFile = new File([compressedBlob], imageDef.name, {
              type: imageDef.type,
              lastModified: Date.now(),
            });
            return imageFile;
          })
          .catch((error) => {
            console.log("Error in file compression", error);
          });
        const body = new FormData();
        let endURL = "";
        if (isReceiving && !isInspection) {
          endURL = ADD_PICTURE_URL;
          body.append("workOrderId", wOrderId);
        } else if (!isReceiving && !isInspection && isWorkorder) {
          endURL = POST_WORKORDER_PICTURE
          body.append("workOrderId", wOrderId);
        } else if (!isWorkorder && isInspection) {
          endURL = ADD_INSPECTION_PICTURE_URL;
          body.append("InspectionQuestionResponseId", inspectionResponseId);
        } else if (isPickup) {
          endURL = ADD_PICKUP_PICTURE_URL;
          body.append("PickUpId", [pickupId]);
        }
        body.append("image", imageFile);
        body.append("description", data.description);
        body.append("isCompressed", true);
        body.append("compressionType", IMAGE_COMPRESSION_TYPE);
        if(!isWorkorder){
          body.append("isSignature", false);
        }

        setLoader(true);
        const uploadSubscribe = uploadPictureAjaxObsv$(body, endURL).subscribe(
          (response) => {
            if (response) {
              setLoader(false);
              if (isReceiving && !isInspection) {
                ajaxPictureListObsv$.next({ wOrderId: wOrderId });
              } else if (!isReceiving && isWorkorder) {
                ajaxWorkOrderPictureListObsv$.next({ wOrderId: wOrderId })
              }
              else if (!isWorkorder && isInspection) {
                ajaxInspectionPictureListObsv$.next({
                  inspectionResponseId: inspectionResponseId,
                });
              } else if (isPickup) {
                ajaxPickupPictureListObsv$.next([pickupId]);
              }
              setLoader(true);
              toast.success(AMPToastConsts.PICTURE_ADD_SUCCESS, {
                position: toast.POSITION.TOP_CENTER,
              });
              closeAddPictureModal();
            } else {
              setLoader(false);
              toast.error(response?.message, {
                position: toast.POSITION.TOP_CENTER,
              });
            }
          },
          (error) => {
            setLoader(false);
            toast.error(AMPToastConsts.PICTURE_ADD_ERROR, {
              position: toast.POSITION.TOP_CENTER,
            });
          },
          () => {
            uploadSubscribe.unsubscribe();
          }
        );
      }
    }
  };

  return (
    <>
      <AMPModal
        show
        onHide={closeAddPictureModal}
        size="lg"
        backdrop="static"
        centered
      >
        <AMPModalHeader>{modalName}</AMPModalHeader>
        <AMPModalBody>
          <Container fluid>
            <div id="results" className="form-container2 bg-form">
              <AMPLoader isLoading={loader} />
              <form onSubmit={handleSubmit(handleSubmitPicture)}>
                <Row>
                  <Col>
                    <Row>
                      <Col className="webcam-select-icons mx-3">
                        <AMPFlexCenter>
                          <button
                            type="button"
                            aria-label="Add"
                            name="Add"
                            className="amp-button button-mini mx-3 m-1 icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                            onClick={showFileUploadField}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              fill="currentColor"
                              className="bi bi-camera"
                              viewBox="0 0 16 16"
                            >
                              <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1v6zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2z" />
                              <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" />
                            </svg>
                          </button>
                        </AMPFlexCenter>
                      </Col>
                    </Row>
                    {!displayFileUploadField ? (
                      <Row className="webcam-style">
                        <Col xs={12} sm={12} md={12} lg={6}>
                          <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="webcam-br"
                            videoConstraints={videoConstraints}
                          />
                          <Row className="webcam-icons">
                            <Col>
                              <FcCamera
                                size="2em"
                                className="m-1"
                                style={cursor}
                                onClick={capture}
                              />
                              <FcSwitchCamera
                                size="2em"
                                className="m-1"
                                style={cursor}
                                onClick={reverse}
                              />
                            </Col>
                          </Row>
                        </Col>
                        <Col xs={12} sm={12} md={12} lg={6}>
                          {image && (
                            <Image
                              src={`${image64}`}
                              alt="No Iamge"
                              className="preview-image"
                            />
                          )}
                          <br />
                          {captureError && (
                            <span className="text-center text-danger">
                              {captureError}
                            </span>
                          )}
                        </Col>
                      </Row>
                    ) : (
                      <AMPFormLayout>
                        <AMPFieldWrapper
                          colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
                          label="Picture"
                          controlId="picture"
                          name="picture"
                          required={true}
                          alwaysFloat
                          fieldValidationCustom={
                            pictureError ? pictureError : false
                          }
                        >
                          <AMPFile ref={register} />
                        </AMPFieldWrapper>
                      </AMPFormLayout>
                    )}
                    <AMPFormLayout>
                      <AMPFieldWrapper
                        colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
                        label="Description"
                        controlId="description"
                        name="description"
                      >
                        <AMPTextArea ref={register} />
                      </AMPFieldWrapper>
                    </AMPFormLayout>
                    <Row>
                      <Col className="text-right my-1">
                        <Button
                          type="submit"
                          variant="secondary"
                          className="px-5"
                        >
                          Add
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </form>
            </div>
          </Container>
        </AMPModalBody>
        <AMPModalFooter>
        </AMPModalFooter>
      </AMPModal>
    </>
  );
};
