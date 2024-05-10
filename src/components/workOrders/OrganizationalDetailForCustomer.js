import React, { useState, useEffect, useMemo } from "react";
import {
  useForm,
  Controller,
} from "react-hook-form";
import Select from "react-select";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import { AMPFieldWrapper } from "../common/AMPFieldWrapper";
import { AMPFormLayout } from "../common/AMPFormLayout";
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
  GET_ORGANIZATION_FOR_CUSTOMER,
} from "../common/const";
import { toast } from "react-toastify";

import { ampJsonAjax } from "../common/utils/ampAjax";
import AMPLoader from "../common/AMPLoader";
import { AMPTextBoxReadOnly } from "../common/AMPTextBoxReadOnly";

const getAllOrganizationListAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax.get(DEFAULT_BASE_URL + VERSION + GET_ALL_ORGANIZATION).pipe(
        map((xhrResponse) => {
          return xhrResponse;
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
          return filteredData;
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
            return filteredData;
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
            return filteredData;
          }),
          catchError((error) => {
            return throwError(error);
          })
        )
    )
  ); // ENd of line
export const OrganizationalDetailForCustomer = (props) => {
  const { handleSubmit } = useForm();
  const { setValue, type, userType, setOrganizationGroup, organizationGroup } =
    props;
  const [showLoader, setLoader] = useState(false);

  const [organizationList, setOrganizationList] = useState({});
  const [companyList, setCompanyList] = useState({});
  const [areaList, setAreaList] = useState({});
  const [regionList, setRegionList] = useState({});
  const [groupUnitList, setGroupUnitList] = useState({});
  const [districtList, setDistrictList] = useState({});
  const {
    org,
    cust,
    organizationArea,
    organizationRegion,
    organizationDistrict,
    control,
    errors,
    errorOrganizationMessage,
    register,
  } = props;

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
        setLoader(false);
        setOrganizationGroup(response?.response?.content?.content);
      }
    },
    []
  ); // Organization group ends
  const ajaxOrganizationObsv$ = useMemo(() => {
    return getAllOrganizationListAjaxObs$();
  }, []);
  useObservableCallback(
    ajaxOrganizationObsv$,
    (response) => {
      if (!response?.status) {
        toast.error(response?.response?.message, {
          position: toast.POSITION.TOP_CENTER,
        });
      } else {
        setLoader(false);
        const filteredData = response?.content?.map((item) => {
          return {
            label: item.value,
            value: item.id,
          };
        });
        setOrganizationList(filteredData);
      }
    },
    []
  );
  //Company List
  const ajaxCompanyObsv$ = useMemo(() => {
    return getCompanyListAjaxObs$();
  }, []);
  useObservableCallback(
    ajaxCompanyObsv$,
    (response) => {
      setLoader(false);
      setCompanyList(response);
      let searchItems = JSON.parse(
        window.sessionStorage.getItem("ajaxReceivingSearch") ||
          window.sessionStorage.getItem("ajaxWorkOrderSearch") ||
          window.sessionStorage.getItem("ajaxPickUpSearch") ||
          window.sessionStorage.getItem("ajaxInventorySearch")
      );
      if (type === "search" && searchItems?.customer?.value) {
        let currentCustomer = response?.filter((item) => {
          if (parseInt(item.value) === parseInt(searchItems?.customer?.value)) {
            return item;
          } else return null;
        });
        setValue("customer", currentCustomer[0]);
      }
    },
    []
  );
  // const companyList = useObservable(ajaxCompanyObsv$, []);
  const ajaxAreaObsv$ = useMemo(() => {
    return getAreaListAjaxObs$();
  }, []);
  useObservableCallback(
    ajaxAreaObsv$,
    (response) => {
      setLoader(false);
      setAreaList(response);
      let searchItems = JSON.parse(
        window.sessionStorage.getItem("ajaxReceivingSearch") ||
          window.sessionStorage.getItem("ajaxWorkOrderSearch") ||
          window.sessionStorage.getItem("ajaxPickUpSearch") ||
          window.sessionStorage.getItem("ajaxInventorySearch")
      );
      if (type === "search" && searchItems?.area?.value) {
        let currentArea = response?.filter((item) => {
          if (parseInt(item.value) === parseInt(searchItems?.area?.value)) {
            return item;
          } else return null;
        });
        setValue("area", currentArea[0]);
      }
    },
    []
  );
  // const areaList = useObservable(ajaxAreaObsv$, []);
  const ajaxRegionObsv$ = useMemo(() => {
    return getRegionListAjaxObs$();
  }, []);
  useObservableCallback(
    ajaxRegionObsv$,
    (response) => {
      setLoader(false);
      setRegionList(response);
      let searchItems = JSON.parse(
        window.sessionStorage.getItem("ajaxReceivingSearch") ||
          window.sessionStorage.getItem("ajaxWorkOrderSearch") ||
          window.sessionStorage.getItem("ajaxPickUpSearch") ||
          window.sessionStorage.getItem("ajaxInventorySearch")
      );
      if (type === "search" && searchItems?.region?.value) {
        let currentRegion = response?.filter((item) => {
          if (parseInt(item.value) === parseInt(searchItems?.region?.value)) {
            return item;
          } else return null;
        });
        setValue("region", currentRegion[0]);
      }
    },
    []
  );
  // const regionList = useObservable(ajaxRegionObsv$, []);
  const ajaxDistrictObsv$ = useMemo(() => {
    return getDistrictListAjaxObs$();
  }, []);
  useObservableCallback(
    ajaxDistrictObsv$,
    (response) => {
      setLoader(false);
      setDistrictList(response);
      let searchItems = JSON.parse(
        window.sessionStorage.getItem("ajaxReceivingSearch") ||
          window.sessionStorage.getItem("ajaxWorkOrderSearch") ||
          window.sessionStorage.getItem("ajaxPickUpSearch") ||
          window.sessionStorage.getItem("ajaxInventorySearch")
      );
      if (type === "search" && searchItems?.district?.value) {
        let currentDistrict = response?.filter((item) => {
          if (parseInt(item.value) === parseInt(searchItems?.district?.value)) {
            return item;
          } else return null;
        });
        setValue("district", currentDistrict[0]);
      }
    },
    []
  );
  // const districtList = useObservable(ajaxDistrictObsv$, []);
  const ajaxGroupUnitObsv$ = useMemo(() => {
    return getGroupUnitListAjaxObs$();
  }, []);
  useObservableCallback(
    ajaxGroupUnitObsv$,
    (response) => {
      setLoader(false);
      setGroupUnitList(response);
      let searchItems = JSON.parse(
        window.sessionStorage.getItem("ajaxReceivingSearch") ||
          window.sessionStorage.getItem("ajaxWorkOrderSearch") ||
          window.sessionStorage.getItem("ajaxPickUpSearch") ||
          window.sessionStorage.getItem("ajaxInventorySearch")
      );
      if (type === "search" && searchItems?.groupUnit?.value) {
        let currentGroupUnit = response?.filter((item) => {
          if (
            parseInt(item.value) === parseInt(searchItems?.groupUnit?.value)
          ) {
            return item;
          } else return null;
        });
        setValue("groupUnit", currentGroupUnit[0]);
      }
    },
    []
  );
  // const groupUnitList = useObservable(ajaxGroupUnitObsv$, []);
  useEffect(() => {
    setLoader(true);
    if (ajaxOrganizationObsv$ && !userType) {
      ajaxOrganizationObsv$.next();
    } else {
      ajaxOrganizationGroupObsv$.next();
    }
  }, [ajaxOrganizationObsv$, ajaxOrganizationGroupObsv$, userType]);

  useEffect(() => {
    if (ajaxCompanyObsv$ && org?.value && !organizationGroup?.customer_id) {
      ajaxCompanyObsv$.next({ id: org?.value });
      setLoader(true);
      setValue("customer", { value: "", label: "" });
    }
  }, [ajaxCompanyObsv$, org?.value, organizationGroup]);
  useEffect(() => {
    if (
      (ajaxAreaObsv$ && cust?.value && !organizationGroup?.area_id) ||
      (ajaxAreaObsv$ &&
        organizationGroup?.customer_id &&
        !organizationGroup?.area_id)
    ) {
      ajaxAreaObsv$.next({ id: organizationGroup?.customer_id || cust?.value });
      setLoader(true);
      setValue("area", { value: "", label: "" });
    }
  }, [ajaxAreaObsv$, cust?.value, organizationGroup]);

  useEffect(() => {
    if (
      (ajaxRegionObsv$ &&
        organizationArea?.value &&
        !organizationGroup?.region_id) ||
      (ajaxRegionObsv$ &&
        organizationGroup?.area_id &&
        !organizationGroup?.region_id)
    ) {
      ajaxRegionObsv$.next({
        id: organizationGroup?.area_id || organizationArea?.value,
      });
      setLoader(true);
      setValue("region", { value: "", label: "" });
    }
  }, [ajaxRegionObsv$, organizationArea?.value, organizationGroup]);

  useEffect(() => {
    if (
      (ajaxDistrictObsv$ &&
        organizationRegion?.value &&
        !organizationGroup?.district_id) ||
      (ajaxDistrictObsv$ &&
        organizationGroup?.region_id &&
        !organizationGroup?.district_id)
    ) {
      ajaxDistrictObsv$.next({
        id: organizationGroup?.region_id || organizationRegion?.value,
      });
      setLoader(true);
      setValue("district", { value: "", label: "" });
    }
  }, [ajaxDistrictObsv$, organizationRegion?.value, organizationGroup]);
  useEffect(() => {
    if (
      (ajaxGroupUnitObsv$ &&
        organizationDistrict?.value &&
        !organizationGroup?.group_unit_id) ||
      (ajaxGroupUnitObsv$ &&
        organizationGroup?.district_id &&
        !organizationGroup?.group_unit_id)
    ) {
      ajaxGroupUnitObsv$.next({
        id: organizationGroup?.district_id || organizationDistrict?.value,
      });
      setLoader(true);
      setValue("groupUnit", { value: "", label: "" });
    }
  }, [ajaxGroupUnitObsv$, organizationDistrict?.value, organizationGroup]);
  return (
    <>
      <AMPLoader isLoading={showLoader} />
      <AMPFormLayout>
        <AMPFieldWrapper
          colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
          label="Organization"
          controlId="organization"
          name="organization"
          required={type !== "search"}
          fieldValidation={errors?.organization ? true : false}
        >
          {!userType ? (
            <Controller
              as={Select}
              control={control}
              options={organizationList}
              onChange={([selected]) => {
                return { value: selected };
              }}
              rules={
                type !== "search" && {
                  required: { value: true, message: "Oranization is required" },
                }
              }
              size="sm"
            />
          ) : (
            <AMPTextBoxReadOnly
              value={organizationGroup?.organization_name}
              register={register}
            />
          )}
        </AMPFieldWrapper>
        {!userType ? (
          <AMPFieldWrapper
            colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
            label="Customer"
            controlId="customer"
            name="customer"
            required={type !== "search"}
            fieldValidation={errorOrganizationMessage ? true : false}
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
        ) : (
          <AMPFieldWrapper
            colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
            label="Customer"
            controlId="customer"
            name="customer"
            required={type !== "search"}
            fieldValidation={errors?.organization ? true : false}
          >
            <AMPTextBoxReadOnly
              value={organizationGroup?.customer_name}
              register={register}
            />
          </AMPFieldWrapper>
        )}

        {!organizationGroup?.area_id ? (
          <AMPFieldWrapper
            colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
            label="Area"
            controlId="area"
            name="area"
          >
            <Controller
              as={Select}
              control={control}
              options={areaList}
              defaultValue={{ value: "", label: "" }}
              size="sm"
              isDisabled={
                (!cust?.value && !organizationGroup?.customer_name) ||
                areaList?.length === 0
              }
            />
          </AMPFieldWrapper>
        ) : (
          <AMPFieldWrapper
            colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
            label="Area"
            controlId="area"
            name="area"
            required={type !== "search"}
            fieldValidation={errors?.organization ? true : false}
          >
            <AMPTextBoxReadOnly value={organizationGroup?.area_name} />
          </AMPFieldWrapper>
        )}
        {!organizationGroup?.region_name ? (
          <AMPFieldWrapper
            colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
            label="Region"
            controlId="region"
            name="region"
          >
            <Controller
              as={Select}
              control={control}
              options={regionList}
              size="sm"
              isDisabled={
                (!organizationArea?.value && !organizationGroup?.area_id) ||
                regionList?.length === 0
              }
            />
          </AMPFieldWrapper>
        ) : (
          <AMPFieldWrapper
            colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
            label="Region"
            controlId="region"
            name="region"
            required={type !== "search"}
            fieldValidation={errors?.organization ? true : false}
          >
            <AMPTextBoxReadOnly value={organizationGroup?.region_name} />
          </AMPFieldWrapper>
        )}
        <AMPFieldWrapper
          colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
          label="District"
          controlId="district"
          name="district"
        >
          {!organizationGroup?.district_id ? (
            <Controller
              as={Select}
              control={control}
              options={districtList}
              defaultValue={{ value: "", label: "" }}
              size="sm"
              isDisabled={
                (!organizationRegion?.value &&
                  !organizationGroup?.region_name) ||
                districtList?.length === 0
              }
            />
          ) : (
            <AMPTextBoxReadOnly value={organizationGroup?.district_name} />
          )}
        </AMPFieldWrapper>
        <AMPFieldWrapper
          colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
          label="Group/Unit"
          controlId="groupUnit"
          name="groupUnit"
        >
          {!organizationGroup?.group_unit_id ? (
            <Controller
              as={Select}
              control={control}
              options={groupUnitList}
              defaultValue={{ value: "", label: "" }}
              size="sm"
              isDisabled={
                (!organizationDistrict?.value &&
                  !organizationGroup?.district_name) ||
                groupUnitList?.length === 0
              }
            />
          ) : (
            <AMPTextBoxReadOnly value={organizationGroup?.group_unit_name} />
          )}
        </AMPFieldWrapper>
      </AMPFormLayout>
    </>
  );
};
