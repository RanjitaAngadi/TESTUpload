import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactGA from 'react-ga';
import ReactPaginate from "react-paginate";
import { Redirect, useLocation } from "react-router-dom";
import AMPTooltip from "../common/AMPTooltip";
import {
  Row,
  Col,
} from "react-bootstrap";
import { useReactToPrint } from "react-to-print";

import {
  DEFAULT_BASE_URL,
  VERSION,
  ConstVariable,
  GET_RECEIVING_REPORT,
  GET_RECEIVING_PICTURE,
  GET_DOWNLOAD__RECEIVINGREPORT_FROM_PUMPSSR,
} from "../common/const";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
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

const getReceivingReportAjaxObs$ = (URL, { errorHandler }) =>
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
      ampJsonAjax.get(URL + param.id).pipe(
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
  const getDownloadedReceivingReportAjaxObs$ = (URL, { errorHandler }) =>
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
export const ReceivingReport = () => {
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
  const [receivingReport, setReceivingReport] = useState(ConstVariable?.INIT);
  const [showPicture, setShowPicture] = useState(null);
  
  const [isBack, setIsBack] = useState(false);
  const moveToBack = () => {
    setIsBack(true);
  };
  const handlePrint = useReactToPrint({
    content: () => usePrintRef.current,
  });

  const ajaxReceivingReportObs$ = useMemo(() => {
    return getReceivingReportAjaxObs$(
      DEFAULT_BASE_URL + VERSION + GET_RECEIVING_REPORT,
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

  useObservableCallback(ajaxReceivingReportObs$, (response) => {
    if (response?.status) {
      setLoader(false);
      setReceivingReport(response?.content);
      setPageCount(response?.content?.receivingPictureIds?.length + 1)
    } else {
      setLoader(false);
      setReceivingReport("");
    }
  });

  //Download Pdf Receiving report file
  const ajaxDownloadedReceivingReportObs$ = useMemo(() => {
    return getDownloadedReceivingReportAjaxObs$(
      "http://localhost:4452/ReactSSR?id=" + workOrderAssetId +"&token=" +context?.token,
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

  useObservableCallback(ajaxDownloadedReceivingReportObs$, (response) => {
    if (response?.status) {
      setLoader(false);
      setReceivingReport(response?.content);
      setPageCount(response?.content?.receivingPictureIds?.length + 1)
    } else {
      setLoader(false);
      setReceivingReport("");
    }
  });
// view picture
const ajaxPictureByIdObsv$ = useMemo(() => {
  return getPictureByIdAjaxObs$(
    DEFAULT_BASE_URL + VERSION + GET_RECEIVING_PICTURE,
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
    setShowPicture(
      response?.content);
  } else {
    setShowPicture(null);
    toast.error(response?.message, {
      position: toast.POSITION.TOP_CENTER,
    });
  }
});
  useEffect(() => {
    if (workOrderAssetId) {
      setLoader(true);
      ajaxReceivingReportObs$.next(workOrderAssetId);
    }
  }, [workOrderAssetId]);
  // For google analytics purpose
 useEffect(()=>{
  ReactGA.pageview(window.location.pathname + window.location.search);
},[])
const handlePageClick = (e) => {
  setShowPicture(null);
 
  const selectedPage = e.selected;
  setOffset(selectedPage + 1);
  if(selectedPage !==0){
    setLoader(true);
  const [pictureId] = receivingReport?.receivingPictureIds.filter((x,idx) => idx+1 === selectedPage).map(x => x);
  ajaxPictureByIdObsv$.next({ id: pictureId })
  }
};
useEffect(() => {
  if(offset === 1){
  var canvas = document.getElementById('image');
  var ctx = canvas?.getContext('2d');

  var img = new Image();

  img.onload = function () {
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    ctx.drawImage(img, 0, 0);
  }
  img.src = receivingReport?.signatureUploaded;
}
}, [receivingReport,offset])


const handleDownload =()=>{
  //window.location.href= "http://localhost:4452"+GET_DOWNLOAD__RECEIVINGREPORT_FROM_PUMPSSR + workOrderAssetId +"&token=" +context?.token;
  window.location.href =DEFAULT_BASE_URL + GET_DOWNLOAD__RECEIVINGREPORT_FROM_PUMPSSR + workOrderAssetId +"&token=" +context?.token;
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
              isReceiving: true,
              backForm: "Receiving",
              serviceCenterId: serviceCenterId,
              workOrderNumber: workOrderNumber,
            },
          }}
        />
      )}
      <div>
        <AMPLoader isLoading={loader} />
        <p>
          <span className="receiving-tag">Receiving Report</span>
          
          <div className="float-right mt-3 mr-4">
            <button onClick={handlePrint}>
              <i className="fa fa-print" aria-hidden="true"></i> Print
            </button>
          </div>
          <div className="float-right mt-3 mr-4">
          <button onClick={handleDownload} >
          {/* <a href="http://localhost:3000/?exportPDF=true" download /> */}
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
        {offset === 1 ? (<AssetReceivingReport
          receivingReport={receivingReport}
          workOrderNumber={workOrderNumber}
          assetInfo={locationRef?.state?.assetInfo}
          usePrintRef={usePrintRef}
          handlePrint={handlePrint}
          handleDownload={handleDownload}
        />):
        (<InspectionUploadedPictures showPicture={showPicture} reportData={receivingReport} usePrintRef={usePrintRef}/>)}
        
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
                </div>
      </div>
    </>
  );
};

export const AssetReceivingReport = ({
  receivingReport,
  workOrderNumber,
  assetInfo,
  usePrintRef,
  handlePrint,
  handleDownload
}) => {

  return (
    <div
      // ref={usePrintRef}
      id="results"
      className="form-container receiving-report-font mx-4 px-4 bg-form py-2 mb-5 "
    >
    
      <Row >
      <Col lg="2" md="2" sm="2" xs="2">
      <img
            src="src/styles/images/Logo_SPM.png"
            height="40px"
            width="150px"
          />
        </Col>
     
        <Col lg="8" md="8" sm="8" xs="8" className="text-center">
          <h3>Receiving Report</h3>
        </Col>
      </Row>
      <div>
      
              <Row className="mt-4 p-2 border-top">
                <Col>
                  <h5>Work Order Details</h5>
                </Col>
              </Row>
              
      
        <Col>
        <Row>
       <Col md="6" lg="6" xs="6" sm="6">
       <span className="m-0 font-weight-bold">Work Order Number: </span><span className="m-0">{receivingReport?.workorderNumber}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
       <span className="m-0 font-weight-bold" >Service Center:</span><span className="m-0"> {receivingReport?.serviceCentre}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
       <span className="m-0 font-weight-bold" >Work Order Type:</span><span className="m-0"> {receivingReport?.workorderType}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
       <span className="m-0 font-weight-bold" >Work Order Status:</span><span className="m-0"> {receivingReport?.status}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
       <span className="m-0 font-weight-bold" >Customer:</span><span className="m-0"> {receivingReport?.workorderAssetResponse?.customer}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
       <span className="m-0 font-weight-bold" >Area:</span><span className="m-0"> {receivingReport?.workorderAssetResponse?.area}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
       <span className="m-0 font-weight-bold" >Region: </span><span className="m-0">{receivingReport?.workorderAssetResponse?.region}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
       <span className="m-0 font-weight-bold" >District: </span><span className="m-0">{receivingReport?.workorderAssetResponse?.district}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
       <span className="m-0 font-weight-bold" >Group/unit: </span><span className="m-0">{receivingReport?.workorderAssetResponse?.group}</span>
          </Col>
           
          </Row>
        </Col>
              <Row className="mt-4 p-2 border-top">
                <Col>
                  <h5>Asset Details :</h5>
                </Col>
              </Row>
              <Col>
        <Row>
       <Col md="6" lg="6" xs="6" sm="6">
       <span className="m-0 font-weight-bold" >Organization: </span><span className="m-0">{receivingReport?.workorderAssetResponse?.organizationGroup}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
       <span className="m-0 font-weight-bold" >Customer: </span><span className="m-0">{receivingReport?.workorderAssetResponse?.customer}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
       <span className="m-0 font-weight-bold" >Area: </span><span className="m-0">{receivingReport?.workorderAssetResponse?.area}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
       <span className="m-0 font-weight-bold" >Region: </span><span className="m-0">{receivingReport?.workorderAssetResponse?.region}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
       <span className="m-0 font-weight-bold" >District: </span><span className="m-0">{receivingReport?.workorderAssetResponse?.district}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
       <span className="m-0 font-weight-bold" >Group/unit: </span><span className="m-0">{receivingReport?.workorderAssetResponse?.group}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
       <span className="m-0 font-weight-bold" >Manufacturer Serial Number: </span><span className="m-0">{
                    receivingReport?.workorderAssetResponse
                      ?.manufacturerSerialNumber
                  }</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
       <span className="m-0 font-weight-bold" >Manufacturer: </span><span className="m-0">{
                    receivingReport?.workorderAssetResponse
                      ?.manufacturer
                  }</span>
        </Col>
         <Col md="12" lg="12" xs="12" sm="12">
       <span className="m-0 font-weight-bold" >Part Number: </span><span className="m-0">{receivingReport?.workorderAssetResponse?.partType}({
       receivingReport?.workorderAssetResponse?.partDescription})</span>
          </Col>
         
          </Row>
        </Col>
              <Row>
        
      </Row>
        <Row className="mt-4 p-2 border-top">
                <Col>
                  <h5>Receiving Details :</h5>
                </Col>
              </Row>
              <Col>
        <Row>
       {receivingReport?.receivedOn && !receivingReport?.expectedReceiveDate ? (<Col md="6" lg="6" xs="6" sm="6">
       <span className="m-0 font-weight-bold" >Received On: </span><span className="m-0">{receivingReport?.receivedOn}</span>
          </Col>):
          (<Col md="6" lg="6" xs="6" sm="6">
       <span className="m-0 font-weight-bold" >Expected Received Date: </span><span className="m-0">{receivingReport?.expectedReceiveDate}</span>
       </Col>)}  
          <Col md="6" lg="6" xs="6" sm="6">
       <span className="m-0 font-weight-bold" >QN Number: </span><span className="m-0">{receivingReport?.qnnumber}</span>
          </Col>
          <Col md="12" lg="12" xs="12" sm="12">
       <span className="m-0 font-weight-bold" >Comment: </span><span className="m-0 text-break description_text">{receivingReport?.comment}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
       <span className="m-0 font-weight-bold" >Received By: </span><span className="m-0">{receivingReport?.receiviedBy}</span>
          </Col>
          <Col md="6" lg="6" xs="6" sm="6">
          <span className="m-0 font-weight-bold" >Signature: </span><span className="m-0">{receivingReport?.signatureUploaded && (
                          <canvas id="image" className="wd-max-200 ht-max-100"></canvas>
                        )}
          </span>
                      </Col>
      
          </Row>
        </Col>
              <Row>
              
      
      </Row>
      </div>
           
    </div>
  );
};
