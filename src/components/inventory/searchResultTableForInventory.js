import React, { useState, useEffect, useMemo } from "react";
import {
  Form,
  Row,
  Col,
  Button,
  Table,
  Header,
  Container,
} from "react-bootstrap";
import {
  ConstVariable,
} from "../common/const";
import { Link, withRouter, Redirect, useLocation } from "react-router-dom";
import AMPTooltip from "../common/AMPTooltip";
import { AMPAccordion } from "../common/AMPAccordion";
import AMPAuthorization from "../common/AMPAuthorization/AMPAuthorization";
import AMPLoader from "../common/AMPLoader";
import ReactPaginate from "react-paginate";

export const SearchResultTableForInventory = ({
  context,
  searchResult,
  setSearchResult,
  isLoading,
  pageCount,
  handlePageClick,
}) => {

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
      case ConstVariable?.MSN_ASCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          let x = a.manufacturerSerialNumber.toLowerCase()
          let y = b.manufacturerSerialNumber.toLowerCase()
          if (x < y) return -1
          if (x > y) return 1
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.MSN_ASCENDING
        })
        break;
      }
      case ConstVariable?.MSN_DESCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          let x = a.manufacturerSerialNumber.toLowerCase()
          let y = b.manufacturerSerialNumber.toLowerCase()
          if (x < y) return 1
          if (x > y) return -1
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.MSN_DESCENDING
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
      case ConstVariable?.ASSET_STATUS_ASCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          let x = a.assetStatus.toString()
          let y = b.assetStatus.toString()
          if (x < y) return -1
          if (x > y) return 1
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.ASSET_STATUS_ASCENDING
        })
        break;
      }
      case ConstVariable?.ASSET_STATUS_DESCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          let x = a.assetStatus.toString()
          let y = b.assetStatus.toString()
          if (x < y) return 1
          if (x > y) return -1
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.ASSET_STATUS_DESCENDING
        })
        break;
      }
      case ConstVariable?.INVENTORY_STATUS_ASCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          let x = a.inventoryStatus.toString()
          let y = b.inventoryStatus.toString()
          if (x < y) return -1
          if (x > y) return 1
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.INVENTORY_STATUS_ASCENDING
        })
        break;
      }
      case ConstVariable?.INVENTORY_STATUS_DESCENDING: {
        let sortedList = searchResult?.searchData?.sort((a, b) => {
          let x = a.inventoryStatus.toString()
          let y = b.inventoryStatus.toString()
          if (x < y) return 1
          if (x > y) return -1
        })
        setSearchResult({
          ...searchResult,
          searchData: sortedList,
          isApplied: true,
          sortType: ConstVariable?.INVENTORY_STATUS_DESCENDING
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

  return (
    <div className="form-container p-0">
      <AMPAccordion title="Search Result (Maximum 100 records can be displayed here)" contentClassName="p-0">
        <Container fluid>
          <div id="results" className="form-container mx-0 bg-form py-2 mb-4">
            <Table
              striped
              bordered
              hover
              responsive
              size="sm"
              className="ws-nowrap"
            >
              <thead className="text-center fn-12">
                <tr>
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
                        <path fillRule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
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
                  <th>Manufacturer Serial #
                    {searchResult?.sortType === ConstVariable?.MSN_ASCENDING ? (
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
                            && searchResult?.sortType === ConstVariable?.MSN_ASCENDING) ? 'blue' : '',
                          cursor: 'pointer'
                        }}
                        // onClick={sortByWorkOrderNumberDesc}
                        onClick={() => applySorting(ConstVariable?.MSN_DESCENDING)}
                      >
                        <path fillRule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
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
                            && searchResult?.sortType === ConstVariable?.MSN_DESCENDING) ? 'blue' : '',
                          cursor: 'pointer'
                        }}
                        // onClick={sortByWorkOrderNumberAsc}
                        onClick={() => applySorting(ConstVariable?.MSN_ASCENDING)}
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
                        <path fillRule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
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
                        <path fillRule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
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
                        <path fillRule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
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
                  <th>Asset Status
                    {searchResult?.sortType === ConstVariable?.ASSET_STATUS_ASCENDING ? (
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
                            && searchResult?.sortType === ConstVariable?.ASSET_STATUS_ASCENDING) ? 'blue' : '',
                          cursor: 'pointer'
                        }}
                        // onClick={sortByWorkOrderNumberDesc}
                        onClick={() => applySorting(ConstVariable?.ASSET_STATUS_DESCENDING)}
                      >
                        <path fillRule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
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
                            && searchResult?.sortType === ConstVariable?.ASSET_STATUS_DESCENDING) ? 'blue' : '',
                          cursor: 'pointer'
                        }}
                        // onClick={sortByWorkOrderNumberAsc}
                        onClick={() => applySorting(ConstVariable?.ASSET_STATUS_ASCENDING)}
                      >
                        <path fillRule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
                        <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
                      </svg>
                    )}
                  </th>
                  <th>Inventory Status
                    {searchResult?.sortType === ConstVariable?.INVENTORY_STATUS_ASCENDING ? (
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
                            && searchResult?.sortType === ConstVariable?.INVENTORY_STATUS_ASCENDING) ? 'blue' : '',
                          cursor: 'pointer'
                        }}
                        // onClick={sortByWorkOrderNumberDesc}
                        onClick={() => applySorting(ConstVariable?.INVENTORY_STATUS_DESCENDING)}
                      >
                        <path fillRule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
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
                            && searchResult?.sortType === ConstVariable?.INVENTORY_STATUS_DESCENDING) ? 'blue' : '',
                          cursor: 'pointer'
                        }}
                        // onClick={sortByWorkOrderNumberAsc}
                        onClick={() => applySorting(ConstVariable?.INVENTORY_STATUS_ASCENDING)}
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
                        <path fillRule="evenodd" d="M11.36 14.098c-1.137 0-1.708-.657-1.762-1.278h1.004c.058.223.343.45.773.45.824 0 1.164-.829 1.133-1.856h-.059c-.148.39-.57.742-1.261.742-.91 0-1.72-.613-1.72-1.758 0-1.148.848-1.835 1.973-1.835 1.09 0 2.063.636 2.063 2.687 0 1.867-.723 2.848-2.145 2.848zm.062-2.735c.504 0 .933-.336.933-.972 0-.633-.398-1.008-.94-1.008-.52 0-.927.375-.927 1 0 .64.418.98.934.98z" />
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
                        <path fillRule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
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
                {searchResult?.searchData?.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item?.workorderNumber}</td>
                    <td>{item?.manufacturerSerialNumber}</td>
                    <td>{item?.serviceCenter}</td>
                    <td>{item?.customer}</td>
                    <td className="text-center">{item?.status}</td>
                    <td className="text-center">{item?.assetStatus}</td>
                    <td className="text-center">{item?.inventoryStatus}</td>
                    <td className="text-center">{item?.createdDate}</td>
                    <td>{item?.createdBy}</td>
                    <td className="text-center">
                      {((!context?.features?.includes("INS-APRREP") &&
                        item?.inventoryStatus !== "PendingReview") ||
                        context?.features?.includes("INS-APRREP")) &&
                        <Link
                          to={{
                            pathname: `/Pump/createOrUpdateInventory`,
                            state: {
                              isCreate: true,
                              id: item?.id,
                              assetId: item?.assetId,
                              workorderAssetId: item?.workorderAssetId,
                              workorderNumber: item?.workorderNumber,
                              manufacturerSerialNumber: item?.manufacturerSerialNumber,
                              inspectionLevel: item?.inspectionLevel,
                              inspectionType: item?.inspectionType,
                              serviceCenterId: item?.serviceCenterId
                            },
                          }}
                        >
                          <button
                            aria-label="Edit"
                            name="Edit"
                            type="button"
                            className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 btn btn-amp-monochrome-amp-brand btn-md"
                          >
                            <AMPTooltip text="View/Edit">
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
                                  fillRule="evenodd"
                                  d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                                />
                              </svg>
                            </AMPTooltip>
                          </button>
                        </Link>
                      }

                    </td>
                  </tr>
                ))
                }
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
      </AMPAccordion >
    </div>
  );
};
