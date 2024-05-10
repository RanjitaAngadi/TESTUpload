import React, { useState, useMemo, useEffect } from "react";
import { AMPTab } from "../../common/AMPTab";
import AMPFieldSet from "../../common/AMPFieldSet";
import AddOrEditAsset from "./addOrEditAsset";
import PartDetails from "./partDetails";
import ClearanceDetails from "./clearanceDetails";
import TorqueDetails from "./torqueDetails";
import { Link, withRouter, Redirect, useLocation } from "react-router-dom";
import AMPTooltip from "../../common/AMPTooltip";
import {
  DEFAULT_BASE_URL,
  VERSION,
  SERVICE_CENTER_GAUGE_IN_ASSET,
} from "../../common/const";
import {
  useObservable,
  useObservableCallback,
} from "../../common/hooks/useObservable";
import db from "./db.json";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import { ampJsonAjax } from "../../common/utils/ampAjax";
import { toast } from "react-toastify";

const AssetDetails = (props) => {
  const {
    //isAssetEdit,
    ajaxAssetListObsv$,
    manufacturer,
    partType,
    assetId,

    ajaxClearanceRangeComponentObsv$,
    gauge,
    setGuage,
    completed,
    inspectionTypeStatus,
    inspectionDetailId,
    ajaxPartDetailsComponentObsv$,

    location,
  } = props;
  const [activeKey, setActiveKey] = useState();
  const [showData, setShowData] = useState("0");
  const [alertErrorMessage, setAlertErrorMessage] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [isSubmit, setSubmit] = useState(false);
  const [showAssetForBack, setShowAssetForBack] = useState(false);

  const [isUpdate, setUpdate] = useState(false);

  const [showOrganizationModal, setShowOrganizationntModal] = useState(false);
  const [organizationGroup, setOrganizationGroup] = useState({});
  const openOrganizationModal = () => setShowOrganizationntModal(true);
  const closeOrganizationModal = () => setShowOrganizationntModal(false);

  const [organizationGroupId, setOrganizationGroupId] = useState();
  const [organizationData, setOrganizationData] = useState({});
  const [customerId, setCustomerId] = useState();

  const locationRef = useLocation();
  const isAssetEdit = locationRef?.state?.isAssetEdit;
  const data = locationRef?.state?.data;
  const type = locationRef?.state?.type;

  const [partTypeId, setPartTypeId] = useState();
  const handleSelect = (key) => {
    if (alertErrorMessage !== true) {
      setShowData(key);
    } else {
      setShowConfirmModal(key);
    }
  };
  const moveToBack = () => {
    setShowAssetForBack(true);
  };
  return (
    <div>
      <div>
        {showAssetForBack && (
          <Redirect
            to={{
              pathname: `/Pump/manageAssets`,
            }}
          />
        )}

        <p>
          <div className="mb-1 ml-2">
            <button
              aria-label="Back"
              name="Back"
              type="button"
              className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-lg"
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

            {!isAssetEdit ? (
              <span className="receiving-tag mx-1"> Add Asset</span>
            ) : (
              <span className="receiving-tag mx-1"> Edit Asset</span>
            )}
          </div>
        </p>
      </div>

      <div
        id="results"
        className="form-container bg-form GeeksforGeeks pt-1 pb-3"
      >
        <AMPFieldSet fieldBgColor="bg_lightGrey pl-0 pr-0 pt-0">
          <AMPTab
            className="pt-5"
            activeKey={showData}
            handleSelect={(e) => handleSelect(e)}
            onChange={(v) => {
              if (alertErrorMessage !== true) {
                setActiveKey(v);
              } else {
                setShowConfirmModal(true);
              }
            }}
            onclick={() => console.log("click")}
          >
            <div name="Asset Details">
              <AddOrEditAsset
                // isAssetEdit={true}
                // isSubmit={isSubmit}
                // setSubmit={setSubmit}
                manufacturer={manufacturer}
                partType={partType}
                offset={props.offset}
                perPage={props.perPage}
                ajaxAssetListObsv$={ajaxAssetListObsv$}
                organizationGroupId={organizationGroupId}
                customerId={customerId}
                organizationData={organizationData}
                setOrganizationData={setOrganizationData}
                organizationGroup={organizationGroup}
                setOrganizationGroup={setOrganizationGroup}
                // isUpdate={isUpdate}
                // setUpdate={setUpdate}
                location={location}
                setPartTypeId={setPartTypeId}
                ajaxPartDetailsComponentObsv$={ajaxPartDetailsComponentObsv$}
                gauge={gauge}
                setGuage={setGuage}
                ajaxClearanceRangeComponentObsv$={
                  ajaxClearanceRangeComponentObsv$
                }
              />
            </div>

            <div
              name="Part Details"
              //disabled={!isSubmit }
            >
              <PartDetails
                type={type}
                inspectionTypeStatus={inspectionTypeStatus}
                inspectionDetailId={inspectionDetailId}
                completed={completed}
                assetId={assetId}
                partTypeId={partTypeId}
                //setPartTypeId={setPartTypeId}
                alertErrorMessage={alertErrorMessage}
                setAlertErrorMessage={setAlertErrorMessage}
                ajaxPartDetailsComponentObsv$={ajaxPartDetailsComponentObsv$}
              />
            </div>

            <div
              name="Clearance Range Details"
              //disabled={!isSubmit}
            >
              <ClearanceDetails
                title="Clearance Range Details"
                partTypeId={partTypeId}
                assetId={assetId}
                ajaxClearanceRangeComponentObsv$={
                  ajaxClearanceRangeComponentObsv$
                }
                inspectionTypeStatus={inspectionTypeStatus}
                customerId={data?.customerId}
                manufacturerId={data?.manufacturerId}
                inspectionDetailId={inspectionDetailId}
                type={type}
                completed={completed}
                alertErrorMessage={alertErrorMessage}
                setAlertErrorMessage={setAlertErrorMessage}
                //serviceCenterGaugeObsv$={serviceCenterGaugeObsv$}
                gauge={gauge}
              />
            </div>
            <div
              name="Torque Range Details"
              //disabled={!isSubmit}
            >
              <TorqueDetails />
            </div>
          </AMPTab>
        </AMPFieldSet>
      </div>
    </div>
  );
};

export default AssetDetails;
