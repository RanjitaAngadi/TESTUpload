import React, { useState, useEffect, useMemo } from "react";
import ReactGA from 'react-ga';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useAccessState } from "../../utils/AppContext/loginContext";
import AMPAuthorization from "../common/AMPAuthorization/AMPAuthorization";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import {
  DEFAULT_BASE_URL,
  VERSION,
  SEARCH_WORKORDER,
  DELETE_RECEIVING_WORKORDER,
  ConstVariable,
} from "../common/const";
import { ampJsonAjax } from "../common/utils/ampAjax";
import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";
import { AMPToastConsts } from "../common/const/AMPToastConst";
import { RejectWorkOrderModal } from "./RejectWorkOrderModal";
import SearchPumpForm from "../SearchForm/searchPumpForm";
import SearchResultTableForReceivingAndWO from "../SearchForm/searchResultTableForReceivingAndWO";
import { UndoRejectWorkOrderModal } from "./undoRejectWorkOrderModal";
import { AMPInspectionEnum } from "../common/const/AMPEnum";

//On create New Questionnaire
const searchWorkOrderObsFormAjax$ = (URL, { errorHandler }) =>
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
// Delete Receiving Form
const deleteReceivingFormAjax$ = (URL) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.delete(URL + params.id).pipe(
        map((xhrResponse) => {
          return xhrResponse;
        }),
        catchError((error) => {
          console.error("Error in Deleting Receiving Form", error);
          errorHandler(error.response);
          return [];
        })
      )
    )
  ); // ENd of line
const WorkOrderByLocation = () => {
  const locationRef = useLocation();
  const params = new window.URLSearchParams(window.location.search);
  // For google analytics purpose
  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, [])
  // removing the ajaxReceivingSearch session to avoid redundancy with ajaxWorkOrderSearch
  useEffect(() => {
    window.sessionStorage.removeItem("ajaxReceivingSearch");
    window.sessionStorage.removeItem("ajaxInventorySearch");
    window.sessionStorage.removeItem("ajaxPickUpSearch");
    window.sessionStorage.removeItem("ajaxBillingSearch");
  }, []);

  const [ajaxSearchParams, setAjaxSearchParams] = useState();

  const [ajaxParams, setAjaxParams] = useState();

  const [searchResult, setSearchResult] = useState(ConstVariable?.INIT);

  // pagination related constants
  const [offset, setOffset] = useState(1);
  const [perPage] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setLoader] = useState();
  const [isCheckAll, setIsCheckAll] = useState(false);
  const editForm = () => { };
  const addNewFields = () => { };
  const context = useAccessState();

  const handlePageClick = (e) => {
    const selectedPage = e.selected;
    setOffset(selectedPage + 1);
    setIsCheckAll(false)
  };

  const [showRejectWorkOrderModal, setShowRejectWorkOrderModal] = useState({
    id: "",
    workorderNumber: "",
  });
  const [showUndoRejectWorkOrderModal, setShowUndoRejectWorkOrderModal] = useState({
    id: "",
    workorderNumber: "",
  });
  const openRejectModal = (id, workorderNumber) => {
    setShowRejectWorkOrderModal({
      id: id,
      workorderNumber: workorderNumber,
    });
  };
  const closeRejectModal = () => {
    setShowRejectWorkOrderModal({
      id: "",
      workorderNumber: "",
    });
  };

  const onOpenUndoRejectModal = (id, workorderNumber) => {
    setShowUndoRejectWorkOrderModal({
      id: id,
      workorderNumber: workorderNumber,
    });
  };
  const closeUndoRejectModal = () => {
    setShowUndoRejectWorkOrderModal({
      id: "",
      workorderNumber: "",
    });
  };
  const deleteReceivingForm$ = useMemo(() => {
    return deleteReceivingFormAjax$(
      DEFAULT_BASE_URL + VERSION + DELETE_RECEIVING_WORKORDER,
      {
        errorHandler: (error) => {
          toast.error(AMPToastConsts.DELETE_RECEIVING_ERROR, {
            // Set to 15sec
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  });

  const searchWorkOrderObs$ = useMemo(() => {
    return searchWorkOrderObsFormAjax$(
      DEFAULT_BASE_URL + VERSION + SEARCH_WORKORDER,
      {
        errorHandler: (error) => {
          toast.error(AMPToastConsts.RECEIVING_SEARCH_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  /* Observer for save response from ajax request */
  useObservableCallback(searchWorkOrderObs$, (response) => {
    setAjaxSearchParams(response?.params?.ajaxSearchParams);
    window.sessionStorage.setItem(
      "ajaxWorkOrderSearch",
      JSON.stringify({
        ...response?.params?.ajaxSearchParams,
        index: 1,
        // index: response?.params?.index,
      })
    );

    // setSearchResult(response?.content); 
    setSearchResult({
      ...response?.content,
      searchData: response?.content?.searchData?.map((itm, idx) => {
        const nextInspection = AMPInspectionEnum.find((insp)=> {
          return insp?.id === parseInt(itm?.inspectionTypeId) 
        })
        return { ...itm, isOpen: false, nextInspection };
      }),
      isApplied: false,
      sortType: ''
    });
    setPageCount(Math.ceil(response?.content?.totalcount / perPage));
    setLoader(false);
  });

  const [organizationGroup, setOrganizationGroup] = useState({});
  const [errorMessage, setError] = useState("");
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
        serialNumber: formData?.manufacturerSerialNumber,
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
        manufacturerSerialNumber: formData?.manufacturerSerialNumber,
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
      searchWorkOrderObs$.next({
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
    searchItems = JSON.parse(
      window.sessionStorage.getItem("ajaxWorkOrderSearch")
    );
    if (searchItems) {
      onSearch(searchItems);
    }
  }, []);

  return (
    <div className="mb-5">
      <AMPAuthorization
        hasToken={context?.features?.includes("WO-SEARCHVIEW")}
        showError={true}
      >
        <SearchPumpForm
          title="Search Work Order"
          formName={ConstVariable.WO}
          setLoader={setLoader}
          searchResult={searchResult}
          perPage={perPage}
          offset={offset}
          searchPumpObs$={searchWorkOrderObs$}
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
            <SearchResultTableForReceivingAndWO
              editForm={editForm}
              addNewFields={addNewFields}
              context={context}
              searchResult={searchResult}
              setSearchResult={setSearchResult}
              isLoading={isLoading}
              pageCount={pageCount}
              handlePageClick={handlePageClick}
              onDeleteReceivingOrWorkOrder={openRejectModal}
              onOpenUndoRejectModal={onOpenUndoRejectModal}
              setIsCheckAll={setIsCheckAll}
              isCheckAll={isCheckAll}
              offset={offset}
              perPage={perPage}
              ajaxParams={ajaxParams}
              ajaxSearchParams={ajaxSearchParams}
              searchPumpObs$={searchWorkOrderObs$}
            />
          )}
        {searchResult?.searchData?.length === 0 && (
          <div className="text-center">No Data Found</div>
        )}
      </AMPAuthorization>

      {showRejectWorkOrderModal?.id && (
        <RejectWorkOrderModal
          offset={offset}
          pageCount={pageCount}
          perPage={perPage}
          ajaxParams={ajaxParams}
          ajaxSearchParams={ajaxSearchParams}
          searchPumpObs$={searchWorkOrderObs$}
          showRejectWorkOrderModal={showRejectWorkOrderModal}
          closeRejectModal={closeRejectModal}
        />
      )}
      {showUndoRejectWorkOrderModal?.id && (
        <UndoRejectWorkOrderModal
          offset={offset}
          pageCount={pageCount}
          perPage={perPage}
          ajaxParams={ajaxParams}
          ajaxSearchParams={ajaxSearchParams}
          searchPumpObs$={searchWorkOrderObs$}
          showUndoRejectWorkOrderModal={showUndoRejectWorkOrderModal}
          closeUndoRejectModal={closeUndoRejectModal}
        />
      )}
    </div>
  );
};

export default WorkOrderByLocation;
