import React, { useState, useMemo, useEffect } from "react";
import { AMPAccordion } from "../../common/AMPAccordion";
import { useForm, Controller } from "react-hook-form";
import { Row, Col, Container } from "react-bootstrap";
import AMPLoader from "../../common/AMPLoader";
import { AMPFieldWrapper } from "../../common/AMPFieldWrapper";
import { AMPTextBox } from "../../common";
import AMPTooltip from "../../common/AMPTooltip";
import Select from "react-select";
import { toast } from "react-toastify";
import {
  useObservable,
  useObservableCallback,
} from "../../common/hooks/useObservable";
import {
  AccessProvider,
  useAccessDispatch,
  useAccessState,
} from "../../../utils/AppContext/loginContext";
import {
  ConstVariable,
  DEFAULT_BASE_URL,
  VERSION,
  GET_OR_POST_OR_UPDATE_FOR_MANAGE_ASSET,
  GET_PART_DETAILS_FOR_MANAGE_ASSET,
} from "../../common/const";
import { AMPToastConsts } from "../../common/const/AMPToastConst";
import complete_icon from "../../../styles/images/complete_icon.png";
import db from "./db.json";
import { Subject, throwError } from "rxjs";
import { ampJsonAjax } from "../../common/utils/ampAjax";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import useUnsavedChangesWarning from "../../common/hooks/useUnsavedChangesWarning";
import { Link, withRouter, Redirect, useLocation } from "react-router-dom";

const getPartDetailsComponentAjaxObs$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax
        .get(URL + "/" + params?.assetId + "/" + params?.partTypeId)
        .pipe(
          map((xhrResponse) => {
            return { ...xhrResponse?.response, params };
          }),
          catchError((error) => {
            errorHandler(error.response);
            return [];
          })
        )
    )
  );

// const getPartDetailsAjaxObs$ = () =>
//   new Subject().pipe(
//     mergeMap((params) =>
//       ampJsonAjax
//         .get(
//           DEFAULT_BASE_URL +
//             VERSION +
//             // GET_PART_DETAILS +
//             GET_PART_TYPE_COMPONENT_CLEARANCE_RANGE_IN_ASSET +
//             // `${params.assetId}/${params.partTypeId}`
//             params?.assetId + "/" + params?.partTypeId
//         )
//         .pipe(
//           map((xhrResponse) => {
//             console.log("xhr response of partdetail", xhrResponse);
//             // const filteredComponentID = xhrResponse?.response?.content?.map(
//             //   (item) => {
//             //     return item?.partTypeComponentId;
//             //   }
//             // );
//             return { ...xhrResponse?.response, params};
//           }),
//           catchError((error) => {
//             return throwError(error);
//           })
//         )
//     )
//   );

// const getPartDetailListAjax$ = (URL, { errorHandler }) =>
//   new Subject().pipe(
//     mergeMap((params) =>
//       ampJsonAjax.post(URL ,params?.body).pipe(
//         map((xhrResponse) => {
//           return { ...xhrResponse.response, params };
//         }),
//         catchError((error) => {
//           errorHandler(error.response);
//           return [];
//         })
//       )
//     )
//   );

const savePartDetailSubComponentAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.post(URL, params?.request).pipe(
        map((xhrResponse) => {
          return { ...xhrResponse.response, params };
        }),
        catchError((error) => {
          errorHandler(error.response);
          return [];
        })
      )
    )
  );

const updatePartDetailSubComponentAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.put(URL, params?.request).pipe(
        map((xhrResponse) => {
          return { ...xhrResponse?.response, params };
        }),
        catchError((error) => {
          errorHandler(error.response);
          return [];
        })
      )
    )
  ); // ENd of line

const PartDetails = (props) => {
  const {
    title,
    partTypeId,
    // setPartTypeId,
    customerId,
    manufacturerId,
    inspectionDetailId,
    inspectionTypeStatus,
    type,
    completed,
    // assetId,
  } = props;

  const [alertErrorMessage, setAlertErrorMessage] = useState("initial");
  const context = useAccessState();
  const [loader, setLoader] = useState(false);
  //const [partTypeComponent, setPartTypeComponent] = useState(db?.partDetails);
  //const [partTypeComponentList, setPartTypeComponentList] = useState(db?.partDetailsRecords);
  const [partTypeComponent, setPartTypeComponent] = useState(null);
  const [partTypeComponentList, setPartTypeComponentList] = useState(null);
  const [countError, setCountError] = useState(0);
  const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();

  const locationRef = useLocation();
  const assetId = locationRef?.state?.id;
  //const [partTypeId, setPartTypeId] = useState();
  useEffect(() => {
    if (countError === 0) {
      setAlertErrorMessage("initial");
      setCountError(0);
      setPristine();
    }
  }, [countError]);

  //Get partdetails api starts
  const ajaxPartDetailsComponentObsv$ = useMemo(() => {
    return getPartDetailsComponentAjaxObs$(
      DEFAULT_BASE_URL + VERSION + GET_PART_DETAILS_FOR_MANAGE_ASSET,
      {
        errorHandler: (error) => {
          toast.error(response?.message, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  useObservableCallback(
    ajaxPartDetailsComponentObsv$,
    (response) => {
      console.log("partDetailResponse", response);
      if (response?.status) {
        //debugger;
        setPartTypeComponent(response);
      } else {
        setPartTypeComponent([]);
      }
    },
    []
  ); // Get partDetails api ends

  useEffect(() => {
    if (assetId && partTypeId) {
      // setLoader(true);
      ajaxPartDetailsComponentObsv$.next({
        assetId,
        partTypeId,
      });
    }
  }, [assetId, partTypeId]);

  return (
    <>
      <AMPLoader isLoading={loader} />
      {partTypeComponent?.content?.length > 0 ? (
        partTypeComponent?.content?.map((item, index) => {
          console.log("item", item);
          return (
            <AMPAccordion
              key={index}
              title={`Part Number: ${item.partnumber} (${item.description})`}
              contentClassName="p-0"
              isOpen={false}
              // showIconForAdd={true}
            >
              <Row className="border font-weight-bold text center mx-0 py-1">
                <Col>Serial Number</Col>
                <Col>Heat Code</Col>
                <Col>PO Number</Col>
                {inspectionTypeStatus !== 3 && (
                  <Col xs={12} sm={6} md={3} lg={3}>
                    Actions
                  </Col>
                )}
              </Row>
              <Row>
                <Col className="list-table-style">
                  <AssetPartDetailList
                    key={item?.id}
                    data={item}
                    id={item?.id}
                    serialNumber={item?.serialNumber}
                    heatCode={item?.heatCode}
                    poNumber={item?.ponumber}
                    setLoader={setLoader}
                    //inspectionDetailId={inspectionDetailId}
                    partTypeComponentId={item?.partTypeComponentId}
                    inspectionTypeStatus={inspectionTypeStatus}
                    type={type}
                    completed={completed}
                    partTypeComponentList={partTypeComponentList}
                    setPartTypeComponentList={setPartTypeComponentList}
                    //ajaxDeletePartDetailObvs$={ajaxDeletePartDetailObvs$}
                    partTypeComponentIds={
                      partTypeComponent?.filteredComponentID
                    }
                    setAlertErrorMessage={setAlertErrorMessage}
                    alertErrorMessage={alertErrorMessage}
                    setCountError={setCountError}
                    Prompt={Prompt}
                    setDirty={setDirty}
                    setPristine={setPristine}
                    assetId={assetId}
                    partTypeId={partTypeId}
                  />
                </Col>
              </Row>
              {inspectionTypeStatus !== 3 && (
                <AddAssetPartDetailComponent
                  inspectionDetailId={inspectionDetailId}
                  partTypeComponentId={item?.partTypeComponentId}
                  setLoader={setLoader}
                  inspectionTypeStatus={inspectionTypeStatus}
                  type={type}
                  completed={completed}
                  partTypeComponentIds={partTypeComponent?.filteredComponentID}
                  //ajaxPartDetailListObsv$={ajaxPartDetailListObsv$}
                  partTypeComponentList={partTypeComponentList}
                  setPartTypeComponentList={setPartTypeComponentList}
                  alertErrorMessage={alertErrorMessage}
                  setCountError={setCountError}
                  setAlertErrorMessage={setAlertErrorMessage}
                  Prompt={Prompt}
                  setDirty={setDirty}
                  setPristine={setPristine}
                />
              )}
            </AMPAccordion>
          );
        })
      ) : (
        <div className="text-center">No Data Found</div>
      )}
    </>
  );
};

export const AssetPartDetailList = ({
  id,
  data,
  setLoader,
  inspectionDetailId,
  partTypeComponentId,
  inspectionTypeStatus,
  type,
  completed,
  partTypeComponentList,
  setPartTypeComponentList,
  ajaxDeletePartDetailObvs$,
  partTypeComponentIds,
  assetId,
  alertErrorMessage,
  setAlertErrorMessage,
  setCountError,
  Prompt,
  setDirty,
  setPristine,
}) => {
  const {
    handleSubmit,
    reset,
    watch,
    control,
    errors,
    setValue,
    register,
    getValues,
    formState,
  } = useForm({});

  const context = useAccessState();
  useEffect(() => {
    const fields = ["serialNumber", "heatCode", "poNumber"];
    const content = {
      serialNumber: data?.serialNumber,
      heatCode: data?.heatCode,
      poNumber: data?.ponumber,
    };
    fields.forEach((field) => setValue(field, content[field]));
  }, [data]);

  const updatePartDetailList = (response) => {
    let newPartTypeComponentList =
      response?.content?.partTypeComponentList?.map((item, index) => {
        if (
          item?.partTypeComponentId === response?.content?.partTypeComponentId
        ) {
          return {
            ...item,
            inspectionPartTypeComponentDetailResponses:
              item?.inspectionPartTypeComponentDetailResponses?.map(
                (itm, idx) => {
                  if (itm?.id === response?.request?.Id) {
                    return {
                      ...itm,
                      Id: response?.request?.id,
                      serialNumber: response?.request?.SerialNumber,
                      heatCode: response?.request?.HeatCode,
                      ponumber: response?.request?.PoNumber,
                    };
                  } else {
                    return itm;
                  }
                }
              ),
          };
        } else {
          return item;
        }
      });
    setPartTypeComponentList(newPartTypeComponentList);
    setLoader(false);
  };
  // update
  const ajaxUpdatePartDetailObvs$ = useMemo(() => {
    return updatePartDetailSubComponentAjax$(
      DEFAULT_BASE_URL + VERSION + GET_OR_POST_OR_UPDATE_FOR_MANAGE_ASSET,
      {
        errorHandler: (error) => {
          setLoader(false);
          toast.error(
            AMPToastConsts.UPDATE_LEVELII_AssInsp_PART_DETAIL_SUB_ERROR,
            {
              position: toast.POSITION.TOP_CENTER,
            }
          );
        },
      }
    );
  }, []);

  useObservableCallback(ajaxUpdatePartDetailObvs$, (response) => {
    if (response?.status) {
      reset(response?.params?.formData);

      updatePartDetailList({
        partTypeComponentList: response?.params?.partTypeComponentList,
        partTypeComponentId: response?.params?.partTypeComponentId,
        request: response?.params?.request,
      });
      toast.success(
        AMPToastConsts.UPDATE_LEVELII_AssInsp_PART_DETAIL_SUB_SUCCESS,
        {
          position: toast.POSITION.TOP_CENTER,
        }
      );
    } else {
      setLoader(false);
      toast.error(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });

  const onSubmit = (formData) => {
    console.log(formData);
    const request = {
      AssetId: assetId,
      Id: data?.id,
      PartTypeComponentId: partTypeComponentId,
      SerialNumber: formData?.serialNumber,
      HeatCode: formData?.heatCode,
      PoNumber: formData?.poNumber,
      RequestedById: parseInt(context?.userId),
    };
    setLoader(true);
    ajaxUpdatePartDetailObvs$.next({
      request,
      formData,
      partTypeComponentId,
      partTypeComponentIds,
      partTypeComponentList,
    });
  };

  useEffect(() => {
    if (formState?.isDirty) {
      setDirty();
      setAlertErrorMessage(true);
      setCountError((preState) => preState + 1);
    } else if (
      alertErrorMessage !== ConstVariable?.INIT &&
      !formState?.isDirty
    ) {
      setCountError((preState) => preState - 1);
    }
  }, [formState?.isDirty]);

  useEffect(() => {
    if (alertErrorMessage !== ConstVariable?.INIT && !alertErrorMessage) {
      reset({
        serialNumber: data?.serialNumber,
        heatCode: data?.heatCode,
        poNumber: data?.ponumber,
      });
    }
  }, [alertErrorMessage]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="border border-top-0">
        {/* render Prompt */}
        {Prompt}
        <Row className="py-1 px-2">
          <Col xs={12} sm={6} md={3} lg={3} className="mt-1">
            <AMPFieldWrapper
              className="m-0 p-0"
              colProps={{
                md: 12,
                sm: 12,
                lg: 12,
                xs: 12,
              }}
              controlId="serialNumber"
              name="serialNumber"
              placeholder="Enter Serial Number"
              // required="true"
              fieldValidationCustom={errors?.serialNumber?.message}
              disabled={inspectionTypeStatus === 3}
            >
              <AMPTextBox
                ref={register({ required: "Required" })}
                defaultValue={data?.serialNumber}
              />
            </AMPFieldWrapper>
          </Col>
          <Col xs={12} sm={6} md={3} lg={3} className="mt-1">
            <AMPFieldWrapper
              className="m-0 p-0"
              colProps={{
                md: 12,
                sm: 12,
                lg: 12,
                xs: 12,
              }}
              controlId="heatCode"
              name="heatCode"
              placeholder="Enter Heat Code"
              // required="true"
              fieldValidationCustom={errors?.heatCode?.message}
              disabled={inspectionTypeStatus === 3}
            >
              <AMPTextBox
                ref={register({ required: "Required" })}
                defaultValue={data?.heatCode}
              />
            </AMPFieldWrapper>
          </Col>
          <Col xs={12} sm={6} md={3} lg={3} className="mt-1">
            <AMPFieldWrapper
              className="m-0 p-0"
              colProps={{
                md: 12,
                sm: 12,
                lg: 12,
                xs: 12,
              }}
              controlId="poNumber"
              name="poNumber"
              placeholder="Enter PO Number"
              // required="true"
              fieldValidationCustom={errors?.poNumber?.message}
              disabled={inspectionTypeStatus === 3}
            >
              <AMPTextBox
                ref={register({ required: "Required" })}
                defaultValue={data?.ponumber}
              />
            </AMPFieldWrapper>
          </Col>
          {inspectionTypeStatus !== 3 && (
            <Col xs={12} sm={6} md={3} lg={3} className="mt-1">
              <button
                aria-label="save"
                name="save"
                type="submit"
                className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 btn btn-amp-monochrome-amp-brand btn-md"
              >
                <AMPTooltip text={"Update"}>
                  <svg
                    fill="rgb(11, 26, 88)"
                    viewBox="0 0 64 64"
                    width="20px"
                    height="20px"
                    xmlns="http://www.w3.org/2000/svg"
                    className="svg-inline--fa amp-svg-icon amp-svg-floppy-disk fa-w-16 amp-icon"
                  >
                    <path d="M61.707,10.293l-8-8A1,1,0,0,0,53,2H7A5.006,5.006,0,0,0,2,7V57a5.006,5.006,0,0,0,5,5H57a5.006,5.006,0,0,0,5-5V11A1,1,0,0,0,61.707,10.293ZM48,4V20a1,1,0,0,1-1,1H17a1,1,0,0,1-1-1V4ZM10,60V35a3,3,0,0,1,3-3H51a3,3,0,0,1,3,3V60Zm50-3a3,3,0,0,1-3,3H56V35a5.006,5.006,0,0,0-5-5H13a5.006,5.006,0,0,0-5,5V60H7a3,3,0,0,1-3-3V7A3,3,0,0,1,7,4h7V20a3,3,0,0,0,3,3H47a3,3,0,0,0,3-3V4h2.586L60,11.414Z"></path>
                    <path d="M39,19h6a1,1,0,0,0,1-1V7a1,1,0,0,0-1-1H39a1,1,0,0,0-1,1V18A1,1,0,0,0,39,19ZM40,8h4v9H40Z"></path>
                    <path d="M47,45H17a1,1,0,0,0,0,2H47a1,1,0,0,0,0-2Z"></path>
                    <path d="M47,39H17a1,1,0,0,0,0,2H47a1,1,0,0,0,0-2Z"></path>
                    <path d="M47,51H17a1,1,0,0,0,0,2H47a1,1,0,0,0,0-2Z"></path>
                  </svg>
                </AMPTooltip>
              </button>
              {!formState?.isDirty && (
                <img
                  className="mx-1 mb-1"
                  src={complete_icon}
                  alt=""
                  width="12"
                  height="12"
                />
              )}
              {formState?.isDirty && <span className="mx-1 light-red">!</span>}
              {/* {data?.id !== ConstVariable?.DID && (
                <button
                  aria-label="Delete"
                  name="Delete"
                  type="button"
                  class="amp-button button-mini icon-mini btn-transition btn-transparent m-0 btn btn-amp-monochrome-amp-brand btn-md"
                  //onClick={() => onDelete(data?.id)}
                >
                  <AMPTooltip text="Delete">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      // class="bi bi-trash"
                      class="svg-inline--fa amp-svg-icon amp-svg-delete fa-w-13 amp-icon"
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
              )} */}
            </Col>
          )}
        </Row>
      </form>
    </>
  );
};

export const AddAssetPartDetailComponent = ({
  inspectionDetailId,
  partTypeComponentId,
  setLoader,
  // ajaxAddPartDetailsObsv$,
  inspectionTypeStatus,
  type,
  completed,
  partTypeComponentIds,
  partTypeComponentList,
  setPartTypeComponentList,
  alertErrorMessage,
  setAlertErrorMessage,
  setCountError,
  Prompt,
  setDirty,
  setPristine,
  assetId,
}) => {
  const {
    handleSubmit,
    reset,
    watch,
    control,
    errors,
    setValue,
    register,
    getValues,
    formState,
  } = useForm({});

  const context = useAccessState();

  const updatePartDetailList = (response) => {
    // let newPartTypeComponentList = response?.partTypeComponentList?.map(
    //   (item, index) => {
    //     if (
    //       item?.partTypeComponentId === response?.request?.PartTypeComponentId
    //     ) {
    //       return {
    //         ...item,
    //         inspectionPartTypeComponentDetailResponses:
    //           item?.inspectionPartTypeComponentDetailResponses?.map(
    //             (itm, idx) => {
    //               if (itm?.id === response?.id) {
    //                 return {
    //                   ...itm,
    //                   Id: response?.id,
    //                   serialNumber: response?.request?.SerialNumber,
    //                   heatCode: response?.request?.HeatCode,
    //                   ponumber: response?.request?.PoNumber,
    //                 };
    //               } else {
    //                 return itm;
    //               }
    //             }
    //           ),
    //       };
    //     } else {
    //       return item;
    //     }
    let newPartTypeComponentList = response?.partTypeComponentList?.map(
      (item, index) => {
        if (
          item?.partTypeComponentId === response?.request?.PartTypeComponentId
        ) {
          return {
            ...item,
            inspectionPartTypeComponentDetailResponses:
              item?.inspectionPartTypeComponentDetailResponses
                ? [
                    ...item?.inspectionPartTypeComponentDetailResponses,
                    {
                      id: response?.id,
                      AssetId: response?.request?.assetId,
                      serialNumber: response?.request?.SerialNumber,
                      heatCode: response?.request?.HeatCode,
                      ponumber: response?.request?.Ponumber,
                    },
                  ]
                : [
                    {
                      id: response?.id,
                      AssetId: response?.request?.assetId,
                      serialNumber: response?.request?.SerialNumber,
                      heatCode: response?.request?.HeatCode,
                      ponumber: response?.request?.Ponumber,
                    },
                  ],
          };
        } else {
          return item;
        }
      }
    );
    setPartTypeComponentList(newPartTypeComponentList);
    setLoader(false);
  };

  // add part details
  const ajaxAddPartDetailsObsv$ = useMemo(() => {
    return savePartDetailSubComponentAjax$(
      DEFAULT_BASE_URL + VERSION + GET_OR_POST_OR_UPDATE_FOR_MANAGE_ASSET,
      {
        errorHandler: (error) => {
          setLoader(false);
          toast.error(
            AMPToastConsts.SAVE_LEVELII_AssInsp_PART_DETAIL_SUB_ERROR,
            {
              position: toast.POSITION.TOP_CENTER,
            }
          );
        },
      }
    );
  }, []);
  useObservableCallback(ajaxAddPartDetailsObsv$, (response) => {
    if (response?.status) {
      toast.success(
        AMPToastConsts.SAVE_LEVELII_AssInsp_PART_DETAIL_SUB_SUCCESS,
        {
          position: toast.POSITION.TOP_CENTER,
        }
      );
      updatePartDetailList({
        Id: response?.content,
        partTypeComponentList: response?.params?.partTypeComponentList,
        request: response?.params?.request,
      });
      reset({
        serialNumber: "",
        heatCode: "",
        poNumber: "",
      });
    } else {
      setLoader(false);
      toast.error(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });

  const onSubmit = (formData) => {
    console.log(formData);
    const request = {
      InspectionDetailId: inspectionDetailId,
      AssetId: assetId,
      //Id: id,
      PartTypeComponentId: partTypeComponentId,
      SerialNumber: formData?.serialNumber,
      HeatCode: formData?.heatCode,
      Ponumber: formData?.poNumber,
      RequestedById: parseInt(context?.userId),
    };
    setLoader(true);
    ajaxAddPartDetailsObsv$.next({
      request,
      partTypeComponentIds,
      partTypeComponentList,
      //countError
    });
  };

  useEffect(() => {
    if (formState?.isDirty) {
      setDirty();
      setAlertErrorMessage(true);
      setCountError((preState) => preState + 1);
    }
    // else if (alertErrorMessage !== ConstVariable?.INIT && !formState?.isDirty) {
    //   setCountError1(preState => preState - 1)
    // }
  }, [formState?.isDirty]);

  useEffect(() => {
    if (alertErrorMessage !== ConstVariable?.INIT && !alertErrorMessage) {
      reset({
        serialNumber: "",
        heatCode: "",
        poNumber: "",
      });
    }
  }, [alertErrorMessage]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} class="border border-top-0">
        {/* render Prompt */}
        {Prompt}
        {/* /render Prompt */}
        <Row className="py-1 px-2">
          <Col xs={12} sm={6} md={3} lg={3} className="mt-1">
            <AMPFieldWrapper
              className="m-0 p-0"
              colProps={{
                md: 12,
                sm: 12,
                lg: 12,
                xs: 12,
              }}
              controlId="serialNumber"
              name="serialNumber"
              placeholder="Enter Serial Number"
              // required="true"
              fieldValidationCustom={errors?.serialNumber?.message}
            >
              <AMPTextBox ref={register({ required: "Required" })} />
            </AMPFieldWrapper>
          </Col>
          <Col xs={12} sm={6} md={3} lg={3} className="mt-1">
            <AMPFieldWrapper
              className="m-0 p-0"
              colProps={{
                md: 12,
                sm: 12,
                lg: 12,
                xs: 12,
              }}
              controlId="heatCode"
              name="heatCode"
              placeholder="Enter Heat Code"
              // required="true"
              fieldValidationCustom={errors?.heatCode?.message}
            >
              <AMPTextBox ref={register({ required: "Required" })} />
            </AMPFieldWrapper>
          </Col>
          <Col xs={12} sm={6} md={3} lg={3} className="mt-1">
            <AMPFieldWrapper
              className="m-0 p-0"
              colProps={{
                md: 12,
                sm: 12,
                lg: 12,
                xs: 12,
              }}
              controlId="poNumber"
              name="poNumber"
              placeholder="Enter PO Number"
              // required="true"
              fieldValidationCustom={errors?.poNumber?.message}
            >
              <AMPTextBox ref={register({ required: "Required" })} />
            </AMPFieldWrapper>
          </Col>
          {inspectionTypeStatus !== 3 && (
            <Col xs={12} sm={6} md={3} lg={3} className="mt-1">
              <button
                aria-label="save"
                name="save"
                type="submit"
                className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 btn btn-amp-monochrome-amp-brand btn-md"
              >
                <AMPTooltip text={"Submit"}>
                  <svg
                    fill="rgb(11, 26, 88)"
                    viewBox="0 0 64 64"
                    width="20px"
                    height="20px"
                    xmlns="http://www.w3.org/2000/svg"
                    className="svg-inline--fa amp-svg-icon amp-svg-floppy-disk fa-w-16 amp-icon"
                  >
                    <path d="M61.707,10.293l-8-8A1,1,0,0,0,53,2H7A5.006,5.006,0,0,0,2,7V57a5.006,5.006,0,0,0,5,5H57a5.006,5.006,0,0,0,5-5V11A1,1,0,0,0,61.707,10.293ZM48,4V20a1,1,0,0,1-1,1H17a1,1,0,0,1-1-1V4ZM10,60V35a3,3,0,0,1,3-3H51a3,3,0,0,1,3,3V60Zm50-3a3,3,0,0,1-3,3H56V35a5.006,5.006,0,0,0-5-5H13a5.006,5.006,0,0,0-5,5V60H7a3,3,0,0,1-3-3V7A3,3,0,0,1,7,4h7V20a3,3,0,0,0,3,3H47a3,3,0,0,0,3-3V4h2.586L60,11.414Z"></path>
                    <path d="M39,19h6a1,1,0,0,0,1-1V7a1,1,0,0,0-1-1H39a1,1,0,0,0-1,1V18A1,1,0,0,0,39,19ZM40,8h4v9H40Z"></path>
                    <path d="M47,45H17a1,1,0,0,0,0,2H47a1,1,0,0,0,0-2Z"></path>
                    <path d="M47,39H17a1,1,0,0,0,0,2H47a1,1,0,0,0,0-2Z"></path>
                    <path d="M47,51H17a1,1,0,0,0,0,2H47a1,1,0,0,0,0-2Z"></path>
                  </svg>
                </AMPTooltip>
              </button>
              {formState?.isDirty && <span className="mx-1 light-red">!</span>}
            </Col>
          )}
        </Row>
      </form>
    </>
  );
};

export default PartDetails;
