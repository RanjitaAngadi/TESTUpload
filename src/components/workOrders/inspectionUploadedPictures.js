import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";

import { Form, Row, Col, Button, Container, Table } from "react-bootstrap";

const InspectionUploadedPictures = (props) => {
  const { reportData, inspectionNamingConvention, usePrintRef } = props;
  return (
    <div className="form-container receiving-report-font mx-4 px-4 bg-form py-2 mb-5" >
      <Row >
        <Col lg="2" md="2" sm="2" xs="2">
          <img
            src="src/styles/images/Logo_SPM.png"
            height="40px"
            width="150px"
          />
        </Col>
      </Row>
      <Col>
        <Row className="mt-4 p-2 border-top">
          <Col md="6" lg="6" xs="6" xl="6">
            <span className="m-0 font-weight-bold">Work Order Number: </span><span className="m-0">{reportData?.workorderNumber}</span>
          </Col>
          <Col md="6" lg="6" xs="6" xl="6">
            <span className="m-0 font-weight-bold">Manufacturer Serial Number: </span><span className="m-0">{reportData?.workorderAssetResponse?.manufacturerSerialNumber}</span>
          </Col>
          <Col md="6" lg="6" xs="6" xl="6">
            <span className="m-0 font-weight-bold">Part Details: </span><span className="m-0">{reportData?.workorderAssetResponse?.partType}
              ({reportData?.workorderAssetResponse?.partDescription})</span>
          </Col>
          {props?.showPicture?.inspectionType && <Col md="6" lg="6" xs="6" xl="6">
            <span className="m-0 font-weight-bold">Inspection Name: </span> <span className="m-0">{inspectionNamingConvention(props?.showPicture?.inspectionType)}</span>
          </Col>}
          <Col md="6" lg="6" xs="6" xl="6">
            <span className="m-0 font-weight-bold">Image Title: </span><span className="m-0">{props?.showPicture?.name}</span>
          </Col>
          <Col md="6" lg="6" xs="6" xl="6">
            <span className="m-0 font-weight-bold">Description: </span> <span className="m-0">{props?.showPicture?.description}</span>
          </Col>

        </Row>
        <Row><Col>
          <div className="m-5 border text-center" >
            <img
              src={props?.showPicture?.imageUploaded} />
          </div>
        </Col></Row>
      </Col>
    </div>

  )
};
export default InspectionUploadedPictures;