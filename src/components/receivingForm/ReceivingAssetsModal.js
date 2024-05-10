import React, { useEffect, useMemo, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { Link, withRouter, Redirect, useLocation } from "react-router-dom";
import ReactGA from 'react-ga';
import {
  AMPModal,
  AMPModalHeader,
  AMPModalBody,
  AMPModalFooter,
} from "../common/AMPModal";
import {
  Form,
  Row,
  Col,
  Button,
  Table,
  Header,
  Container,
} from "react-bootstrap";
import AMPFlexStart from "../common/AMPFlex/AMPFlexStart";
import AMPAuthorization from "../common/AMPAuthorization/AMPAuthorization";
import AMPLoader from "../common/AMPLoader";
import { AMPValidation } from "../common/AMPAuthorization/AMPValidation";
import { toast } from "react-toastify";

import { useAccessState } from "../../utils/AppContext/loginContext";

import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";
import {
  DEFAULT_BASE_URL,
  VERSION,
  GET_TEMP_SERIAL_NUMBER,
  GET_ASSET_LIST,
  DELETE_ASSET_BY_SERIAL_NUMBER,
  ConstVariable,
} from "../common/const";
import { ampJsonAjax } from "../common/utils/ampAjax";
import { AMPToastConsts } from "../common/const/AMPToastConst";
import ReactPaginate from "react-paginate";
import { OrganizationalDetailsForm } from "../workOrders/OrganizationalDetails";
import { CreateOrUpdateAsset } from "./CreateOrUpdateAsset";
import { DeleteModal } from "../common/DeleteModal";
import { OrganizationModal } from "./OrganizationModal";
import { AssetStatusModal } from "./AssetStatusModal";
import AMPTooltip from "../common/AMPTooltip";
import { AMPMessage } from "../common/const/AMPMessage";

const getAssetListAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax
        .get(
          DEFAULT_BASE_URL +
          VERSION +
          GET_ASSET_LIST +
          `${param.index}/${param.pageSize}/${param.workOrderId}`
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

const deleteAssetAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.delete(URL + params.id).pipe(
        map((xhrResponse) => {
          return xhrResponse;
        }),
        catchError((error) => {
          console.error("Error in delete Asset", error);
          errorHandler(error.response);
          return [];
        })
      )
    )
  );

const userToken = [30, 31, 32, 33, 35];
const addAssetToken = 25;

const ReceivingAssetsModal = (props) => {
  const context = useAccessState();

  const params = new window.URLSearchParams(window.location.search);
  const locationRef = useLocation();
  const workId = locationRef?.state?.id || params.get("workOrderId");
  const status = locationRef?.state?.status || params.get("status");
  const isReceiving = locationRef?.state?.isReceiving;
  const workOrderNumber = locationRef?.state?.workOrderNumber;
  const serviceCenterId = locationRef?.state?.serviceCenterId;

  const [showAddOrEditAssetModal, setShowAddOrEditAssetModal] = useState({
    isAdd: false,
    isEdit: "",
  });
  const [showAssetStatusModal, setShowAssetStatusModal] = useState({
    data: "",
    showModal: false,
  });

  const openAddAssetModal1 = () => {
    setShowAddOrEditAssetModal({
      isAdd: true,
      isEdit: "",
    });
  };

  const openEditAssetModal1 = (id) => {
    setShowAddOrEditAssetModal({
      isAdd: false,
      isEdit: id,
    });
  };

  const closeAddOrEditAssetModal = () => {
    setShowAddOrEditAssetModal({
      isAdd: false,
      isEdit: "",
    });
  };
  const closeStatusModal = () => {
    setShowAssetStatusModal({
      showModal: false,
    });
  };
  const openStatusModal = (data) => {
    setShowAssetStatusModal({
      data: data,
      serviceCenterId: serviceCenterId,
      showModal: true,
    });
  };
  const closeAssetModal = () => {
    props.setState(true);
    props.closeAssetModal();
  };

  // delete modal
  const [showDeleteModal, setShowDeleteModal] = useState();

  // pagination related constants
  const [offset, setOffset] = useState(1);
  const [perPage] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [assetList, setAssetList] = useState({});
  const [loader, setLoader] = useState(false);
  const [isAssetLoading, setIsAssetLoading] = useState(true);

  const ajaxAssetListObsv$ = useMemo(() => {
    return getAssetListAjaxObs$();
  }, []);

  useObservableCallback(ajaxAssetListObsv$, (response) => {
    if (response?.status) {
      setAssetList(response?.content);
      setIsAssetLoading(false);
      setPageCount(Math.ceil(response?.content?.totalCount / perPage));
    } else {
      setIsAssetLoading(false);
      toast.error(AMPToastConsts.ASSET_RETRIEVING_FAILURE, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });

  const handlePageClick = (e) => {
    const selectedPage = e.selected;
    setOffset(selectedPage + 1);
    setIsAssetLoading(true);
  };
  useEffect(() => {
    if (ajaxAssetListObsv$)
      ajaxAssetListObsv$.next({
        index: offset,
        pageSize: perPage,
        workOrderId: workId || props?.wOrderId,
      });
  }, [offset]);

  // delete asset
  const deleteAsset$ = useMemo(() => {
    return deleteAssetAjax$(
      DEFAULT_BASE_URL + VERSION + DELETE_ASSET_BY_SERIAL_NUMBER,
      {
        errorHandler: (error) => {
          toast.error(AMPToastConsts.ASSET_DELETE_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  });
  useObservableCallback(deleteAsset$, (response) => {
    setShowDeleteModal("");
    ajaxAssetListObsv$.next({
      index: offset,
      pageSize: perPage,
      workOrderId: props.wOrderId,
    });
    setIsAssetLoading(true);
    toast.success(AMPToastConsts.ASSET_DELETE_SUCCESS, {
      position: toast.POSITION.TOP_CENTER,
    });
  });

  const closeDeleteModal = () => {
    setShowDeleteModal("");
  };
  const onDelete = (id) => {
    setShowDeleteModal(id);
  };
  const onConfirmDelete = (id) => {
    deleteAsset$.next({ id: id });
  };
  // For google analytics purpose
  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, [])
  return (
    <>
      {props.state && (
        <Redirect
          to={{
            pathname: `/Pump/${isReceiving ? `UpdateReceivingFullForm` : `EditWorkOrder`
              }`,
            state: { isCreate: false, id: workId, status: status },
          }}
        />
      )}
      {(showAddOrEditAssetModal.isAdd || showAddOrEditAssetModal.isEdit) && (
        <AddOrEditAssetModal
          modalName={
            showAddOrEditAssetModal.isEdit ? `Edit Asset` : `Add Asset`
          }
          wOrderId={props.wOrderId}
          manufacturer={props.manufacturer}
          partType={props.partType}
          openAddAssetModal={openAddAssetModal1}
          closeAddAssetModal={closeAddOrEditAssetModal}
          offset={offset}
          perPage={perPage}
          setIsAssetLoading={setIsAssetLoading}
          ajaxAssetListObsv$={ajaxAssetListObsv$}
          isAssetEdit={showAddOrEditAssetModal.isEdit}
          isReceiving={isReceiving}
          status={status}
        />
      )}
      {showAssetStatusModal.showModal && (
        <AssetStatusModal
          modalName="Inspection Status"
          showAssetStatusModal={showAssetStatusModal}
          closeStatusModal={closeStatusModal}
          partType={props?.partType}
          workId={props?.wOrderId}
          workOrderNumber={workOrderNumber}
          status={status}
        />
      )}
      <Container fluid>
        <div
          id="results"
          className="form-container mx-0 px-0 pt-2 bg-form pb-0 fn-13"
        >
          <AMPLoader isLoading={isAssetLoading} />
          <AMPAuthorization
            hasToken={
              isReceiving
                ? context?.features?.includes("RE-EDIT")
                : context?.features?.includes("WO-EDIT")
            }
          >
            <Row>
              <Col>
                {status !== ConstVariable?.INP &&
                  status !== ConstVariable?.CLSD &&
                  status !== ConstVariable?.RJCT &&
                  assetList?.data?.length < 1 &&
                  isReceiving && (
                    <div className="float-right btn-control-action-icons-group mb-1">
                      <button
                        aria-label="Add"
                        name="Add"
                        type="button"
                        className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                        onClick={openAddAssetModal1}
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
                  )}
              </Col>
            </Row>
          </AMPAuthorization>
          {assetList?.totalCount > 0 &&
            <Table
              striped
              bordered
              hover
              responsive
              size="sm"
              className="bg-light m-0"
            >
              <thead>
                <tr>
                  <th>Serial Number</th>
                  <th>Manufacturer</th>
                  <th>Part Type</th>
                  <th>Description</th>
                  <th>On Hold</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              {assetList?.totalCount > 0 &&
                <tbody>
                  {assetList?.data?.map((al) => (
                    <tr key={al?.assetId}>
                      <td>{al?.manufacturerSerialNumber}</td>
                      <td>{al?.manufacturerName}</td>
                      <td>{al?.partTypeName}</td>
                      <td>{al?.description}</td>
                      <td>{al?.isOnHold === "True" ? "Yes" : "No"}</td>
                      <td>{al?.status}</td>
                      <td>
                        <AMPFlexStart>
                          {status !== ConstVariable?.RJCT && (
                            <>
                              <button
                                aria-label="Edit"
                                name="Edit"
                                type="button"
                                className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                                onClick={() => openEditAssetModal1(al.assetId)}
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
                                      fillRule="evenodd"
                                      d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                                    />
                                  </svg>
                                </AMPTooltip>
                              </button>
                            </>
                          )}
                          {!isReceiving && (
                            <>
                              {al?.isOnHold === "False" && (

                                <button
                                  aria-label="View"
                                  name="View"
                                  type="button"
                                  className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                                  onClick={() => openStatusModal(al)}
                                >
                                  <AMPTooltip text="View Inspection Status">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="21"
                                      height="21"
                                      fill="currentColor"
                                      className="bi bi-eye"
                                      viewBox="0 0 16 16"
                                    >
                                      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                                      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                                    </svg>
                                  </AMPTooltip>
                                </button>
                              )}
                            </>
                          )}
                          <AMPAuthorization
                            hasToken={
                              isReceiving
                                ? context?.features?.includes("RE-EDIT")
                                : context?.features?.includes("WO-EDIT")
                            }
                          >
                            <>
                              {status !== ConstVariable?.INP &&
                                status !== ConstVariable?.CLSD &&
                                status !== ConstVariable?.RJCT &&
                                isReceiving && (
                                  <>
                                    <button
                                      aria-label="Delete"
                                      name="Delete"
                                      type="button"
                                      className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                                      onClick={() =>
                                        onDelete(al.manufacturerSerialNumber)
                                      }
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
                                            fillRule="evenodd"
                                            d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                                          />
                                        </svg>
                                      </AMPTooltip>
                                    </button>
                                  </>
                                )}
                            </>
                          </AMPAuthorization>
                          {isReceiving && (
                            <Link
                              to={{
                                pathname: "/Pump/ReceivingReport",
                                state: {
                                  isCreate: false,
                                  id: workId,
                                  status: status,
                                  showAssetOrReceivingOrWorkForBack: true,
                                  isReceiving: false,
                                  backForm: "Receiving",
                                  serviceCenterId: serviceCenterId,
                                  workOrderNumber: workOrderNumber,
                                  assetInfo: {
                                    assetId: al?.assetId,
                                    workorderAssetId: al?.workorderAssetId,
                                    manufacturerSerialNumber:
                                      al?.manufacturerSerialNumber,
                                    partTypeName: al?.partTypeName,
                                    partTypeDescription: al?.description,
                                    manufacturerName: al?.manufacturerName,
                                  },
                                },
                              }}
                            >
                              <button
                                aria-label="Print"
                                name="Print"
                                type="button"
                                className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                              >
                                <AMPTooltip text="Print Receiving Report">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    fill="currentColor"
                                    className="bi bi-printer"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
                                    <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z" />
                                  </svg>
                                </AMPTooltip>
                              </button>
                            </Link>
                          )}
                          {!isReceiving && (
                            <Link
                              to={{
                                pathname: "/Pump/InspectionReport",
                                state: {
                                  isCreate: false,
                                  id: workId,
                                  status: status,
                                  showAssetOrReceivingOrWorkForBack: true,
                                  isReceiving: false,
                                  backForm: "workOrder",
                                  serviceCenterId: serviceCenterId,
                                  workOrderNumber: workOrderNumber,
                                  assetInfo: {
                                    assetId: al?.assetId,
                                    workorderAssetId: al?.workorderAssetId,
                                    manufacturerSerialNumber:
                                      al?.manufacturerSerialNumber,
                                    partTypeName: al?.partTypeName,
                                    partTypeDescription: al?.description,
                                    manufacturerName: al?.manufacturerName,
                                  },
                                },
                              }}
                            >
                              <button
                                aria-label="Print"
                                name="Print"
                                type="button"
                                className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                              >
                                <AMPTooltip text="Print Inspection Report">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    fill="currentColor"
                                    className="bi bi-printer"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
                                    <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z" />
                                  </svg>
                                </AMPTooltip>
                              </button>
                            </Link>
                          )}
                        </AMPFlexStart>
                      </td>
                    </tr>
                  ))}
                </tbody>
              }
            </Table>
          }
          {/* {assetList?.totalCount > 0 && (
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
          )} */}


          {!isAssetLoading && assetList?.totalCount === 0 && (
            <Row>
              <Col className="text-center text-danger pb-1">No Data Found</Col>
            </Row>
          )}

          {showDeleteModal && (
            <DeleteModal
              confirmationMessage={AMPMessage.DEL_ASSET_CONFIRM}
              showDeleteModal={showDeleteModal}
              onConfirmDelete={onConfirmDelete}
              closeModal={closeDeleteModal}
            />
          )}
        </div>
      </Container>
    </>
  );
};

export default ReceivingAssetsModal;

// Add Asset Modal
export const AddOrEditAssetModal = (props) => {
  const context = useAccessState();

  const [showOrganizationModal, setShowOrganizationntModal] = useState(false);

  const [organizationGroup, setOrganizationGroup] = useState({});

  const openOrganizationModal = () => setShowOrganizationntModal(true);
  const closeOrganizationModal = () => setShowOrganizationntModal(false);

  const [organizationGroupId, setOrganizationGroupId] = useState();
  const [organizationData, setOrganizationData] = useState();
  const [customerId, setCustomerId] = useState();

  // Generate Temporary Serial number
  const [isTempSerialNumber, setIsTempSerialNumber] = useState(false);
  const [isTempSerialNumberLoading, setIsTempSerialNumberLoading] =
    useState(false);
  const getTempSerialNumberAjaxObs$ = () =>
    new Subject().pipe(
      mergeMap((param) =>
        ampJsonAjax
          .get(DEFAULT_BASE_URL + VERSION + GET_TEMP_SERIAL_NUMBER)
          .pipe(
            map((xhrResponse) => {
              setIsTempSerialNumber(true);
              setIsTempSerialNumberLoading(false);
              return xhrResponse.response.content;
            }),
            catchError((error) => {
              return throwError(error);
            })
          )
      )
    );
  const ajaxGenTempSerialNumberObsv$ = useMemo(() => {
    return getTempSerialNumberAjaxObs$();
  }, []);

  const tempSerialNumber = useObservable(ajaxGenTempSerialNumberObsv$, "");
  const genTempSerialNumber = () => {
    setIsTempSerialNumberLoading(true);
    ajaxGenTempSerialNumberObsv$.next();
  };


  // close asset modal
  const closeAddAssetModal = () => props.closeAddAssetModal();
  return (
    <>
      <AMPModal
        show
        onHide={closeAddAssetModal}
        size="xl"
        backdrop="static"
        centered
      >
        <AMPModalHeader>{props.modalName}</AMPModalHeader>
        <AMPModalBody>
          <Container fluid>
            <div id="results" className="form-container2 bg-form">
              <CreateOrUpdateAsset
                wOrderId={props.wOrderId}
                manufacturer={props.manufacturer}
                partType={props.partType}
                isAssetEdit={props.isAssetEdit}
                closeAssetModal={props.closeAddAssetModal}
                isTempSerialNumber={isTempSerialNumber}
                isTempSerialNumberLoading={isTempSerialNumberLoading}
                tempSerialNumber={tempSerialNumber}
                genTempSerialNumber={genTempSerialNumber}
                offset={props.offset}
                perPage={props.perPage}
                setIsAssetLoading={props.setIsAssetLoading}
                ajaxAssetListObsv$={props.ajaxAssetListObsv$}
                openOrganizationModal={openOrganizationModal}
                organizationGroupId={organizationGroupId}
                customerId={customerId}
                organizationData={organizationData}
                setOrganizationData={setOrganizationData}
                organizationGroup={organizationGroup}
                setOrganizationGroup={setOrganizationGroup}
                isReceiving={props.isReceiving}
                status={props.status}
              />

              {showOrganizationModal && (
                <OrganizationModal
                  modalName="Change Organization Details"
                  closeOrganizationModal={closeOrganizationModal}
                  setOrganizationGroupId={setOrganizationGroupId}
                  setCustomerId={setCustomerId}
                  setOrganizationData={setOrganizationData}
                  organizationGroup={organizationGroup}
                  setOrganizationGroup={setOrganizationGroup}
                  context={context}
                />
              )}
            </div>
          </Container>
        </AMPModalBody>
        <AMPModalFooter></AMPModalFooter>
      </AMPModal>
    </>
  );
};

// Edit Asset Modal
