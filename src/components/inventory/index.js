import React, { useState, useContext, useEffect, memo, useMemo } from "react";
import SearchPumpForm from "../SearchForm/searchPumpForm";
import ReactGA from 'react-ga';
import { SearchResultTableForInventory } from "./searchResultTableForInventory";
import { toast } from "react-toastify";
import { Link, withRouter, Redirect, useLocation } from "react-router-dom";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import {
  DEFAULT_BASE_URL,
  VERSION,
  SEARCH_INVENTORY,
  ConstVariable,
} from "../common/const";
import { ampJsonAjax } from "../common/utils/ampAjax";
import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";
import { AMPToastConsts } from "../common/const/AMPToastConst";
import { useAccessState } from "../../utils/AppContext/loginContext";
import AMPAuthorization from "../common/AMPAuthorization/AMPAuthorization";

const searchInventoryFormAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax
        .post(URL + `${params.index}/${params.pageSize}`, params.ajaxParams)
        .pipe(
          map((xhrResponse) => {
            return { ...xhrResponse.response, params };
          }),
          catchError((error) => {
            console.error("Error in Search Work Order", error);
            errorHandler(error.response);
            return [];
          })
        )
    )
  ); // ENd of line

const InventoryForm = () => {
  const context = useAccessState();

  const [offset, setOffset] = useState(1);
  const [perPage] = useState(10);
  const [pageCount, setPageCount] = useState(0);

  const [isLoading, setLoader] = useState();

  const [searchResult, setSearchResult] = useState(ConstVariable?.INIT);

  const [ajaxParams, setAjaxParams] = useState();
  const [ajaxSearchParams, setAjaxSearchParams] = useState();

  const [organizationGroup, setOrganizationGroup] = useState({});

  const [errorMessage, setError] = useState("");


  window.sessionStorage.removeItem("ajaxReceivingSearch");
  window.sessionStorage.removeItem("ajaxWorkOrderSearch");
  window.sessionStorage.removeItem("ajaxPickUpSearch");
  window.sessionStorage.removeItem("ajaxBillingSearch");
  // For google analytics purpose
  useEffect(()=>{
    ReactGA.pageview(window.location.pathname + window.location.search);
  },[])
  const searchInventoryObs$ = useMemo(() => {
    return searchInventoryFormAjax$(
      DEFAULT_BASE_URL + VERSION + SEARCH_INVENTORY,
      {
        errorHandler: (error) => {
          setLoader(false);
          toast.error(AMPToastConsts.INVENTORY_SEARCH_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  /* Observer for save response from ajax request */
  useObservableCallback(searchInventoryObs$, (response) => {
    setAjaxSearchParams(response?.params?.ajaxSearchParams);
    window.sessionStorage.setItem(
      "ajaxInventorySearch",
      JSON.stringify({
        ...response?.params?.ajaxSearchParams,
        index: 1,
      })
    );
    if (response?.content) {
      // setSearchResult(response?.content);
      setSearchResult({
        ...response?.content,
        isApplied: false,
        sortType: ''
      });
    } else {
      setSearchResult({
        searchData: [],
        totalcount: 0
      });
    }
    setPageCount(Math.ceil(response?.content?.totalcount / perPage));
    setLoader(false);
  });

  const onSearch = (formData) => {
    let ajaxParams = {};
    let ajaxSearchParams = {};
    const from = formData?.from && new Date(formData?.from);
    const to = formData?.to && new Date(formData?.to);

    if ((from && from?.getTime()) > (to && to?.getTime())) {
      setError("To Date must be greater than From Date");
    } else {
      setError("");

      ajaxParams = {
        workorderNumber: formData?.workOrderNo,
        serviceCenterId: 0,
        workorderTypeId: 0,
        organizationGroupId:
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
          parseInt(organizationGroup?.organization_id),
        customerId:
          formData?.customer?.value?.toString() ||
          organizationGroup?.customer_id?.toString(),
        startDate: formData?.from ? new Date(formData?.from) : null,
        endDate: formData?.to ? new Date(formData?.to) : null,
        status: formData?.status?.value,
        serviceCenterIds: context?.serviceCenterIds,
      };

      ajaxSearchParams = {
        workOrderNo: formData?.workOrderNo,
        from: formData?.from ? formData?.from : null,
        to: formData?.to ? formData?.to : null,
        organization: formData?.organization || {
          value: organizationGroup?.organization_id,
          label: organizationGroup?.organization_name,
        },
        customer: formData?.customer || {
          value: organizationGroup?.customer_id,
          label: organizationGroup?.customer_name,
        },
        area: formData?.area || {
          value: organizationGroup?.area_id,
          label: organizationGroup?.area_name,
        },
        region: formData?.region || {
          value: organizationGroup?.region_id,
          label: organizationGroup?.region_name,
        },
        district: formData?.district || {
          value: organizationGroup?.district_id,
          label: organizationGroup?.district_name,
        },
        groupUnit: formData?.groupUnit || {
          value: organizationGroup?.group_unit_id,
          label: organizationGroup?.group_unit_name,
        },
        status: formData?.status,
        serviceCenterIds: context?.serviceCenterIds || formData?.serviceCenterIds,
      };
      setAjaxParams(ajaxParams);
      setOffset(1);
      searchInventoryObs$.next({
        index: formData?.index || 1,
        pageSize: perPage,
        ajaxParams: ajaxParams,
        ajaxSearchParams: ajaxSearchParams,
      });
      setLoader(true);
    }
  };
  const handlePageClick = (e) => {
    const selectedPage = e.selected;
    setOffset(selectedPage + 1);
  };

  useEffect(() => {
    let searchItems;
    searchItems = JSON.parse(
      window.sessionStorage.getItem("ajaxInventorySearch")
    );
    if (searchItems) {
      onSearch(searchItems);
    }
  }, []);
  return (
    <div className="mb-5">
      <AMPAuthorization
        showError={true}
        hasToken={
          context?.features?.includes("INV-SEARCH") ||
          context?.features?.includes("INV-ENTRY")
        }
      >
        <SearchPumpForm
          title="Search Inventory"
          formName={ConstVariable.INV}
          setLoader={setLoader}
          searchResult={searchResult}
          perPage={perPage}
          offset={offset}
          searchPumpObs$={searchInventoryObs$}
          ajaxParams={ajaxParams}
          isLoading={isLoading}
          isReceivingSearch={false}
          onSearch={onSearch}
          organizationGroup={organizationGroup}
          setOrganizationGroup={setOrganizationGroup}
          errorMessage={errorMessage}
          ajaxSearchParams={ajaxSearchParams}
        />

        {searchResult !== ConstVariable.INIT &&
          searchResult?.searchData?.length > 0 && (
            <SearchResultTableForInventory
              context={context}
              searchResult={searchResult}
              setSearchResult={setSearchResult}
              isLoading={isLoading}
              offset={offset}
              perPage={perPage}
              pageCount={pageCount}
              ajaxParams={ajaxParams}
              ajaxSearchParams={ajaxSearchParams}
              handlePageClick={handlePageClick}
            />
          )}
        {(searchResult?.searchData?.length === 0 || !searchResult) && (
          <div className="text-center">No Data Found</div>
        )}
      </AMPAuthorization>
    </div>
  );
};

export default InventoryForm
