import React, { useState, useEffect, useRef, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import ReactGA from 'react-ga';
import {
  Row,
  Col,
  Form,
  Card,
  Header,
  Button,
  Collapse,
} from "react-bootstrap";
import { Link, withRouter, Redirect, useLocation } from "react-router-dom";

import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import Select, { components } from "react-select";
import moment from "moment";
import {
  DEFAULT_BASE_URL,
  VERSION,
  CREATE_OR_UPDATE_WORKODRER,
  GET_WORK_ORDER_BY_ID,
  GET_ORGANIZATION_FOR_CUSTOMER,
  ConstVariable,
} from "../common/const";
import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";
import AMPFieldSet from "../common/AMPFieldSet";
import AMPLoader from "../common/AMPLoader";
import { AMPFormLayout } from "../common/AMPFormLayout";
import { AMPFieldWrapper } from "../common/AMPFieldWrapper";
import { AMPTextArea, AMPTextBox } from "../common";
import { AMPCheckbox } from "../common/AMPCheckbox";
import { AMPNumberTextBox2 } from "../common/AMPNumberTextBox2";
import { AMPTextBoxReadOnly } from "../common/AMPTextBoxReadOnly";
import { OrganizationalDetailsForm } from "../workOrders/OrganizationalDetails";
import { AMPToastConsts } from "../common/const/AMPToastConst";
import { ampJsonAjax } from "../common/utils/ampAjax";

import { toast } from "react-toastify";
import { useAccessState } from "../../utils/AppContext/loginContext";
import { AMPErrorAlert } from "../common/AMPAlert";
import AMPTooltip2 from "../common/AMPTooltip2";

// Fetch Organization details for customer user
const getOrganizationForCustomerAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax
        .get(DEFAULT_BASE_URL + VERSION + GET_ORGANIZATION_FOR_CUSTOMER)
        .pipe(
          map((xhrResponse) => {
            return xhrResponse;
          }),
          catchError((error) => {
            return throwError(error);
          })
        )
    )
  );

//get by work order Id

const getWorkOrderByIdAjax$ = () =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax
        .get(DEFAULT_BASE_URL + VERSION + GET_WORK_ORDER_BY_ID + params)
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

//On Update New Questionnaire
const updateWorkOrderAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.put(URL, params).pipe(
        map((xhrResponse) => {
          return { ...xhrResponse, params };
        }),
        catchError((error) => {
          console.error("Error in update Work Order Form", error);
          errorHandler(error.response);
          return [];
        })
      )
    )
  ); // ENd of line

//On Update New Questionnaire
const updateWorkOrderFormAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.put(URL + "/" + params).pipe(
        map((xhrResponse) => {
          return xhrResponse;
        }),
        catchError((error) => {
          console.error("Error in update Work Order Form", error);
          errorHandler(error.response);
          return [];
        })
      )
    )
  ); // ENd of line

export const EditWorkOrder = (props) => {
  const locationRef = useLocation();
  const context = useAccessState();
  let defaultValue = {
    workOrderNumber: "",
  };
  const [errorOrganizationMessage, setErrorOrganizationMessage] = useState();
  const [workOrderIdAfterUpdate, setWorkOrderIdAfterUpdate] = useState();
  const [updateForMoveToWorkOrder, setUpdateForMoveToWorkOrder] =
    useState(false);
  const [showServiceCenterError, setServiceCenterErrors] = useState(false);
  const [showWorkOrderTypeError, setWorkOrderTypeErrors] = useState(false);
  const [showReceivedOnOrder, setReceivedOneErrors] = useState(false);
  const [showExpDateError, setExpectedDateErrors] = useState(false);
  const [showMoveToWorkOrder, setMoveToWorkOrderErrors] = useState(false);
  const [moveToWorkOrderStatus, setMoveToWorkOrderStatus] = useState(false);
  const [stateData, setStateData] = useState(!workId ? defaultValue : null);
  const [organizationGroup, setOrganizationGroup] = useState({});
  const { handleSubmit, reset, watch, control, register, setValue, errors } =
    useForm({
      defaultValues: stateData,
    });
  const isComponentReceived = watch("isComponentReceived");
  const [ajaxData, setAjaxData] = useState();
  const [workOrderId, setWorkOrderId] = useState();
  const params = new window.URLSearchParams(window.location.search);
  const workId = locationRef?.state?.id || params.get("workOrderId");
  const status = locationRef?.state?.status;

  const org = watch("organization");
  const cust = watch("customer");
  const organizationArea = watch("area");
  const organizationRegion = watch("region");
  const organizationDistrict = watch("district");
  const {
    isCreate,
    setIsWorkOrderNumberLoading,
    isWorkOrderNumberLoading,
    generateWorkOrderNumber,
    isWorkOrderNumberGenerated,
    workOrderType,
    loggedUserName,
    openPictureModal,
    openDocumentModal,
    location,
    openAssetModal,
    openOrganizationModal,
    organizationGroupId,
    customerId,
    organizationData,
    setOrganizationData,
    state,
    showAssetOrReceivingOrWorkForBack,
  } = props;

  // For google analytics purpose
  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, [])
  useEffect(() => {
    if (isWorkOrderNumberGenerated) {
      setValue("workOrderNumber", isWorkOrderNumberGenerated);
    }
  }, [isWorkOrderNumberGenerated]);

  useEffect(() => {
    window.sessionStorage.removeItem("ajaxReceivingSearch");
  }, []);
  // // For Update Receivng Form
  const updateWorkOrder$ = useMemo(() => {
    return updateWorkOrderAjax$(
      DEFAULT_BASE_URL + VERSION + CREATE_OR_UPDATE_WORKODRER,
      {
        errorHandler: (error) => {
          toast.error(AMPToastConsts.WORKORDER_UPDATE_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  /* Observer for update response from ajax request */
  useObservableCallback(updateWorkOrder$, (response) => {
    if (!response?.status) {
      toast.error(response.response.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      if (
        // moveToWorkOrderStatus &&
        !response?.params?.ServiceCenterId ||
        !response?.params?.WorkorderTypeId ||
        (!response?.params?.ReceivedOn &&
          !response?.params?.IsComponentReceived) ||
        (!response?.params?.ExpectedReceiveDate &&
          response?.params?.IsComponentReceived)
      ) {
        if (!response?.params?.ServiceCenterId) {
          setServiceCenterErrors(false);
        }
        if (!response?.params?.WorkorderTypeId) {
          setWorkOrderTypeErrors(false);
        }
        if (
          !response?.params?.ReceivedOn &&
          response?.params?.IsComponentReceived
        ) {
          setReceivedOneErrors(false);
        }
        if (
          !response?.params?.ExpectedReceiveDate &&
          !response?.params?.IsComponentReceived
        ) {
          setExpectedDateErrors(false);
        }
        setUpdateForMoveToWorkOrder(true);
      }
      toast.success(AMPToastConsts.WORKORDER_UPDATE_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
      setWorkOrderIdAfterUpdate(response?.params?.id);
    }
  }); // ENd of line

  // // For Update Work Order Form
  const updateWorkOrderForm$ = useMemo(() => {
    return updateWorkOrderFormAjax$(
      DEFAULT_BASE_URL + VERSION + CREATE_OR_UPDATE_WORKODRER,
      {
        errorHandler: (error) => {
          toast.error(AMPToastConsts.WORKORDER_UPDATE_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  /* Observer for update response from ajax request */
  useObservableCallback(updateWorkOrderForm$, (response) => {
    if (!response?.response?.status) {
      toast.error(response.response.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      //fetch section

      toast.success(AMPToastConsts.WORKORDER_UPDATE_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  }); // ENd of line
  const onSubmit = (formData) => {
    if (
      !formData?.customer?.value &&
      !organizationData?.customerName &&
      !organizationGroup?.customer_id
    ) {
      setErrorOrganizationMessage(true);
    } else {
      setErrorOrganizationMessage(false);
      const ajaxParams = {
        id: workId,
        WorkorderNumber: formData?.workOrderNumber?.toUpperCase(),
        ServiceCenterId:
          parseInt(stateData?.serviceCenterId) || parseInt(0),
        WorkorderTypeId: parseInt(stateData?.workOrderTypeValue) || parseInt(0),
        OrganizationGroupId:
          organizationGroupId ||
          parseInt(formData?.groupUnit?.value) ||
          parseInt(organizationGroup?.group_unit_id) ||
          parseInt(formData?.district?.value) ||
          parseInt(organizationGroup?.district_id) ||
          parseInt(formData?.region?.value) ||
          parseInt(organizationGroup?.region_id) ||
          parseInt(formData?.area?.value) ||
          parseInt(organizationGroup?.area_id) ||
          parseInt(formData?.customer?.value) ||
          parseInt(organizationGroup?.customer_id) ||
          parseInt(formData?.organization?.value) ||
          parseInt(organizationGroup?.organization_id) ||
          stateData?.organizationGroupId,
        CustomerId: parseInt(
          customerId || organizationGroup?.customer_id || stateData?.customerId
        ),
        IsComponentReceived: formData?.isComponentReceived,
        ExpectedReceiveDate: formData?.expReceiving
          ? new Date(formData?.expReceiving)
          : null, //formData?.expReceiving,
        ReceivedOn: formData?.receivedOn
          ? new Date(formData?.receivedOn)
          : null,
        Qnnumber: formData?.qnNumber,
        Comment: formData?.comment,
        LinkedWorkorderNumber: formData?.pumpWorkOrderNumber,
        locationHierarchyLevelId: stateData?.locationHierarchyLevelId
      };
      setAjaxData(ajaxParams);

      updateWorkOrder$.next(ajaxParams);
    }
  };

  //Get work order By id memo function
  const getWorkOrderById$ = useMemo(() => {
    return getWorkOrderByIdAjax$({
      errorHandler: (error) => {
        toast.error(AMPToastConsts.RECEIVING_CREATE_ERROR, {
          position: toast.POSITION.TOP_CENTER,
        });
      },
    });
  }, []);
  /* Observer for view response from ajax request */
  useObservableCallback(
    getWorkOrderById$,
    (response) => {
      if (!response?.status) {
        toast.error(response?.message, {
          position: toast.POSITION.TOP_CENTER,
        });
      } else {
        setIsWorkOrderNumberLoading(false);
        let currentServiceCenter = { label: "", value: "" };
        let currentWorkType = { label: "", value: "" };
        if (response?.content?.workorderTypeId) {
          currentWorkType = workOrderType?.filter((item) => {
            if (parseInt(item.value) === response?.content?.workorderTypeId) {
              return item;
            } else return null;
          });
        }

        const fields = [
          "workOrderNumber",
          "workOrderType",
          "isComponentReceived",
          "serviceCenter",
          "receivedOn",
          "expReceiving",
          "qnNumber",
          "comment",
          "pumpWorkOrderNumber",
        ];
        const expDate = response?.content?.expectedReceiveDate
          ? moment(new Date(response?.content?.expectedReceiveDate)).format(
            "YYYY-MM-DD"
          )
          : null;
        const receivedOn = response?.content?.receivedOn
          ? moment(new Date(response?.content?.receivedOn)).format("YYYY-MM-DD")
          : null;
        const content = {
          workOrderNumber: response?.content?.workorderNumber,
          serviceCenter: response?.content?.serviceCenterName,
          serviceCenterId: response?.content?.serviceCenterId,
          workOrderType: currentWorkType[0]?.label,
          expReceiving: expDate, //response?.content?.expectedReceiveDate,
          receivedOn: receivedOn,
          customerId: response?.content?.customerId,
          organizationGroupId: response?.content?.organizationGroupId,
          qnNumber: response?.content?.qnnumber,
          comment: response?.content?.comment,
          isComponentReceived: response?.content?.isComponentReceived,
          numberOfAssets: response?.content?.numberOfAssets,
          numberOfDocuments: response?.content?.numberOfDocuments,
          numberOfPictures: response?.content?.numberOfPictures,
          workOrderTypeValue: currentWorkType[0]?.value,
          pumpWorkOrderNumber: response?.content?.linkedWorkorderNumber,
          locationHierarchyLevelId: response?.content?.locationHierarchyLevelId
        };
        fields.forEach((field) => setValue(field, content[field]));

        setStateData(content);
        setOrganizationData(response?.content?.organizationalGroupResponse);
        defaultValue = { workorderNumber: response?.content?.workorderNumber };
      }
    },
    null,
    [location, workOrderType]
  );

  const ajaxOrganizationGroupObsv$ = useMemo(() => {
    return getOrganizationForCustomerAjaxObs$();
  }, []);
  useObservableCallback(
    ajaxOrganizationGroupObsv$,
    (response) => {
      if (!response?.status) {
        toast.error(response?.response?.message, {
          position: toast.POSITION.TOP_CENTER,
        });
      } else {
        setIsWorkOrderNumberLoading(false);
        setOrganizationGroup(response?.response?.content?.content);
      }
    },
    []
  ); // Organization group ends

  useEffect(() => {
    if (workId) {
      if (location?.length > 0 && workOrderType?.length > 0) {
        getWorkOrderById$.next(workId);
      }
      setIsWorkOrderNumberLoading(true);
    }
    if (!workId && context?.userType === ConstVariable?.CST) {
      ajaxOrganizationGroupObsv$.next();
      setIsWorkOrderNumberLoading(true);
    }
  }, [workId, workOrderIdAfterUpdate, location, workOrderType, state]);
  useEffect(() => {
    if (stateData?.workOrderTypeValue == "5") {
      setValue("pumpWorkOrderNumber", stateData?.pumpWorkOrderNumber);
    }
  }, [stateData?.workOrderTypeValue]);

  // For service center multiple option type
  const colourStyles = {
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        backgroundColor: isFocused ? "#999999" : null,
        color: data?.locationHierarchyLevelId === 4 ? "blue" : null,
      };
    },
  };
  const { Option } = components;
  const IconOption = (props) => (
    <Option {...props}>
      {props.data.label} <span className="text-info">{props.data?.locationHierarchyLevelId === 4 && "(Hub)"}</span>
    </Option>
  );

  // useEffect(() => {
  //   $(function () {
  //     $('[data-toggle="tooltip"]').tooltip()
  //   })
  // }, [])

  return (
    <>
      {workOrderIdAfterUpdate && (
        <Redirect
          to={{
            pathname: `/Pump/EditWorkOrder`,
            state: {
              isCreate: false,
              id: workId,
              status: status,
            },
          }}
        />
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col md={6} sm={12} lg={9} xs={12}>
            <AMPFieldSet title="Work Order Details">
              <AMPLoader isLoading={isWorkOrderNumberLoading} />
              <AMPFormLayout>
                <AMPFieldWrapper
                  colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                  label="Service Center"
                  controlId="serviceCenter"
                  name="serviceCenter"
                  isDisabled={
                    status === ConstVariable?.CLSD ||
                    status === ConstVariable?.RJCT
                  }
                  fieldValidation={showServiceCenterError}
                  styles={colourStyles}
                  components={{ Option: IconOption }}
                  readOnly={true}
                >
                  <AMPTextBox
                    className="text-uppercase"
                    ref={register({ required: true })}
                  />
                </AMPFieldWrapper>

                <AMPFieldWrapper
                  colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                  label="Work Order Type"
                  controlId="workOrderType"
                  name="workOrderType"
                  fieldValidation={showWorkOrderTypeError}
                  isDisabled={
                    status === ConstVariable?.CLSD ||
                    status === ConstVariable?.RJCT
                  }
                  readOnly={true}
                >
                  <AMPTextBox
                    className="text-uppercase"
                    ref={register({ required: true })}
                  />
                </AMPFieldWrapper>
                <AMPFieldWrapper
                  colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                  label="Work Order Number"
                  controlId="workOrderNumber"
                  name="workOrderNumber"
                  required="true"
                  readOnly={true}
                  fieldValidation={errors?.workOrderNumber ? true : false}
                >
                  <AMPTextBox
                    className="text-uppercase"
                    ref={register({ required: true })}
                  />
                </AMPFieldWrapper>

                {stateData?.workOrderTypeValue == "5" && (
                  <AMPFieldWrapper
                    colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                    label="Pump Work Order Number"
                    controlId="pumpWorkOrderNumber"
                    name="pumpWorkOrderNumber"
                  >
                    <AMPTextBox className="text-uppercase" ref={register} />
                  </AMPFieldWrapper>
                )}
              </AMPFormLayout>
            </AMPFieldSet>
            <AMPFieldSet title="Organizational Details">
              {context?.userType === ConstVariable?.INRNL && isCreate && (
                <OrganizationalDetailsForm
                  org={org}
                  cust={cust}
                  organizationArea={organizationArea}
                  organizationRegion={organizationRegion}
                  organizationDistrict={organizationDistrict}
                  control={control}
                  errors={errors}
                  setValue={setValue}
                  errorOrganizationMessage={errorOrganizationMessage}
                  type="add/edit"
                />
              )}

              {((context?.userType === ConstVariable?.INRNL && !isCreate) ||
                context?.userType === ConstVariable?.CST) && (
                  <Col xs={12}>
                    <Col lg={12} sm={12} md={12} xs={12}>
                      {status !== ConstVariable?.CLSD &&
                        status !== ConstVariable?.RJCT && (
                          <div className="float-right">
                            <Link
                              onClick={openOrganizationModal}
                              to={{
                                pathname: "",
                                state: {
                                  isCreate: false,
                                  id: workId,
                                  status: status,
                                },
                              }}
                            >
                              Change
                            </Link>
                          </div>
                        )}
                    </Col>
                    <Row>
                      <Col lg={4} sm={6} md={6} xs={12}>
                        <div className="font-weight-bold">Organization</div>
                        <div>
                          {organizationData?.organizationName ||
                            organizationGroup?.organization_name ||
                            "NA"}
                        </div>
                      </Col>
                      <Col lg={4} sm={6} md={6} xs={12}>
                        <div className="font-weight-bold">Customer</div>
                        <div>
                          {organizationData?.customerName ||
                            organizationGroup?.customer_name ||
                            "NA"}
                        </div>
                      </Col>
                      <Col lg={4} sm={6} md={6} xs={12}>
                        <div className="font-weight-bold">Area</div>
                        <div>
                          {organizationData?.areaName ||
                            organizationGroup?.area_name ||
                            "NA"}
                        </div>
                      </Col>
                      <Col lg={4} sm={6} md={6} xs={12}>
                        <div className="font-weight-bold">Region</div>
                        <div>
                          {organizationData?.regionName ||
                            organizationGroup?.region_name ||
                            "NA"}
                        </div>
                      </Col>
                      <Col lg={4} sm={6} md={6} xs={12}>
                        <div className="font-weight-bold">District</div>

                        <div>
                          {organizationData?.districtName ||
                            organizationGroup?.district_name ||
                            "NA"}
                        </div>
                      </Col>
                      <Col lg={4} sm={6} md={6} xs={12}>
                        <div className="font-weight-bold">Group/Unit</div>
                        <div>
                          {organizationData?.groupName ||
                            organizationGroup?.group_unit_name ||
                            "NA"}
                        </div>
                      </Col>
                    </Row>
                  </Col>
                )}
            </AMPFieldSet>
            {status !== ConstVariable?.CLSD && status !== ConstVariable?.RJCT && (
              <Row>
                <Col className="text-right">
                  <Button
                    type="submit"
                    variant="secondary"
                    className="px-5 m-2 mb-4 "
                    size="md"
                  >
                    Update
                  </Button>
                </Col>
              </Row>
            )}
          </Col>
          <Col
            md={6}
            sm={12}
            lg={3}
            xs={12}
            className="text-center bg-side-link"
          >
            <Row>
              <Card className="card-positioning">
                <Card.Body>
                  <Col className="side-heading" md={12} sm={12} lg={12} xs={12}>
                    Quick Links
                    <hr />
                  </Col>
                  {workId && !isCreate ? (
                    <div>
                      <Col
                        className="side-links"
                        md={12}
                        sm={12}
                        lg={12}
                        xs={12}
                      >
                        {status !== ConstVariable?.RJCT && (
                          <Link
                            to={{
                              pathname: "/Pump/CreateOrUpdateAsset",
                              state: {
                                isCreate: false,
                                id: workId,
                                status: status,
                                showAssetOrReceivingOrWorkForBack: true,
                                isReceiving: false,
                                backForm: "workOrder",
                                serviceCenterId: stateData?.serviceCenterId,
                                workOrderNumber: stateData?.workOrderNumber,
                              },
                            }}
                            onClick={() => openAssetModal(workId)}
                          >
                            Asset ({stateData?.numberOfAssets})
                          </Link>
                        )}
                      </Col>
                      <Col
                        className="side-links"
                        md={12}
                        sm={12}
                        lg={12}
                        xs={12}
                      >
                        <Link
                          to={{
                            pathname: "",
                            state: {
                              isCreate: false,
                              id: workId,
                              status: status,
                              isReceiving: false,
                              isWorkorder: true,                        
                              // isBilling: false,
                              // inspectionWorkOrderNumber:
                              //   inspectionWorkOrderNumber || null,
                              // inspectionType: inspectionType || null,
                              // linkedWorkorderNumber: inspectionWorkOrderNumber || stateData?.linkedWorkorderNumber || null
                            },
                          }}
                          onClick={() => openPictureModal(workId)}
                        >
                          <AMPTooltip2
                            title="Work Order Pictures"
                            dataPlacement="top"
                          >
                            Pictures ({stateData?.numberOfPictures})
                          </AMPTooltip2>
                          {/* <span
                            data-toggle="tooltip"
                            data-placement="top"
                            title="Work Order Documents">
                            Picture ({stateData?.numberOfPictures})
                          </span> */}
                        </Link>
                      </Col>
                      <Col
                        className="side-links"
                        md={12}
                        sm={12}
                        lg={12}
                        xs={12}
                      >
                        <Link
                          to={{
                            pathname: "",
                            state: {
                              isCreate: false,
                              id: workId,
                              status: status,
                              isReceiving: false,
                              isWorkorder: true,
                              isBilling: false,
                              // inspectionWorkOrderNumber:
                              //   inspectionWorkOrderNumber || null,
                              // inspectionType: inspectionType || null,
                              // linkedWorkorderNumber: inspectionWorkOrderNumber || stateData?.linkedWorkorderNumber || null
                            },
                          }}
                          onClick={() => openDocumentModal(workId)}
                        >
                          <AMPTooltip2
                            title="Work Order Documents"
                            dataPlacement="top"
                          >
                            Documents ({stateData?.numberOfDocuments})
                          </AMPTooltip2>
                          {/* <span
                            data-toggle="tooltip"
                            data-placement="top"
                            title="Work Order Documents">
                            Documents ({stateData?.numberOfDocuments})
                          </span> */}
                        </Link>
                      </Col>
                    </div>
                  ) : (
                    <div>
                      <Col
                        className="side-links"
                        md={12}
                        sm={12}
                        lg={12}
                        xs={12}
                      >
                        Asset (0)
                      </Col>
                      <Col
                        className="side-links"
                        md={12}
                        sm={12}
                        lg={12}
                        xs={12}
                      >
                        Pictures (0)
                      </Col>
                      <Col
                        className="side-links"
                        md={12}
                        sm={12}
                        lg={12}
                        xs={12}
                      >
                        Documents (0)
                      </Col>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Row>
          </Col>
        </Row>
      </form>
    </>
  );
};
