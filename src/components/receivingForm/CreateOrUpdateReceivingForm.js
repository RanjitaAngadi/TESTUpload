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
  CREATE_OR_UPDATE_RECEIVING,
  CREATE_OR_UPDATE_WORKODRER,
  GET_RECEIVING_BY_ID,
  RETRIEVAL_VIEW_SINATURE_BY_ID_URL,
  GET_ORGANIZATION_FOR_CUSTOMER,
  FormValidation,
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
import AMPTooltip from "../common/AMPTooltip";
import AMPTooltip2 from "../common/AMPTooltip2";

//On create New Questionnaire
const saveReceivingFormAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.post(URL, params?.ajaxParams).pipe(
        map((xhrResponse) => {
          return { ...xhrResponse, params };
        }),
        catchError((error) => {
          console.error("Error in create Questionnaire", error);
          errorHandler(error.response);
          return [];
        })
      )
    )
  ); // ENd of line

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
// view Signature fetching start
const getSignatureByIdAjaxObs$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax.get(URL + param).pipe(
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
//get by work order Id

const getWorkOrderByIdAjax$ = () =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax
        .get(DEFAULT_BASE_URL + VERSION + GET_RECEIVING_BY_ID + params)
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
const updateReceivingFormAjax$ = (URL, { errorHandler }) =>
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

export const CreateOrUpdateReceivingForm = (props) => {
  const { inspectionWorkOrderNumber, inspectionType } = props;
  const context = useAccessState();
  let defaultValue = {
    workOrderNumber: "",
  };
  // For google analytics purpose
  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, [])
  const [loader, setLoader] = useState(false);
  const [errorOrganizationMessage, setErrorOrganizationMessage] = useState();
  const [updateForMoveToWorkOrder, setUpdateForMoveToWorkOrder] =
    useState(false);
  const [signUrlError, setSignUrlError] = useState(false);
  const [showServiceCenterError, setServiceCenterErrors] = useState(false);
  const [showWorkOrderTypeError, setWorkOrderTypeErrors] = useState(false);
  const [showReceivedOnOrder, setReceivedOneErrors] = useState(false);
  const [showIsComponentReceived, setIsComponentReceivedErrors] =
    useState(false);
  // const [showExpDateError, setExpectedDateErrors] = useState(false);
  const [showMoveToWorkOrder, setMoveToWorkOrderErrors] = useState(false);
  const [moveToWorkOrderStatus, setMoveToWorkOrderStatus] = useState(false);
  const [stateData, setStateData] = useState(!workId ? defaultValue : null);
  const [organizationGroup, setOrganizationGroup] = useState({});
  const [selectedWoType, setSelectedWoType] = useState(false);
  const {
    handleSubmit,
    reset,
    watch,
    control,
    register,
    setValue,
    errors,
    getValues,
  } = useForm({
    defaultValues: stateData,
  });
  const locationRef = useLocation();
  const isComponentReceived = watch("isComponentReceived");
  const [ajaxData, setAjaxData] = useState();
  const [status, setStatus] = useState();
  const [workOrderId, setWorkOrderId] = useState();
  const [workOrderIdAfterUpdate, setWorkOrderIdAfterUpdate] = useState();
  const params = new window.URLSearchParams(window.location.search);
  const workId = locationRef?.state?.id || params.get("workOrderId");
  const [showGenerateLink, setShowGenerateLink] = useState(true)
  //const status = locationRef?.state?.status || params.get("status");

  const org = watch("organization");
  const cust = watch("customer");
  const organizationArea = watch("area");
  const organizationRegion = watch("region");
  const organizationDistrict = watch("district");
  const {
    isCreate,
    setIsWorkOrderNumberLoading,
    isWorkOrderNumberLoading,
    signUrl,
    openSignatureModal,
    ajaxGenerateWorkOrderNumberObsv$,
    isWorkOrderNumberGenerated,
    ajaxGenerateWorkOrderNumberForOPMObsv$,
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
    setSignUrl,
    state,
    showAssetOrReceivingOrWorkForBack,
  } = props;
  useEffect(() => {
    if (isWorkOrderNumberGenerated) {
      setValue("workOrderNumber", isWorkOrderNumberGenerated);
    }
    if (workOrderType?.length === 1) {
      setValue("workOrderType", workOrderType[0]);
    }
  }, [isWorkOrderNumberGenerated, workOrderType]);
  const saveReceivingForm$ = useMemo(() => {
    return saveReceivingFormAjax$(
      DEFAULT_BASE_URL + VERSION + CREATE_OR_UPDATE_RECEIVING,
      {
        errorHandler: (error) => {
          toast.error(AMPToastConsts.RECEIVING_CREATE_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  /* Observer for save response from ajax request */
  useObservableCallback(saveReceivingForm$, (response) => {
    if (!response?.response?.status) {
      toast.error(response.response.message, {
        position: toast.POSITION.TOP_CENTER,
      });
      setIsWorkOrderNumberLoading(false);
    } else {
      setIsWorkOrderNumberLoading(false);
      setWorkOrderId(response?.response?.content);
      toast.success(AMPToastConsts.RECEIVING_CREATE_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });

  // // For Update Receivng Form
  const updateReceivingForm$ = useMemo(() => {
    return updateReceivingFormAjax$(
      DEFAULT_BASE_URL + VERSION + CREATE_OR_UPDATE_RECEIVING,
      {
        errorHandler: (error) => {
          toast.error(AMPToastConsts.RECEIVING_UPDATE_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  /* Observer for update response from ajax request */
  useObservableCallback(updateReceivingForm$, (response) => {
    if (!response?.status) {
      toast.error(response.response.message, {
        position: toast.POSITION.TOP_CENTER,
      });
      setIsWorkOrderNumberLoading(false);
    } else {
      setIsWorkOrderNumberLoading(false);
      const content = {
        workOrderNumber: response?.params?.WorkorderNumber,
        serviceCenter: response?.params?.ServiceCenterId,
        workOrderType: response?.params?.WorkorderTypeId,
        expReceiving: response?.params?.ExpectedReceiveDate,
        receivedOn: response?.params?.ReceivedOn,
        customerId: response?.params?.CustomerId,
        organizationGroupId: response?.params?.OrganizationGroupId,
        qnNumber: response?.params?.Qnnumber,
        comment: response?.params?.Comment,
        isComponentReceived: response?.params?.IsComponentReceived,
        numberOfAssets: stateData?.numberOfAssets,
        numberOfDocuments: stateData?.numberOfDocuments,
        numberOfPictures: stateData?.numberOfPictures,
      };
      setStateData(content);
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
        if (!response?.params?.IsComponentReceived) {
          setIsComponentReceivedErrors(false);
        }
        if (
          !response?.params?.ReceivedOn &&
          response?.params?.IsComponentReceived
        ) {
          setReceivedOneErrors(false);
        }
        setUpdateForMoveToWorkOrder(true);
      }
      toast.success(AMPToastConsts.RECEIVING_UPDATE_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
      setWorkOrderIdAfterUpdate(response?.params?.id);
      getWorkOrderById$.next(workId);
    }
  }); // ENd of line

  // // For Update Work Order FormgetWorkOrderById
  const updateWorkOrderForm$ = useMemo(() => {
    return updateWorkOrderFormAjax$(
      DEFAULT_BASE_URL + VERSION + CREATE_OR_UPDATE_WORKODRER,
      {
        errorHandler: (error) => {
          setLoader(false);
          toast.error(AMPToastConsts.RECEIVING_UPDATE_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  /* Observer for update response from ajax request */
  useObservableCallback(updateWorkOrderForm$, (response) => {
    if (!response?.response?.status) {
      setLoader(false);
      toast.error(response.response.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      setLoader(false);
      toast.success(AMPToastConsts.RECEIVING_UPDATE_RULE_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
      setMoveToWorkOrderStatus(true);
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
          parseInt(formData?.serviceCenter?.value) || parseInt(0),
        WorkorderTypeId:
          parseInt(formData?.workOrderType?.value) || parseInt(0),
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
          formData?.customer?.value ||
          customerId ||
          organizationGroup?.customer_id ||
          stateData?.customerId
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
        LinkedWorkorderNumber:
          formData?.pumpWorkOrderNumber || inspectionWorkOrderNumber,
        locationHierarchyLevelId: formData?.serviceCenter?.locationHierarchyLevelId
      };
      setAjaxData(ajaxParams);
      setIsWorkOrderNumberLoading(true);
      if (!workId) {
        saveReceivingForm$.next({
          ajaxParams
        });
      } else {
        updateReceivingForm$.next(ajaxParams);
      }
    }
  };
  // On SUbmit of Move to work order button
  const handleMoveToWorkOrder = handleSubmit((formData) => {
    if (stateData?.numberOfAssets > 0) {
      if (
        !signUrl ||
        !stateData?.serviceCenter?.value ||
        !stateData?.workOrderType?.value ||
        !stateData?.receivedOn
      ) {
        toast.error(AMPToastConsts.MOVE_TO_MANDATORY_FIELDS, {
          position: toast.POSITION.TOP_CENTER,
        });

        if (!signUrl) {
          setSignUrlError(true);
        }
        if (!formData?.serviceCenter?.value) {
          setServiceCenterErrors(true);
        }
        if (!formData?.workOrderType?.value) {
          setWorkOrderTypeErrors(true);
        }
        if (!formData?.isComponentReceived) {
          setIsComponentReceivedErrors(true);
        }
        if (!formData?.receivedOn) {
          setReceivedOneErrors(true);
        }
        setMoveToWorkOrderErrors(true);
      } else {
        setLoader(true);
        updateWorkOrderForm$.next(workId);
      }
    } else {
      toast.error(AMPToastConsts.REQUIRED_ASSET, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });
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
          "userName"
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
          serviceCenter: {
            label: response?.content?.serviceCenterName, value: response?.content?.serviceCenterId,
            locationHierarchyLevelId: response?.content?.locationHierarchyLevelId
          },
          workOrderType: currentWorkType[0],
          expReceiving: expDate,
          receivedOn: receivedOn,
          customerId: response?.content?.customerId,
          organizationGroupId: response?.content?.organizationGroupId,
          qnNumber: response?.content?.qnnumber,
          comment: response?.content?.comment,
          isComponentReceived: response?.content?.isComponentReceived,
          numberOfAssets: response?.content?.numberOfAssets,
          numberOfDocuments: response?.content?.numberOfDocuments,
          numberOfPictures: response?.content?.numberOfPictures,
          pumpWorkOrderNumber: response?.content?.linkedWorkorderNumber,
          userName: response?.content?.createdByName
        };
        fields.forEach((field) => setValue(field, content[field]));
        setStateData(content);
        setStatus(response?.content?.status);
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
  const ajaxSignatureByIdObsv$ = useMemo(() => {
    return getSignatureByIdAjaxObs$(
      DEFAULT_BASE_URL + VERSION + RETRIEVAL_VIEW_SINATURE_BY_ID_URL,
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
    setLoader(false);
    if (!response?.status) {
      toast.error(response.response.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      setSignUrl(response?.content?.imageUploaded);

    }
  });
  const selectedWOValue = watch("workOrderType");
  let selectedWOType = selectedWOValue?.value;

  useEffect(() => {
    if (
      workId &&
      selectedWOType &&
      stateData?.workOrderType &&
      !(parseInt(selectedWOType) === stateData?.workOrderType || selectedWOType === stateData?.workOrderType?.value)
    ) {
      //Reset work order number onselect of work order type
      setValue("workOrderNumber", "");
      setSelectedWoType(true)
      setShowGenerateLink(true)
    } else if (!workId) {
      setShowGenerateLink(true)
      setValue("workOrderNumber", "");
    }
  }, [selectedWOType, stateData]);

  useEffect(() => {
    if (workId) {
      if ((context?.userType === ConstVariable?.INRNL && location?.length > 0 && workOrderType?.length > 0) || (context?.userType === ConstVariable?.CST && workOrderType?.length > 0)) {
        getWorkOrderById$.next(workId);
        setLoader(true);
        ajaxSignatureByIdObsv$.next(workId);
      }
      setIsWorkOrderNumberLoading(true);
    }
    if (!workId && context?.userType === ConstVariable?.CST) {
      ajaxOrganizationGroupObsv$.next();
      setIsWorkOrderNumberLoading(true);
    }
  }, [workId, workOrderIdAfterUpdate, location, workOrderType, state]);

  const generateWorkOrderNumber = () => {
    setIsWorkOrderNumberLoading(true);
    setShowGenerateLink(false)
    if (selectedWOValue?.label === "Pump") {
      ajaxGenerateWorkOrderNumberObsv$.next();
    } else {
      ajaxGenerateWorkOrderNumberForOPMObsv$.next();
    }
  };
  useEffect(() => {
    var canvas = document.getElementById('image');
    var ctx = canvas?.getContext('2d');

    var img = new Image();

    img.onload = function () {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      ctx.drawImage(img, 0, 0);
    }
    img.src = signUrl;
  }, [signUrl])
  const numberRestriction = (event) => {
    const regex = new RegExp("^[a-zA-Z0-9-_]+$");
    const key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    if (!regex.test(key)) {
      event.preventDefault();
      return false;
    }
  }
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

  useEffect(() => {
    if (workId && !selectedWoType && !selectedWOValue) {
      setShowGenerateLink(false)
    }
    else if (selectedWoType && selectedWOValue) {
      setShowGenerateLink(true)
    }
  }, [selectedWoType, selectedWOValue])

  // useEffect(() => {
  //   $(function () {
  //     $('[data-toggle="tooltip"]').tooltip()
  //   })
  // }, [])

  return (
    <>
      {workOrderId && (
        <Redirect
          to={{
            pathname: `/Pump/UpdateReceivingFullForm`,
            state: {
              isCreate: false,
              id: workOrderId,
              status: status,
              linkedWorkorderNumber: inspectionWorkOrderNumber || stateData?.linkedWorkorderNumber || null,
              inspectionType: inspectionType || null,

            },
          }}
        />
      )}
      {moveToWorkOrderStatus && (
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
              <AMPLoader isLoading={loader} />
              <AMPFormLayout>
                <AMPFieldWrapper
                  colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                  label="Service Center"
                  controlId="serviceCenter"
                  name="serviceCenter"
                  fieldValidation={showServiceCenterError}
                  styles={colourStyles}
                  components={{ Option: IconOption }}

                >
                  <Controller
                    as={Select}
                    control={control}
                    options={location}
                    onChange={([selected]) => {
                      return { value: selected };
                    }}
                  />
                </AMPFieldWrapper>
                <AMPFieldWrapper
                  colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                  label="Work Order Type"
                  controlId="workOrderType"
                  name="workOrderType"
                  fieldValidation={showWorkOrderTypeError}
                >
                  <Controller
                    as={Select}
                    control={control}
                    options={workOrderType}
                    defaultValue={
                      inspectionType
                        ? { label: "OPM", value: "16" }
                        : { label: "Pump", value: "14" }
                    }
                    onChange={([selected]) => {
                      return { value: selected };
                    }}
                  />
                </AMPFieldWrapper>
                <div colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}>
                  <AMPFieldWrapper
                    colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                    label="Work Order Number"
                    controlId="workOrderNumber"
                    name="workOrderNumber"
                    required="true"
                    fieldValidation={errors?.workOrderNumber ? true : false}
                    readOnly={workId && !selectedWoType}
                  >
                    <AMPTextBox
                      className="text-uppercase"
                      onKeyPress={(e) => numberRestriction(e)}
                      ref={register({ required: true })}
                    />
                  </AMPFieldWrapper>
                  <div
                    className="fn-12 text-info mx-0"
                  >
                    (It accepts only alphanumeric, dash and underscore)
                  </div>
                  {(showGenerateLink && status !== "InProgress" &&
                    status !== ConstVariable.CLSD) && (
                      <span
                        className="generate-sn-btn mx-0"
                        onClick={generateWorkOrderNumber}
                      >
                        Generate Work Order Number
                      </span>
                    )}
                </div>
                {(parseInt(selectedWOValue?.value) === 16) && (
                  <AMPFieldWrapper
                    colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                    label="Pump Work Order Number"
                    controlId="pumpWorkOrderNumber"
                    name="pumpWorkOrderNumber"
                    disabled={inspectionType}
                  >
                    {inspectionWorkOrderNumber ? (
                      <AMPTextBoxReadOnly value={inspectionWorkOrderNumber} />
                    ) : (
                      <AMPTextBox className="text-uppercase" ref={register} />
                    )}
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
                      <div className="float-right">
                        {!(status === ConstVariable?.INP) && (
                          <Link
                            onClick={openOrganizationModal}
                            to={{
                              pathname: "",
                              state: {
                                //isCreate: false,
                                id: workId,
                                status: status,
                                showAssetOrReceivingOrWorkForBack: false,
                                isReceiving: true,
                                inspectionWorkOrderNumber:
                                  inspectionWorkOrderNumber || null,
                                inspectionType: inspectionType || null,
                                linkedWorkorderNumber: inspectionWorkOrderNumber || stateData?.linkedWorkorderNumber || null
                              },
                            }}
                          >
                            Change
                          </Link>
                        )}
                      </div>
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
            <AMPFieldSet title="Receiving Details">
              <AMPFormLayout>
                <AMPFieldWrapper
                  colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                  marginClassName="mt-5"
                  controlId="isComponentReceived"
                  name="isComponentReceived"
                  fieldValidationCustom={
                    showIsComponentReceived &&
                    FormValidation.IS_COMPONENT_MADATORY
                  }
                >
                  <AMPCheckbox
                    label="Is The Component Received"
                    id="isComponentReceived"
                    ref={register}
                  />
                </AMPFieldWrapper>

                {isComponentReceived && (
                  <AMPFieldWrapper
                    colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                    label="Received On"
                    controlId="receivedOn"
                    name="receivedOn"
                    fieldValidation={showReceivedOnOrder}
                  >
                    <Form.Control type="date" ref={register} />
                  </AMPFieldWrapper>
                )}
                {!isComponentReceived && (
                  <AMPFieldWrapper
                    colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                    label="Expected Receiving Date"
                    controlId="expReceivingDate"
                    name="expReceiving"
                  // fieldValidation={showExpDateError}
                  >
                    <Form.Control type="date" ref={register} />
                  </AMPFieldWrapper>
                )}
                <AMPFieldWrapper
                  colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                  label="QN number"
                  controlId="qnNumber"
                  name="qnNumber"
                >
                  <AMPTextBox ref={register} />
                </AMPFieldWrapper>
                <AMPFieldWrapper
                  colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
                  label="Comment"
                  controlId="comment"
                  name="comment"
                >
                  <AMPTextArea ref={register} />
                </AMPFieldWrapper>
              </AMPFormLayout>

              <Col xs={12} lg={12} md={12} sm={12}>
                <Row>
                  <Col xs={12} lg={3} md={12} sm={12}>
                    <AMPFieldWrapper
                      colProps={{ md: 6, sm: 12, lg: 3, xs: 12 }}
                      label="Logged User"
                      controlId="userName"
                      name="userName"
                      isFocused="false"
                      readOnly={true}
                    >
                      {!workId ? <AMPTextBoxReadOnly value={loggedUserName} /> :
                        <AMPTextBox
                          ref={register({ required: true })}
                        />
                      }

                    </AMPFieldWrapper>
                  </Col>

                  {workId && (
                    <>
                      {!signUrl && (
                        <Col xs={12} lg={3} md={12} sm={12}>
                          <Button
                            type="button"
                            variant=" btn btn-secondary"
                            className="mt-4"
                            block
                            onClick={openSignatureModal}
                          >
                            Add Signature
                          </Button>
                          {signUrlError && (
                            <div className="error-message amp-field-error -feedback">
                              Signature is required
                            </div>
                          )}
                        </Col>
                      )}
                      <Col
                        xs={12}
                        lg={6}
                        md={6}
                        sm={12}
                      >
                        {signUrl && (
                          <canvas id="image" className="wd-max-200 ht-max-100 m-30"></canvas>
                        )}
                      </Col>
                    </>
                  )}
                </Row>
              </Col>
            </AMPFieldSet>
            <Row>
              <Col className="text-right">
                {workId || !isCreate ? (
                  status !== "InProgress" &&
                  status !== ConstVariable.CLSD && (
                    <div>
                      {context?.userType !== ConstVariable?.CST && <Button
                        // type="submit"
                        variant="outline-secondary"
                        className="px-5 m-2"
                        size="md"
                        onClick={handleMoveToWorkOrder}
                      >
                        Move to In-Progress Work order
                      </Button>}
                      <Button
                        type="submit"
                        variant="secondary"
                        className="px-5 m-2"
                        size="md"
                      >
                        Update
                      </Button>
                    </div>
                  )
                ) : (
                  <Button
                    type="submit"
                    variant="secondary"
                    className="px-5 m-2"
                    size="md"
                  >
                    Submit
                  </Button>
                )}
              </Col>
            </Row>
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
                        <Link
                          to={{
                            pathname: "/Pump/CreateOrUpdateAsset",
                            state: {
                              isCreate: false,
                              id: workId,
                              status: status,
                              showAssetOrReceivingOrWorkForBack: true,
                              backForm: "Receiving",
                              isReceiving: true,
                              serviceCenterId: parseInt(
                                stateData?.serviceCenter?.value
                              ),
                              workOrderNumber: stateData?.workOrderNumber,
                              inspectionWorkOrderNumber:
                                inspectionWorkOrderNumber || null,
                              inspectionType: inspectionType || null,
                              linkedWorkorderNumber: inspectionWorkOrderNumber || stateData?.linkedWorkorderNumber || null

                            },
                          }}
                          onClick={() => openAssetModal(workId)}
                        >
                          Asset ({stateData?.numberOfAssets})
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
                              isReceiving: true,
                              isWorkorder: false,
                              inspectionWorkOrderNumber:
                                inspectionWorkOrderNumber || null,
                              inspectionType: inspectionType || null,
                              linkedWorkorderNumber: inspectionWorkOrderNumber || stateData?.linkedWorkorderNumber || null
                            },
                          }}
                          onClick={() => openPictureModal(workId)}
                        >
                          <AMPTooltip2
                            title="Receiving Pictures"
                            dataPlacement="top"
                          >
                            Pictures ({stateData?.numberOfPictures})
                          </AMPTooltip2>
                          {/* <span
                            data-toggle="tooltip"
                            data-placement="top"
                            title="Receiving Pictures">
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
                              isReceiving: true,
                              isWorkorder: false,
                              isBilling: false,
                              inspectionWorkOrderNumber:
                                inspectionWorkOrderNumber || null,
                              inspectionType: inspectionType || null,
                              linkedWorkorderNumber: inspectionWorkOrderNumber || stateData?.linkedWorkorderNumber || null
                            },
                          }}
                          onClick={() => openDocumentModal(workId)}
                        >
                          <AMPTooltip2
                            title="Receiving Documents"
                            dataPlacement="top"
                          >
                            Documents ({stateData?.numberOfDocuments})
                          </AMPTooltip2>
                          {/* <span
                            data-toggle="tooltip"
                            data-placement="top"
                            title="Receiving Documents">
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
                        Documents(0)
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
