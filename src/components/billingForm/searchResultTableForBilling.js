import React, { useState, useEffect, useMemo } from "react";
import { Row, Col, Container, Table } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import AMPTooltip from "../common/AMPTooltip";
import { AMPAccordion } from "../common/AMPAccordion";
import AMPLoader from "../common/AMPLoader";
import ReactPaginate from "react-paginate";
import { ConstVariable } from "../common/const";
import { AMPToastConsts } from "../common/const/AMPToastConst";
import { ChangeWOrkOrderPOStatusModal } from "./changeWOrkOrderPOStatusModal";
import { toast } from "react-toastify";
import CapturePONumberModal from "./capturePONumber";

import {
  DEFAULT_BASE_URL,
  VERSION,
  GET_BILLING_DOCUMENT,
  POST_BILLING_DOCUMENT,
  DOWNLOAD_BILLING_DOCUMENT,
  DELETE_BILLING_DOCUMENT
} from "../common/const";

import { RecievingDocumentsForm } from "../receivingForm/RecievingDocumentsModal";

import { ampJsonAjax, ampOctetStreamAjax } from "../common/utils/ampAjax";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";
import {
  AccessProvider,
  useAccessDispatch,
  useAccessState,
} from "../../utils/AppContext/loginContext";


// const getDocumentListAjaxObs$ = () =>
//   new Subject().pipe(
//     mergeMap((params) =>
//       ampJsonAjax
//         .get(
//           DEFAULT_BASE_URL + VERSION + GET_BILLING_DOCUMENT + params
//         )
//         .pipe(
//           map((xhrResponse) => {
//             return { ...xhrResponse?.response };
//           }),
//           catchError((error) => {
//             return throwError(error);
//           })
//         )
//     )
//   );

const getDocumentListAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax
        .post(
          DEFAULT_BASE_URL +
          VERSION +
          GET_BILLING_DOCUMENT,
          params
        )
        .pipe(
          map((xhrResponse) => {
            return xhrResponse.response;
          }),
          catchError((error) => {
            return throwError(error);
          })
        )
    )
  );

const deleteDocumentAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.delete(URL + params.id).pipe(
        map((xhrResponse) => {
          return { ...xhrResponse?.response, params };
        }),
        catchError((error) => {
          console.error("Error in delete Picture", error);
          errorHandler(error.response);
          return [];
        })
      )
    )
  );

const getDocumentDownloadAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((params) =>
      ampOctetStreamAjax
        .get(DEFAULT_BASE_URL + VERSION + DOWNLOAD_BILLING_DOCUMENT + params.id)
        .pipe(
          map((xhrResponse) => {
            return { ...xhrResponse, params };
          }),
          catchError((error) => {
            console.log("Error:", error)
            return throwError(error);
          })
        )
    )
  );

const SearchResultTableForBilling = (props) => {
  const {
    context,
    searchResult,
    setSearchResult,
    isLoading,
    pageCount,
    handlePageClick,
    editForm,
    isCheckAll,
    setIsCheckAll,
    perPage,
    ajaxParams,
    ajaxSearchParams,
    offset,
    searchPumpObs$
  } = props;
  const history = useHistory();
  const [showErrorMessage, setShowErrorMessage] = useState("")
  const [isCheck, setIsCheck] = useState([]);
  const [checkedData, setCheckedData] = useState([]);
  const [showChangeWOrkOrderPOStatusModal, setShowChangeWOrkOrderPOStatusModal] = useState(false);

  const [loader, setLoader] = useState(false)
  const [isCapturePoNumberModalOpen, setIsCapturePoNumberModalOpen] = useState('')
  const openCapturePoNumberModal = (item) => { setIsCapturePoNumberModalOpen(item) }
  const closeCapturePoNumberModal = () => { setIsCapturePoNumberModalOpen('') }

  // for billing document modal
  const [state, setState] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState("")
  const [documentList, setDocumentList] = useState([]);
  const openDocumentModal = (id) => {
    setShowDocumentModal(id);
  };
  const closeDocumentModal = () => {
    setShowDocumentModal("")
    setDocumentList([])
  };

  const [showDeleteModal, setShowDeleteModal] = useState();

  const handleSelectAll = (e, itm) => {
    const { id, checked } = e.target;
    setIsCheckAll(!isCheckAll);
    setCheckedData(searchResult?.searchData)
    setIsCheck(
      searchResult?.searchData?.map((li) => {
        return li.id;
      })
    );
    if (isCheckAll) {
      setIsCheck([]);
      setCheckedData([])
    }
  };

  const openWOrkOrderPOStatusModel = () => {

    let errorMessage = [];
    if (checkedData?.length > 0) {
      checkedData.map(elem => {
        if (elem.isPOApproved !== checkedData[0].isPOApproved) {
          errorMessage.push(true);
        }
        else {
          errorMessage.push(false);
        }
        return errorMessage;
      })
      //return errorMessage;
      if (!errorMessage?.includes(true)) {
        setShowErrorMessage("");
        setShowChangeWOrkOrderPOStatusModal(true)
      }
      else {
        toast.error(AMPToastConsts.SELECT_WO_FOR_POSTATUS, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    }
    else {
      toast.info(AMPToastConsts.SELECT_ATLEAST_ONE_WORKORDER_MANDATORY, {
        position: toast.POSITION.TOP_CENTER,
      });
    }


  }
  const closeWOrkOrderPOStatusModel = () => {
    setShowChangeWOrkOrderPOStatusModal(false)
  };
  const handleClick = (e, itm) => {
    const { id, checked } = e.target;
    setIsCheck([...isCheck, id]);
    if (!checked) {
      setIsCheck(isCheck.filter((item) => item !== id));
      setCheckedData(checkedData.filter((item) => item.id !== id))
    }
    if (checked) {
      setCheckedData([...checkedData, itm])
    }
  };

  const ajaxDocumentListObsv$ = useMemo(() => {
    return getDocumentListAjaxObs$();
  }, []);

  useObservableCallback(
    ajaxDocumentListObsv$,
    (response) => {
      setLoader(false);
      setDocumentList(response);
    },
    []
  );

  const ajaxDocumentDownloadObsv$ = useMemo(() => {
    return getDocumentDownloadAjaxObs$();
  }, []);

  useObservableCallback(
    ajaxDocumentDownloadObsv$,
    (response) => {
      downloadFile(response?.response, `${response?.params?.name}.pdf`);
      setLoader(false);
      toast.success(AMPToastConsts.DOCUMENT_DOWNLOAD_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
    },
    []
  );
  const downloadFile = (contentData, fileName) => {
    let blob = new Blob([contentData], { type: contentData.type });
    if (typeof window.navigator.msSaveBlob !== "undefined") {
      //IE workaround
      window.navigator.msSaveBlob(blob, fileName);
    } else {
      let url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }
  };

  // delete document
  const deleteDocument$ = useMemo(() => {
    return deleteDocumentAjax$(
      DEFAULT_BASE_URL + VERSION + DELETE_BILLING_DOCUMENT,
      {
        errorHandler: (error) => {
          toast.error(AMPToastConsts.DOCUMENT_DELETE_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  });
  useObservableCallback(deleteDocument$, (response) => {
    if (response?.status) {
      setShowDeleteModal("");
      ajaxDocumentListObsv$.next([response?.params?.wOrderId]);
      setLoader(true);
      toast.success(AMPToastConsts.DOCUMENT_DELETE_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      toast.error(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });

  const applySorting = (type) => {
    switch (type) {
      case ConstVariable?.WON_ASCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          let x = a.workorderNumber.toLowerCase()
          let y = b.workorderNumber.toLowerCase()
          if (x < y) return -1
          if (x > y) return 1
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.WON_ASCENDING
        })
        break;
      }
      case ConstVariable?.WON_DESCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          let x = a.workorderNumber.toLowerCase()
          let y = b.workorderNumber.toLowerCase()
          if (x < y) return 1
          if (x > y) return -1
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.WON_DESCENDING
        })
        break;
      }
      case ConstVariable?.SERVICE_CENTER_ASCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          let x = a.serviceCenter.toLowerCase()
          let y = b.serviceCenter.toLowerCase()
          if (x < y) return -1
          if (x > y) return 1
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.SERVICE_CENTER_ASCENDING
        })
        break;
      }
      case ConstVariable?.SERVICE_CENTER_DESCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          let x = a.serviceCenter.toLowerCase()
          let y = b.serviceCenter.toLowerCase()
          if (x < y) return 1
          if (x > y) return -1
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.SERVICE_CENTER_DESCENDING
        })
        break;
      }
      case ConstVariable?.CUSTOMER_ASCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          let x = a.customer.toLowerCase()
          let y = b.customer.toLowerCase()
          if (x < y) return -1
          if (x > y) return 1
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.CUSTOMER_ASCENDING
        })
        break;
      }
      case ConstVariable?.CUSTOMER_DESCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          let x = a.customer.toLowerCase()
          let y = b.customer.toLowerCase()
          if (x < y) return 1
          if (x > y) return -1
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.CUSTOMER_DESCENDING
        })
        break;
      }
      case ConstVariable?.ASSET_ASCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => a?.numberOfAssets - b?.numberOfAssets)
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.ASSET_ASCENDING
        })
        break;
      }
      case ConstVariable?.ASSET_DESCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => b?.numberOfAssets - a?.numberOfAssets)
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.ASSET_DESCENDING
        })
        break;
      }
      case ConstVariable?.PERCENTAGE_ASCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => a?.completionPercentage - b?.completionPercentage)
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.PERCENTAGE_ASCENDING
        })
        break;
      }
      case ConstVariable?.PERCENTAGE_DESCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => b?.completionPercentage - a?.completionPercentage)
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.PERCENTAGE_DESCENDING
        })
        break;
      }
      case ConstVariable?.STATUS_ASCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          let x = a.status.toLowerCase()
          let y = b.status.toLowerCase()
          if (x < y) return -1
          if (x > y) return 1
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.STATUS_ASCENDING
        })
        break;
      }
      case ConstVariable?.STATUS_DESCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          let x = a.status.toLowerCase()
          let y = b.status.toLowerCase()
          if (x < y) return 1
          if (x > y) return -1
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.STATUS_DESCENDING
        })
        break;
      }
      case ConstVariable?.CREATEDON_ASCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          return new Date(a.createdDate) - new Date(b.createdDate)
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.CREATEDON_ASCENDING
        })
        break;
      }
      case ConstVariable?.CREATEDON_DESCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          return new Date(b.createdDate) - new Date(a.createdDate)
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.CREATEDON_DESCENDING
        })
        break;
      }
      case ConstVariable?.CREATEDBY_ASCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          let x = a.createdBy.toLowerCase()
          let y = b.createdBy.toLowerCase()
          if (x < y) return -1
          if (x > y) return 1
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.CREATEDBY_ASCENDING
        })
        break;
      }
      case ConstVariable?.CREATEDBY_DESCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          let x = a.createdBy.toLowerCase()
          let y = b.createdBy.toLowerCase()
          if (x < y) return 1
          if (x > y) return -1
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.CREATEDBY_DESCENDING
        })
        break;
      }
      case ConstVariable?.PONUMBER_ASCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          let x = a.poNumber
          let y = b.poNumber
          return (x === null) - (y === null) || +(x?.toLowerCase() > y?.toLowerCase()) || -(x?.toLowerCase() < y?.toLowerCase())
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.PONUMBER_ASCENDING
        })
        break;
      }
      case ConstVariable?.PONUMBER_DESCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          let x = a.poNumber
          let y = b.poNumber
          return (x === null) - (y === null) || -(x?.toLowerCase() > y?.toLowerCase()) || +(x?.toLowerCase() < y?.toLowerCase())
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.PONUMBER_DESCENDING
        })
        break;
      }
      case ConstVariable?.POSTATUS_ASCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          let x = a.isPOApproved.toString()
          let y = b.isPOApproved.toString()
          if (x < y) return -1
          if (x > y) return 1
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.POSTATUS_ASCENDING
        })
        break;
      }
      case ConstVariable?.POSTATUS_DESCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          let x = a.isPOApproved.toString()
          let y = b.isPOApproved.toString()
          if (x < y) return 1
          if (x > y) return -1
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.POSTATUS_DESCENDING
        })
        break;
      }
      default: return 0
    }
  }


  return (
    <div id="results" className="form-container p-0">
      <AMPLoader isLoading={isLoading} />
      {searchResult !== "initial" && searchResult?.searchData?.length > 0 && (
        <AMPAccordion title="Search Result" showDropdownIcon={true && context?.features?.includes("BILL-CHG-PO-STATUS")} dropdownOptions="Change PO Status" openSelectOption={openWOrkOrderPOStatusModel} contentClassName="p-0">
          <Container fluid>
            <div id="results" className="form-container mx-0 bg-form py-2 mb-4">
              <Table striped bordered hover responsive size="sm" className="ws-nowrap">
                <thead className="text-center fn-12">
                  <tr>
                    <th>
                      <Checkbox
                        type="checkbox"
                        name="selectAll"
                        id="selectAll"
                        handleClick={handleSelectAll}
                        isChecked={isCheckAll}
                      />
                    </th>

                    <th>Work Order #
                      {searchResult?.sortType === ConstVariable?.WON_ASCENDING ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-sort-alpha-up"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: '5px',
                            color: (searchResult?.isApplied
                              && searchResult?.sortType === ConstVariable?.WON_ASCENDING) ? 'blue' : '',
                            cursor: 'pointer'
                          }}
                          // onClick={sortByWorkOrderNumberDesc}
                          onClick={() => applySorting(ConstVariable?.WON_DESCENDING)}
                        >
                          <path fill-rule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
                          <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zm-8.46-.5a.5.5 0 0 1-1 0V3.707L2.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.498.498 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L4.5 3.707V13.5z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16" height="16"
                          fill="currentColor"
                          className="bi bi-sort-alpha-down"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: '5px',
                            color: (searchResult?.isApplied
                              && searchResult?.sortType === ConstVariable?.WON_DESCENDING) ? 'blue' : '',
                            cursor: 'pointer'
                          }}
                          // onClick={sortByWorkOrderNumberAsc}
                          onClick={() => applySorting(ConstVariable?.WON_ASCENDING)}
                        >
                          <path fillRule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
                          <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
                        </svg>
                      )}
                    </th>
                    <th>Service Center
                      {searchResult?.sortType === ConstVariable?.SERVICE_CENTER_ASCENDING ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-sort-alpha-up"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: '5px',
                            color: (searchResult?.isApplied
                              && searchResult?.sortType === ConstVariable?.SERVICE_CENTER_ASCENDING) ? 'blue' : '',
                            cursor: 'pointer'
                          }}
                          // onClick={sortByWorkOrderNumberDesc}
                          onClick={() => applySorting(ConstVariable?.SERVICE_CENTER_DESCENDING)}
                        >
                          <path fill-rule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
                          <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zm-8.46-.5a.5.5 0 0 1-1 0V3.707L2.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.498.498 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L4.5 3.707V13.5z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16" height="16"
                          fill="currentColor"
                          className="bi bi-sort-alpha-down"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: '5px',
                            color: (searchResult?.isApplied
                              && searchResult?.sortType === ConstVariable?.SERVICE_CENTER_DESCENDING) ? 'blue' : '',
                            cursor: 'pointer'
                          }}
                          // onClick={sortByWorkOrderNumberAsc}
                          onClick={() => applySorting(ConstVariable?.SERVICE_CENTER_ASCENDING)}
                        >
                          <path fillRule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
                          <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
                        </svg>
                      )}
                    </th>
                    <th>Customer
                      {searchResult?.sortType === ConstVariable?.CUSTOMER_ASCENDING ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-sort-alpha-up"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: '5px',
                            color: (searchResult?.isApplied
                              && searchResult?.sortType === ConstVariable?.CUSTOMER_ASCENDING) ? 'blue' : '',
                            cursor: 'pointer'
                          }}
                          // onClick={sortByWorkOrderNumberDesc}
                          onClick={() => applySorting(ConstVariable?.CUSTOMER_DESCENDING)}
                        >
                          <path fill-rule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
                          <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zm-8.46-.5a.5.5 0 0 1-1 0V3.707L2.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.498.498 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L4.5 3.707V13.5z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16" height="16"
                          fill="currentColor"
                          className="bi bi-sort-alpha-down"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: '5px',
                            color: (searchResult?.isApplied
                              && searchResult?.sortType === ConstVariable?.CUSTOMER_DESCENDING) ? 'blue' : '',
                            cursor: 'pointer'
                          }}
                          // onClick={sortByWorkOrderNumberAsc}
                          onClick={() => applySorting(ConstVariable?.CUSTOMER_ASCENDING)}
                        >
                          <path fillRule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
                          <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
                        </svg>
                      )}
                    </th>
                    {/* <th>Assets
                      {searchResult?.sortType === ConstVariable?.ASSET_ASCENDING ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-sort-numeric-up"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: '5px',
                            color: (searchResult?.isApplied
                              && searchResult?.sortType === ConstVariable?.ASSET_ASCENDING) ? 'blue' : '',
                            cursor: 'pointer'
                          }}
                          // onClick={sortByPercentageDesc}
                          onClick={() => applySorting(ConstVariable?.ASSET_DESCENDING)}
                        >
                          <path d="M12.438 1.668V7H11.39V2.684h-.051l-1.211.859v-.969l1.262-.906h1.046z" />
                          <path fill-rule="evenodd" d="M11.36 14.098c-1.137 0-1.708-.657-1.762-1.278h1.004c.058.223.343.45.773.45.824 0 1.164-.829 1.133-1.856h-.059c-.148.39-.57.742-1.261.742-.91 0-1.72-.613-1.72-1.758 0-1.148.848-1.835 1.973-1.835 1.09 0 2.063.636 2.063 2.687 0 1.867-.723 2.848-2.145 2.848zm.062-2.735c.504 0 .933-.336.933-.972 0-.633-.398-1.008-.94-1.008-.52 0-.927.375-.927 1 0 .64.418.98.934.98z" />
                          <path d="M4.5 13.5a.5.5 0 0 1-1 0V3.707L2.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.498.498 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L4.5 3.707V13.5z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-sort-numeric-down"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: '5px',
                            color: (searchResult?.isApplied
                              && searchResult?.sortType === ConstVariable?.ASSET_DESCENDING) ? 'blue' : '',
                            cursor: 'pointer'
                          }}
                          // onClick={sortByPercentageAsc}
                          onClick={() => applySorting(ConstVariable?.ASSET_ASCENDING)}
                        >
                          <path d="M12.438 1.668V7H11.39V2.684h-.051l-1.211.859v-.969l1.262-.906h1.046z" />
                          <path fillRule="evenodd" d="M11.36 14.098c-1.137 0-1.708-.657-1.762-1.278h1.004c.058.223.343.45.773.45.824 0 1.164-.829 1.133-1.856h-.059c-.148.39-.57.742-1.261.742-.91 0-1.72-.613-1.72-1.758 0-1.148.848-1.835 1.973-1.835 1.09 0 2.063.636 2.063 2.687 0 1.867-.723 2.848-2.145 2.848zm.062-2.735c.504 0 .933-.336.933-.972 0-.633-.398-1.008-.94-1.008-.52 0-.927.375-.927 1 0 .64.418.98.934.98z" />
                          <path d="M4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
                        </svg>
                      )}
                    </th> */}
                    <th>% Completed
                      {searchResult?.sortType === ConstVariable?.PERCENTAGE_ASCENDING ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-sort-numeric-up"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: '5px',
                            color: (searchResult?.isApplied
                              && searchResult?.sortType === ConstVariable?.PERCENTAGE_ASCENDING) ? 'blue' : '',
                            cursor: 'pointer'
                          }}
                          // onClick={sortByPercentageDesc}
                          onClick={() => applySorting(ConstVariable?.PERCENTAGE_DESCENDING)}
                        >
                          <path d="M12.438 1.668V7H11.39V2.684h-.051l-1.211.859v-.969l1.262-.906h1.046z" />
                          <path fill-rule="evenodd" d="M11.36 14.098c-1.137 0-1.708-.657-1.762-1.278h1.004c.058.223.343.45.773.45.824 0 1.164-.829 1.133-1.856h-.059c-.148.39-.57.742-1.261.742-.91 0-1.72-.613-1.72-1.758 0-1.148.848-1.835 1.973-1.835 1.09 0 2.063.636 2.063 2.687 0 1.867-.723 2.848-2.145 2.848zm.062-2.735c.504 0 .933-.336.933-.972 0-.633-.398-1.008-.94-1.008-.52 0-.927.375-.927 1 0 .64.418.98.934.98z" />
                          <path d="M4.5 13.5a.5.5 0 0 1-1 0V3.707L2.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.498.498 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L4.5 3.707V13.5z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-sort-numeric-down"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: '5px',
                            color: (searchResult?.isApplied
                              && searchResult?.sortType === ConstVariable?.PERCENTAGE_DESCENDING) ? 'blue' : '',
                            cursor: 'pointer'
                          }}
                          // onClick={sortByPercentageAsc}
                          onClick={() => applySorting(ConstVariable?.PERCENTAGE_ASCENDING)}
                        >
                          <path d="M12.438 1.668V7H11.39V2.684h-.051l-1.211.859v-.969l1.262-.906h1.046z" />
                          <path fillRule="evenodd" d="M11.36 14.098c-1.137 0-1.708-.657-1.762-1.278h1.004c.058.223.343.45.773.45.824 0 1.164-.829 1.133-1.856h-.059c-.148.39-.57.742-1.261.742-.91 0-1.72-.613-1.72-1.758 0-1.148.848-1.835 1.973-1.835 1.09 0 2.063.636 2.063 2.687 0 1.867-.723 2.848-2.145 2.848zm.062-2.735c.504 0 .933-.336.933-.972 0-.633-.398-1.008-.94-1.008-.52 0-.927.375-.927 1 0 .64.418.98.934.98z" />
                          <path d="M4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
                        </svg>
                      )}
                    </th>
                    <th>Created On
                      {searchResult?.sortType === ConstVariable?.CREATEDON_ASCENDING ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-sort-numeric-up"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: '5px',
                            color: (searchResult?.isApplied
                              && searchResult?.sortType === ConstVariable?.CREATEDON_ASCENDING) ? 'blue' : '',
                            cursor: 'pointer'
                          }}
                          // onClick={sortByPercentageDesc}
                          onClick={() => applySorting(ConstVariable?.CREATEDON_DESCENDING)}
                        >
                          <path d="M12.438 1.668V7H11.39V2.684h-.051l-1.211.859v-.969l1.262-.906h1.046z" />
                          <path fill-rule="evenodd" d="M11.36 14.098c-1.137 0-1.708-.657-1.762-1.278h1.004c.058.223.343.45.773.45.824 0 1.164-.829 1.133-1.856h-.059c-.148.39-.57.742-1.261.742-.91 0-1.72-.613-1.72-1.758 0-1.148.848-1.835 1.973-1.835 1.09 0 2.063.636 2.063 2.687 0 1.867-.723 2.848-2.145 2.848zm.062-2.735c.504 0 .933-.336.933-.972 0-.633-.398-1.008-.94-1.008-.52 0-.927.375-.927 1 0 .64.418.98.934.98z" />
                          <path d="M4.5 13.5a.5.5 0 0 1-1 0V3.707L2.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.498.498 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L4.5 3.707V13.5z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-sort-numeric-down"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: '5px',
                            color: (searchResult?.isApplied
                              && searchResult?.sortType === ConstVariable?.CREATEDON_DESCENDING) ? 'blue' : '',
                            cursor: 'pointer'
                          }}
                          // onClick={sortByPercentageAsc}
                          onClick={() => applySorting(ConstVariable?.CREATEDON_ASCENDING)}
                        >
                          <path d="M12.438 1.668V7H11.39V2.684h-.051l-1.211.859v-.969l1.262-.906h1.046z" />
                          <path fillRule="evenodd" d="M11.36 14.098c-1.137 0-1.708-.657-1.762-1.278h1.004c.058.223.343.45.773.45.824 0 1.164-.829 1.133-1.856h-.059c-.148.39-.57.742-1.261.742-.91 0-1.72-.613-1.72-1.758 0-1.148.848-1.835 1.973-1.835 1.09 0 2.063.636 2.063 2.687 0 1.867-.723 2.848-2.145 2.848zm.062-2.735c.504 0 .933-.336.933-.972 0-.633-.398-1.008-.94-1.008-.52 0-.927.375-.927 1 0 .64.418.98.934.98z" />
                          <path d="M4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
                        </svg>
                      )}
                    </th>
                    <th>Created By
                      {searchResult?.sortType === ConstVariable?.CREATEDBY_ASCENDING ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-sort-alpha-up"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: '5px',
                            color: (searchResult?.isApplied
                              && searchResult?.sortType === ConstVariable?.CREATEDBY_ASCENDING) ? 'blue' : '',
                            cursor: 'pointer'
                          }}
                          // onClick={sortByWorkOrderNumberDesc}
                          onClick={() => applySorting(ConstVariable?.CREATEDBY_DESCENDING)}
                        >
                          <path fill-rule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
                          <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zm-8.46-.5a.5.5 0 0 1-1 0V3.707L2.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.498.498 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L4.5 3.707V13.5z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16" height="16"
                          fill="currentColor"
                          className="bi bi-sort-alpha-down"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: '5px',
                            color: (searchResult?.isApplied
                              && searchResult?.sortType === ConstVariable?.CREATEDBY_DESCENDING) ? 'blue' : '',
                            cursor: 'pointer'
                          }}
                          // onClick={sortByWorkOrderNumberAsc}
                          onClick={() => applySorting(ConstVariable?.CREATEDBY_ASCENDING)}
                        >
                          <path fillRule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
                          <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
                        </svg>
                      )}
                    </th>
                    <th>Status
                      {searchResult?.sortType === ConstVariable?.STATUS_ASCENDING ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-sort-alpha-up"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: '5px',
                            color: (searchResult?.isApplied
                              && searchResult?.sortType === ConstVariable?.STATUS_ASCENDING) ? 'blue' : '',
                            cursor: 'pointer'
                          }}
                          // onClick={sortByWorkOrderNumberDesc}
                          onClick={() => applySorting(ConstVariable?.STATUS_DESCENDING)}
                        >
                          <path fill-rule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
                          <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zm-8.46-.5a.5.5 0 0 1-1 0V3.707L2.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.498.498 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L4.5 3.707V13.5z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16" height="16"
                          fill="currentColor"
                          className="bi bi-sort-alpha-down"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: '5px',
                            color: (searchResult?.isApplied
                              && searchResult?.sortType === ConstVariable?.STATUS_DESCENDING) ? 'blue' : '',
                            cursor: 'pointer'
                          }}
                          // onClick={sortByWorkOrderNumberAsc}
                          onClick={() => applySorting(ConstVariable?.STATUS_ASCENDING)}
                        >
                          <path fillRule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
                          <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
                        </svg>
                      )}
                    </th>
                    <th>PO Number
                      {searchResult?.sortType === ConstVariable?.PONUMBER_ASCENDING ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-sort-alpha-up"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: '5px',
                            color: (searchResult?.isApplied
                              && searchResult?.sortType === ConstVariable?.PONUMBER_ASCENDING) ? 'blue' : '',
                            cursor: 'pointer'
                          }}
                          // onClick={sortByWorkOrderNumberDesc}
                          onClick={() => applySorting(ConstVariable?.PONUMBER_DESCENDING)}
                        >
                          <path fill-rule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
                          <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zm-8.46-.5a.5.5 0 0 1-1 0V3.707L2.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.498.498 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L4.5 3.707V13.5z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16" height="16"
                          fill="currentColor"
                          className="bi bi-sort-alpha-down"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: '5px',
                            color: (searchResult?.isApplied
                              && searchResult?.sortType === ConstVariable?.PONUMBER_DESCENDING) ? 'blue' : '',
                            cursor: 'pointer'
                          }}
                          // onClick={sortByWorkOrderNumberAsc}
                          onClick={() => applySorting(ConstVariable?.PONUMBER_ASCENDING)}
                        >
                          <path fillRule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
                          <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
                        </svg>
                      )}
                    </th>
                    <th>PO Status
                      {searchResult?.sortType === ConstVariable?.POSTATUS_ASCENDING ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-sort-alpha-up"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: '5px',
                            color: (searchResult?.isApplied
                              && searchResult?.sortType === ConstVariable?.POSTATUS_ASCENDING) ? 'blue' : '',
                            cursor: 'pointer'
                          }}
                          // onClick={sortByWorkOrderNumberDesc}
                          onClick={() => applySorting(ConstVariable?.POSTATUS_DESCENDING)}
                        >
                          <path fill-rule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
                          <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zm-8.46-.5a.5.5 0 0 1-1 0V3.707L2.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.498.498 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L4.5 3.707V13.5z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16" height="16"
                          fill="currentColor"
                          className="bi bi-sort-alpha-down"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: '5px',
                            color: (searchResult?.isApplied
                              && searchResult?.sortType === ConstVariable?.POSTATUS_DESCENDING) ? 'blue' : '',
                            cursor: 'pointer'
                          }}
                          // onClick={sortByWorkOrderNumberAsc}
                          onClick={() => applySorting(ConstVariable?.POSTATUS_ASCENDING)}
                        >
                          <path fillRule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
                          <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
                        </svg>
                      )}
                    </th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="fn-12">
                  {searchResult?.searchData?.map((itm, idx) => {
                    return (
                      <tr key={itm?.id}>
                        <td className="text-center">

                          <Checkbox
                            key={itm.id}
                            type="checkbox"
                            name={name}
                            id={itm.id}
                            handleClick={(e) => handleClick(e, itm)}
                            isChecked={isCheck.includes(itm.id)}
                          />
                        </td>

                        <td className="text-center">{itm?.workorderNumber}</td>
                        <td className="text-center">
                          {itm.serviceCenter}
                        </td>

                        <td className="text-center">{itm?.customer}</td>
                        {/* <td className="text-center">{itm?.numberOfAssets}</td> */}

                        <td className="text-center">{itm?.completionPercentage} %</td>
                        <td className="text-center">{itm?.createdDate}</td>
                        <td className="text-center">{itm?.createdBy}</td>
                        <td className="text-center">
                          {itm.status}
                        </td>
                        <td className="text-center">
                          {itm.poNumber}
                        </td>
                        <td className="text-center">
                          {itm.isPOApproved === true ? 'Received' : 'Not Received'}
                        </td>
                        <td>
                          <Row className="text-center mw-60 m-0 p-0">
                            <Col lg="6" md="6" sm="6" xs="6" className="m-0 p-0">
                              {itm?.billingId &&
                                <button
                                  aria-label="docs"
                                  name="docs"
                                  type="button"
                                  className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                                // onClick={() => openCapturePoNumberModal(itm)}
                                >
                                  <Link
                                    to={{
                                      pathname: "",
                                      state: {
                                        isCreate: false,
                                        id: itm?.id,
                                        status: itm?.status,
                                        isReceiving: false,
                                        isWorkorder: false,
                                        isBilling: true,
                                        workorderNumber: itm?.workorderNumber
                                        // inspectionWorkOrderNumber:
                                        //   inspectionWorkOrderNumber || null,
                                        // inspectionType: inspectionType || null,
                                        // linkedWorkorderNumber: inspectionWorkOrderNumber || stateData?.linkedWorkorderNumber || null
                                      },
                                    }}
                                    onClick={() => openDocumentModal(itm?.billingId)}
                                  >
                                    <AMPTooltip text="Docs">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="19"
                                        height="19"
                                        fill="currentColor"
                                        className="bi bi-file-earmark-text"
                                        viewBox="0 0 16 16">
                                        <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z" />
                                        <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
                                      </svg>
                                    </AMPTooltip>
                                  </Link>
                                </button>
                                }
                            </Col>
                            <Col lg="6" md="6" sm="6" xs="6" className="m-0 p-0">
                              <button
                                aria-label="Edit"
                                name="Edit"
                                type="button"
                                className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                                onClick={() => openCapturePoNumberModal(itm)}
                              >
                                <AMPTooltip text="Edit/View">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="19"
                                    height="19"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                    className="bi bi-pencil-square mr-2"
                                  >
                                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                    <path
                                      fill-rule="evenodd"
                                      d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                                    />
                                  </svg>
                                </AMPTooltip>
                              </button>
                            </Col>
                          </Row>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

              {searchResult?.totalcount > 0 && (
                <Row>
                  <Col className="p-0 px-sm-3">
                    <ReactPaginate
                      previousLabel={"prev"}
                      nextLabel={"next"}
                      breakLabel={"..."}
                      breakClassName={"break-me"}
                      pageCount={pageCount}
                      marginPagesDisplayed={2}
                      pageRangeDisplayed={3}
                      onPageChange={handlePageClick}
                      containerClassName={"pagination float-right"}
                      subContainerClassName={"pages pagination"}
                      activeClassName={"active"}
                    />
                  </Col>
                </Row>
              )}
            </div>
          </Container>
        </AMPAccordion>
      )}
      {searchResult?.searchData?.length === 0 && (
        <div className="text-center">No Data Found</div>
      )}
      {showChangeWOrkOrderPOStatusModal &&
        <ChangeWOrkOrderPOStatusModal isCheck={isCheck} closeWOrkOrderPOStatusModel={closeWOrkOrderPOStatusModel}
          modalName="Change the PO Status" checkedData={checkedData}
          setShowChangeWOrkOrderPOStatusModal={setShowChangeWOrkOrderPOStatusModal}
          offset={offset}
          perPage={perPage}
          ajaxParams={ajaxParams}
          ajaxSearchParams={ajaxSearchParams}
          searchPumpObs$={searchPumpObs$}
          setIsCheck={setIsCheck}
          setCheckedData={setCheckedData} />}
      {isCapturePoNumberModalOpen &&
        <CapturePONumberModal
          modalName="Billing Entry"
          isCapturePoNumberModalOpen={isCapturePoNumberModalOpen}
          closeCapturePoNumberModal={closeCapturePoNumberModal}
          offset={offset}
          perPage={perPage}
          ajaxParams={ajaxParams}
          ajaxSearchParams={ajaxSearchParams}
          searchPumpObs$={searchPumpObs$}
          setIsCheck={setIsCheck}
          setCheckedData={setCheckedData}
        />
      }

      {showDocumentModal && (
        <RecievingDocumentsForm
          modalName="Billing Documents"
          wOrderId={showDocumentModal}
          closeDocumentModal={closeDocumentModal}
          state={state}
          setState={setState}
          loader={loader}
          setLoader={setLoader}
          documentList={documentList}
          ajaxDocumentListObsv$={ajaxDocumentListObsv$}
          ajaxDocumentDownloadObsv$={ajaxDocumentDownloadObsv$}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          deleteDocument$={deleteDocument$}
        />
      )}
    </div>
  );
};
const Checkbox = ({ id, type, name, handleClick, isChecked }) => {
  return (
    <input
      id={id}
      name={name}
      type={type}
      onChange={handleClick}
      checked={isChecked}
    />
  );
};
export default SearchResultTableForBilling;
