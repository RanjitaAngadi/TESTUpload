import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  useForm,
  Controller,
} from "react-hook-form";
import Select, { components } from "react-select";
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
} from "../common/const";

import { ampJsonAjax } from "../common/utils/ampAjax";
import AMPLoader from "../common/AMPLoader";

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
export const OrganizationalDetailsForm = (props) => {
  const { handleSubmit } = useForm();
  const { setValue, type } = props;
  const [showLoader, setLoader] = useState(false);
  const [organizationList, setOrganizationList] = useState([]);
  const [companyList, setCompanyList] = useState({});
  const [areaList, setAreaList] = useState({});
  const [regionList, setRegionList] = useState({});
  const [groupUnitList, setGroupUnitList] = useState({});
  const [districtList, setDistrictList] = useState({});
  // to load organizations 
  const [fetchOrganization, setFetchOrganization] = useState(false)
  const {
    org,
    cust,
    organizationArea,
    organizationRegion,
    organizationDistrict,
    control,
    errors,
    errorOrganizationMessage,
  } = props;

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
        let currentCustomer = { value: "", label: "" }
        currentCustomer = response?.filter((item) => {
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
    let recentOrganizations = JSON.parse(localStorage.getItem('cachedOrganizations')) || []
    if (ajaxOrganizationObsv$ &&
      (recentOrganizations?.length < 10 || fetchOrganization)
    ) {
      ajaxOrganizationObsv$.next();
      setLoader(true);
    }
  }, [ajaxOrganizationObsv$, fetchOrganization]);


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

    setValue("area", { value: "", label: "" });
  }, [ajaxAreaObsv$, cust?.value]);
  useEffect(() => {
    if (ajaxRegionObsv$ && organizationArea?.value) {
      ajaxRegionObsv$.next({ id: organizationArea?.value });
      setLoader(true);
    }

    setValue("region", { value: "", label: "" });
  }, [ajaxRegionObsv$, organizationArea?.value]);
  useEffect(() => {
    if (ajaxDistrictObsv$ && organizationRegion?.value) {
      ajaxDistrictObsv$.next({ id: organizationRegion?.value });
      setLoader(true);
    }

    setValue("district", { value: "", label: "" });
  }, [ajaxDistrictObsv$, organizationRegion?.value]);
  useEffect(() => {
    if (ajaxGroupUnitObsv$ && organizationDistrict?.value) {
      ajaxGroupUnitObsv$.next({ id: organizationDistrict?.value });
      setLoader(true);
    }

    setValue("groupUnit", { value: "", label: "" });
  }, [ajaxGroupUnitObsv$, organizationDistrict?.value]);


  // --------------------------- modifications start -----------------------------

  useEffect(() => {
    if (org && org?.value) {
      const temp = [
        org,
        ...JSON.parse(localStorage.getItem('cachedOrganizations')) || []
      ]
      const result = Array.from(new Set(temp?.map(item => item?.value)))?.map(value => {
        return {
          label: temp?.find(itm => itm?.value === value)?.label,
          value: value
        }
      })?.slice(0, 10)
      window.localStorage.setItem('cachedOrganizations', JSON.stringify(result))
    }

    const recentOrganizations = JSON.parse(localStorage.getItem('cachedOrganizations')) || []
    // recentOrganizations.splice(9,1)
    // window.localStorage.setItem('cachedOrganizations', JSON.stringify(recentOrganizations))
    if (recentOrganizations.length === 10 && !fetchOrganization) {
      setOrganizationList([{
        label: "Recent",
        options: recentOrganizations
      }]);
    }
  }, [org])

  // -------------------------- modifications end -----------------------------

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
    setFetchOrganization(true)
  }

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
          <Controller
            as={Select}
            control={control}
            options={organizationList}
            components={{
              MenuList,
              MenuListFooter: (
                <MenuListFooter
                  fetchOrganization={fetchOrganization}
                  show={organizationList[0]?.options?.length}
                  onClick={loadAllOptions}
                />
              )
            }}
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
        </AMPFieldWrapper>
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
            isDisabled={!cust?.value || areaList?.length === 0}
          />
        </AMPFieldWrapper>
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
            isDisabled={!organizationArea?.value || regionList?.length === 0}
          />
        </AMPFieldWrapper>
        <AMPFieldWrapper
          colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
          label="District"
          controlId="district"
          name="district"
        >
          <Controller
            as={Select}
            control={control}
            options={districtList}
            defaultValue={{ value: "", label: "" }}
            size="sm"
            isDisabled={
              !organizationRegion?.value || districtList?.length === 0
            }
          />
        </AMPFieldWrapper>
        <AMPFieldWrapper
          colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
          label="Group/Unit"
          controlId="groupUnit"
          name="groupUnit"
        >
          <Controller
            as={Select}
            control={control}
            options={groupUnitList}
            defaultValue={{ value: "", label: "" }}
            size="sm"
            isDisabled={
              !organizationDistrict?.value || groupUnitList?.length === 0
            }
          />
        </AMPFieldWrapper>
      </AMPFormLayout>
    </>
  );
};
