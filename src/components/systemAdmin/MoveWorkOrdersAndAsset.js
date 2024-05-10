import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactGA from 'react-ga';
import { useForm, Controller } from "react-hook-form";
import AMPFieldSet from "../common/AMPFieldSet";
import Select from "react-select";
import {
  Row,
  Col,
  Form,
  Card,
  Header,
  Button,
  Collapse,
  Table,
} from "react-bootstrap";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import * as yup from "yup";
import { AMPFieldWrapper } from "../common/AMPFieldWrapper";
import { AMPFormLayout } from "../common/AMPFormLayout";
import { AMPCheckbox } from "../common/AMPCheckbox";

import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";
import {
  DEFAULT_BASE_URL,
  VERSION,
  GET_ALL_ORGANIZATION,
  GET_COMPANY,
  GET_AREA,
  GET_REGION,
  GET_GROUP_UNIT,
  GET_DISTRICT,
  MOVE_TO_WO_AND_ASSET,
} from "../common/const";
import { ampJsonAjax } from "../common/utils/ampAjax";
import AMPLoader from "../common/AMPLoader";
import { useAccessState } from "../../utils/AppContext/loginContext";
import { AMPToastConsts } from "../common/const/AMPToastConst";
import { toast } from "react-toastify";
import { AMPErrorAlert } from "../common/AMPAlert";
import { MoveWoAndAssetConst } from "./MoveWoAndAssetConst";
import { type } from "ramda";

//On Migration
const moveToWorkOrderAndAssetAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.put(URL, params).pipe(
        map((xhrResponse) => {
          return { ...xhrResponse?.response, params };
        }),
        catchError((error) => {
          console.error("Error in update Receiving Form", error);
          errorHandler(error.response);
          return [];
        })
      )
    )
  ); // ENd of line

const getAllOrganizationListAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax.get(DEFAULT_BASE_URL + VERSION + GET_ALL_ORGANIZATION).pipe(
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
// Fethc Company List By Org Id
const getCompanyListAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax.get(DEFAULT_BASE_URL + VERSION + GET_COMPANY + param.id).pipe(
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
  ); // End oF line

// Fetch Area
const getAreaListAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax.get(DEFAULT_BASE_URL + VERSION + GET_AREA + param.id).pipe(
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
  ); // End of Lines

// Fetch Region
const getRegionListAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax.get(DEFAULT_BASE_URL + VERSION + GET_REGION + param.id).pipe(
        map((xhrResponse) => {
          const filteredData = xhrResponse.response.content.map((item) => {
            return {
              label: item.value,
              value: item.id,
            };
          });
          return { filteredData, ...param };
        }),
        catchError((error) => {
          return throwError(error);
        })
      )
    )
  ); // End Of Line
// Fetch District
const getDistrictListAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax
        .get(DEFAULT_BASE_URL + VERSION + GET_DISTRICT + param.id)
        .pipe(
          map((xhrResponse) => {
            const filteredData = xhrResponse.response.content.map((item) => {
              return {
                label: item.value,
                value: item.id,
              };
            });
            return { filteredData, ...param };
          }),
          catchError((error) => {
            return throwError(error);
          })
        )
    )
  ); // End Of Line

//Fetch Grup Unit
const getGroupUnitListAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax
        .get(DEFAULT_BASE_URL + VERSION + GET_GROUP_UNIT + param.id)
        .pipe(
          map((xhrResponse) => {
            const filteredData = xhrResponse.response.content.map((item) => {
              return {
                label: item.value,
                value: item.id,
              };
            });
            return { filteredData, ...param };
          }),
          catchError((error) => {
            return throwError(error);
          })
        )
    )
  ); // ENd of line
const MoveWorkOrderAndAsset = () => {
  const {
    handleSubmit,
    reset,
    watch,
    control,
    register,
    setValue,
    errors,
    getValues,
  } = useForm({});

  const org = watch("organization");
  const cust = watch("customer");
  const sourceOrganizationArea = watch("sourceArea");
  const destinationOrganizationArea = watch("destinationArea");
  const sourceOrganizationRegion = watch("sourceRegion");
  const destinationOrganizationRegion = watch("destinationRegion");
  const sourceOrganizationDistrict = watch("sourceDistrict");
  const destinationOrganizationDistrict = watch("destinationDistrict");
  const sourceOrganizationGroup = watch("sourceGroupUnit");
  const destinationOrganizationGroup = watch("destinationGroupUnit");
  const [showLoader, setLoader] = useState(false);
  const [showMigrationReport, setShowMigrationReport] = useState(false);
  // For google analytics purpose
  useEffect(()=>{
    ReactGA.pageview(window.location.pathname + window.location.search);
  },[])
  // // For Update Receivng Form
  const moveToWorkOrderAndAssetForm$ = useMemo(() => {
    return moveToWorkOrderAndAssetAjax$(
      DEFAULT_BASE_URL + VERSION + MOVE_TO_WO_AND_ASSET,
      {
        errorHandler: (error) => {
          toast.error(AMPToastConsts.MOVE_TO_WORKORDER_AND_ASSET_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  /* Observer for update response from ajax request */
  useObservableCallback(moveToWorkOrderAndAssetForm$, (response) => {
    if (!response?.status) {
      toast.error(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      setShowMigrationReport(response?.content);
      toast.success(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });

  return (
    <div>
      <p>
        <span className="receiving-tag">Move Work orders and Assets</span>
      </p>
      <div>
        <MoveWorkOrderAndAssetComponent
          org={org}
          cust={cust}
          sourceOrganizationArea={sourceOrganizationArea}
          destinationOrganizationArea={destinationOrganizationArea}
          sourceOrganizationRegion={sourceOrganizationRegion}
          destinationOrganizationRegion={destinationOrganizationRegion}
          sourceOrganizationDistrict={sourceOrganizationDistrict}
          destinationOrganizationDistrict={destinationOrganizationDistrict}
          sourceOrganizationGroup={sourceOrganizationGroup}
          destinationOrganizationGroup={destinationOrganizationGroup}
          control={control}
          errors={errors}
          setValue={setValue}
          setLoader={setLoader}
          showLoader={showLoader}
          register={register}
          watch={watch}
          handleSubmit={handleSubmit}
          setShowMigrationReport={setShowMigrationReport}
          showMigrationReport={showMigrationReport}
          moveToWorkOrderAndAssetForm$={moveToWorkOrderAndAssetForm$}
        />
      </div>
    </div>
  );
};
const MoveWorkOrderAndAssetComponent = (props) => {
  const context = useAccessState();
  const {
    org,
    cust,
    sourceOrganizationArea,
    destinationOrganizationArea,
    sourceOrganizationRegion,
    destinationOrganizationRegion,
    sourceOrganizationDistrict,
    destinationOrganizationDistrict,
    sourceOrganizationGroup,
    destinationOrganizationGroup,
    control,
    errors,
    setValue,
    setLoader,
    showLoader,
    register,
    watch,
    handleSubmit,
    showMigrationReport,
    setShowMigrationReport,
    moveToWorkOrderAndAssetForm$,
  } = props;
  const [organizationList, setOrganizationList] = useState({});
  const [companyList, setCompanyList] = useState({});
  const [areaList, setAreaList] = useState({});
  const [sourceRegionList, setSourceRegionList] = useState({});
  const [surceGroupUnitList, setSourceGroupUnitList] = useState({});
  const [sourceDistrictList, setSourceDistrictList] = useState({});
  const [destinationRegionList, setDestinationRegionList] = useState({});
  const [destinationgroupUnitList, setDestinationGroupUnitList] = useState({});
  const [destinationDistrictList, setDestinationDistrictList] = useState({});
  const [showMessage, setMessage] = useState("");

  const districtOrGroupUnit = watch("districtOrGroupUnit");

  const ajaxOrganizationObsv$ = useMemo(() => {
    return getAllOrganizationListAjaxObs$();
  }, []);
  useObservableCallback(
    ajaxOrganizationObsv$,
    (response) => {
      setLoader(false);
      setOrganizationList(response);
    },
    []
  );
  const ajaxCompanyObsv$ = useMemo(() => {
    return getCompanyListAjaxObs$();
  }, []);
  useObservableCallback(
    ajaxCompanyObsv$,
    (response) => {
      setLoader(false);
      setCompanyList(response);
    },
    []
  );
  const ajaxAreaObsv$ = useMemo(() => {
    return getAreaListAjaxObs$();
  }, []);
  useObservableCallback(
    ajaxAreaObsv$,
    (response) => {
      setLoader(false);
      setAreaList(response);
    },
    []
  );
  const ajaxRegionObsv$ = useMemo(() => {
    return getRegionListAjaxObs$();
  }, []);
  useObservableCallback(
    ajaxRegionObsv$,
    (response) => {
      setLoader(false);
      if (response?.type === MoveWoAndAssetConst.SRC_RGN) {
        setSourceRegionList(response?.filteredData);
      } else if (response?.type === MoveWoAndAssetConst.DES_RGN) {
        setDestinationRegionList(response?.filteredData);
      }
    },
    []
  );
  const ajaxDistrictObsv$ = useMemo(() => {
    return getDistrictListAjaxObs$();
  }, []);
  useObservableCallback(
    ajaxDistrictObsv$,
    (response) => {
      setLoader(false);
      if (response?.type === MoveWoAndAssetConst.SRC_DSTRCT) {
        setSourceDistrictList(response?.filteredData);
      } else if (response?.type === MoveWoAndAssetConst.DES_DSTRCT) {
        setDestinationDistrictList(response?.filteredData);
        response?.filteredData;
      }
    },
    []
  );
  const ajaxGroupUnitObsv$ = useMemo(() => {
    return getGroupUnitListAjaxObs$();
  }, []);
  useObservableCallback(
    ajaxGroupUnitObsv$,
    (response) => {
      setLoader(false);
      if (response?.type === MoveWoAndAssetConst.SRC_GRPUNIT) {
        setSourceGroupUnitList(response?.filteredData);
      } else if (response?.type === MoveWoAndAssetConst.DES_GRPUNIT) {
        setDestinationGroupUnitList(response?.filteredData);
      }
    },
    []
  );
  useEffect(() => {
    if (ajaxOrganizationObsv$) {
      ajaxOrganizationObsv$.next();
      setLoader(true);
    }
  }, [ajaxOrganizationObsv$]);

  useEffect(() => {
    if (ajaxCompanyObsv$ && org?.value) {
      ajaxCompanyObsv$.next({ id: org?.value });
      setLoader(true);
    }

    setValue("customer", { value: "", label: "" });
  }, [ajaxCompanyObsv$, org?.value]);
  useEffect(() => {
    if (ajaxAreaObsv$ && cust?.value) {
      ajaxAreaObsv$.next({ id: cust?.value });
      setLoader(true);
    }
    setValue("sourceArea", { value: "", label: "" });
    setValue("destinationArea", { value: "", label: "" });
  }, [ajaxAreaObsv$, cust?.value]);

  useEffect(() => {
    if (ajaxRegionObsv$ && sourceOrganizationArea?.value) {
      ajaxRegionObsv$.next({
        id: sourceOrganizationArea?.value,
        type: MoveWoAndAssetConst.SRC_RGN,
      });
      setLoader(true);
    }
    setValue("sourceRegion", { value: "", label: "" });
  }, [ajaxRegionObsv$, sourceOrganizationArea?.value]);

  useEffect(() => {
    if (ajaxRegionObsv$ && destinationOrganizationArea?.value) {
      ajaxRegionObsv$.next({
        id: destinationOrganizationArea?.value,
        type: MoveWoAndAssetConst.DES_RGN,
      });
      setLoader(true);
    }

    setValue("destinationRegion", { value: "", label: "" });
  }, [ajaxRegionObsv$, destinationOrganizationArea?.value]);

  useEffect(() => {
    if (ajaxDistrictObsv$ && sourceOrganizationRegion?.value) {
      ajaxDistrictObsv$.next({
        id: sourceOrganizationRegion?.value,
        type: MoveWoAndAssetConst.SRC_DSTRCT,
      });
      setLoader(true);
    }

    setValue("sourceDistrict", { value: "", label: "" });
  }, [ajaxDistrictObsv$, sourceOrganizationRegion?.value]);

  useEffect(() => {
    if (ajaxDistrictObsv$ && destinationOrganizationRegion?.value) {
      ajaxDistrictObsv$.next({
        id: destinationOrganizationRegion?.value,
        type: MoveWoAndAssetConst.DES_DSTRCT,
      });
      setLoader(true);
    }
    setValue("destinationDistrict", { value: "", label: "" });
  }, [ajaxDistrictObsv$, destinationOrganizationRegion?.value]);

  useEffect(() => {
    if (ajaxGroupUnitObsv$ && sourceOrganizationDistrict?.value) {
      ajaxGroupUnitObsv$.next({
        id: sourceOrganizationDistrict?.value,
        type: MoveWoAndAssetConst.SRC_GRPUNIT,
      });
      setLoader(true);
    }
    setValue("sourceGroupUnit", { value: "", label: "" });
  }, [ajaxGroupUnitObsv$, sourceOrganizationDistrict?.value]);

  useEffect(() => {
    if (ajaxGroupUnitObsv$ && destinationOrganizationDistrict?.value) {
      ajaxGroupUnitObsv$.next({
        id: destinationOrganizationDistrict?.value,
        type: MoveWoAndAssetConst.DES_GRPUNIT,
      });
      setLoader(true);
    }
    setValue("destinationGroupUnit", { value: "", label: "" });
  }, [ajaxGroupUnitObsv$, destinationOrganizationDistrict?.value]);

  const onMigration = (formState) => {
    if (
      districtOrGroupUnit === "1" &&
      formState?.sourceGroupUnit?.value ===
        formState?.destinationGroupUnit?.value
    ) {
      setMessage(
        "Source Group/Unit and Destination Group/Unit can't be same. Please Select different Source Group/Unit and Destination Group/Unit."
      );
    } else if (
      districtOrGroupUnit === "0" &&
      formState?.sourceDistrict?.value === formState?.destinationDistrict?.value
    ) {
      setMessage(
        "Source District and Destination District can't be same. Please Select different Source District and Destination District"
      );
    } else {
      setMessage("");
      let ajaxParams = {
        organizationLevelId: parseInt(formState?.organization?.value),
        sourceOrganizationGroupId:
          parseInt(formState?.sourceGroupUnit?.value) ||
          parseInt(formState?.sourceDistrict?.value),
        destinationOrganizationGroupId:
          parseInt(formState?.destinationGroupUnit?.value) ||
          parseInt(formState?.destinationDistrict?.value),
        isMigrationSummaryChecked: formState?.isMigrationSummaryChecked,
        RequestedById: parseInt(context?.userId),
      };
      moveToWorkOrderAndAssetForm$.next(ajaxParams);
    }
  };
  useEffect(() => {
    if (
      (districtOrGroupUnit === "0" &&
        sourceOrganizationDistrict &&
        destinationOrganizationDistrict) ||
      (districtOrGroupUnit === "1" &&
        sourceOrganizationGroup &&
        destinationOrganizationGroup)
    ) {
      setShowMigrationReport(false);
    }
    if (
      (districtOrGroupUnit === "0" &&
        sourceOrganizationDistrict?.value &&
        destinationOrganizationDistrict?.value &&
        sourceOrganizationDistrict?.value ===
          destinationOrganizationDistrict?.value) ||
      (districtOrGroupUnit === "1" &&
        destinationOrganizationGroup?.value &&
        sourceOrganizationGroup?.value &&
        sourceOrganizationGroup?.value === destinationOrganizationGroup?.value)
    ) {
      setMessage("");
    }
  }, [
    sourceOrganizationGroup,
    destinationOrganizationGroup,
    sourceOrganizationDistrict,
    destinationOrganizationDistrict,
  ]);

  return (
    <div id="results" className="form-container bg-form">
      <form onSubmit={handleSubmit(onMigration)} className="pb-5">
        <Row>
          <Col md={12} sm={12} lg={12} xs={12}>
            <AMPFieldSet title="Select Customer">
              <AMPFormLayout>
                <AMPFieldWrapper
                  colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                  label="Organization"
                  controlId="organization"
                  name="organization"
                  fieldValidation={errors?.organization ? true : false}
                >
                  <Controller
                    as={Select}
                    control={control}
                    options={organizationList}
                    onChange={([selected]) => {
                      // React Select return object instead of value for selection
                      return { value: selected };
                    }}
                    rules={{
                      required: {
                        value: true,
                        message: "Oranization is required",
                      },
                    }}
                    size="sm"
                  />
                </AMPFieldWrapper>
                <AMPFieldWrapper
                  colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                  label="Customer"
                  controlId="customer"
                  name="customer"
                >
                  <Controller
                    as={Select}
                    control={control}
                    options={companyList}
                    onChange={([selected]) => {
                      return { value: selected };
                    }}
                    size="sm"
                    isDisabled={!org?.value || companyList?.length === 0}
                  />
                </AMPFieldWrapper>
              </AMPFormLayout>
            </AMPFieldSet>
            {cust?.value && (
              <AMPFieldSet>
                <div className="amp-position-relative">
                  <Col lg={12} md={6} xs={12} sm={12}>
                    <Row>
                      <Col lg={6} md={6} xs={12} sm={12}>
                        <Form.Label className="form-label mt-3">
                          Do you want to move the workorder across to Districts
                          or Group/Unit?
                        </Form.Label>
                      </Col>
                      <Col lg={3} md={3} xs={12} sm={12}>
                        <Form.Label className="form-label mt-3 ml-1 input-radio">
                          <span className="mr-1">
                            <input
                              type="radio"
                              name="districtOrGroupUnit"
                              value="0"
                              ref={register}
                              defaultChecked={true}
                            />
                          </span>
                          District
                        </Form.Label>
                      </Col>

                      <Col lg={3} md={3} xs={12} sm={12}>
                        <Form.Label className="form-label mt-3 ml-1 input-radio">
                          <span className="mr-1">
                            <input
                              type="radio"
                              name="districtOrGroupUnit"
                              value="1"
                              ref={register}
                            />
                          </span>
                          Group/Unit
                        </Form.Label>
                      </Col>
                      {/* </div> */}
                    </Row>
                  </Col>
                </div>
              </AMPFieldSet>
            )}
            {districtOrGroupUnit && (
              <AMPFieldSet>
                <Row>
                  <Col xs={12} sm={12} md={6} lg={6}>
                    <AMPFieldSet
                      title={
                        districtOrGroupUnit === "0"
                          ? "Source District"
                          : "Source Group/Unit"
                      }
                    >
                      <AMPFieldWrapper
                        colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                        label="Area"
                        controlId="sourceArea"
                        name="sourceArea"
                      >
                        <Controller
                          as={Select}
                          control={control}
                          options={areaList}
                          defaultValue={{ value: "", label: "" }}
                          size="sm"
                          isDisabled={!cust?.value || areaList?.length === 0}
                        />
                      </AMPFieldWrapper>
                      <AMPFieldWrapper
                        colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                        label="Region"
                        controlId="sourceRegion"
                        name="sourceRegion"
                      >
                        <Controller
                          as={Select}
                          control={control}
                          options={sourceRegionList}
                          size="sm"
                          //defaultValue={{ value: '', label: '' }}
                          isDisabled={
                            !sourceOrganizationArea?.value ||
                            sourceRegionList?.length === 0
                          }
                        />
                      </AMPFieldWrapper>
                      <AMPFieldWrapper
                        colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                        label="District"
                        controlId="sourceDistrict"
                        name="sourceDistrict"
                      >
                        <Controller
                          as={Select}
                          control={control}
                          options={sourceDistrictList}
                          defaultValue={{ value: "", label: "" }}
                          size="sm"
                          isDisabled={
                            !sourceOrganizationRegion?.value ||
                            sourceDistrictList?.length === 0
                          }
                        />
                      </AMPFieldWrapper>
                      {districtOrGroupUnit === "1" && (
                        <AMPFieldWrapper
                          colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                          label="Group/Unit"
                          controlId="sourceGroupUnit"
                          name="sourceGroupUnit"
                        >
                          <Controller
                            as={Select}
                            control={control}
                            options={surceGroupUnitList}
                            defaultValue={{ value: "", label: "" }}
                            size="sm"
                            isDisabled={
                              !sourceOrganizationDistrict?.value ||
                              surceGroupUnitList?.length === 0
                            }
                          />
                        </AMPFieldWrapper>
                      )}
                    </AMPFieldSet>
                  </Col>

                  <Col xs={12} sm={12} md={6} lg={6}>
                    <AMPFieldSet
                      title={
                        districtOrGroupUnit === "0"
                          ? "Destination District"
                          : "Destination Group/Unit"
                      }
                    >
                      <AMPFieldWrapper
                        colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                        label="Area"
                        controlId="destinationArea"
                        name="destinationArea"
                      >
                        <Controller
                          as={Select}
                          control={control}
                          options={areaList}
                          defaultValue={{ value: "", label: "" }}
                          size="sm"
                          isDisabled={!cust?.value || areaList?.length === 0}
                        />
                      </AMPFieldWrapper>
                      <AMPFieldWrapper
                        colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                        label="Region"
                        controlId="destinationRegion"
                        name="destinationRegion"
                      >
                        <Controller
                          as={Select}
                          control={control}
                          options={destinationRegionList}
                          size="sm"
                          isDisabled={
                            !destinationOrganizationArea?.value ||
                            destinationRegionList?.length === 0
                          }
                        />
                      </AMPFieldWrapper>
                      <AMPFieldWrapper
                        colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                        label="District"
                        controlId="destinationDistrict"
                        name="destinationDistrict"
                      >
                        <Controller
                          as={Select}
                          control={control}
                          options={destinationDistrictList}
                          defaultValue={{ value: "", label: "" }}
                          size="sm"
                          isDisabled={
                            !destinationOrganizationRegion?.value ||
                            destinationDistrictList?.length === 0
                          }
                        />
                      </AMPFieldWrapper>
                      {districtOrGroupUnit === "1" && (
                        <AMPFieldWrapper
                          colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                          label="Group/Unit"
                          controlId="destinationGroupUnit"
                          name="destinationGroupUnit"
                        >
                          <Controller
                            as={Select}
                            control={control}
                            options={destinationgroupUnitList}
                            defaultValue={{ value: "", label: "" }}
                            size="sm"
                            isDisabled={
                              !destinationOrganizationDistrict?.value ||
                              destinationgroupUnitList?.length === 0
                            }
                          />
                        </AMPFieldWrapper>
                      )}
                    </AMPFieldSet>
                  </Col>
                </Row>

                {showMessage &&
                  ((districtOrGroupUnit === "0" &&
                    sourceOrganizationDistrict?.value &&
                    destinationOrganizationDistrict?.value &&
                    sourceOrganizationDistrict?.value ===
                      destinationOrganizationDistrict?.value) ||
                    (districtOrGroupUnit === "1" &&
                      destinationOrganizationGroup?.value &&
                      sourceOrganizationGroup?.value &&
                      sourceOrganizationGroup?.value ===
                        destinationOrganizationGroup?.value)) && (
                    <AMPErrorAlert show={true}>{showMessage}</AMPErrorAlert>
                  )}
              </AMPFieldSet>
            )}
            {((districtOrGroupUnit === "0" &&
              sourceOrganizationDistrict?.value &&
              destinationOrganizationDistrict?.value) ||
              (districtOrGroupUnit === "1" &&
                sourceOrganizationGroup?.value &&
                destinationOrganizationGroup?.value)) && (
              <AMPFieldSet>
                <AMPFieldWrapper
                  controlId="isMigrationSummaryChecked"
                  colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
                  name="isMigrationSummaryChecked"
                >
                  <AMPCheckbox
                    label="Do you want to display Migration Summary?"
                    ref={register}
                  />
                </AMPFieldWrapper>
              </AMPFieldSet>
            )}
            {((districtOrGroupUnit === "0" &&
              sourceOrganizationDistrict?.value &&
              destinationOrganizationDistrict?.value) ||
              (districtOrGroupUnit === "1" &&
                sourceOrganizationGroup?.value &&
                destinationOrganizationGroup?.value)) && (
              <Row>
                <Col xs="3" sm="3" md="3" lg="3"></Col>
                <Col xs="12" sm="12" md="7" lg="7">
                  <Button
                    type="submit"
                    variant="secondary"
                    className="px-5 mt-3 mb-3"
                    size="md"
                  >
                    Click to Move Workorder and Asset from Source to Destination
                    {districtOrGroupUnit === "0" ? ` District` : ` Group/Unit`}
                  </Button>
                </Col>
                <Col xs="2" sm="2" md="2" lg="2"></Col>
              </Row>
            )}
            {showMigrationReport && (
              <AMPFieldSet
                title="Migration Report"
                customisedClassName="fn-18 text-info"
              >
                <Table striped bordered hover responsive size="sm">
                  <thead>
                    <tr className="text-center">
                      <th width="200">Work Order Number</th>
                      <th width="200">Workorder Status</th>
                    </tr>
                  </thead>
                  <tbody className="fn-14">
                    {showMigrationReport?.workorderMigrationSummary?.map(
                      (itm, idx) => {
                        return (
                          <tr>
                            <td className="text-center">
                              {itm?.workorderNumber}
                            </td>
                            <td className="text-center">
                              {itm?.workorderStatus}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </Table>
              </AMPFieldSet>
            )}

            {showMigrationReport && (
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr className="text-center">
                    <th width="200">Manufacturer Serial Number</th>
                    <th width="200">Asset Status</th>
                  </tr>
                </thead>
                <tbody className="fn-14">
                  {showMigrationReport?.assetMigrationSummary?.map(
                    (itm, idx) => {
                      return (
                        <tr>
                          <td className="text-center">
                            {itm?.assetManufacturerSerialNumber}
                          </td>
                          <td className="text-center">{itm?.assetStatus}</td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </Table>
            )}
          </Col>
        </Row>
      </form>
    </div>
  );
};
export default MoveWorkOrderAndAsset;
