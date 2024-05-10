import React, { useEffect, useMemo, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import Select, { components } from "react-select";
import * as yup from "yup";
import { AMPCheckbox } from "../common/AMPCheckbox";
import { AMPFieldWrapper } from "../common/AMPFieldWrapper";
import { AMPFormLayout } from "../common/AMPFormLayout";
import ReactGA from 'react-ga';
import {
  Form,
  Row,
  Col,
  Button,
  Table,
  Header,
  Container,
} from "react-bootstrap";
import { Link, withRouter, Redirect, useLocation } from "react-router-dom";
import { AMPFile } from "../common/AMPFile";
import { AMPFormValidation } from "../common/AMPFormValidation";
import { AMPTextBox } from "../common";
import AMPFieldSet from "../common/AMPFieldSet";
import AMPLoader from "../common/AMPLoader";
import { AMPValidation } from "../common/AMPAuthorization/AMPValidation";
import { toast } from "react-toastify";
import { useAccessState } from "../../utils/AppContext/loginContext";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";
import {
  DEFAULT_BASE_URL,
  VERSION,
  GET_PART_NUMBER_DETAILS,
  GET_ALL_PART_ATTRIBUTES,
  ADD_ASSET_URL,
  GET_ASSET_DETAIL_BY_ID,
  UPDATE_ASSET_DETAILS,
  GET_ORGANIZATION_FOR_CUSTOMER,
  CHECK_ASSET_API,
  FormValidation,
  ConstVariable,
} from "../common/const";
import { ampJsonAjax } from "../common/utils/ampAjax";
import { AMPToastConsts } from "../common/const/AMPToastConst";
import { OrganizationalDetailsForm } from "../workOrders/OrganizationalDetails";
import AMPAuthorization from "../common/AMPAuthorization/AMPAuthorization";
import { AMPUpdateConfirmBox } from "../common/AMPUpdateConfirmBox";

const getPartNumberDetailsAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax
        .get(
          DEFAULT_BASE_URL +
          VERSION +
          GET_PART_NUMBER_DETAILS +
          param.partNumber,
          param.partType
        )
        .pipe(
          map((xhrResponse) => {
            return { ...xhrResponse?.response, param };
          }),
          catchError((error) => {
            return throwError(error);
          })
        )
    )
  );

const getAssetDetailAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax
        .get(DEFAULT_BASE_URL + VERSION + GET_ASSET_DETAIL_BY_ID + param)
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
const getIsAssetExistAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax
        .get(DEFAULT_BASE_URL + VERSION + CHECK_ASSET_API + param?.serialNumber)
        .pipe(
          map((xhrResponse) => {
            return { ...xhrResponse?.response, param };
          }),
          catchError((error) => {
            return throwError(error);
          })
        )
    )
  );
const updateAssetFormAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.put(URL, params).pipe(
        map((xhrResponse) => {
          return xhrResponse?.response;
        }),
        catchError((error) => {
          console.error("Error in updating Asset", error);
          errorHandler(error.response);
          return [];
        })
      )
    )
  ); // ENd of line

const saveAssetAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.post(URL, params).pipe(
        map((xhrResponse) => {
          return xhrResponse.response;
        }),
        catchError((error) => {
          errorHandler(error.response);
          return [];
        })
      )
    )
  ); // ENd of line
export const CreateOrUpdateAsset = ({
  manufacturer,
  partType,
  isAssetEdit,
  closeAssetModal,
  offset,
  perPage,
  setIsAssetLoading,
  ajaxAssetListObsv$,
  openOrganizationModal,
  organizationGroupId,
  customerId,
  organizationData,
  setOrganizationData,
  organizationGroup,
  setOrganizationGroup,
  isReceiving,

  ...props
}) => {
  const locationRef = useLocation();
  const workId = locationRef?.state?.id;
  const status = locationRef?.state?.status;

  const validationSchema = useMemo(
    () =>
      yup.object({
        serialNumber: yup.string().trim().required("Required"),
        manufacturer: yup.object().required("Required"),
        partType: yup.object().required("Required"),
        size: yup.object().required("Required"),
        style: yup.object().required("Required"),
        service: yup.object().required("Required"),
        pressureRating: yup.object().required("Required"),
        designation: yup.object().required("Required"),
      }),
    []
  );
  const resolver = AMPValidation(validationSchema);
  const {
    handleSubmit,
    reset,
    watch,
    control,
    register,
    getValues,
    setValue,
    errors,
  } = useForm({
    resolver,
  });
  const myRef = useRef(null);
  // organization level watch
  const org = watch("organization");
  const cust = watch("customer");
  const organizationArea = watch("area");
  const organizationRegion = watch("region");
  const organizationDistrict = watch("district");
  const isTempSerialNumberWatched = watch("isTempSerialNumber") || false
  const prtTyp = watch("partType");
  const prtTypId = prtTyp?.value;

  // ------------------------- local storage changes start -------------------------
  const watchManufacturer = watch("manufacturer")
  const [manufacturer1, setManufacturer1] = useState(manufacturer)

  useEffect(() => {
    if (watchManufacturer && watchManufacturer?.value) {
      const temp = [
        watchManufacturer,
        ...JSON.parse(localStorage.getItem('cachedManufacturers')) || []
      ]
      const result = Array.from(new Set(temp?.map(item => item?.value)))?.map(value => {
        return {
          label: temp?.find(itm => itm?.value === value)?.label,
          value: value
        }
      })?.slice(0, 10)
      window.localStorage.setItem('cachedManufacturers', JSON.stringify(result))
    }

    const recentManufacturers = JSON.parse(localStorage.getItem('cachedManufacturers')) || []
    if (recentManufacturers.length === 10 && !isAssetEdit) {
      setManufacturer1([{
        label: "Recent",
        options: recentManufacturers
      }]);
    }
  }, [watchManufacturer])
  console.log("setresponse",setManufacturer1);

  const MenuList = (props) => {
    const {
      MenuListHeader = null,
      MenuListFooter = null
    } = props.selectProps.components
    return (
      <components.MenuList {...props}>
        {props.children.length && MenuListHeader}
        {props.children}
        {props.children.length && MenuListFooter}
      </components.MenuList>
    )
  }

  const MenuListFooter = ({ show, onClick }) => {
    return show && show === 10 ? (
      <center>
        <button
          type="button"
          className='show-all-btn'
          onClick={onClick}>
          Show All
        </button>
      </center>
    ) : null;
  }

  const loadAllOptions = () => {
    setManufacturer1(manufacturer)
  }

  // ---------------------- local storage changes end -----------------------

  const [edit, setEdit] = useState(false);
  const [partNumberDetails, setPartNumberDetails] = useState({});

  const context = useAccessState();
  const [errorOrganizationMessage, setErrorOrganizationMessage] = useState();

  const [stateData, setStateData] = useState();

  const [loader, setLoader] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [partTypeChange, setPartTypeChange] = useState()

  const ajaxAssetDetailByIdObsv$ = useMemo(() => {
    return getAssetDetailAjaxObs$();
  }, []);

  // / Organization for customer group start
  // const [organizationGroup, setOrganizationGroup] = useState({});
  const ajaxOrganizationGroupObsv$ = useMemo(() => {
    return getOrganizationForCustomerAjaxObs$();
  }, []);
  useObservableCallback(
    ajaxOrganizationGroupObsv$,
    (response) => {
      if (!response?.status) {
        debugger
        setLoader(false);
        toast.error(response?.response?.message, {
          position: toast.POSITION.TOP_CENTER,
        });
      } else {
        setLoader(false);
        setOrganizationGroup(response?.response?.content?.content);
      }
    },
    []
  ); // Organization group ends

  // const assetDetails = useObservable(ajaxOrganizationObsv$, {})
  useObservableCallback(
    ajaxAssetDetailByIdObsv$,
    (response) => {
      setLoader(false);
      if (!response?.status) {
        toast.error(response?.message, {
          position: toast.POSITION.TOP_CENTER,
        });
      } else {
        let currentManufacturer = { label: "", value: "" };
        let currentPartType = { label: "", value: "" };
        currentManufacturer = manufacturer?.filter((item) => {
          if (
            parseInt(item.value) === parseInt(response?.content?.manufacturerId)
          ) {
            return item;
          } else return null;
        });
        currentPartType = partType?.filter((item) => {
          if (
            parseInt(item.value) === parseInt(response?.content?.partTypeId)
          ) {
            return item;
          } else return null;
        });
        const fields = [
          "serialNumber",
          "isTempSerialNumber",
          "manufacturer",
          "partType",
          "partNumber",
        ];
        const content = {
          serialNumber: response?.content?.manufacturerSerialNumber,
          isTempSerialNumber: response?.content?.isTempSerialNumber,
          manufacturer: currentManufacturer[0],
          partType: currentPartType[0],
          organizationGroupId: response?.content?.organizationGroupId,
          customerId: response?.content?.customerId,
          partNumber: response?.content?.partNumber,
          sizeId: response?.content?.sizeId,
          styleId: response?.content?.styleId,
          serviceId: response?.content?.serviceId,
          pressureRatingId: response?.content?.pressureRatingId,
          designationId: response?.content?.designationId,
          assetId: response?.content?.id
        };
        fields.forEach((field) => setValue(field, content[field]));
        setEdit(true);
        //debugger
        setStateData(content);
        setOrganizationData(response?.content?.organizationalGroupResponse);
      }
    },
    []
  );
  useEffect(() => {
    if (isAssetEdit) {
      setLoader(true);
      ajaxAssetDetailByIdObsv$.next(isAssetEdit);
    }
    if (context?.userType === ConstVariable?.CST && !isAssetEdit) {
      ajaxOrganizationGroupObsv$.next();
      setLoader(true);
    }
  }, []);

  useEffect(() => {
    if (props?.tempSerialNumber) {
      setValue("serialNumber", props?.tempSerialNumber);
    }
  }, [props?.tempSerialNumber]);

  // ---------- Fetching Part Number Details ----------
  const [isSubPartAttributesLoading, setIsSubPartAttributesLoading] =
    useState(false);
  const [partNumberErrorMessage, setPartNumberErrorMessage] = useState(false);
  const [isPartNumberLoading, setIsPartNumberLoading] = useState(false);

  const ajaxPartNumDetailsObsv$ = useMemo(() => {
    return getPartNumberDetailsAjaxObs$();
  }, []);
  useObservableCallback(
    ajaxPartNumDetailsObsv$,
    (response) => {
      if (!response?.content) {
        setIsPartNumberLoading(false);
        setPartNumberErrorMessage("Part Number Not Available.");
      } else {
        setIsPartNumberLoading(false);
        setPartNumberDetails(response?.content);
        if (response?.content?.partTypeId) {
          response?.param?.partType?.map((item) => {
            if (parseInt(item.value) === response?.content?.partTypeId) {
              setValue("partType", {
                value: item.value,
                label: item.label,
              });
              setPartTypeChange({
                value: item.value,
                label: item.label,
              })
            }
          });
        }
      }
    },
    []
  );

  const checkPartNumberValidation = (partNumber) => {
    if (partNumber) {
      setPartNumberErrorMessage(false);
      setIsPartNumberLoading(true);
      ajaxPartNumDetailsObsv$.next({
        partNumber: partNumber,
        partType: partType,
      });
    } else {
      setPartNumberErrorMessage("Please Enter Part Number!");
    }
  };
  // ---------- /Fetching Part Number Details ----------

  // ---------- Fetching Parts Attributes ----------
  const [isPartAttributesLoading, setIsPartAttributesLoading] = useState(false);
  const getAllPartAttributesAjaxObs$ = () =>
    new Subject().pipe(
      mergeMap((param) =>
        ampJsonAjax
          .get(
            DEFAULT_BASE_URL + VERSION + GET_ALL_PART_ATTRIBUTES + param.pNumId
          )
          .pipe(
            map((xhrResponse) => {
              setIsPartAttributesLoading(false);
              if (xhrResponse.response.content) {
                const size = xhrResponse.response.content.size.map((item) => {
                  return {
                    label: item.value,
                    value: item.id,
                  };
                });
                const style = xhrResponse.response.content.style.map((item) => {
                  return {
                    label: item.value,
                    value: item.id,
                  };
                });
                const service = xhrResponse.response.content.service.map(
                  (item) => {
                    return {
                      label: item.value,
                      value: item.id,
                    };
                  }
                );
                const pressureRating =
                  xhrResponse.response.content.pressureRating.map((item) => {
                    return {
                      label: item.value,
                      value: item.id,
                    };
                  });
                const designation =
                  xhrResponse.response.content.designation.map((item) => {
                    return {
                      label: item.value,
                      value: item.id,
                    };
                  });

                if (
                  param.partNumberDetails !== null &&
                  Object.keys(param.partNumberDetails).length !== 0
                ) {
                  setIsSubPartAttributesLoading(false);

                  let currentSize = size?.filter((item) => {
                    if (
                      param.partNumberDetails.sizeId === parseInt(item.value)
                    ) {
                      return { label: item.label, value: item.value };
                    } else return null;
                  });
                  let currentStyle = style?.filter((item) => {
                    if (
                      param.partNumberDetails.styleId === parseInt(item.value)
                    ) {
                      return { label: item.label, value: item.value };
                    } else return null;
                  });
                  let currentService = service.filter((item) => {
                    if (
                      param.partNumberDetails?.serviceId ===
                      parseInt(item?.value)
                    ) {
                      return { label: item.label, value: item.value };
                    } else return null;
                  });
                  let currentPressureRating = pressureRating?.filter((item) => {
                    if (
                      param?.partNumberDetails?.pressureRatingId ===
                      parseInt(item.value)
                    ) {
                      return { label: item.label, value: item.value };
                    } else return null;
                  });
                  let currentDesignation = designation?.filter((item) => {
                    if (
                      param.partNumberDetails.designationId ===
                      parseInt(item.value)
                    ) {
                      return { label: item.label, value: item.value };
                    } else return null;
                  });
                  const fields = [
                    "size",
                    "style",
                    "service",
                    "pressureRating",
                    "designation",
                  ];
                  setValue("size", currentDesignation[0]);
                  const content = {
                    size: currentSize[0],
                    style: currentStyle[0],
                    service: currentService[0],
                    pressureRating: currentPressureRating[0],
                    designation: currentDesignation[0],
                  };
                  fields.forEach((field) => setValue(field, content[field]));

                  Object.keys(param.partNumberDetails).forEach(
                    (o) => delete param.partNumberDetails[o]
                  );
                }

                return { size, style, service, pressureRating, designation };
              }
            }),
            catchError((error) => {
              return throwError(error);
            })
          )
      )
    );
  const ajaxPartAttributesObsv$ = useMemo(() => {
    return getAllPartAttributesAjaxObs$();
  }, []);
  const partAttributes = useObservable(ajaxPartAttributesObsv$, {});
  useEffect(() => {
    if (prtTypId) {
      setIsPartAttributesLoading(true);
      const fields = [
        "size",
        "style",
        "service",
        "pressureRating",
        "designation",
      ];
      fields.forEach((field) => setValue(field, null));
      ajaxPartAttributesObsv$.next({
        pNumId: prtTypId,
        partNumberDetails: partNumberDetails,
      });
    }
  }, [
    prtTypId,
    // partNumberDetails
    partTypeChange,
  ]);

  useEffect(() => {
    if (edit) {
      if (isAssetEdit && stateData && partAttributes) {
        let currentSize = { label: "", value: "" };
        let currentStyle = { label: "", value: "" };
        let currentService = { label: "", value: "" };
        let currentPressureRating = { label: "", value: "" };
        let currentDesignation = { label: "", value: "" };

        if (stateData?.sizeId !== 0) {
          currentSize = partAttributes?.size?.filter((item) => {
            if (parseInt(item.value) === parseInt(stateData?.sizeId)) {
              return item;
            } else return null;
          });
        }
        if (stateData?.styleId !== 0) {
          currentStyle = partAttributes?.style?.filter((item) => {
            if (parseInt(item.value) === parseInt(stateData?.styleId)) {
              return item;
            } else return null;
          });
        }
        if (stateData?.serviceId !== 0) {
          currentService = partAttributes?.service?.filter((item) => {
            if (parseInt(item.value) === parseInt(stateData?.serviceId)) {
              return item;
            } else return null;
          });
        }
        if (stateData?.pressureRatingId !== 0) {
          currentPressureRating = partAttributes?.pressureRating?.filter(
            (item) => {
              if (
                parseInt(item.value) === parseInt(stateData?.pressureRatingId)
              ) {
                return item;
              } else return null;
            }
          );
        }
        if (stateData?.designationId !== 0) {
          currentDesignation = partAttributes?.designation?.filter((item) => {
            if (parseInt(item.value) === parseInt(stateData?.designationId)) {
              return item;
            } else return null;
          });
        }
        const fields = [
          "size",
          "style",
          "service",
          "pressureRating",
          "designation",
        ];

        const content = {
          size: !currentSize || currentSize[0] || null,
          style: !currentStyle || currentStyle[0] || null,
          service: !currentService || currentService[0] || null,
          pressureRating:
            !currentPressureRating || currentPressureRating[0] || null,
          designation: !currentDesignation || currentDesignation[0] || null,
        };
        fields.forEach((field) => setValue(field, content[field]));
        setEdit(false);
      }
    }
  }, [partAttributes]);

  // ---------- /Fetching Part Attributes ----------

  // fetch asset info start
  const [isAssetError, setIsAssetError] = useState(false);
  const ajaxAssetExistObsv$ = useMemo(() => {
    return getIsAssetExistAjaxObs$();
  }, []);
  useObservableCallback(
    ajaxAssetExistObsv$,
    (response) => {
      if (response?.content[0]) {
        setLoader(false);
        setPartNumberDetails(response?.content[0]);
        if (response?.content[0]?.manufacturerId) {
          response?.param?.manufacturer?.map((item) => {
            if (
              parseInt(item.value) ===
              parseInt(response?.content[0]?.manufacturerId)
            ) {
              setValue("manufacturer", {
                value: item.value,
                label: item.label,
              });
            }
          });
        }
        if (response?.content[0]?.partTypeId) {
          response?.param?.partType?.map((item) => {
            if (parseInt(item.value) === response?.content[0]?.partTypeId) {
              setValue("partType", {
                value: item.value,
                label: item.label,
              });
            }
          });
        }
      } else {
        setLoader(false);
        setIsAssetError("Serial Number Not Available.");
      }
    },
    []
  ); // Organization group ends

  const isAssestAlreadyExist = (manufacturerSerialNumber) => {
    if (manufacturerSerialNumber) {
      setIsAssetError(false);
      setLoader(true);
      ajaxAssetExistObsv$.next({
        serialNumber: manufacturerSerialNumber?.toUpperCase(),
        manufacturer: manufacturer,
        partType: partType,
      });
    } else {
      setIsAssetError("Please Enter the Serial Number!");
    }
  };

  // /fetch asset exist info end

  // submit handler
  // const [isAssetAdding, setIsAssetAdding] = useState(false);
  const ajaxSaveAssetObsv$ = useMemo(() => {
    return saveAssetAjax$(DEFAULT_BASE_URL + VERSION + ADD_ASSET_URL, {
      errorHandler: (error) => {
        setLoader(false);
        toast.error(AMPToastConsts.ASSET_ADD_ERROR, {
          position: toast.POSITION.TOP_CENTER,
        });
      },
    });
  }, []);
  useObservableCallback(ajaxSaveAssetObsv$, (response) => {
    if (response?.status) {
      setLoader(false);
      ajaxAssetListObsv$.next({
        index: offset,
        pageSize: perPage,
        workOrderId: props.wOrderId,
      });
      setIsAssetLoading(true);
      toast.success(AMPToastConsts.ASSET_ADD_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
      closeAssetModal();
    } else {
      setLoader(false);
      toast.error(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });
  // Asset Update
  const ajaxUpdateAsset$ = useMemo(() => {
    return updateAssetFormAjax$(
      DEFAULT_BASE_URL + VERSION + UPDATE_ASSET_DETAILS,
      {
        errorHandler: (error) => {
          setLoader(false);
          toast.error(AMPToastConsts.ASSET_UPDATE_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);

  useObservableCallback(ajaxUpdateAsset$, (response) => {
    setLoader(false);
    if (response?.status) {
      ajaxAssetListObsv$.next({
        index: offset,
        pageSize: perPage,
        workOrderId: props.wOrderId,
      });
      setIsAssetLoading(true);
      toast.success(AMPToastConsts.ASSET_UPDATE_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
      closeAssetModal();
    }
    else {
      toast.error(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });
  const closeConfirmModal = () => {
    setShowConfirmModal(false);
  };
  // / Asset Update
  const onSubmit = (data) => {
    if (
      !isReceiving &&
      stateData &&
      stateData?.partType?.value !== data?.partType?.value
    ) {
      setShowConfirmModal(data);
    } else {
      onConfirmSubmit(data);
    }
  };
  const onConfirmSubmit = (data) => {
    if (
      !data?.customer?.value &&
      !organizationData?.customerName &&
      !organizationGroup?.customer_id
    ) {
      toast.error(AMPToastConsts.ASSET_MANDATORY_FIELDS, {
        position: toast.POSITION.TOP_CENTER,
      });
      setErrorOrganizationMessage(true);
    } else {
      setErrorOrganizationMessage(false);
      const ajaxParams = {
        organizationGroupId:
          organizationGroupId ||
          parseInt(data?.groupUnit?.value) ||
          parseInt(organizationGroup?.group_unit_id) ||
          parseInt(data?.district?.value) ||
          parseInt(organizationGroup?.district_id) ||
          parseInt(data?.region?.value) ||
          parseInt(organizationGroup?.region_id) ||
          parseInt(data?.area?.value) ||
          parseInt(organizationGroup?.area_id) ||
          parseInt(data?.customer?.value) ||
          parseInt(organizationGroup?.customer_id) ||
          stateData?.organizationGroupId,
        customerId: parseInt(
          customerId ||
          stateData?.customerId ||
          organizationGroup?.customer_id ||
          data?.customer?.value
        ),
        manufacturerId: parseInt(data?.manufacturer?.value),
        manufacturerSerialNumber: data?.serialNumber?.toUpperCase(),
        isTempSerialNumber: isAssetEdit
          ? data?.isTempSerialNumber
          : props?.isTempSerialNumber || false,
        partNumber: data?.partNumber,
        partTypeId: parseInt(data?.partType?.value),
        sizeId: parseInt(data?.size?.value),
        styleId: parseInt(data?.style?.value),
        serviceId: parseInt(data?.service?.value),
        pressureRatingId: parseInt(data?.pressureRating?.value),
        designationId: parseInt(data?.designation?.value),
        workorderId: props?.wOrderId,
      };
      if (isAssetEdit) {
        ajaxParams["id"] = isAssetEdit;
        
        setLoader(true);
        console.log("formData:", ajaxParams)
        ajaxUpdateAsset$.next(ajaxParams);
      } else {
        // setIsAssetAdding(true);
        setLoader(true);
        ajaxSaveAssetObsv$.next(ajaxParams);
      }
    }
  };
  useEffect(() => {
    myRef?.current?.scrollIntoView();
  });
  const numberRestriction = (event) => {
    const regex = new RegExp("^[a-zA-Z0-9-_]+$");
    const key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    if (!regex.test(key)) {
      event.preventDefault();
      return false;
    }
  }
  // For google analytics purpose
  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, [])
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col>
            <AMPFieldSet title="Organization Details">
              {/* <AMPLoader isLoading={isAssetAdding} /> */}
              <AMPLoader isLoading={loader} />
              <div ref={myRef}>
                {context?.userType === ConstVariable?.INRNL && !isAssetEdit && (
                  <OrganizationalDetailsForm
                    org={org}
                    cust={cust}
                    organizationArea={organizationArea}
                    organizationRegion={organizationRegion}
                    organizationDistrict={organizationDistrict}
                    control={control}
                    errors={errors}
                    setValue={setValue}
                    // control={control}
                    errorOrganizationMessage={errorOrganizationMessage}
                    type="add/edit"
                  />
                )}
                {((context?.userType === ConstVariable?.INRNL && isAssetEdit) ||
                  context?.userType === ConstVariable.CST) && (
                    <div>
                      <Row>
                        <Col xs={12} className="mt-2">
                          <Row>
                            <Col lg={12} sm={12} md={12} xs={12}>
                              <div className="float-right">
                                <AMPAuthorization
                                  hasToken={
                                    isReceiving
                                      ? context?.features?.includes("RE-EDIT")
                                      : context?.features?.includes("WO-EDIT")
                                  }
                                >
                                  {status !== ConstVariable?.CLSD &&
                                    status !== ConstVariable?.RJCT && (
                                      <Link
                                        onClick={openOrganizationModal}
                                        to={{
                                          pathname: "",
                                          state: {
                                            isCreate: false,
                                            id: workId,
                                            status: status,
                                            isReceiving: isReceiving,
                                            backForm: "Receiving",
                                            showAssetOrReceivingOrWorkForBack: true,
                                          },
                                        }}
                                      >
                                        Change
                                      </Link>
                                    )}
                                </AMPAuthorization>
                              </div>
                            </Col>
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
                      </Row>
                    </div>
                  )}
              </div>
            </AMPFieldSet>
            <AMPFieldSet>
              <div>
                {isAssetError && (
                  <span className="part-number-error-message">
                    {isAssetError}
                  </span>
                )}
              </div>
              <AMPLoader isLoading={props?.isTempSerialNumberLoading} />
              <AMPFormLayout>
                <div colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}>
                  <AMPFieldWrapper
                    // colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                    label="Serial Number"
                    controlId="serialNumber"
                    name="serialNumber"
                    required={true}
                    readOnly={(stateData?.assetId && stateData?.isTempSerialNumber && isTempSerialNumberWatched) ||
                      (stateData?.assetId && !stateData?.isTempSerialNumber)}
                    // readOnly={
                    //   isAssetEdit
                    //     ? status === ConstVariable?.CLSD ||
                    //     status === ConstVariable?.RJCT
                    //     : false
                    // }
                    fieldValidation={errors.serialNumber ? true : false}
                  >
                    <AMPTextBox
                      className="text-uppercase"
                      onKeyPress={(e) => numberRestriction(e)}
                      ref={register}

                    />
                  </AMPFieldWrapper>
                  <div
                    className="fn-12 text-info mx-0"
                  >
                    (It accepts only alphanumeric, dash and underscore)
                  </div>

                  {isAssetEdit ? (
                    stateData && stateData?.isTempSerialNumber &&
                    (<AMPFieldWrapper
                      label=""
                      controlId="isTempSerialNumber"
                      name="isTempSerialNumber"
                      disabled={
                        isAssetEdit
                          ? status === ConstVariable?.CLSD ||
                          status === ConstVariable?.RJCT
                          : false
                      }
                    >
                      <AMPCheckbox
                        label="Is Temp Serial Number"
                        id="isTempSerialNumber"
                        defaultChecked={true}
                        ref={register}
                      />
                    </AMPFieldWrapper>)
                  ) : props?.isTempSerialNumber ? (
                    stateData && stateData?.isTempSerialNumber &&
                    (<AMPFieldWrapper
                      label=""
                      controlId="isTempSerialNumber"
                      name="isTempSerialNumber"
                    >
                      <AMPCheckbox
                        label="Is Temp Serial Number"
                        id="isTempSerialNumber"
                        defaultChecked={true}
                        ref={register}
                        disabled={props?.isTempSerialNumber}
                      />
                    </AMPFieldWrapper>)
                  ) : (
                    <span
                      className="generate-sn-btn mx-0"
                      onClick={props?.genTempSerialNumber}
                    >
                      Generate Serial Number
                    </span>
                  )}
                </div>
                <Button
                  colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                  type="button"
                  variant="outline-secondary"
                  className="form-button"
                  block
                  onClick={() =>
                    isAssestAlreadyExist(getValues("serialNumber"))
                  }
                  disabled={
                    isAssetEdit
                      ? status === ConstVariable?.CLSD ||
                      status === ConstVariable?.RJCT
                      : false
                  }
                >
                  Check
                </Button>
                <AMPFieldWrapper
                  colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                  label="Manufacturer"
                  controlId="manufacturer"
                  name="manufacturer"
                  required={true}
                  isDisabled={
                    isAssetEdit
                      ? status === ConstVariable?.CLSD ||
                      status === ConstVariable?.RJCT
                      : false
                  }
                  fieldValidation={errors.manufacturer ? true : false}
                >
                  <Controller
                    as={Select}
                    id="manufacturer"
                    control={control}
                    options={manufacturer1}
                    components={{
                      MenuList,
                      MenuListFooter: (
                        <MenuListFooter
                          // fetchOrganization={fetchOrganization}
                          show={manufacturer1[0]?.options?.length}
                          onClick={loadAllOptions}
                        />
                      )
                    }}
                    onChange={([selected]) => {
                      return { value: selected };
                    }}
                  />
                </AMPFieldWrapper>
              </AMPFormLayout>
            </AMPFieldSet>
            <AMPFieldSet title="Part Details">
              <div>
                {partNumberErrorMessage && (
                  <span className="part-number-error-message">
                    {partNumberErrorMessage}
                  </span>
                )}
              </div>
              <AMPLoader isLoading={isPartNumberLoading} />
              <AMPLoader isLoading={isPartAttributesLoading} />
              <AMPLoader isLoading={isSubPartAttributesLoading} />
              <AMPFormLayout>
                <AMPFieldWrapper
                  colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                  label="Part Number"
                  controlId="partNumber"
                  name="partNumber"
                  readOnly={
                    isAssetEdit
                      ? status === ConstVariable?.CLSD ||
                      status === ConstVariable?.RJCT
                      : false
                  }
                >
                  <AMPTextBox ref={register} />
                </AMPFieldWrapper>
                <Button
                  colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                  type="button"
                  variant="outline-secondary"
                  className="form-button"
                  block
                  disabled={
                    isAssetEdit
                      ? status === ConstVariable?.CLSD ||
                      status === ConstVariable?.RJCT
                      : false
                  }
                  onClick={() =>
                    checkPartNumberValidation(getValues("partNumber"))
                  }
                >
                  Check
                </Button>
              </AMPFormLayout>
              <AMPFormLayout>
                <AMPFieldWrapper
                  colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                  label="Part Type"
                  controlId="partType"
                  name="partType"
                  required={true}
                  isDisabled={
                    isAssetEdit
                      ? status === ConstVariable?.CLSD ||
                      status === ConstVariable?.RJCT
                      : false
                  }
                  fieldValidation={errors.partType ? true : false}
                >
                  <Controller
                    as={Select}
                    id="partType"
                    control={control}
                    options={partType}
                    onChange={([selected]) => {
                      return { value: selected };
                    }}
                    menuPlacement="top"
                  />
                </AMPFieldWrapper>
                <AMPFieldWrapper
                  colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                  label="Select Size"
                  controlId="size"
                  name="size"
                  required={true}
                  isDisabled={
                    isAssetEdit
                      ? status === ConstVariable?.CLSD ||
                      status === ConstVariable?.RJCT
                      : false
                  }
                  fieldValidation={errors.size ? true : false}
                >
                  <Controller
                    as={Select}
                    id="size"
                    control={control}
                    options={partAttributes?.size}
                    onChange={([selected]) => {
                      return { value: selected };
                    }}
                    menuPlacement="top"
                  />
                </AMPFieldWrapper>
                <AMPFieldWrapper
                  colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                  label="Style"
                  controlId="style"
                  name="style"
                  required={true}
                  isDisabled={
                    isAssetEdit
                      ? status === ConstVariable?.CLSD ||
                      status === ConstVariable?.RJCT
                      : false
                  }
                  fieldValidation={errors.style ? true : false}
                >
                  <Controller
                    as={Select}
                    id="style"
                    control={control}
                    options={partAttributes?.style}
                    onChange={([selected]) => {
                      return { value: selected };
                    }}
                    menuPlacement="top"
                  />
                </AMPFieldWrapper>
                <AMPFieldWrapper
                  colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                  label="Service"
                  controlId="service"
                  name="service"
                  required={true}
                  isDisabled={
                    isAssetEdit
                      ? status === ConstVariable?.CLSD ||
                      status === ConstVariable?.RJCT
                      : false
                  }
                  fieldValidation={errors.service ? true : false}
                >
                  <Controller
                    as={Select}
                    id="service"
                    control={control}
                    options={partAttributes?.service}
                    onChange={([selected]) => {
                      return { value: selected };
                    }}
                    menuPlacement="top"
                  />
                </AMPFieldWrapper>
                <AMPFieldWrapper
                  colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                  label="Pressure Rating"
                  controlId="pressureRating"
                  name="pressureRating"
                  required={true}
                  isDisabled={
                    isAssetEdit
                      ? status === ConstVariable?.CLSD ||
                      status === ConstVariable?.RJCT
                      : false
                  }
                  fieldValidation={errors.pressureRating ? true : false}
                >
                  <Controller
                    as={Select}
                    id="pressureRating"
                    control={control}
                    options={partAttributes?.pressureRating}
                    onChange={([selected]) => {
                      return { value: selected };
                    }}
                    menuPlacement="top"
                  />
                </AMPFieldWrapper>
                <AMPFieldWrapper
                  colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                  label="Designation"
                  controlId="designation"
                  name="designation"
                  required={true}
                  isDisabled={
                    isAssetEdit
                      ? status === ConstVariable?.CLSD ||
                      status === ConstVariable?.RJCT
                      : false
                  }
                  fieldValidation={errors.designation ? true : false}
                >
                  <Controller
                    as={Select}
                    id="designation"
                    control={control}
                    options={partAttributes?.designation}
                    onChange={([selected]) => {
                      return { value: selected };
                    }}
                    menuPlacement="top"
                  />
                </AMPFieldWrapper>
              </AMPFormLayout>
            </AMPFieldSet>
            <Row>
              <Col className="text-right my-2">
                {isAssetEdit ? (
                  <AMPAuthorization
                    hasToken={
                      isReceiving
                        ? context?.features?.includes("RE-EDIT")
                        : context?.features?.includes("WO-EDIT")
                    }
                  >
                    <>
                      {status !== ConstVariable.CLSD &&
                        status !== ConstVariable.RJCT && (
                          <Button
                            type="submit"
                            variant="secondary"
                            className="px-5"
                          >
                            Update
                          </Button>
                        )}
                    </>
                  </AMPAuthorization>
                ) : (
                  <Button type="submit" variant="secondary" className="px-5">
                    Submit
                  </Button>
                )}
              </Col>
            </Row>
          </Col>
        </Row>
      </form>
      {showConfirmModal && (
        <AMPUpdateConfirmBox
          modalName=""
          confirmationMessage={
            FormValidation?.ASSET_PARTTYPE_CHANGE_INFO_MESSAGE
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
