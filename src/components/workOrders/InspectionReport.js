import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactGA from 'react-ga';
import ReactPaginate from "react-paginate";
import { Redirect, useLocation } from "react-router-dom";
import AMPTooltip from "../common/AMPTooltip";
import {
  Row,
  Col,
  Table,
} from "react-bootstrap";
import { useReactToPrint } from "react-to-print";

import {
  DEFAULT_BASE_URL,
  VERSION,
  GET_INSPECTION_REPORT,
  ConstVariable,
  GET_INSPECTION_PICTURE_BY_ID_URL_FOR_REPORT,
  GET_DOWNLOAD__INSPECTIONREPORT_FROM_PUMPSSR,
} from "../common/const";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject } from "rxjs";
import { ampJsonAjax } from "../common/utils/ampAjax";
import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";
import { AMPToastConsts } from "../common/const/AMPToastConst";
import { toast } from "react-toastify";
import AMPLoader from "../common/AMPLoader";
import InspectionUploadedPictures from "./inspectionUploadedPictures";
import { useAccessState } from "../../utils/AppContext/loginContext";

const getInspectionReportAjaxObs$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax.get(URL + param).pipe(
        map((xhrResponse) => {
          return xhrResponse?.response;
        }),
        catchError((error) => {
          errorHandler(error.response);
          return [];
        })
      )
    )
  );

// view picture
const getPictureByIdAjaxObs$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax.get(URL + param?.pictureDetails?.item?.cur).pipe(
        map((xhrResponse) => {
          return { ...xhrResponse?.response, param };
        }),
        catchError((error) => {
          errorHandler(error.response);
          return [];
        })
      )
    )
  );
const inspectionNamingConvention = (name) => {
  switch (name) {
    case "LevelIDisassembly":
      return "Level I Disassembly";
    case "LevelIAssembly":
      return "Level I Assembly";
    case "LevelIFinal":
      return "Level I Final";
    case "FillPressureWash1":
      return "Fill Pressure Wash 1";
    case "TruckRemoval":
      return "Truck Removal"
    case "LevelIIDisassemblyInspection":
      return "Level II Disassembly Inspection";
    case "Paint1":
      return "Paint 1";
    case "LevelIIAssemblyInspection":
      return "Level II Assembly Inspection";
    case "AirTest1":
      return "Air Test 1";
    case "PerformanceTest":
      return "Performance Test";
    case "AirTest2":
      return "Air Test 2";
    case "PressureWash":
      return "Pressure Wash";
    case "Paint2":
      return "Paint 2";
    case "DataTag":
      return "Data Tag";
    case "TruckInstall":
      return "Truck Install"
    case "TruckOilChange":
      return "Truck Oil Change";
    case "LubePumpReplacement":
      return "Lube Pump Replacement";
    case "LevelIIFinalInspection":
      return "Level II Final Inspection";
    default:
      return name;
  }
};

export const InspectionReport = () => {
  const context = useAccessState();
  const locationRef = useLocation();
  const workId = locationRef?.state?.id || params.get("workOrderId");
  const status = locationRef?.state?.status || params.get("status");
  const isReceiving = locationRef?.state?.isReceiving;
  const workOrderNumber = locationRef?.state?.workOrderNumber;
  const serviceCenterId = locationRef?.state?.serviceCenterId;
  const workOrderAssetId = locationRef?.state?.assetInfo?.workorderAssetId;
  const [offset, setOffset] = useState(1);
  const [perPage] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const usePrintRef = useRef();
  const [loader, setLoader] = useState(false);
  const [inspectionReport, setInspectionReport] = useState(ConstVariable?.INIT);
  const [inspectionPicturesIds, setInspectionPicturesIds] = useState(null);
  const [showPicture, setShowPicture] = useState(null);
  const [isBack, setIsBack] = useState(false);
  const moveToBack = () => {
    setIsBack(true);
  };
  const handlePrint = useReactToPrint({
    content: () => usePrintRef.current,
  });

  // view picture
  const ajaxPictureByIdObsv$ = useMemo(() => {
    return getPictureByIdAjaxObs$(
      DEFAULT_BASE_URL + VERSION + GET_INSPECTION_PICTURE_BY_ID_URL_FOR_REPORT,
      {
        errorHandler: (error) => {
          setLoader(false);
          setShowPicture(null);
          toast.error(AMPToastConsts.PICTURE_VIEW_BY_ID_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  useObservableCallback(ajaxPictureByIdObsv$, (response) => {
    setLoader(false);
    if (response?.status) {
      setShowPicture({
        ...response?.content,
        ...response?.param?.pictureDetails?.item?.item,
        imageUploaded: response?.content?.fileBinary,
      }
      );
    } else {
      setShowPicture(null);
      toast.error(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });

  const ajaxInspectionReportObs$ = useMemo(() => {
    return getInspectionReportAjaxObs$(
      DEFAULT_BASE_URL + VERSION + GET_INSPECTION_REPORT,
      {
        errorHandler: (error) => {
          setLoader(false);
          toast.error(AMPToastConsts.GET_ASSET_REPORT_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);

  useObservableCallback(ajaxInspectionReportObs$, (response) => {
    if (response?.status) {
      setLoader(false);
      setInspectionReport(response?.content);
      // To merge inspection type and inspection id together
      var inspectionPictureIds = response?.content?.inspectionDetailReports?.map((item, index) => {
        const newValues = item?.inspectionQuestionPictureIds?.reduce((acc, cur) => {
          return acc.concat({ item, cur });
        }, []);
        return newValues;
      });
      var data = inspectionPictureIds?.map((itm, id) => {
        var data1 = itm?.map((item) => {
          return { item, ...inspectionPictureIds?.item }

        });
        return data1;
      });
      var merged = [].concat.apply([], data);
      setInspectionPicturesIds(merged);
      setPageCount(merged?.length + 1)
    } else {
      setLoader(false);
      setInspectionReport("");
    }
  });

  useEffect(() => {
    if (workOrderAssetId) {
      setLoader(true);
      ajaxInspectionReportObs$.next(workOrderAssetId);
    }
  }, [workOrderAssetId]);
  // For google analytics purpose
  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, [])
  // on Paginationation click
  const handlePageClick = (e) => {
    setShowPicture(null);
    const selectedPage = e.selected;
    setOffset(selectedPage + 1);
    if (selectedPage !== 0) {
      setLoader(true);
      const [pictureDetails] = inspectionPicturesIds.filter((x, idx) => idx + 1 === selectedPage).map(x => x);
      ajaxPictureByIdObsv$.next({ pictureDetails: pictureDetails })
    }
  };


  useEffect(() => {
    if (offset === 1) {
      var canvas = document.getElementById('image');
      var ctx = canvas?.getContext('2d');

      var img = new Image();

      img.onload = function () {
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        ctx.drawImage(img, 0, 0);
      }
      img.src = inspectionReport?.signatureUploaded;
    }
  }, [inspectionReport, offset])

  //For download pdf from server side rendering
  const handleDownload = () => {
    window.location.href = DEFAULT_BASE_URL + GET_DOWNLOAD__INSPECTIONREPORT_FROM_PUMPSSR + workOrderAssetId + "&token=" + context?.token;
    //window.location.href = "http://localhost:4452"+GET_DOWNLOAD__INSPECTIONREPORT_FROM_PUMPSSR + workOrderAssetId +"&token=" +context?.token
  }
  return (
    <>
      {isBack && (
        <Redirect
          to={{
            pathname: "/Pump/CreateOrUpdateAsset",
            state: {
              isCreate: false,
              id: workId,
              status: status,
              showAssetOrReceivingOrWorkForBack: true,
              isReceiving: false,
              backForm: "workOrder",
              serviceCenterId: serviceCenterId,
              workOrderNumber: workOrderNumber,
            },
          }}
        />
      )}
      <div>
        <AMPLoader isLoading={loader} />
        <p>
          <span className="receiving-tag">Inspection Report</span>

          <div className="float-right mt-3 mr-4">
            <button onClick={handlePrint}>
              <i className="fa fa-print" aria-hidden="true"></i> Print
            </button>
          </div>
          <div className="float-right mt-3 mr-4">
            <button onClick={handleDownload} >
              Download Pdf
            </button>
          </div>
          <div className="float-left btn-control-action-icons-group mb-1 ml-2">
            <button
              aria-label="Back"
              name="Back"
              type="button"
              className="amp-button button-mini mt-2 icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-lg"
              onClick={moveToBack}
            >
              <AMPTooltip text="Back">
                <svg
                  fill="currentColor"
                  viewBox="0 0 512 512"
                  xmlns="http://www.w3.org/2000/svg"
                  className="svg-inline--fa ifx-svg-icon ifx-svg-back fa-w-16 ifx-icon"
                >
                  <path
                    d="M256,0C114.844,0,0,114.844,0,256s114.844,256,256,256s256-114.844,256-256S397.156,0,256,0z M256,490.667
                                    C126.604,490.667,21.333,385.396,21.333,256S126.604,21.333,256,21.333S490.667,126.604,490.667,256S385.396,490.667,256,490.667
                                    z"
                  ></path>
                  <path
                    d="M394.667,245.333H143.083l77.792-77.792c4.167-4.167,4.167-10.917,0-15.083c-4.167-4.167-10.917-4.167-15.083,0l-96,96
                                    c-4.167,4.167-4.167,10.917,0,15.083l96,96c2.083,2.083,4.813,3.125,7.542,3.125c2.729,0,5.458-1.042,7.542-3.125
                                    c4.167-4.167,4.167-10.917,0-15.083l-77.792-77.792h251.583c5.896,0,10.667-4.771,10.667-10.667S400.563,245.333,394.667,245.333
                                    z"
                  ></path>
                </svg>
              </AMPTooltip>
            </button>
          </div>
        </p>
        <div ref={usePrintRef}>
          {offset === 1 ? (<AssetInspectionReport
            inspectionReport={inspectionReport}
            workOrderNumber={workOrderNumber}
            assetInfo={locationRef?.state?.assetInfo}
            usePrintRef={usePrintRef}
            handlePrint={handlePrint}
          />) :
            (<InspectionUploadedPictures showPicture={showPicture} reportData={inspectionReport} inspectionNamingConvention={inspectionNamingConvention} usePrintRef={usePrintRef} />)}
          <Row>
            <Col className="p-0 px-sm-3 mb-5">
              <ReactPaginate
                previousLabel={"prev"}
                nextLabel={"next"}
                breakLabel={"..."}
                breakClassName={"break-me"}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageClick}
                containerClassName={"pagination d-flex justify-content-center"}
                subContainerClassName={"pages pagination"}
                activeClassName={"active"}
              />
            </Col>
          </Row>
          <Row className="form-container inspection-report-font mx-4 px-4  py-2 mb-5"><Col>
            <p className="text-center font-italic disclaimer_font-family">This document confirms that if the inspected item was manufactured by SPM™ Oil & Gas, it meets all standards and specification requirements of SPM™ Oil & Gas according to SPM™ Oil & Gas quality management systems, and has been serviced in accordance with applicable SPM™ Oil & Gas standards and customer or OEM standards and guidelines, where otherwise required and provided to SPM™ Oil & Gas for the purpose of these services.
            </p>
            <p className="text-center font-italic disclaimer_font-family pb-5">
              For Additional Inspection Information, please visit amp.spmoilandgas.com</p>
          </Col></Row>
        </div>
      </div>
    </>
  );
};

export const AssetInspectionReport = ({
  inspectionReport,
  workOrderNumber,
  assetInfo,
  usePrintRef,
  handlePrint,
}) => {

  return (
    <div
      //ref={usePrintRef}
      id="results"
      className="form-container inspection-report-font mx-4 px-4 bg-form py-2 mb-5"
    >
      <Row className="text-center">
        <Col lg="2" md="2" sm="2" xs="2">
          <img
            src="src/styles/images/Logo_SPM.png"
            height="40px"
            width="150px"
          />
        </Col>

        <Col lg="8" md="8" sm="8" xs="8" className="text-center">
          <h3>Inspection Report</h3>
        </Col>
      </Row>
      <Col>
        <Row className="mt-4 p-2 border-top">
          <Col md="6" lg="6" xs="6" sm="6">
            <span className="m-0 font-weight-bold">Work Order Number: </span><span className="m-0">{inspectionReport?.workorderNumber}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
            <span className="m-0 font-weight-bold" >Manufacturer Serial Number:</span><span className="m-0"> {inspectionReport?.workorderAssetResponse?.manufacturerSerialNumber}</span>
          </Col>
          <Col md="12" lg="12" xs="12" sm="12">
            <span className="m-0 font-weight-bold" >Part Number:</span><span className="m-0"> {inspectionReport?.workorderAssetResponse?.partType}
              {inspectionReport?.workorderAssetResponse
                ?.partDescription && (
                  <>
                    (
                    {
                      inspectionReport?.workorderAssetResponse
                        ?.partDescription
                    }
                    )
                  </>
                )}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
            <span className="m-0 font-weight-bold" >Manufacturer:</span><span className="m-0">  {inspectionReport?.workorderAssetResponse?.manufacturer}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
            <span className="m-0 font-weight-bold" >Service Center:</span><span className="m-0"> {inspectionReport?.serviceCentre}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
            <span className="m-0 font-weight-bold" >Customer: </span><span className="m-0">{inspectionReport?.workorderAssetResponse?.customer}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
            <span className="m-0 font-weight-bold" >Area: </span><span className="m-0">{inspectionReport?.workorderAssetResponse?.area}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
            <span className="m-0 font-weight-bold" >Region: </span><span className="m-0">{inspectionReport?.workorderAssetResponse?.region}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
            <span className="m-0 font-weight-bold" >District: </span><span className="m-0">{inspectionReport?.workorderAssetResponse?.district}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
            <span className="m-0 font-weight-bold" >Group/unit: </span><span className="m-0">{inspectionReport?.workorderAssetResponse?.group}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
            <span className="m-0 font-weight-bold" >Received On: </span><span className="m-0">{inspectionReport?.receivedOn}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
            <span className="m-0 font-weight-bold" >Received By: </span><span className="m-0"> {inspectionReport?.receiviedBy}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
            <span className="m-0 font-weight-bold" >Work Order Status: </span><span className="m-0"> {inspectionReport?.status}</span>
          </Col>
        </Row>
      </Col>
      <Row className="mt-2 p-2">
        <Col>
          <h5>
            Inspection Result
            {inspectionReport?.inspectionLevel && (
              <>
                {" "}
                (
                {inspectionReport?.inspectionLevel === ConstVariable?.PL1 && (
                  <span className="inspection-report-level">Pump Level 1</span>
                )}
                {inspectionReport?.inspectionLevel === ConstVariable?.PL2 && (
                  <span className="inspection-report-level">Pump Level 2</span>
                )}
                {inspectionReport?.inspectionLevel === ConstVariable?.OPMINSP && (
                  <span className="inspection-report-level">OPM Inspection</span>
                )}
                )
              </>
            )}
          </h5>
        </Col>
      </Row>
      {inspectionReport?.workorderType === ConstVariable?.WTPUMP && (
        <>
          <Row>
            {inspectionReport !== ConstVariable?.INIT &&
              inspectionReport?.inspectionDetailReports?.length > 0 && (
                <Col>
                  <Table striped bordered hover responsive size="sm">
                    <thead>
                      <tr className="text-center">
                        <th>Inspection</th>
                        <th>Status</th>
                        <th>Inspected Date</th>
                        <th>Inspected By</th>
                        <th style={{ width: "30%" }}>Comments</th>
                      </tr>
                    </thead>
                    <tbody className="fn-14">
                      {inspectionReport?.inspectionDetailReports?.map(
                        (itm, idx) => {
                          return (
                            <tr key={idx} className="text-center">
                              <td className="text-break description_text">
                                {inspectionNamingConvention(itm?.inspectionType)}
                              </td>
                              <td className="text-break description_text">{itm?.status}</td>
                              <td className="text-break description_text">{itm?.completionDate}</td>
                              <td className="text-break description_text">{itm?.inspectedBy}</td>
                              <td style={{ width: "30%" }} className="text-break description_text">{itm?.comments}</td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </Table>
                </Col>
              )}
            {inspectionReport !== ConstVariable?.INIT &&
              !inspectionReport?.inspectionDetailReports && (
                <Col className="text-center text-danger">
                  <span>No Data Found</span>
                </Col>
              )}
          </Row>
          {(inspectionReport?.inspectionLevel === ConstVariable?.PL1 ||
            inspectionReport?.inspectionLevel === ConstVariable?.PL2) && (
              <>
                <Row className="mt-2 p-2 ">
                  <Col>
                    <h5>Replacement Components</h5>
                  </Col>
                </Row>
                <Row>
                  {inspectionReport !== ConstVariable?.INIT &&
                    inspectionReport?.partReplacementComponentResponses?.length >
                    0 && (
                      <Col>
                        <Table striped bordered hover responsive size="sm">
                          <thead>
                            <tr className="text-center">
                              <th>Part Number</th>
                              <th>Description</th>
                              <th>Quantity Needed</th>
                              <th>Stock Availability</th>
                              <th style={{ width: "30%" }}>Comments</th>
                            </tr>
                          </thead>
                          <tbody className="fn-14">
                            {inspectionReport?.partReplacementComponentResponses?.map(
                              (itm, idx) => {
                                return (
                                  <tr key={idx} className="text-center">
                                    <td className="text-break description_text">{itm?.partNumber}</td>
                                    <td className="text-break description_text">{itm?.description}</td>
                                    <td className="text-break description_text">{itm?.quantityNeeded}</td>
                                    <td className="text-break description_text">{itm?.stockAvailability}</td>
                                    <td style={{ width: "30%" }} className="text-break description_text">{itm?.comments}</td>
                                  </tr>
                                );
                              }
                            )}
                          </tbody>
                        </Table>
                      </Col>
                    )}
                  {inspectionReport !== ConstVariable?.INIT &&
                    !inspectionReport?.partReplacementComponentResponses && (
                      <Col className="text-center text-danger">
                        <span>No Data Found</span>
                      </Col>
                    )}
                </Row>
              </>
            )}

          {inspectionReport?.inspectionLevel === ConstVariable?.PL2 && (
            <>
              <Row className="mt-2 p-2 ">
                <Col>
                  <h5>Part Details</h5>
                </Col>
              </Row>
              <Row>
                {inspectionReport !== ConstVariable?.INIT &&
                  inspectionReport?.levelIIAssemblyPartDetails?.length > 0 && (
                    <Col>
                      <Table striped bordered hover responsive size="sm">
                        <thead>
                          <tr className="text-center">
                            <th>Part Number</th>
                            <th>Serial Number</th>
                            <th>Heat Code</th>
                            <th>PO Number</th>
                          </tr>
                        </thead>
                        <tbody className="fn-14">
                          {inspectionReport?.levelIIAssemblyPartDetails?.map(
                            (itm, idx) => {
                              return (
                                <tr key={idx} className="text-center">
                                  <td className="text-break description_text">{itm?.partNumber}</td>
                                  <td className="text-break description_text">{itm?.serialNumber}</td>
                                  <td className="text-break description_text">{itm?.heatCode}</td>
                                  <td className="text-break description_text">{itm?.poNumber}</td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </Table>
                    </Col>
                  )}
                {inspectionReport !== ConstVariable?.INIT &&
                  (!inspectionReport?.levelIIAssemblyPartDetails ||
                    inspectionReport?.levelIIAssemblyPartDetails.length < 1) && (
                    <Col className="text-center text-danger">
                      <span>No Data Found</span>
                    </Col>
                  )}
              </Row>
            </>
          )}

          {(inspectionReport?.inspectionLevel === ConstVariable?.PL1 ||
            inspectionReport?.inspectionLevel === ConstVariable?.PL2) && (
              <>
                <Row className="mt-2 p-2 ">
                  <Col>
                    <h5>Clearance Range Details</h5>
                  </Col>
                </Row>
                <Row>
                  {inspectionReport !== ConstVariable?.INIT &&
                    inspectionReport?.clearanceRangeDetails?.length > 0 && (
                      <Col>
                        <Table striped bordered hover responsive size="sm">
                          <thead>
                            <tr className="text-center">
                              <th>Part Number</th>
                              <th>Bearing</th>
                              <th>Guage</th>
                              <th>Min</th>
                              <th>Max</th>
                              <th>Reading</th>
                              <th style={{ width: "30%" }}>Comments</th>
                            </tr>
                          </thead>
                          <tbody className="fn-14">
                            {inspectionReport?.clearanceRangeDetails?.map(
                              (itm, idx) => {
                                return (
                                  <tr key={idx} className="text-center">
                                    <td className="text-break description_text">{itm?.partNumber}</td>
                                    <td className="text-break description_text">Bearing {itm?.bearingSequenceNumber}</td>
                                    <td className="text-break description_text">{itm?.gauge}</td>
                                    <td className="text-break description_text">{itm?.minimumValue}</td>
                                    <td className="text-break description_text">{itm?.maximumValue}</td>
                                    <td className="text-break description_text">{itm?.readingValue}</td>
                                    <td style={{ width: "30%" }} className="text-break description_text">{itm?.comment}</td>
                                  </tr>
                                );
                              }
                            )}
                          </tbody>
                        </Table>
                      </Col>
                    )}
                  {inspectionReport !== ConstVariable?.INIT &&
                    !inspectionReport?.clearanceRangeDetails && (
                      <Col className="text-center text-danger">
                        <span>No Data Found</span>
                      </Col>
                    )}
                </Row>
              </>
            )}

          {(inspectionReport?.inspectionLevel === ConstVariable?.PL1 ||
            inspectionReport?.inspectionLevel === ConstVariable?.PL2) && (
              <>
                <Row className="mt-2 p-2 ">
                  <Col>
                    <h5>Torque Range Details</h5>
                  </Col>
                </Row>
                <Row>
                  {inspectionReport !== ConstVariable?.INIT &&
                    inspectionReport?.torqueRangeDetails?.length > 0 && (
                      <Col>
                        <Table striped bordered hover responsive size="sm">
                          <thead>
                            <tr className="text-center">
                              <th>Part Number</th>
                              <th>Bearing</th>
                              <th>Guage</th>
                              <th>Min</th>
                              <th>Max</th>
                              <th>Reading</th>
                              <th style={{ width: "30%" }}>Comments</th>
                            </tr>
                          </thead>
                          <tbody className="fn-14">
                            {inspectionReport?.torqueRangeDetails?.map((itm, idx) => {
                              return (
                                <tr key={idx} className="text-center">
                                  <td className="text-break description_text">{itm?.partNumber}</td>
                                  <td className="text-break description_text">Bearing {itm?.bearingSequenceNumber}</td>
                                  <td className="text-break description_text">{itm?.gauge}</td>
                                  <td className="text-break description_text">{itm?.minimumValue}</td>
                                  <td className="text-break description_text">{itm?.maximumValue}</td>
                                  <td className="text-break description_text">{itm?.readingValue}</td>
                                  <td style={{ width: "30%" }} className="text-break description_text">{itm?.comment}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </Col>
                    )}
                  {inspectionReport !== ConstVariable?.INIT &&
                    !inspectionReport?.torqueRangeDetails && (
                      <Col className="text-center text-danger">
                        <span>No Data Found</span>
                      </Col>
                    )}
                </Row>
              </>
            )}
        </>
      )}

      {inspectionReport?.workorderType === ConstVariable?.WTOPM && (
        <>
          {inspectionReport !== ConstVariable?.INIT &&
            inspectionReport?.preInspectionCheck && (
              <>
                <Row className="mt-2 p-2 ">
                  <Col>
                    <h5 className="text-white bg-secondary p-1">Pre-Inspection Check</h5>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Table striped bordered hover responsive size="sm">
                      <thead>
                        <tr className="text-center">
                          <th>Inspection</th>
                          <th>Status</th>
                          <th>Inspected Date</th>
                          <th>Inspected By</th>
                          <th style={{ width: "30%" }}>Comments</th>
                        </tr>
                      </thead>
                      <tbody className="fn-14">
                        <tr className="text-center">
                          <td className="text-break description_text">
                            Pre-Inspection Check
                          </td>
                          <td className="text-break description_text">{inspectionReport?.preInspectionCheck?.status}</td>
                          <td className="text-break description_text">{inspectionReport?.preInspectionCheck?.completionDate}</td>
                          <td className="text-break description_text">{inspectionReport?.preInspectionCheck?.inspectedBy}</td>
                          <td style={{ width: "30%" }} className="text-break description_text">{inspectionReport?.preInspectionCheck?.comments}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <span className="mx-0 px-0 inspection-report-font-weight">Bearing Bore Details</span>
                  </Col>
                </Row>
                <Row>
                  {inspectionReport?.preInspectionCheck?.inspectionBearingBoreDetailResponses?.length > 0 && (
                    <Col>
                      <Table striped bordered hover responsive size="sm">
                        <thead>
                          <tr className="text-center">
                            <th>Bearing</th>
                            <th>Location A</th>
                            <th>Location B</th>
                          </tr>
                        </thead>
                        <tbody className="fn-14">
                          <>
                            {inspectionReport?.preInspectionCheck?.inspectionBearingBoreDetailResponses?.map((itm, idx) => {
                              return (
                                <tr key={idx} className="text-center">
                                  <td className="text-break description_text">Bearing {itm?.borecount}</td>
                                  <td className="text-break description_text">{itm?.readings[0]?.value}</td>
                                  <td className="text-break description_text">{itm?.readings[1]?.value}</td>
                                </tr>
                              )
                            })}
                          </>
                        </tbody>
                      </Table>
                    </Col>
                  )}
                  {inspectionReport !== ConstVariable?.INIT &&
                    inspectionReport?.preInspectionCheck?.inspectionBearingBoreDetailResponses?.length === 0 && (
                      <Col className="text-center text-danger">
                        <span>No Data Found</span>
                      </Col>
                    )}
                </Row>
                <Row className="mt-2 p-2 ">
                  <Col>
                    <span className="mx-0 px-0 inspection-report-font-weight">Line Bore Details</span>
                  </Col>
                </Row>
                <Row>
                  {inspectionReport?.preInspectionCheck?.inspectionLineBoreDetailResponses?.length > 0 && (
                    <Col>
                      <Table striped bordered hover responsive size="sm">
                        <thead>
                          <tr className="text-center">
                            <th>Bearing</th>
                            <th>TOP</th>
                            <th>NOSE</th>
                            <th>REAR</th>
                            <th>Bottom</th>
                          </tr>
                        </thead>
                        <tbody className="fn-14">
                          <>
                            {inspectionReport?.preInspectionCheck?.inspectionLineBoreDetailResponses?.map((itm, idx) => {
                              return (
                                <tr key={idx} className="text-center">
                                  <td className="text-break description_text">Bearing {itm?.borecount}</td>
                                  <td className="text-break description_text">{itm?.readings[0]?.value}</td>
                                  <td className="text-break description_text">{itm?.readings[1]?.value}</td>
                                  <td className="text-break description_text">{itm?.readings[2]?.value}</td>
                                  <td className="text-break description_text">{itm?.readings[3]?.value}</td>
                                </tr>
                              )
                            })}
                          </>
                        </tbody>
                      </Table>
                    </Col>
                  )}
                  {inspectionReport !== ConstVariable?.INIT &&
                    inspectionReport?.preInspectionCheck?.inspectionLineBoreDetailResponses?.length === 0 && (
                      <Col className="text-center text-danger">
                        <span>No Data Found</span>
                      </Col>
                    )}
                </Row>
                <Row className="mt-2 p-2 ">
                  <Col>
                    <span className="mx-0 px-0 inspection-report-font-weight">Center Line Details</span>
                  </Col>
                </Row>
                <Row>
                  {inspectionReport?.preInspectionCheck?.inspectionCenterlineDetailResponses?.length > 0 && (
                    <Col>
                      <Table striped bordered hover responsive size="sm">
                        <thead>
                          <tr className="text-center">
                            <th>Location</th>
                            <th>Drive Side</th>
                            <th>Non-Drive Side</th>
                          </tr>
                        </thead>
                        <tbody className="fn-14">
                          <>
                            {inspectionReport?.preInspectionCheck?.inspectionCenterlineDetailResponses?.map((itm, idx) => {
                              return (
                                <tr key={idx} className="text-center">
                                  <td className="text-break description_text">{itm?.boreLocationType}</td>
                                  <td className="text-break description_text">{itm?.driveSideValue}</td>
                                  <td className="text-break description_text">{itm?.nonDriveSideValue}</td>
                                </tr>
                              )
                            })}
                          </>
                        </tbody>
                      </Table>
                    </Col>
                  )}
                  {inspectionReport !== ConstVariable?.INIT &&
                    inspectionReport?.preInspectionCheck?.inspectionCenterlineDetailResponses?.length === 0 && (
                      <Col className="text-center text-danger">
                        <span>No Data Found</span>
                      </Col>
                    )}
                </Row>
                <Row className="mt-2 p-2 ">
                  <Col>
                    <span className="mx-0 px-0 inspection-report-font-weight">Cylinder Line Details</span>
                  </Col>
                </Row>
                <Row>
                  {inspectionReport?.preInspectionCheck?.inspectionCylinderDetailResponses?.length > 0 && (
                    <Col>
                      <Table striped bordered hover responsive size="sm">
                        <thead>
                          <tr className="text-center">
                            <th>Location</th>
                            <th>Cylinder</th>
                            <th>Reading</th>
                          </tr>
                        </thead>
                        <tbody className="fn-14">
                          <>
                            {inspectionReport?.preInspectionCheck?.inspectionCylinderDetailResponses?.map((itm, idx) => {
                              return (
                                <tr key={idx} className="text-center">
                                  <td className="text-break description_text">{itm?.boreLocationType}</td>
                                  <td className="text-break description_text">{itm?.cylinderType}</td>
                                  <td className="text-break description_text">{itm?.readingValue}</td>
                                </tr>
                              )
                            })}
                          </>
                        </tbody>
                      </Table>
                    </Col>
                  )}
                  {inspectionReport !== ConstVariable?.INIT &&
                    inspectionReport?.preInspectionCheck?.inspectionCylinderDetailResponses?.length === 0 && (
                      <Col className="text-center text-danger">
                        <span>No Data Found</span>
                      </Col>
                    )}
                </Row>
              </>
            )}
          {inspectionReport !== ConstVariable?.INIT &&
            inspectionReport?.postInspectionReview && (
              <>
                <Row className="mt-2 p-2 ">
                  <Col>
                    <h5 className="text-white bg-secondary p-1">Post-Inspection Review</h5>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Table striped bordered hover responsive size="sm">
                      <thead>
                        <tr className="text-center">
                          <th>Inspection</th>
                          <th>Status</th>
                          <th>Inspected Date</th>
                          <th>Inspected By</th>
                          <th style={{ width: "30%" }}>Comments</th>
                        </tr>
                      </thead>
                      <tbody className="fn-14">
                        <tr className="text-center">
                          <td className="text-break description_text">
                            Post-Inspection Review
                          </td>
                          <td className="text-break description_text">{inspectionReport?.postInspectionReview?.status}</td>
                          <td className="text-break description_text">{inspectionReport?.postInspectionReview?.completionDate}</td>
                          <td className="text-break description_text">{inspectionReport?.postInspectionReview?.inspectedBy}</td>
                          <td style={{ width: "30%" }} className="text-break description_text">{inspectionReport?.postInspectionReview?.comments}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>
                </Row>
                <Row className="mt-2 p-2 ">
                  <Col>
                    <span className="mx-0 px-0 inspection-report-font-weight">Bearing Bore Details</span>
                  </Col>
                </Row>
                <Row>
                  {inspectionReport?.postInspectionReview?.inspectionBearingBoreDetailResponses?.length > 0 && (
                    <Col>
                      <Table striped bordered hover responsive size="sm">
                        <thead>
                          <tr className="text-center">
                            <th>Bearing</th>
                            <th>Location A</th>
                            <th>Location B</th>
                          </tr>
                        </thead>
                        <tbody className="fn-14">
                          <>
                            {inspectionReport?.postInspectionReview?.inspectionBearingBoreDetailResponses?.map((itm, idx) => {
                              return (
                                <tr key={idx} className="text-center">
                                  <td className="text-break description_text">Bearing {itm?.borecount}</td>
                                  <td className="text-break description_text">{itm?.readings[0]?.value}</td>
                                  <td className="text-break description_text">{itm?.readings[1]?.value}</td>
                                </tr>
                              )
                            })}
                          </>
                        </tbody>
                      </Table>
                    </Col>
                  )}
                  {inspectionReport !== ConstVariable?.INIT &&
                    inspectionReport?.postInspectionReview?.inspectionBearingBoreDetailResponses?.length === 0 && (
                      <Col className="text-center text-danger">
                        <span>No Data Found</span>
                      </Col>
                    )}
                </Row>
                <Row className="mt-2 p-2 ">
                  <Col>
                    <span className="mx-0 px-0 inspection-report-font-weight">Line Bore Details</span>
                  </Col>
                </Row>
                <Row>
                  {inspectionReport?.postInspectionReview?.inspectionLineBoreDetailResponses?.length > 0 && (
                    <Col>
                      <Table striped bordered hover responsive size="sm">
                        <thead>
                          <tr className="text-center">
                            <th>Bearing</th>
                            <th>TOP</th>
                            <th>NOSE</th>
                            <th>REAR</th>
                            <th>Bottom</th>
                          </tr>
                        </thead>
                        <tbody className="fn-14">
                          <>
                            {inspectionReport?.postInspectionReview?.inspectionLineBoreDetailResponses?.map((itm, idx) => {
                              return (
                                <tr key={idx} className="text-center">
                                  <td className="text-break description_text">Bearing {itm?.borecount}</td>
                                  <td className="text-break description_text">{itm?.readings[0]?.value}</td>
                                  <td className="text-break description_text">{itm?.readings[1]?.value}</td>
                                  <td className="text-break description_text">{itm?.readings[2]?.value}</td>
                                  <td className="text-break description_text">{itm?.readings[3]?.value}</td>
                                </tr>
                              )
                            })}
                          </>
                        </tbody>
                      </Table>
                    </Col>
                  )}
                  {inspectionReport !== ConstVariable?.INIT &&
                    inspectionReport?.postInspectionReview?.inspectionLineBoreDetailResponses?.length === 0 && (
                      <Col className="text-center text-danger">
                        <span>No Data Found</span>
                      </Col>
                    )}
                </Row>
                <Row className="mt-2 p-2 ">
                  <Col>
                    <span className="mx-0 px-0 inspection-report-font-weight">Center Line Details</span>
                  </Col>
                </Row>
                <Row>
                  {inspectionReport?.postInspectionReview?.inspectionCenterlineDetailResponses?.length > 0 && (
                    <Col>
                      <Table striped bordered hover responsive size="sm">
                        <thead>
                          <tr className="text-center">
                            <th>Location</th>
                            <th>Drive Side</th>
                            <th>Non-Drive Side</th>
                          </tr>
                        </thead>
                        <tbody className="fn-14">
                          <>
                            {inspectionReport?.postInspectionReview?.inspectionCenterlineDetailResponses?.map((itm, idx) => {
                              return (
                                <tr key={idx} className="text-center">
                                  <td className="text-break description_text">{itm?.boreLocationType}</td>
                                  <td className="text-break description_text">{itm?.driveSideValue}</td>
                                  <td className="text-break description_text">{itm?.nonDriveSideValue}</td>
                                </tr>
                              )
                            })}
                          </>
                        </tbody>
                      </Table>
                    </Col>
                  )}
                  {inspectionReport !== ConstVariable?.INIT &&
                    inspectionReport?.postInspectionReview?.inspectionCenterlineDetailResponses?.length === 0 && (
                      <Col className="text-center text-danger">
                        <span>No Data Found</span>
                      </Col>
                    )}
                </Row>
                <Row className="mt-2 p-2 ">
                  <Col>
                    <span className="mx-0 px-0 inspection-report-font-weight">Cylinder Line Details</span>
                  </Col>
                </Row>
                <Row>
                  {inspectionReport?.postInspectionReview?.inspectionCylinderDetailResponses?.length > 0 && (
                    <Col>
                      <Table striped bordered hover responsive size="sm">
                        <thead>
                          <tr className="text-center">
                            <th>Location</th>
                            <th>Cylinder</th>
                            <th>Reading</th>
                          </tr>
                        </thead>
                        <tbody className="fn-14">
                          <>
                            {inspectionReport?.postInspectionReview?.inspectionCylinderDetailResponses?.map((itm, idx) => {
                              return (
                                <tr key={idx} className="text-center">
                                  <td className="text-break description_text">{itm?.boreLocationType}</td>
                                  <td className="text-break description_text">{itm?.cylinderType}</td>
                                  <td className="text-break description_text">{itm?.readingValue}</td>
                                </tr>
                              )
                            })}
                          </>
                        </tbody>
                      </Table>
                    </Col>
                  )}
                  {inspectionReport !== ConstVariable?.INIT &&
                    inspectionReport?.postInspectionReview?.inspectionCylinderDetailResponses?.length === 0 && (
                      <Col className="text-center text-danger">
                        <span>No Data Found</span>
                      </Col>
                    )}
                </Row>
              </>
            )}
        </>
      )}

    </div>
  );
};
