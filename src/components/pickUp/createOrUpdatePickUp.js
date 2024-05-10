import React, { useState, useEffect, useRef, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";

import {
  Row,
  Col,
  Form,
  Card,
  Header,
  Button,
  Collapse,
  Container,
  Table,
} from "react-bootstrap";
import {
  Link,
  withRouter,
  Redirect,
  useLocation,
  useHistory,
} from "react-router-dom";
import AMPLoader from "../common/AMPLoader";

import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import moment from "moment";
import * as yup from "yup";
import {
  DEFAULT_BASE_URL,
  VERSION,
  CREATE_OR_UPDATE_WORKODRER,
  ConstVariable,
  GET_PICKUP_BY_ID,
  INITIATE_PICKUP,
  RETRIEVAL_VIEW_PICKUP_SINATURE_BY_WORKORDERASSETID,
} from "../common/const";
import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";
import AMPFieldSet from "../common/AMPFieldSet";
import { AMPFormLayout } from "../common/AMPFormLayout";
import { AMPFieldWrapper } from "../common/AMPFieldWrapper";
import { AMPTextArea, AMPTextBox } from "../common";
import { AMPTextBoxReadOnly } from "../common/AMPTextBoxReadOnly";
import { AMPToastConsts } from "../common/const/AMPToastConst";
import { ampJsonAjax } from "../common/utils/ampAjax";

import { toast } from "react-toastify";
import { useAccessState } from "../../utils/AppContext/loginContext";
import { AMPValidation } from "../common/AMPAuthorization/AMPValidation";
import AMPAuthorization from "../common/AMPAuthorization/AMPAuthorization";

const submitPickupByIdAJax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.put(URL, params).pipe(
        map((xhrResponse) => {
          return { ...xhrResponse, params };
        }),
        catchError((error) => {
          console.error("Error in update Receiving Form", error);
          errorHandler(error.response);
          return [];
        })
      )
    )
  ); // ENd of line

//Initiate Pickup Entry Form Api starts
const initiatePickUpEntryAJax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.post(URL, params).pipe(
        map((xhrResponse) => {
          return xhrResponse;
        }),
        catchError((error) => {
          console.error("Error in create PickUp Entry Form", error);
          errorHandler(error.response);
          return [];
        })
      )
    )
  ); // ENd of line

// view Signature fetching start
const getSignatureByIdAjaxObs$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax.post(URL, param).pipe(
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

export const CreateOrUpdatePickUp = (props) => {
  const locationRef = useLocation();
  const history = useHistory();
  const context = useAccessState();
  const [stateData, setStateData] = useState(null);
  const [signatureError, setSignatureError] = useState(false);

  const [tempData, setTempData] = useState();
  const [loader, setLoader] = useState();
  const validationSchema = useMemo(
    () =>
      yup.object({
        shippedOn: yup.date().required("Required"),
        destination: yup.string().required("Required"),
      }),
    []
  );
  const resolver = AMPValidation(validationSchema);
  const { handleSubmit, reset, watch, control, register, setValue, errors } =
    useForm({
      defaultValues: tempData,
      resolver,
    });
  const workAssetId =
    locationRef?.state?.WOrkorderAssetID || props?.workAssetId;
  const pickupStatus = locationRef?.state?.pickupStatus;
  const pickupIdforEdit = locationRef?.state?.pickupId;

  const {
    isCreate,
    openSignatureModal,
    signUrl,
    loggedUserName,
    openPictureModal,
    openDocumentModal,
    setPickUpId,
    pickupId,
    handlePrint,
    componentRef,
    setSignUrl,
    getPickUpByIdAjax$,
    setStatus,
    statusInfo,
    getGeneratedPickUpNumberAjax$,
    getPickUpById$,
    showPictureModal,
    showDocumentModal,
  } = props;

  const initiatePickUpEntry$ = useMemo(() => {
    return initiatePickUpEntryAJax$(
      DEFAULT_BASE_URL + VERSION + INITIATE_PICKUP,
      {
        errorHandler: (error) => {
          toast.error(
            isCreate
              ? AMPToastConsts.PICKUP_CREATE_ERROR
              : AMPToastConsts.PICKUP_UPDATE_ERROR,
            {
              position: toast.POSITION.TOP_CENTER,
            }
          );
        },
      }
    );
  }, []);
  /* Observer for save response from ajax request */
  useObservableCallback(initiatePickUpEntry$, (response) => {
    if (!response?.response?.status) {
      toast.error(response.response.message, {
        position: toast.POSITION.TOP_CENTER,
      });
      setLoader(false);
    } else {
      setLoader(false);
      setPickUpId(response?.response?.content?.id);
      toast.success(
        isCreate
          ? AMPToastConsts.PICKUP_INITIATE_SUCCESS
          : AMPToastConsts.PICKUP_UPDATE_SUCCESS,
        {
          position: toast.POSITION.TOP_CENTER,
        }
      );
      history.push({
        pathname: "/Pump/UpdatePickup",
        state: {
          isCreate: false,
          pickupId: pickupId,
          WOrkorderAssetID: workAssetId,
          pickupStatus: pickupStatus,
        },
      });
    }
  });
  
  //Generate Pickup Number Api starts
  const getGeneratedPickNumber$ = useMemo(() => {
    return getGeneratedPickUpNumberAjax$({
      errorHandler: (error) => {
        toast.error(AMPToastConsts.RECEIVING_CREATE_ERROR, {
          position: toast.POSITION.TOP_CENTER,
        });
      },
    });
  }, []);

  /* Observer for save response from ajax request */
  useObservableCallback(getGeneratedPickNumber$, (response) => {
    if (!response?.status) {
      toast.error(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
      setLoader(false);
    } else {
      const formData = response?.params;
      const ajaxParams = {
        PickupId: isCreate ? ConstVariable.DID : pickupId,
        WorkorderAssetId: workAssetId,
        ShippedOn: moment(new Date(formData?.shippedOn)).format("YYYY-MM-DD"),
        Destination: formData.destination,
        Comment: formData?.comment,
        PickupNumber: response?.content,
        Status: 2,
      };

      initiatePickUpEntry$.next(ajaxParams);
    }
  });
  //Generate Pickup Number Api ends
  const submitPickupById$ = useMemo(() => {
    return submitPickupByIdAJax$(DEFAULT_BASE_URL + VERSION + INITIATE_PICKUP, {
      errorHandler: (error) => {
        toast.error(
          isCreate
            ? AMPToastConsts.PICKUP_CREATE_ERROR
            : AMPToastConsts.PICKUP_UPDATE_ERROR,
          {
            position: toast.POSITION.TOP_CENTER,
          }
        );
      },
    });
  }, []);
  /* Observer for save response from ajax request */
  useObservableCallback(submitPickupById$, (response) => {
    if (!response?.response?.status) {
      toast.error(response.response.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      setLoader(false);
      setStatus(response?.response?.content?.status);
      toast.success(AMPToastConsts.PICKUP_SUBMITTED_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });
  const onSubmit = (formData) => {
    setLoader(true);
    if (isCreate) {
      // Generate Pickup Number and then inside generated pickup api call save/update api after getting response
      getGeneratedPickNumber$.next(formData);
    } else if (!isCreate && pickupId !== ConstVariable.DID) {
      const ajaxParams = {
        PickupId: isCreate ? ConstVariable.DID : pickupId,
        WorkorderAssetId: workAssetId,
        ShippedOn: moment(new Date(formData?.shippedOn)).format("YYYY-MM-DD"),
        Destination: formData.destination,
        Comment: formData?.comment,
        PickupNumber: stateData[0].pickupNumber,
        Status: 2,
      };

      initiatePickUpEntry$.next(ajaxParams);
    }
  };

  /* Observer for view response from ajax request */
  useObservableCallback(
    getPickUpById$,
    (response) => {
      if (!response?.status) {
        toast.error(response?.message, {
          position: toast.POSITION.TOP_CENTER,
        });
        setLoader(false);
      } else {
        setLoader(false);
        if (!isCreate) {
          const fields = ["comment", "destination", "signature", "shippedOn"];
          const shippedOn = response?.content?.searchData[0]?.shippedOn
            ? moment(
                new Date(response?.content?.searchData[0]?.shippedOn)
              ).format("YYYY-MM-DD")
            : null;
          const content = {
            shippedOn: shippedOn,
            customer: response?.content?.searchData[0]?.customer,
            destination: response?.content?.searchData[0]?.destination,
            comment: response?.content?.searchData[0]?.comments,
          };

          fields.forEach((field) => {
            setValue(field, content[field]);
          });

          setTempData(content);
        }
        setStatus(response?.content?.status);
        setStateData(response?.content?.searchData);
        setPickUpId(response?.content?.searchData[0].pickupId);
        if (!isCreate) {
          ajaxSignatureByIdObsv$.next([
            response?.content?.searchData[0].pickupId,
          ]);
        }
      }
    },
    null,
    []
  );
  const ajaxSignatureByIdObsv$ = useMemo(() => {
    return getSignatureByIdAjaxObs$(
      DEFAULT_BASE_URL +
        VERSION +
        RETRIEVAL_VIEW_PICKUP_SINATURE_BY_WORKORDERASSETID,
      {
        errorHandler: (error) => {
          toast.error(AMPToastConsts.PICTURE_VIEW_BY_ID_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  /* Observer for save response from ajax request */
  useObservableCallback(ajaxSignatureByIdObsv$, (response) => {
    if (!response?.status) {
      toast.error(response.response.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      setSignUrl(response?.content && response?.content[0]?.imageUploaded);
    }
  });
  useEffect(() => {
    if (
      pickupId ||
      statusInfo !== 3
    ) {
      setLoader(true);
      getPickUpById$.next({
        PickupId: pickupId || ConstVariable.DID,
        WOrkorderAssetID: workAssetId,
      });
    }
  }, [workAssetId, pickupId]);

  const onPickUpSubmit = () => {
    if (!signUrl) {
      setSignatureError(true);
    } else {
      submitPickupById$.next([pickupId]);
    }
  };

  useEffect(() => {
    var canvas = document.getElementById("image");
    var ctx = canvas?.getContext("2d");

    var img = new Image();

    img.onload = function () {
      if(canvas){
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      }
    };
    img.src = signUrl;
  }, [signUrl]);
  return (
    <div className="mb-5">
      <AMPLoader isLoading={loader} />
      <Row>
        <Col md={6} sm={12} lg={9} xs={12} ref={componentRef}>
          <AMPFieldSet title="Work Order Details">
            <Container fluid>
              <div id="results" className="form-container mx-0 bg-form py-2">
                <Table striped bordered hover responsive size="sm">
                  <thead>
                    <tr className="text-center">
                      <th>Service Center</th>
                      <th>Work Order #</th>
                      <th>Serial Number</th>
                      <th>Organization</th>
                      <th>Customer Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stateData?.map((itm, idx) => {
                      return (
                        <tr key={itm?.id} className="text-center">
                          <td>{itm.serviceCenter}</td>
                          <td>{itm.workorderNumber}</td>
                          <td>{itm.serialNumber}</td>
                          <td>{itm.organization}</td>
                          <td>
                            {itm.customer ||
                              "" + "/" + itm?.area ||
                              "" + "/" + itm?.region ||
                              "" + "/" + itm?.district ||
                              "" + "/" + itm?.group ||
                              ""}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </Container>
          </AMPFieldSet>
          {statusInfo !== 3 ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <AMPFieldSet title="Pickup Entry Details">
                <AMPFormLayout>
                  <AMPFieldWrapper
                    colProps={{ md: 6, sm: 12, lg: 6, xs: 12 }}
                    label="Picked On"
                    controlId="shippedOn"
                    name="shippedOn"
                    required="true"
                    fieldValidation={errors.shippedOn ? true : false}
                    readOnly={!context?.features?.includes("PIC-ENTRY")}
                  >
                    <Form.Control
                      type="date"
                      ref={register}
                      defaultValue={moment(new Date()).format("YYYY-MM-DD")}
                    />
                  </AMPFieldWrapper>

                  <AMPFieldWrapper
                    colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
                    label="Destination"
                    controlId="destination"
                    name="destination"
                    required="true"
                    fieldValidation={errors.destination ? true : false}
                    readOnly={!context?.features?.includes("PIC-ENTRY")}
                  >
                    <AMPTextArea ref={register} />
                  </AMPFieldWrapper>

                  <AMPFieldWrapper
                    colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
                    label="Comment"
                    controlId="comment"
                    name="comment"
                    readOnly={!context?.features?.includes("PIC-ENTRY")}
                  >
                    <AMPTextArea ref={register} />
                  </AMPFieldWrapper>
                </AMPFormLayout>
                <Col xs={12} lg={12} md={12} sm={12}>
                  <Row>
                    <Col xs={12} lg={3} md={6} sm={12}>
                      <AMPFieldWrapper
                        colProps={{ md: 6, sm: 12, lg: 3, xs: 12 }}
                        label="Logged In User"
                        controlId="userName"
                        name="userName"
                        isFocused="false"
                      >
                        <AMPTextBoxReadOnly value={loggedUserName} />
                      </AMPFieldWrapper>
                    </Col>
                    {!signUrl && pickupId !== ConstVariable.DID && (
                      <Col xs={12} lg={3} md={6} sm={12}>
                        <AMPAuthorization
                          hasToken={context?.features?.includes("PIC-ENTRY")}
                        >
                          <Button
                            type="button"
                            variant=" btn btn-secondary"
                            className="mt-4"
                            block
                            onClick={openSignatureModal}
                          >
                            Add Signature
                          </Button>
                        </AMPAuthorization>
                        {signatureError && (
                          <div className="error-message amp-field-error -feedback">
                            Signature is required
                          </div>
                        )}
                      </Col>
                    )}

                    <Col xs={12} lg={6} md={6} sm={12}>
                      {signUrl && (
                        <canvas
                          id="image"
                          className="wd-max-200 ht-max-100 m-30"
                        ></canvas>
                      )}
                    </Col>
                  </Row>
                </Col>
              </AMPFieldSet>
              <Row>
                <Col className="text-right">
                  <AMPAuthorization
                    hasToken={context?.features?.includes("PIC-ENTRY")}
                  >
                    {isCreate &&
                      stateData &&
                      stateData[0].pickupId === ConstVariable.DID && (
                        <Button
                          type="submit"
                          variant="secondary"
                          className="px-5 m-2 mb-4 "
                          size="md"
                        >
                          Save
                        </Button>
                      )}
                    {!isCreate && (
                      <Button
                        type="submit"
                        variant="secondary"
                        className="px-5 m-2 mb-4 "
                        size="md"
                      >
                        Update
                      </Button>
                    )}
                  </AMPAuthorization>
                </Col>
              </Row>
              <AMPAuthorization
                hasToken={context?.features?.includes("PIC-ENTRY")}
              >
                {statusInfo !== 3 && pickupId !== ConstVariable.DID && (
                  <Row>
                    <Col>
                      <Button
                        type="button"
                        variant="primary"
                        className="mb-4 mx-2 float-right width-1 mt-2"
                        onClick={(e) => onPickUpSubmit()}
                      >
                        Submit
                      </Button>
                    </Col>
                  </Row>
                )}
              </AMPAuthorization>
            </form>
          ) : (
            <AMPFieldSet title="Pickup Entry Details">
              <Row>
                <Col lg={4} sm={6} md={4} xs={6}>
                  <div className="font-weight-bold">Shipped On</div>
                  <div>
                    {stateData && stateData[0]?.shippedOn
                      ? moment(new Date(stateData[0]?.shippedOn)).format(
                          "YYYY-MM-DD"
                        )
                      : null}
                  </div>
                </Col>
                <Col lg={4} sm={6} md={4} xs={6}>
                  <div className="font-weight-bold">Destination</div>
                  <div>{stateData && stateData[0]?.destination}</div>
                </Col>
                <Col lg={4} sm={6} md={4} xs={6}>
                  <div className="font-weight-bold">Comment</div>
                  <div>{stateData && stateData[0]?.comments}</div>
                </Col>
                <Col lg={4} sm={6} md={4} xs={6}>
                  <div className="font-weight-bold">Logged In User</div>
                  <div>{loggedUserName}</div>
                </Col>
                <Col lg={4} sm={6} md={4} xs={6}>
                  <div className="font-weight-bold">Signature</div>

                  <div>
                    {signUrl && (
                      <img
                        src={signUrl}
                        alt="No Image"
                        width="180"
                        height="60"
                      />
                    )}
                  </div>
                </Col>
              </Row>
            </AMPFieldSet>
          )}
        </Col>
        <Col md={6} sm={12} lg={3} xs={12} className="text-center bg-side-link">
          <Row>
            <Card className="card-positioning">
              <Card.Body>
                <Col className="side-heading" md={12} sm={12} lg={12} xs={12}>
                  Quick Links
                  <hr />
                </Col>
                {pickupId !== ConstVariable.DID ? (
                  <div>
                    <Col className="side-links" md={12} sm={12} lg={12} xs={12}>
                      <Link
                        to={{
                          pathname: "",
                          state: {
                            isCreate: isCreate,
                            id: workAssetId,
                            WOrkorderAssetID: workAssetId,
                            pickupId: pickupId,
                            pickupStatus: pickupStatus,
                            statusInfo: statusInfo,
                          },
                        }}
                        onClick={() => openPictureModal(pickupId)}
                      >
                        Pictures ({stateData && stateData[0]?.numberofPic})
                      </Link>
                    </Col>
                    <Col className="side-links" md={12} sm={12} lg={12} xs={12}>
                      <Link
                        to={{
                          pathname: "",
                          state: {
                            isCreate: isCreate,
                            id: workAssetId,
                            WOrkorderAssetID: workAssetId,
                            pickupStatus: pickupStatus,
                            statusInfo: statusInfo,
                            isReceiving:false,
                            isBilling: false,
                            isWorkorder:false,
                            isPickup:true
                          },
                        }}
                        onClick={() => openDocumentModal(pickupId)}
                      >
                        Documents ({stateData && stateData[0]?.numberofDocument}
                        )
                      </Link>
                    </Col>
                  </div>
                ) : (
                  <div>
                    <Col className="side-links" md={12} sm={12} lg={12} xs={12}>
                      Pictures (0)
                    </Col>
                    <Col className="side-links" md={12} sm={12} lg={12} xs={12}>
                      Documents(0)
                    </Col>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Row>
        </Col>
      </Row>
    </div>
  );
};
