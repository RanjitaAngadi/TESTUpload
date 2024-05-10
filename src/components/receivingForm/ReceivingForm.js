import React, { useState, useContext, useEffect, memo, useMemo } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { withRouter, useLocation } from "react-router-dom";
import { useAccessState } from "../../utils/AppContext/loginContext";
import AMPAuthorization from "../common/AMPAuthorization/AMPAuthorization";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import { DeleteModal } from "../common/DeleteModal";
import { toast } from "react-toastify";
import ReactGA from 'react-ga';
import {
  DEFAULT_BASE_URL,
  VERSION,
  SEARCH_RECEIVING,
  DELETE_RECEIVING_WORKORDER,
  ConstVariable,
} from "../common/const";
import { ampJsonAjax } from "../common/utils/ampAjax";
import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";
import { AMPToastConsts } from "../common/const/AMPToastConst";
import SearchResultTableForReceivingAndWO from "../SearchForm/searchResultTableForReceivingAndWO";
import SearchPumpForm from "../SearchForm/searchPumpForm";
import { AMPMessage } from "../common/const/AMPMessage";

//On create New Questionnaire
const searchReceivingObsFormAjax$ = (URL, { errorHandler }) =>
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
const ReceivingForm = () => {
  const { handleSubmit, reset, watch, control, register, setValue } = useForm(
    {}
  );
  // removing the ajaxWorkOrderSearch session to avoid redundancy with ajaxReceivingSearch
  useEffect(() => {
    window.sessionStorage.removeItem("ajaxWorkOrderSearch");
    window.sessionStorage.removeItem("ajaxInventorySearch");
    window.sessionStorage.removeItem("ajaxPickUpSearch");
    window.sessionStorage.removeItem("ajaxBillingSearch");
  }, []);
  // For google analytics purpose
useEffect(()=>{
  ReactGA.pageview(window.location.pathname + window.location.search);
},[])
  const locationRef = useLocation();
  const params = new window.URLSearchParams(window.location.search);

  const [ajaxSearchParams, setAjaxSearchParams] = useState();

  const [searchResult, setSearchResult] = useState("initial");
  const [ajaxParams, setAjaxParams] = useState();
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState();

  // pagination related constants
  const [offset, setOffset] = useState(1);
  const [perPage] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setLoader] = useState();
  const editForm = () => { };
  const addNewFields = () => { };

  const context = useAccessState();

  const handlePageClick = (e) => {
    const selectedPage = e.selected;
    setOffset(selectedPage + 1);
  };

  //Deleteing Receiving
  const onDeleteReceivingOrWorkOrder = (id) => {
    setShowDeleteModal(id);
  };
  const onConfirmDelete = (id) => {
    deleteReceivingForm$.next({ id: id });
  };
  const closeDeleteModal = () => {
    setShowDeleteModal("");
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
  useObservableCallback(deleteReceivingForm$, (response) => {
    searchReceivingObs$.next({
      index: offset,
      pageSize: perPage,
      ajaxParams: ajaxParams,
      ajaxSearchParams: ajaxSearchParams,
    });
    setShowDeleteModal("");
    toast.success(AMPToastConsts.DELETE_RECEIVING_SUCCESS, {
      position: toast.POSITION.TOP_CENTER,
    });
  });
  const searchReceivingObs$ = useMemo(() => {
    return searchReceivingObsFormAjax$(
      DEFAULT_BASE_URL + VERSION + SEARCH_RECEIVING,
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
  useObservableCallback(searchReceivingObs$, (response) => {
    setAjaxSearchParams(response?.params?.ajaxSearchParams);
    // session creation
    window.sessionStorage.setItem(
      "ajaxReceivingSearch",
      JSON.stringify({
        ...response?.params?.ajaxSearchParams,
        index: 1,
      })
    );

    setSearchResult({
      ...response?.content,
      isApplied:false,
      sortType:''
    });
    setPageCount(Math.ceil(response?.content?.totalcount / perPage));
    setLoader(false);
  });

  const [organizationGroup, setOrganizationGroup] = useState({});
  const [errorMessage, setError] = useState("");
  const onSearch = (formData) => {
    console.log("formData",formData);
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
      searchReceivingObs$.next({
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
      window.sessionStorage.getItem("ajaxReceivingSearch")
    );
    if (searchItems) {
      onSearch(searchItems);
    }
  }, []);
  return (
    <>
      <AMPAuthorization
        showError={true}
        hasToken={context?.features?.includes("RE-SEACHVIEW")}
      >
        <SearchPumpForm
          title="Search Receiving Data"
          formName={ConstVariable.REC}
          setLoader={setLoader}
          searchResult={searchResult}
          perPage={perPage}
          offset={offset}
          searchPumpObs$={searchReceivingObs$}
          ajaxParams={ajaxParams}
          isLoading={isLoading}
          isReceivingSearch={true}
          onSearch={onSearch}
          organizationGroup={organizationGroup}
          setOrganizationGroup={setOrganizationGroup}
          errorMessage={errorMessage}
          ajaxSearchParams={ajaxSearchParams}
        />

        <SearchResultTableForReceivingAndWO
          formName={ConstVariable.REC}
          editForm={editForm}
          addNewFields={addNewFields}
          context={context}
          searchResult={searchResult}          
          setSearchResult={setSearchResult}
          isLoading={isLoading}
          offset={offset}
          perPage={perPage}
          pageCount={pageCount}
          handlePageClick={handlePageClick}
          showUpdateForm={showUpdateForm}
          onDeleteReceivingOrWorkOrder={onDeleteReceivingOrWorkOrder}
        />
      </AMPAuthorization>

      {showDeleteModal && (
        <DeleteModal
          modalName=""
          confirmationMessage={AMPMessage.DEL_RECEIVE_CONFIRM}
          closeModal={closeDeleteModal}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          onConfirmDelete={onConfirmDelete}
        />
      )}
    </>
  );
};

export default ReceivingForm;
