import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Table,
  Container,
} from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";

import { Link } from "react-router-dom";
import AMPTooltip from "../common/AMPTooltip";
import { AMPAccordion } from "../common/AMPAccordion";
import AMPAuthorization from "../common/AMPAuthorization/AMPAuthorization";
import AMPLoader from "../common/AMPLoader";
import ReactPaginate from "react-paginate";
import { ConstVariable } from "../common/const";
import { TransferToWOrkOrderModal } from "../workOrders/transferToWOrkOrderModal";
import { AMPToastConsts } from "../common/const/AMPToastConst";
import { toast } from "react-toastify";
import { AMPInspectionEnum } from "../common/const/AMPEnum";

const SearchResultTableForReceivingAndWO = (props) => {
  const {
    context,
    searchResult,
    setSearchResult,
    isLoading,
    pageCount,
    handlePageClick,
    formName,
    onDeleteReceivingOrWorkOrder,
    editForm,
    isCheckAll,
    setIsCheckAll,
    offset,
    perPage,
    ajaxParams,
    ajaxSearchParams,
    searchPumpObs$,
    onOpenUndoRejectModal
  } = props;

  const [isCheck, setIsCheck] = useState([]);
  const [checkedData, setCheckedData] = useState([]);
  const [showErrorMessage, setShowErrorMessage] = useState("")
  const [showTransferToWorkOrderModal, setShowTransferToWorkOrderModal] = useState(false);
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
  const openWOrkOrderRegionModel = () => {

    let errorMessage = [];
    if (checkedData?.length > 0) {
      checkedData.map(elem => {
        if (elem.serviceCenterId !== checkedData[0].serviceCenterId) {
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
        setShowTransferToWorkOrderModal(true)
      }
      else {
        toast.error(AMPToastConsts.SELECT_SERVICE_CENTER_FOR_MOVE_WORKORDER, {
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
  const closeWOrkOrderRegionModel = () => {
    setShowTransferToWorkOrderModal(false)
  };
  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <a
      href=""
      ref={ref}
      onClick={e => {
        e.preventDefault();
        onClick(e);
      }}
    >
      {children}

    </a>
  ));
  const popperConfig = {
    strategy: "fixed"
  };

  // code to sort work order list
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


      case ConstVariable?.PART_TYPE_ASCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          let x = a.partType.toLowerCase()
          let y = b.partType.toLowerCase()
          if (x < y) return -1
          if (x > y) return 1
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.PART_TYPE_ASCENDING
        })
        break;
      }
      case ConstVariable?.PART_TYPE_DESCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          let x = a.partType.toLowerCase()
          let y = b.partType.toLowerCase()
          if (x < y) return 1
          if (x > y) return -1
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.PART_TYPE_DESCENDING
        })
        break;
      }


      case ConstVariable?.INSPECTION_ASCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          let x = a?.nextInspection?.value.toLowerCase()
          let y = b?.nextInspection?.value.toLowerCase()
          if (x < y) return -1
          if (x > y) return 1
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.INSPECTION_ASCENDING
        })
        break;
      }
      case ConstVariable?.INSPECTION_DESCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          let x = a?.nextInspection?.value?.toLowerCase()
          let y = b?.nextInspection?.value?.toLowerCase()
          if (x < y) return 1
          if (x > y) return -1
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.INSPECTION_DESCENDING
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
      case ConstVariable?.TYPE_ASCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          let x = a.workorderType.toLowerCase()
          let y = b.workorderType.toLowerCase()
          if (x < y) return -1
          if (x > y) return 1
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.TYPE_ASCENDING
        })
        break;
      }
      case ConstVariable?.TYPE_DESCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          let x = a.workorderType.toLowerCase()
          let y = b.workorderType.toLowerCase()
          if (x < y) return 1
          if (x > y) return -1
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.TYPE_DESCENDING
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
      default: return 0
    }
  }

  const handleView = (id) => {
    setSearchResult({
      ...searchResult,
      searchData: searchResult?.searchData?.map((itm, idx) => {
        return itm?.id === id ? { ...itm, isOpen: !itm?.isOpen } : itm;
      })
    })
  }

  return (
    <div id="results" className="form-container p-0 mb-5">
      <AMPLoader isLoading={isLoading} />

      {formName === ConstVariable.REC && (
        <AMPAuthorization hasToken={context?.features?.includes("RE-CREATE")}>
          <Col>
            <Row>
              <Col md={12} sm={12} xs={12} lg={12}>
                <div className="amp-action-btn-controls">
                  <Link
                    to={{
                      pathname: "/Pump/ReceivingFullForm",
                      state: { isCreate: true },
                    }}
                  >
                    <div className="float-right btn-control-action-icons-group mb-1">
                      <button
                        aria-label="Add"
                        name="Add"
                        type="button"
                        className="amp-button button-mini mt-2 icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                        onClick={props?.addNewFields}
                      >
                        <AMPTooltip text="Add New">
                          <svg
                            fill="rgb(11, 26, 88)"
                            viewBox="0 0 510 510"
                            xmlns="http://www.w3.org/2000/svg"
                            className="svg-inline--fa amp-svg-icon amp-svg-add fa-w-16 amp-icon"
                          >
                            <path
                              d="M256,0C114.844,0,0,114.844,0,256s114.844,256,256,256s256-114.844,256-256S397.156,0,256,0z M256,490.667
                                C126.604,490.667,21.333,385.396,21.333,256S126.604,21.333,256,21.333S490.667,126.604,490.667,256S385.396,490.667,256,490.667
                                  z"
                            ></path>
                            <path
                              d="M394.667,245.333h-128v-128c0-5.896-4.771-10.667-10.667-10.667s-10.667,4.771-10.667,10.667v128h-128
                                  c-5.896,0-10.667,4.771-10.667,10.667s4.771,10.667,10.667,10.667h128v128c0,5.896,4.771,10.667,10.667,10.667
                                s10.667-4.771,10.667-10.667v-128h128c5.896,0,10.667-4.771,10.667-10.667S400.563,245.333,394.667,245.333z"
                            ></path>
                          </svg>
                        </AMPTooltip>
                      </button>
                    </div>
                  </Link>
                </div>
              </Col>
            </Row>
          </Col>
        </AMPAuthorization>
      )}
      {searchResult !== "initial" && searchResult?.searchData?.length > 0 && (
        <AMPAccordion title="Search Result" contentClassName="p-0" showDropdownIcon={formName !== ConstVariable.REC && true && context?.features?.includes("WO-TRANS")} dropdownOptions="Transfer Work Order" openSelectOption={openWOrkOrderRegionModel}>
          <Container fluid>
            <div id="results" className="form-container mx-0 bg-form py-2 mb-4">
              <Table bordered striped hover responsive size="sm" className="ws-nowrap">
                <thead className="text-center fn-12">
                  <tr>
                    {formName !== ConstVariable.REC &&
                      context?.features?.includes("WO-TRANS") &&
                      <th>
                        <Checkbox
                          type="checkbox"
                          name="selectAll"
                          id="selectAll"
                          handleClick={handleSelectAll}
                          isChecked={isCheckAll}
                        />
                      </th>}
                    <th>Work Order #
                      {searchResult?.sortType === ConstVariable?.WON_ASCENDING ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          class="bi bi-sort-alpha-up"
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
                          class="bi bi-sort-alpha-up"
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
                          class="bi bi-sort-alpha-up"
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
                    {formName !== ConstVariable.REC &&
                      <>
                        <th>Part Type
                          {searchResult?.sortType === ConstVariable?.PART_TYPE_ASCENDING ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              class="bi bi-sort-alpha-up"
                              viewBox="0 0 16 16"
                              style={{
                                marginLeft: '5px',
                                color: (searchResult?.isApplied
                                  && searchResult?.sortType === ConstVariable?.PART_TYPE_ASCENDING) ? 'blue' : '',
                                cursor: 'pointer'
                              }}
                              // onClick={sortByWorkOrderNumberDesc}
                              onClick={() => applySorting(ConstVariable?.PART_TYPE_DESCENDING)}
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
                                  && searchResult?.sortType === ConstVariable?.PART_TYPE_DESCENDING) ? 'blue' : '',
                                cursor: 'pointer'
                              }}
                              // onClick={sortByWorkOrderNumberAsc}
                              onClick={() => applySorting(ConstVariable?.PART_TYPE_ASCENDING)}
                            >
                              <path fillRule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
                              <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
                            </svg>
                          )}
                        </th>
                        <th>Inspection
                          {searchResult?.sortType === ConstVariable?.INSPECTION_ASCENDING ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              class="bi bi-sort-alpha-up"
                              viewBox="0 0 16 16"
                              style={{
                                marginLeft: '5px',
                                color: (searchResult?.isApplied
                                  && searchResult?.sortType === ConstVariable?.INSPECTION_ASCENDING) ? 'blue' : '',
                                cursor: 'pointer'
                              }}
                              // onClick={sortByWorkOrderNumberDesc}
                              onClick={() => applySorting(ConstVariable?.INSPECTION_DESCENDING)}
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
                                  && searchResult?.sortType === ConstVariable?.INSPECTION_DESCENDING) ? 'blue' : '',
                                cursor: 'pointer'
                              }}
                              // onClick={sortByWorkOrderNumberAsc}
                              onClick={() => applySorting(ConstVariable?.INSPECTION_ASCENDING)}
                            >
                              <path fillRule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
                              <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
                            </svg>
                          )}
                        </th>
                      </>
                    }
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
                    <th>Type
                      {searchResult?.sortType === ConstVariable?.TYPE_ASCENDING ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          class="bi bi-sort-alpha-up"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: '5px',
                            color: (searchResult?.isApplied
                              && searchResult?.sortType === ConstVariable?.TYPE_ASCENDING) ? 'blue' : '',
                            cursor: 'pointer'
                          }}
                          // onClick={sortByWorkOrderNumberDesc}
                          onClick={() => applySorting(ConstVariable?.TYPE_DESCENDING)}
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
                              && searchResult?.sortType === ConstVariable?.TYPE_DESCENDING) ? 'blue' : '',
                            cursor: 'pointer'
                          }}
                          // onClick={sortByWorkOrderNumberAsc}
                          onClick={() => applySorting(ConstVariable?.TYPE_ASCENDING)}
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
                          class="bi bi-sort-alpha-up"
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
                          class="bi bi-sort-alpha-up"
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="fn-12">
                  {searchResult?.searchData?.map((itm, idx) => {
                    return (
                      <React.Fragment key={idx}>
                        <tr>
                          {formName !== ConstVariable.REC && context?.features?.includes("WO-TRANS") &&
                            <td>
                              <Checkbox
                                key={itm.id}
                                type="checkbox"
                                name={name}
                                id={itm.id}
                                handleClick={(e) => handleClick(e, itm)}
                                isChecked={isCheck.includes(itm.id)}
                              />
                            </td>}
                          <td>{itm?.workorderNumber}</td>
                          <td>{itm?.serviceCenter}</td>
                          <td>{itm?.customer}</td>
                          {formName !== ConstVariable.REC &&
                            <>
                              <td className="text-center ws-nowrap">
                                {itm?.partType}
                              </td>
                              <td className="text-center">
                                {itm?.nextInspection?.value}
                              </td>
                            </>
                          }
                          <td className="text-center">
                            {itm?.completionPercentage} %
                          </td>
                          <td className="text-center">{itm?.workorderType}</td>
                          <td className="text-center">
                            {itm?.status === ConstVariable?.INP
                              ? "In-Progress"
                              : itm?.status}
                          </td>

                          <td className="text-center">{itm?.createdDate}</td>
                          <td>{itm?.createdBy}</td>
                          <td>
                            {formName === ConstVariable.REC ? (
                              <>
                                <Row className="text-center mw-60 m-0 p-0">
                                  <Col lg="6" md="6" sm="6" xs="6" className="m-0 p-0">
                                    <AMPAuthorization
                                      hasToken={context?.features?.includes(
                                        "RE-EDIT"
                                      )}
                                    >
                                      <>
                                        {itm?.status !== ConstVariable?.RJCT && (
                                          <Link
                                            to={{
                                              pathname: `/Pump/UpdateReceivingFullForm`,
                                              state: {
                                                isCreate: false,
                                                id: itm?.id,
                                                status: itm?.status,
                                              },
                                            }}
                                          >
                                            <button
                                              aria-label="Edit"
                                              name="Edit"
                                              type="button"
                                              className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 btn btn-amp-monochrome-amp-brand btn-md"
                                              onClick={editForm}
                                            >
                                              <AMPTooltip text="Edit/View">
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  width="19"
                                                  height="19"
                                                  fill="currentColor"
                                                  viewBox="0 0 16 16"
                                                  className="bi bi-pencil-square"
                                                >
                                                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                  <path
                                                    fill-rule="evenodd"
                                                    d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                                                  />
                                                </svg>
                                              </AMPTooltip>
                                            </button>
                                          </Link>
                                        )}
                                      </>
                                    </AMPAuthorization>
                                  </Col>
                                  <Col lg="6" md="6" sm="6" xs="6" className="m-0 p-0">
                                    {itm?.status === ConstVariable?.REC &&
                                      <Dropdown className="mt-1">
                                        <Dropdown.Toggle variant="success" id="dropdown-basic" as={CustomToggle}>
                                          <span> <i className="fa fa-ellipsis-v"></i></span>
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu popperConfig={popperConfig}>
                                          <Dropdown.Item>
                                            <div onClick={(e) => {
                                              onDeleteReceivingOrWorkOrder(itm?.id);
                                            }} className="pointer">
                                              <button
                                                aria-label="Delete"
                                                name="Delete"
                                                type="button"
                                                className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 btn btn-amp-monochrome-amp-brand btn-md"
                                              >
                                                <AMPTooltip text="Delete">
                                                  <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="20"
                                                    height="20"
                                                    fill="currentColor"
                                                    className="svg-inline--fa amp-svg-icon amp-svg-delete fa-w-13 amp-icon"
                                                    viewBox="0 0 16 16"
                                                  >
                                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                                    <path
                                                      fill-rule="evenodd"
                                                      d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                                                    />
                                                  </svg>
                                                </AMPTooltip>

                                              </button>
                                              <span>Delete</span>
                                            </div>
                                          </Dropdown.Item>
                                        </Dropdown.Menu>
                                      </Dropdown>
                                    }
                                  </Col>
                                </Row>
                              </>
                            ) : (
                              <AMPAuthorization
                                hasToken={context?.features?.includes("WO-EDIT")}
                              >
                                <Row className="text-center mw-60 m-0 p-0">
                                  {/* {itm?.isOpen ?
                                        <ArrowUp
                                          onClick={() => handleView(itm?.id)}
                                        />
                                        : <ArrowDown
                                          onClick={() => handleView(itm?.id)}
                                        />
                                      } */}
                                  <Col lg="6" md="6" sm="6" xs="6" className="m-0 p-0">
                                    {itm?.status !== ConstVariable?.RJCT && (<Link
                                      to={{
                                        pathname: `/Pump/EditWorkOrder`,
                                        state: {
                                          isCreate: false,
                                          id: itm?.id,
                                          status: itm?.status,
                                        },
                                      }}
                                    >
                                      <button
                                        aria-label="Edit"
                                        name="Edit"
                                        type="button"
                                        className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                                        onClick={editForm(itm?.id, itm?.status)}
                                      >
                                        <AMPTooltip text="Edit/View">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="19"
                                            height="19"
                                            fill="currentColor"
                                            viewBox="0 0 16 16"
                                            className="bi bi-pencil-square"
                                          >
                                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                            <path
                                              fill-rule="evenodd"
                                              d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                                            />
                                          </svg>
                                        </AMPTooltip>
                                      </button>
                                    </Link>)}
                                  </Col>
                                  <Col lg="6" md="6" sm="6" xs="6" className="m-0 p-0">
                                    <Dropdown className="mt-1">
                                      <Dropdown.Toggle variant="success" id="dropdown-basic" as={CustomToggle}>
                                        <span> <i className="fa fa-ellipsis-v"></i></span>
                                      </Dropdown.Toggle>

                                      <Dropdown.Menu popperConfig={popperConfig}>
                                        <Dropdown.Item>{(itm?.status === ConstVariable?.CLSD || (!context?.features?.includes(
                                          "WO-REJECT"
                                        ) && itm?.status !== ConstVariable?.RJCT) || (itm?.status === ConstVariable?.RJCT && !context?.features?.includes(
                                          "WO-UNDOREJECT"
                                        ))) && <div>

                                            No Options
                                          </div>}
                                          <div> <AMPAuthorization
                                            hasToken={context?.features?.includes(
                                              "WO-REJECT"
                                            )}
                                          >
                                            <>
                                              {itm?.status !==
                                                ConstVariable?.CLSD && itm?.status !== ConstVariable?.RJCT && (
                                                  <div className="pointer" 
                                                  onClick={() =>
                                                    onDeleteReceivingOrWorkOrder(
                                                      itm?.id,
                                                      itm?.workorderNumber
                                                    )
                                                  }>
                                                    <button
                                                      aria-label="Reject"
                                                      name="Reject"
                                                      type="button"
                                                      className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"

                                                    >

                                                      <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="19"
                                                        height="19"
                                                        fill="currentColor"
                                                        className="bi bi-folder-x"
                                                        viewBox="0 0 16 16"
                                                      >
                                                        <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181L15.546 8H14.54l.265-2.91A1 1 0 0 0 13.81 4H2.19a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91H9v1H2.826a2 2 0 0 1-1.991-1.819l-.637-7a1.99 1.99 0 0 1 .342-1.31zm6.339-1.577A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139C1.72 3.042 1.95 3 2.19 3h5.396l-.707-.707z" />
                                                        <path d="M11.854 10.146a.5.5 0 0 0-.707.708L12.293 12l-1.146 1.146a.5.5 0 0 0 .707.708L13 12.707l1.146 1.147a.5.5 0 0 0 .708-.708L13.707 12l1.147-1.146a.5.5 0 0 0-.707-.708L13 11.293l-1.146-1.147z" />
                                                      </svg>

                                                    </button>
                                                    <span>Reject</span>
                                                  </div>
                                                )}
                                            </>
                                          </AMPAuthorization>

                                            <AMPAuthorization
                                              hasToken={context?.features?.includes(
                                                "WO-UNDOREJECT"
                                              )}
                                            >
                                              {itm?.status === ConstVariable?.RJCT && <div className="pointer" onClick={(e) => onOpenUndoRejectModal(itm?.id,
                                                itm?.workorderNumber)}>
                                                <span><i className="fa fa-undo"></i></span>
                                                Undo Reject
                                              </div>}
                                            </AMPAuthorization>
                                          </div>

                                        </Dropdown.Item>

                                      </Dropdown.Menu>
                                    </Dropdown>
                                  </Col>
                                </Row>
                              </AMPAuthorization>
                            )}
                          </td>
                        </tr>
                      </React.Fragment>
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
      )
      }
      {
        searchResult?.searchData?.length === 0 && (
          <div className="text-center">No Data Found</div>
        )
      }
      {
        showTransferToWorkOrderModal &&
        <TransferToWOrkOrderModal
          isCheck={isCheck}
          closeWOrkOrderRegionModel={closeWOrkOrderRegionModel}
          modalName="Transfer Work Order"
          checkedData={checkedData}
          setShowTransferToWorkOrderModal={setShowTransferToWorkOrderModal}
          offset={offset}
          perPage={perPage}
          ajaxParams={ajaxParams}
          ajaxSearchParams={ajaxSearchParams}
          searchPumpObs$={searchPumpObs$}
          setIsCheck={setIsCheck}
          setCheckedData={setCheckedData} />
      }
    </div >

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
export default SearchResultTableForReceivingAndWO;
