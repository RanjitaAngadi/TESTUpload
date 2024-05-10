import React, { useEffect, useState, useMemo } from "react";
import { Row, Col, Table, Container } from "react-bootstrap";
import AMPTooltip from "../../common/AMPTooltip";
import { AMPAccordion } from "../../common/AMPAccordion";
import AMPAuthorization from "../../common/AMPAuthorization/AMPAuthorization";
import AMPLoader from "../../common/AMPLoader";
import ReactPaginate from "react-paginate";
import { ConstVariable } from "../../common/const";
import { AMPToastConsts } from "../../common/const/AMPToastConst";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
//import { useObservableCallback } from "../../common/hooks/useObservable";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import {
  useObservable,
  useObservableCallback,
} from "../../common/hooks/useObservable";
import {
  DEFAULT_BASE_URL,
  VERSION,
  ADD_OR_UPDATE_ASSET_DETAILS,
} from "../../common/const";

const updateAssetFormAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.put(URL, params).pipe(
        map((xhrResponse) => {
          return xhrResponse?.response;
        }),
        catchError((error) => {
          console.error("Error in updating Asset", error);
          errorHandler(error.response);
          return [];
        })
      )
    )
  ); // ENd of line

const SearchResultTableForManageAsset = (props) => {
  const {
    context,
    searchResult,
    setSearchResult,
    isLoading,
    pageCount,
    handlePageClick,
    formName,
    // onDeleteReceivingOrWorkOrder,

    editForm,
    isCheckAll,
    setIsCheckAll,
    offset,
    perPage,
    ajaxParams,
    ajaxSearchParams,
    searchAssetObs$,
    onOpenUndoRejectModal,
    isAssetEdit,
    ajaxSaveAssetObsv$,
    //ajaxUpdateAsset$,
    setIsAssetAdding,
  } = props;

  const [isCheck, setIsCheck] = useState([]);
  const [checkedData, setCheckedData] = useState([]);
  const [showErrorMessage, setShowErrorMessage] = useState("");
  // const [showTransferToManageAssetModal, setShowTransferToManageAssetModal] = useState(false);
  const handleSelectAll = (e, itm) => {
    const { id, checked } = e.target;
    setIsCheckAll(!isCheckAll);
    setCheckedData(searchResult?.assets);
    setIsCheck(
      searchResult?.assets?.map((li) => {
        return li.assetId;
      })
    );
    if (isCheckAll) {
      setIsCheck([]);
      setCheckedData([]);
    }
  };

  const handleClick = (e, itm) => {
    const { id, checked } = e.target;
    setIsCheck([...isCheck, id]);
    if (!checked) {
      setIsCheck(isCheck.filter((item) => item !== id));
      setCheckedData(checkedData.filter((item) => item.id !== id));
    }
    if (checked) {
      setCheckedData([...checkedData, itm]);
    }
  };

  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <a
      href=""
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
    >
      {children}
    </a>
  ));
  const popperConfig = {
    strategy: "fixed",
  };

  const applySorting = (type) => {
    switch (type) {
      case ConstVariable?.AI_ASCENDING: {
        let sortedList = searchResult?.assets?.sort((a, b) => {
          let x = a.assetId.toLowerCase();
          let y = b.assetId.toLowerCase();
          if (x < y) return -1;
          if (x > y) return 1;
        });
        setSearchResult({
          ...searchResult,
          assets: sortedList,
          isApplied: true,
          sortType: ConstVariable?.AI_ASCENDING,
        });
        break;
      }
      case ConstVariable?.AI_DESCENDING: {
        let sortedList = searchResult?.assets?.sort((a, b) => {
          let x = a.assetId.toLowerCase();
          let y = b.assetId.toLowerCase();
          if (x < y) return 1;
          if (x > y) return -1;
        });
        setSearchResult({
          ...searchResult,
          assets: sortedList,
          isApplied: true,
          sortType: ConstVariable?.AI_DESCENDING,
        });
        break;
      }
      case ConstVariable?.MANUSNO_ASCENDING: {
        let sortedList = searchResult?.assets?.sort((a, b) => {
          let x = a.manufacturerSerialNumber.toLowerCase();
          let y = b.manufacturerSerialNumber.toLowerCase();
          if (x < y) return -1;
          if (x > y) return 1;
        });
        setSearchResult({
          ...searchResult,
          assets: sortedList,
          isApplied: true,
          sortType: ConstVariable?.MANUSNO_ASCENDING,
        });
        break;
      }
      case ConstVariable?.MANUSNO_DESCENDING: {
        let sortedList = searchResult?.assets?.sort((a, b) => {
          let x = a.manufacturerSerialNumber.toLowerCase();
          let y = b.manufacturerSerialNumber.toLowerCase();
          if (x < y) return 1;
          if (x > y) return -1;
        });
        setSearchResult({
          ...searchResult,
          assets: sortedList,
          isApplied: true,
          sortType: ConstVariable?.MANUSNO_DESCENDING,
        });
        break;
      }

      case ConstVariable?.MANU_NAME_ASCENDING: {
        let sortedList = searchResult?.assets?.sort((a, b) => {
          let x = a.manufacturerName.toLowerCase();
          let y = b.manufacturerName.toLowerCase();
          if (x < y) return -1;
          if (x > y) return 1;
        });
        setSearchResult({
          ...searchResult,
          assets: sortedList,
          isApplied: true,
          sortType: ConstVariable?.MANU_NAME_ASCENDING,
        });
        break;
      }
      case ConstVariable?.MANU_NAME_DESCENDING: {
        let sortedList = searchResult?.assets?.sort((a, b) => {
          let x = a.manufacturerName.toLowerCase();
          let y = b.manufacturerName.toLowerCase();
          if (x < y) return 1;
          if (x > y) return -1;
        });
        setSearchResult({
          ...searchResult,
          assets: sortedList,
          isApplied: true,
          sortType: ConstVariable?.MANU_NAME_DESCENDING,
        });
        break;
      }

      case ConstVariable?.PART_NUMBER_ASCENDING: {
        let sortedList = searchResult?.assets?.sort((a, b) => {
          let x = a.partNumber.toLowerCase();
          let y = b.partNumber.toLowerCase();
          if (x < y) return -1;
          if (x > y) return 1;
        });
        setSearchResult({
          ...searchResult,
          assets: sortedList,
          isApplied: true,
          sortType: ConstVariable?.PART_NUMBER_ASCENDING,
        });
        break;
      }
      case ConstVariable?.PART_NUMBER_DESCENDING: {
        let sortedList = searchResult?.assets?.sort((a, b) => {
          let x = a.partNumber.toLowerCase();
          let y = b.partNumber.toLowerCase();
          if (x < y) return 1;
          if (x > y) return -1;
        });
        setSearchResult({
          ...searchResult,
          assets: sortedList,
          isApplied: true,
          sortType: ConstVariable?.PART_NUMBER_DESCENDING,
        });
        break;
      }
      case ConstVariable?.PART_TYPE_NAME_ASCENDING: {
        let sortedList = searchResult?.assets?.sort((a, b) => {
          let x = a.partTypeName.toLowerCase();
          let y = b.partTypeName.toLowerCase();
          if (x < y) return -1;
          if (x > y) return 1;
        });
        setSearchResult({
          ...searchResult,
          assets: sortedList,
          isApplied: true,
          sortType: ConstVariable?.PART_TYPE_NAME_ASCENDING,
        });
        break;
      }
      case ConstVariable?.PART_TYPE_NAME_DESCENDING: {
        let sortedList = searchResult?.assets?.sort((a, b) => {
          let x = a.partTypeName.toLowerCase();
          let y = b.partTypeName.toLowerCase();
          if (x < y) return 1;
          if (x > y) return -1;
        });
        setSearchResult({
          ...searchResult,
          assets: sortedList,
          isApplied: true,
          sortType: ConstVariable?.PART_TYPE_NAME_DESCENDING,
        });
        break;
      }

      case ConstVariable?.ISONHOLD_ASCENDING: {
        let sortedList = searchResult?.assets?.sort((a, b) => {
          let x = a.isOnHold.toLowerCase();
          let y = b.isOnHold.toLowerCase();
          if (x < y) return -1;
          if (x > y) return 1;
        });
        setSearchResult({
          ...searchResult,
          assets: sortedList,
          isApplied: true,
          sortType: ConstVariable?.ISONHOLD_ASCENDING,
        });
        break;
      }
      case ConstVariable?.ISONHOLD_DESCENDING: {
        let sortedList = searchResult?.assets?.sort((a, b) => {
          let x = a.isOnHold.toLowerCase();
          let y = b.isOnHold.toLowerCase();
          if (x < y) return 1;
          if (x > y) return -1;
        });
        setSearchResult({
          ...searchResult,
          assets: sortedList,
          isApplied: true,
          sortType: ConstVariable?.ISONHOLD_DESCENDING,
        });
        break;
      }
      case ConstVariable?.DESCRIPTION_ASCENDING: {
        let sortedList = searchResult?.assets?.sort((a, b) => {
          let x = a.description.toLowerCase();
          let y = b.description.toLowerCase();
          if (x < y) return -1;
          if (x > y) return 1;
        });
        setSearchResult({
          ...searchResult,
          assets: sortedList,
          isApplied: true,
          sortType: ConstVariable?.DESCRIPTION_ASCENDING,
        });
        break;
      }
      case ConstVariable?.DESCRIPTION_DESCENDING: {
        let sortedList = searchResult?.assets?.sort((a, b) => {
          let x = a.description.toLowerCase();
          let y = b.description.toLowerCase();
          if (x < y) return 1;
          if (x > y) return -1;
        });
        setSearchResult({
          ...searchResult,
          assets: sortedList,
          isApplied: true,
          sortType: ConstVariable?.DESCRIPTION_DESCENDING,
        });
        break;
      }
      case ConstVariable?.STATUS_ASCENDING: {
        let sortedList = searchResult?.assets?.sort((a, b) => {
          let x = a.status.toLowerCase();
          let y = b.status.toLowerCase();
          if (x < y) return -1;
          if (x > y) return 1;
        });
        setSearchResult({
          ...searchResult,
          assets: sortedList,
          isApplied: true,
          sortType: ConstVariable?.STATUS_ASCENDING,
        });
        break;
      }
      case ConstVariable?.STATUS_DESCENDING: {
        let sortedList = searchResult?.assets?.sort((a, b) => {
          let x = a.status.toLowerCase();
          let y = b.status.toLowerCase();
          if (x < y) return 1;
          if (x > y) return -1;
        });
        setSearchResult({
          ...searchResult,
          assets: sortedList,
          isApplied: true,
          sortType: ConstVariable?.STATUS_DESCENDING,
        });
        break;
      }
    }
  };

  // // Asset Update
  const ajaxUpdateAsset$ = useMemo(() => {
    return updateAssetFormAjax$(
      DEFAULT_BASE_URL + VERSION + ADD_OR_UPDATE_ASSET_DETAILS,
      {
        errorHandler: (error) => {
          setLoader(false);
          toast.error(AMPToastConsts.ASSET_UPDATE_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  useObservableCallback(ajaxUpdateAsset$, (response) => {
    setLoader(false);
    if (response?.status) {
      ajaxAssetListObsv$.next({
        index: offset,
        pageSize: perPage,
        workOrderId: props.wOrderId,
      });
      setIsAssetLoading(true);
      toast.success(AMPToastConsts.ASSET_UPDATE_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
      closeAssetModal();
    } else {
      toast.error(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });
  // const [postresponse,setPostresponse]= useState();

  useEffect(() => {
    //  if(isAssetEdit)
    //  ajaxUpdateAsset$.next(ajaxParams);
    //  else{
    //    ajaxSaveAssetObsv$.next(ajaxParams)
    //  }
  }, []);

  return (
    <div id="results" className="form-container p-0 mb-4">
      <AMPLoader isLoading={isLoading} />

      {formName === ConstVariable.ASSET && (
        <AMPAuthorization hasToken={context?.features?.includes("RE-CREATE")}>
          <Col>
            <Row>
              <Col md={12} sm={12} xs={12} lg={12}>
                <div className="amp-action-btn-controls">
                  <Link
                    to={{
                      pathname: "/Pump/manageAssets/assetDetails",
                      //state: { isCreate: true },
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
      {searchResult !== "initial" && searchResult?.assets?.length > 0 && (
        <AMPAccordion
          title="Search Result"
          contentClassName="p-0"
          //   showDropdownIcon={formName !== ConstVariable.ASSET && true && context?.features?.includes("ASSET")}
          //   //dropdownOptions="Transfer Work Order"
          //   openSelectOption={openManageAssetModel}
        >
          <Container fluid>
            <div id="results" className="form-container mx-0 bg-form py-2 mb-4">
              <Table
                bordered
                striped
                hover
                responsive
                size="sm"
                className="ws-nowrap"
              >
                <thead className="text-center fn-10">
                  <tr>
                    {formName !== ConstVariable.ASSET &&
                      context?.features?.includes("ASSET") && (
                        <th>
                          <Checkbox
                            type="checkbox"
                            name="selectAll"
                            id="selectAll"
                            handleClick={handleSelectAll}
                            isChecked={isCheckAll}
                          />
                        </th>
                      )}
                    {/* <th>Asset Id #
                      {searchResult?.sortType === ConstVariable?.AI_ASCENDING ? (
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
                              && searchResult?.sortType === ConstVariable?.AI_ASCENDING) ? 'blue' : '',
                            cursor: 'pointer'
                          }}
                          // onClick={sortByWorkOrderNumberDesc}
                          onClick={() => applySorting(ConstVariable?.AI_DESCENDING)}
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
                              && searchResult?.sortType === ConstVariable?.AI_DESCENDING) ? 'blue' : '',
                            cursor: 'pointer'
                          }}
                          // onClick={sortByWorkOrderNumberAsc}
                          onClick={() => applySorting(ConstVariable?.AI_ASCENDING)}
                        >
                          <path fillRule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
                          <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
                        </svg>
                      )}
                    </th> */}
                    <th>
                      Manu Serial Number
                      {searchResult?.sortType ===
                      ConstVariable?.MANUSNO_ASCENDING ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          class="bi bi-sort-alpha-up"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: "5px",
                            color:
                              searchResult?.isApplied &&
                              searchResult?.sortType ===
                                ConstVariable?.MANUSNO_ASCENDING
                                ? "blue"
                                : "",
                            cursor: "pointer",
                          }}
                          // onClick={sortByWorkOrderNumberDesc}
                          onClick={() =>
                            applySorting(ConstVariable?.MANUSNO_DESCENDING)
                          }
                        >
                          <path
                            fill-rule="evenodd"
                            d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z"
                          />
                          <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zm-8.46-.5a.5.5 0 0 1-1 0V3.707L2.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.498.498 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L4.5 3.707V13.5z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-sort-alpha-down"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: "5px",
                            color:
                              searchResult?.isApplied &&
                              searchResult?.sortType ===
                                ConstVariable?.MANUSNO_DESCENDING
                                ? "blue"
                                : "",
                            cursor: "pointer",
                          }}
                          // onClick={sortByWorkOrderNumberAsc}
                          onClick={() =>
                            applySorting(ConstVariable?.MANUSNO_ASCENDING)
                          }
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z"
                          />
                          <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
                        </svg>
                      )}
                    </th>
                    <th>
                      Manufacture Name
                      {searchResult?.sortType ===
                      ConstVariable?.MANU_NAME_ASCENDING ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          class="bi bi-sort-alpha-up"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: "5px",
                            color:
                              searchResult?.isApplied &&
                              searchResult?.sortType ===
                                ConstVariable?.MANU_NAME_ASCENDING
                                ? "blue"
                                : "",
                            cursor: "pointer",
                          }}
                          // onClick={sortByWorkOrderNumberDesc}
                          onClick={() =>
                            applySorting(ConstVariable?.MANU_NAME_DESCENDING)
                          }
                        >
                          <path
                            fill-rule="evenodd"
                            d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z"
                          />
                          <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zm-8.46-.5a.5.5 0 0 1-1 0V3.707L2.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.498.498 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L4.5 3.707V13.5z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-sort-alpha-down"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: "5px",
                            color:
                              searchResult?.isApplied &&
                              searchResult?.sortType ===
                                ConstVariable?.MANU_NAME_DESCENDING
                                ? "blue"
                                : "",
                            cursor: "pointer",
                          }}
                          // onClick={sortByWorkOrderNumberAsc}
                          onClick={() =>
                            applySorting(ConstVariable?.MANU_NAME_ASCENDING)
                          }
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z"
                          />
                          <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
                        </svg>
                      )}
                    </th>

                    {/* <th>Part number
                          {searchResult?.sortType === ConstVariable?.PART_NUMBER_ASCENDING ? (
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
                                  && searchResult?.sortType === ConstVariable?.PART_NUMBER_ASCENDING) ? 'blue' : '',
                                cursor: 'pointer'
                              }}
                              // onClick={sortByWorkOrderNumberDesc}
                              onClick={() => applySorting(ConstVariable?.PART_NUMBER_DESCENDING)}
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
                                  && searchResult?.sortType === ConstVariable?.PART_NUMBER_DESCENDING) ? 'blue' : '',
                                cursor: 'pointer'
                              }}
                              // onClick={sortByWorkOrderNumberAsc}
                              onClick={() => applySorting(ConstVariable?.PART_NUMBER_ASCENDING)}
                            >
                              <path fillRule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z" />
                              <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
                            </svg>
                          )}
                        </th> */}
                    <th>
                      Part Type
                      {searchResult?.sortType ===
                      ConstVariable?.PART_TYPE_NAME_ASCENDING ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          class="bi bi-sort-alpha-up"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: "5px",
                            color:
                              searchResult?.isApplied &&
                              searchResult?.sortType ===
                                ConstVariable?.PART_TYPE_NAME_ASCENDING
                                ? "blue"
                                : "",
                            cursor: "pointer",
                          }}
                          // onClick={sortByWorkOrderNumberDesc}
                          onClick={() =>
                            applySorting(
                              ConstVariable?.PART_TYPE_NAME_DESCENDING
                            )
                          }
                        >
                          <path
                            fill-rule="evenodd"
                            d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z"
                          />
                          <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zm-8.46-.5a.5.5 0 0 1-1 0V3.707L2.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.498.498 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L4.5 3.707V13.5z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-sort-alpha-down"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: "5px",
                            color:
                              searchResult?.isApplied &&
                              searchResult?.sortType ===
                                ConstVariable?.PART_TYPE_NAME_DESCENDING
                                ? "blue"
                                : "",
                            cursor: "pointer",
                          }}
                          // onClick={sortByWorkOrderNumberAsc}
                          onClick={() =>
                            applySorting(
                              ConstVariable?.PART_TYPE_NAME_ASCENDING
                            )
                          }
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z"
                          />
                          <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
                        </svg>
                      )}
                    </th>
                    <th>
                      Description
                      {searchResult?.sortType ===
                      ConstVariable?.DESCRIPTION_ASCENDING ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          class="bi bi-sort-alpha-up"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: "5px",
                            color:
                              searchResult?.isApplied &&
                              searchResult?.sortType ===
                                ConstVariable?.DESCRIPTION_ASCENDING
                                ? "blue"
                                : "",
                            cursor: "pointer",
                          }}
                          // onClick={sortByWorkOrderNumberDesc}
                          onClick={() =>
                            applySorting(ConstVariable?.DESCRIPTION_DESCENDING)
                          }
                        >
                          <path
                            fill-rule="evenodd"
                            d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z"
                          />
                          <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zm-8.46-.5a.5.5 0 0 1-1 0V3.707L2.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.498.498 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L4.5 3.707V13.5z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-sort-alpha-down"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: "5px",
                            color:
                              searchResult?.isApplied &&
                              searchResult?.sortType ===
                                ConstVariable?.DESCRIPTION_DESCENDING
                                ? "blue"
                                : "",
                            cursor: "pointer",
                          }}
                          // onClick={sortByWorkOrderNumberAsc}
                          onClick={() =>
                            applySorting(ConstVariable?.DESCRIPTION_ASCENDING)
                          }
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z"
                          />
                          <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
                        </svg>
                      )}
                    </th>
                    <th>
                      Is OnHold
                      {searchResult?.sortType ===
                      ConstVariable?.ISONHOLD_ASCENDING ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-sort-numeric-up"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: "5px",
                            color:
                              searchResult?.isApplied &&
                              searchResult?.sortType ===
                                ConstVariable?.ISONHOLD_ASCENDING
                                ? "blue"
                                : "",
                            cursor: "pointer",
                          }}
                          // onClick={sortByPercentageDesc}
                          onClick={() =>
                            applySorting(ConstVariable?.ISONHOLD_DESCENDING)
                          }
                        >
                          <path d="M12.438 1.668V7H11.39V2.684h-.051l-1.211.859v-.969l1.262-.906h1.046z" />
                          <path
                            fill-rule="evenodd"
                            d="M11.36 14.098c-1.137 0-1.708-.657-1.762-1.278h1.004c.058.223.343.45.773.45.824 0 1.164-.829 1.133-1.856h-.059c-.148.39-.57.742-1.261.742-.91 0-1.72-.613-1.72-1.758 0-1.148.848-1.835 1.973-1.835 1.09 0 2.063.636 2.063 2.687 0 1.867-.723 2.848-2.145 2.848zm.062-2.735c.504 0 .933-.336.933-.972 0-.633-.398-1.008-.94-1.008-.52 0-.927.375-.927 1 0 .64.418.98.934.98z"
                          />
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
                            marginLeft: "5px",
                            color:
                              searchResult?.isApplied &&
                              searchResult?.sortType ===
                                ConstVariable?.ISONHOLD_DESCENDING
                                ? "blue"
                                : "",
                            cursor: "pointer",
                          }}
                          // onClick={sortByPercentageAsc}
                          onClick={() =>
                            applySorting(ConstVariable?.ISONHOLD_ASCENDING)
                          }
                        >
                          <path d="M12.438 1.668V7H11.39V2.684h-.051l-1.211.859v-.969l1.262-.906h1.046z" />
                          <path
                            fillRule="evenodd"
                            d="M11.36 14.098c-1.137 0-1.708-.657-1.762-1.278h1.004c.058.223.343.45.773.45.824 0 1.164-.829 1.133-1.856h-.059c-.148.39-.57.742-1.261.742-.91 0-1.72-.613-1.72-1.758 0-1.148.848-1.835 1.973-1.835 1.09 0 2.063.636 2.063 2.687 0 1.867-.723 2.848-2.145 2.848zm.062-2.735c.504 0 .933-.336.933-.972 0-.633-.398-1.008-.94-1.008-.52 0-.927.375-.927 1 0 .64.418.98.934.98z"
                          />
                          <path d="M4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
                        </svg>
                      )}
                    </th>

                    <th>
                      Status
                      {searchResult?.sortType ===
                      ConstVariable?.STATUS_ASCENDING ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          class="bi bi-sort-alpha-up"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: "5px",
                            color:
                              searchResult?.isApplied &&
                              searchResult?.sortType ===
                                ConstVariable?.STATUS_ASCENDING
                                ? "blue"
                                : "",
                            cursor: "pointer",
                          }}
                          // onClick={sortByWorkOrderNumberDesc}
                          onClick={() =>
                            applySorting(ConstVariable?.STATUS_DESCENDING)
                          }
                        >
                          <path
                            fill-rule="evenodd"
                            d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z"
                          />
                          <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zm-8.46-.5a.5.5 0 0 1-1 0V3.707L2.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.498.498 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L4.5 3.707V13.5z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-sort-alpha-down"
                          viewBox="0 0 16 16"
                          style={{
                            marginLeft: "5px",
                            color:
                              searchResult?.isApplied &&
                              searchResult?.sortType ===
                                ConstVariable?.STATUS_DESCENDING
                                ? "blue"
                                : "",
                            cursor: "pointer",
                          }}
                          // onClick={sortByWorkOrderNumberAsc}
                          onClick={() =>
                            applySorting(ConstVariable?.STATUS_ASCENDING)
                          }
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z"
                          />
                          <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z" />
                        </svg>
                      )}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="fn-12">
                  {searchResult?.assets?.map((itm, idx) => {
                    return (
                      <React.Fragment key={idx}>
                        <tr>
                          {formName !== ConstVariable.ASSET &&
                            context?.features?.includes("ASSET") && (
                              <td>
                                <Checkbox
                                  key={itm.id}
                                  type="checkbox"
                                  name={name}
                                  id={itm.id}
                                  handleClick={(e) => handleClick(e, itm)}
                                  isChecked={isCheck.includes(itm.id)}
                                />
                              </td>
                            )}
                          {/* <td>{itm?.assetId}</td> */}
                          <td>{itm?.manufacturerSerialNumber}</td>
                          <td>{itm?.manufacturerName}</td>
                          {/* <td>{itm?.partNumber}</td> */}
                          <td>{itm?.partTypeName}</td>
                          <td className="text-center">{itm?.description}</td>
                          <td>{itm?.isOnHold} </td>
                          <td className="text-center">
                            {itm?.status === ConstVariable?.INP
                              ? "In-Progress"
                              : itm?.status}
                          </td>
                          <td>
                            <>
                              <Row className="text-center mw-60 m-0 p-0">
                                <Col
                                  lg="6"
                                  md="6"
                                  sm="6"
                                  xs="6"
                                  className="m-0 p-0"
                                >
                                  <AMPAuthorization
                                    hasToken={context?.features?.includes(
                                      "RE-EDIT"
                                    )}
                                  >
                                    <>
                                      {console.log(itm)}
                                      {itm?.status !== ConstVariable?.RJCT && (
                                        <Link
                                          to={{
                                            pathname: `/Pump/manageAssets/assetDetails`,
                                            state: {
                                              isAssetEdit: true,
                                              id: itm?.assetId,
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
                                            <AMPTooltip text="Edit">
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
                              </Row>
                            </>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </Table>
              {searchResult?.totalAssetCount > 0 && (
                <Row>
                  <Col className="p-0 px-sm-3">
                    <ReactPaginate
                      previousLabel={"prev"}
                      nextLabel={"next"}
                      breakLabel={"..."}
                      breakClassName={"break-me"}
                      pageCount={pageCount}
                      offset={offset}
                      perPage={perPage}
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

      {searchResult?.assets?.length === 0 && (
        <div className="text-center">No Data Found</div>
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

export default SearchResultTableForManageAsset;
