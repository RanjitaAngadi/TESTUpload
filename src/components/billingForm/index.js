import React, { useState, useContext, useEffect, memo, useMemo } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import ReactGA from 'react-ga';
import { useAccessState } from "../../utils/AppContext/loginContext";
import AMPAuthorization from "../common/AMPAuthorization/AMPAuthorization";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import {
  DEFAULT_BASE_URL,
  VERSION,
  ConstVariable,
  SEARCH_RECEIVING,
} from "../common/const";
import { ampJsonAjax } from "../common/utils/ampAjax";
import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";
import { AMPToastConsts } from "../common/const/AMPToastConst";
import SearchPumpForm from "../SearchForm/searchPumpForm";
import SearchResultTableForBilling from "./searchResultTableForBilling";

//On create New Questionnaire
const searchBillingObsFormAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax
        .post(URL + `/${params.index}/${params.pageSize}`, params.ajaxParams)
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

const BillingForm = () => {
  const locationRef = useLocation();
  const params = new window.URLSearchParams(window.location.search);

  // removing the ajaxReceivingSearch session to avoid redundancy with ajaxWorkOrderSearch
  window.sessionStorage.removeItem("ajaxWorkOrderSearch");
  window.sessionStorage.removeItem("ajaxInventorySearch");
  window.sessionStorage.removeItem("ajaxReceivingSearch");
  // window.sessionStorage.removeItem("ajaxBillingSearch");

  const [ajaxSearchParams, setAjaxSearchParams] = useState();

  const [ajaxParams, setAjaxParams] = useState();

  const [searchResult, setSearchResult] = useState(ConstVariable?.INIT);
  const [isCheckAll, setIsCheckAll] = useState(false);

  // pagination related constants
  const [offset, setOffset] = useState(1);
  const [perPage] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setLoader] = useState();
  const editForm = () => { };

  const context = useAccessState();

  const handlePageClick = (e) => {
    const selectedPage = e.selected;
    setOffset(selectedPage + 1);
    setIsCheckAll(false);
  };

  const searchBillingObs$ = useMemo(() => {
    return searchBillingObsFormAjax$(
      DEFAULT_BASE_URL + VERSION + SEARCH_RECEIVING,
      {
        errorHandler: (error) => {
          toast.error(AMPToastConsts.PICKUP_SEARCH_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  /* Observer for save response from ajax request */
  useObservableCallback(searchBillingObs$, (response) => {
    setAjaxSearchParams(response?.params?.ajaxSearchParams);
    window.sessionStorage.setItem(
      "ajaxBillingSearch",
      JSON.stringify({
        ...response?.params?.ajaxSearchParams,
        index: 1,
      })
    );

    // setSearchResult(response?.content);
    setSearchResult({
      ...response?.content,
      isApplied: false,
      sortType: ''
    });
    setPageCount(Math.ceil(response?.content?.totalcount / perPage));
    setLoader(false);
  });

  const [organizationGroup, setOrganizationGroup] = useState({});
  const [errorMessage, setError] = useState("");
  //On Search of PIckup
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
        WorkorderNumber: formData?.workOrderNo.trim(),
        OrganizationGroupId:
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
      searchBillingObs$.next({
        index: formData?.index || 1,
        pageSize: perPage,
        ajaxParams: ajaxParams,
        ajaxSearchParams: ajaxSearchParams,
      });
      setLoader(true);
    }
  };
  useEffect(() => {
    let searchItems;
    searchItems = JSON.parse(window.sessionStorage.getItem("ajaxBillingSearch"));
    if (searchItems) {
      onSearch(searchItems);
    }
  }, []);
  // For google analytics purpose
  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, [])
  return (
    <div className="mb-5">
      <AMPAuthorization
        showError={true}
        hasToken={
          context?.features?.includes("BILL-SEARCH")
        }
      >
        <>
          <SearchPumpForm
            title="Search Billing"
            formName={ConstVariable.BILL}
            setSearchResult={setSearchResult}
            setLoader={setLoader}
            searchResult={searchResult}
            setPageCount={setPageCount}
            perPage={perPage}
            offset={offset}
            searchPumpObs$={searchBillingObs$}
            setAjaxParams={setAjaxParams}
            ajaxParams={ajaxParams}
            isLoading={isLoading}
            isReceivingSearch={false}
            onSearch={onSearch}
            organizationGroup={organizationGroup}
            setOrganizationGroup={setOrganizationGroup}
            errorMessage={errorMessage}
            setError={setError}
            ajaxSearchParams={ajaxSearchParams}
          />
          {searchResult !== ConstVariable.INIT &&
            searchResult?.searchData?.length > 0 && (
              <SearchResultTableForBilling
                editForm={editForm}
                context={context}
                searchResult={searchResult}
                setSearchResult={setSearchResult}
                isLoading={isLoading}
                offset={offset}
                perPage={perPage}
                pageCount={pageCount}
                ajaxParams={ajaxParams}
                searchPumpObs$={searchBillingObs$}
                ajaxSearchParams={ajaxSearchParams}
                handlePageClick={handlePageClick}
                searchBillingObs$={searchBillingObs$}
                isCheckAll={isCheckAll}
                setIsCheckAll={setIsCheckAll}
              />
            )}
          {searchResult?.searchData?.length === 0 && (
            <div className="text-center">No Data Found</div>
          )}
        </>
      </AMPAuthorization>
    </div>
  );
};

export default BillingForm;
