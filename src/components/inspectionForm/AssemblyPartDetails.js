import React, { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Row, Col, Button, Table, Image, Container } from "react-bootstrap";
import { Redirect, useLocation, Link } from "react-router-dom";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import AMPTooltip from "../common/AMPTooltip";
import { AMPAccordion } from "../common/AMPAccordion";
import { AMPToastConsts } from "../common/const/AMPToastConst";
import { toast } from "react-toastify";
import { AMPTextBox } from "../common";
import { AMPFieldWrapper } from "../common/AMPFieldWrapper";
import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";
import {
  DEFAULT_BASE_URL,
  VERSION,
  GET_PART_TYPE_COMPONENT_CLEARANCE_RANGE,
  GET_PART_DETAILS_LIST,
  POST_LEVELII_ASS_INSP_PART_DETAIL_SUBCOMPONENT,
  UPDATE_LEVELII_ASS_INSP_PART_DETAIL_SUBCOMPONENT,
  DELETE_LEVELII_ASS_INSP_PART_DETAIL_SUBCOMPONENT,
  ConstVariable,
} from "../common/const";
import { ampJsonAjax } from "../common/utils/ampAjax";
import AMPLoader from "../common/AMPLoader";
import {
  AccessProvider,
  useAccessDispatch,
  useAccessState,
} from "../../utils/AppContext/loginContext";
import complete_icon from "../../styles/images/complete_icon.png";
import useUnsavedChangesWarning from "../common/hooks/useUnsavedChangesWarning";

const getPartDetailsComponentAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax
        .get(
          DEFAULT_BASE_URL +
          VERSION +
          GET_PART_TYPE_COMPONENT_CLEARANCE_RANGE +
          params?.partTypeId
        )
        .pipe(
          map((xhrResponse) => {
            const filteredComponentID = xhrResponse?.response?.content?.map((item) => {
              return item?.partTypeComponentId;
            });
            return { ...xhrResponse?.response, filteredComponentID };
          }),
          catchError((error) => {
            return throwError(error);
          })
        )
    )
  );

const getPartDetailListAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.post(URL, params?.body).pipe(
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

const deletePartDetailSubComponentAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.delete(URL + params?.body?.id + "/" + params?.body?.RequestedById).pipe(
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

export const AssemblyPartDetails = (props) => {
  const {
    title,
    partTypeId,
    customerId,
    manufacturerId,
    inspectionDetailId,
    inspectionTypeStatus,
    type,
    completed,
    alertErrorMessage,
    setAlertErrorMessage,
  } = props;

  const context = useAccessState();
  const [loader, setLoader] = useState(false);
  const [partTypeComponent, setPartTypeComponent] = useState([]);
  const [partTypeComponentList, setPartTypeComponentList] = useState([]);

  const [countError, setCountError] = useState(0);
  const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();

  useEffect(() => {
    if (countError === 0) {
      setAlertErrorMessage("initial")
      setCountError(0)
      setPristine()
    }
  }, [countError])


  //Get clearance api starts
  const ajaxPartDetailsComponentObsv$ = useMemo(() => {
    return getPartDetailsComponentAjaxObs$();
  }, []);
  useObservableCallback(
    ajaxPartDetailsComponentObsv$,
    (response) => {
      if (response?.status) {
        debugger
        setLoader(false);

        (response);
        ajaxPartDetailListObsv$.next({
          body: {
            partTypeComponentIds: response?.filteredComponentID,
            inspectionDetailId: inspectionDetailId,
            requestedById: parseInt(context?.userId)
          },
          // data: response?.content
        })
      } else {
        setLoader(false);
        setPartTypeComponent([]);
      }
    },
    []
  ); // Get Clerance api ends


  const ajaxPartDetailListObsv$ = useMemo(() => {
    return getPartDetailListAjax$(
      DEFAULT_BASE_URL +
      VERSION +
      GET_PART_DETAILS_LIST,
      {
        errorHandler: (error) => {
          setLoader(false);
          toast.error(
            AMPToastConsts.GET_PART_DETAILS_ERROR,
            {
              position: toast.POSITION.TOP_CENTER,
            }
          );
        },
      }
    );
  }, []);
  useObservableCallback(ajaxPartDetailListObsv$, (response) => {
    if (response) {
      debugger
      setLoader(false);
      setPartTypeComponentList(response?.content)
    }
    // else {
    //   setLoader(false);
    //   setPartTypeComponentList([])
    //   toast.error(response?.message, {
    //     position: toast.POSITION.TOP_CENTER,
    //   });
    // }
  });

  const updatePartDetailList = (response) => {
    
    let newPartTypeComponentList = response?.partTypeComponentList?.map((item, index) => {
      if (item?.partTypeComponentId === response?.partTypeComponentId) {
        return {
          ...item,
          inspectionPartTypeComponentDetailResponses: item?.inspectionPartTypeComponentDetailResponses?.filter((itm, idx) => {
            return itm?.id !== response?.id
          })
        }
      } else {
        return item;
      }
    })
    setPartTypeComponentList(newPartTypeComponentList)
    debugger
    setLoader(false);
  }

  // delete
  const ajaxDeletePartDetailObvs$ = useMemo(() => {
    return deletePartDetailSubComponentAjax$(
      DEFAULT_BASE_URL +
      VERSION +
      DELETE_LEVELII_ASS_INSP_PART_DETAIL_SUBCOMPONENT,
      {
        errorHandler: (error) => {
          setLoader(false);
          toast.error(
            AMPToastConsts.DELETE_LEVELII_AssInsp_PART_DETAIL_SUB_ERROR,
            {
              position: toast.POSITION.TOP_CENTER,
            }
          );
        },
      }
    );
  });
  useObservableCallback(ajaxDeletePartDetailObvs$, (response) => {
    if (response?.status) {
      updatePartDetailList({
        partTypeComponentId: response?.params?.partTypeComponentId,
        partTypeComponentList: response?.params?.partTypeComponentList,
        id: response?.params?.body?.id
      })
      toast.success(
        AMPToastConsts.DELETE_LEVELII_AssInsp_PART_DETAIL_SUB_SUCCESS,
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


  useEffect(() => {
    if (partTypeId) {
      setLoader(true);
      ajaxPartDetailsComponentObsv$.next({
        partTypeId: partTypeId,
      });
    }
  }, [partTypeId]);
  return (
    <>
      <AMPLoader isLoading={loader} />
      {(partTypeComponent?.content?.length > 0 && partTypeComponentList?.length > 0) ? (
        partTypeComponent?.content?.map((item, index) =>
          partTypeComponentList?.map((data, idx) => {
            if (data?.partTypeComponentId === item?.partTypeComponentId) {
              return (
                <AMPAccordion
                  key={index}
                  title={`Part Number: ${item.partnumber} (${item.description})`}
                  contentClassName="p-0"
                  isOpen={false}
                // showIconForAdd={true}
                >
                
                  <Row>
                    <Col className='list-table-style'>
                      {data?.inspectionPartTypeComponentDetailResponses?.map((i, ix) => (
                        
                        <AssemblyPartDetailList
                          key={ix}
                          data={i}
                          id={i?.id}
                          serialNumber={i?.serialNumber}
                          heatCode={i?.heatCode}
                          poNumber={i?.ponumber}
                          setLoader={setLoader}
                          inspectionDetailId={inspectionDetailId}
                          partTypeComponentId={data?.partTypeComponentId}
                          inspectionTypeStatus={inspectionTypeStatus}
                          type={type}
                          completed={completed}
                          partTypeComponentList={partTypeComponentList}
                          setPartTypeComponentList={setPartTypeComponentList}
                          // ajaxUpdatePartDetailObvs$={ajaxUpdatePartDetailObvs$}
                          ajaxDeletePartDetailObvs$={ajaxDeletePartDetailObvs$}
                          partTypeComponentIds={partTypeComponent?.filteredComponentID}

                          alertErrorMessage={alertErrorMessage}
                          setAlertErrorMessage={setAlertErrorMessage}
                          setCountError={setCountError}
                          Prompt={Prompt}
                          setDirty={setDirty}
                          setPristine={setPristine}
                          
                          ajaxPartDetailListObsv$={ajaxPartDetailListObsv$}
                        />)
                      )}
                    </Col>
                  </Row>
                  {(data?.inspectionPartTypeComponentDetailResponses?.length === 0 &&
                    inspectionTypeStatus === 3) &&
                    <Row>
                      <Col className="text-center text-danger">
                        No Data Found
                      </Col>
                    </Row>
                  }
                  {inspectionTypeStatus !== 3 &&
                    <AddPartDetailComponent
                      inspectionDetailId={inspectionDetailId}
                      partTypeComponentId={data?.partTypeComponentId}
                      setLoader={setLoader}
                      // ajaxAddPartDetailsObsv$={ajaxAddPartDetailsObsv$}
                      inspectionTypeStatus={inspectionTypeStatus}
                      type={type}
                      completed={completed}
                      partTypeComponentIds={partTypeComponent?.filteredComponentID}
                      ajaxPartDetailListObsv$={ajaxPartDetailListObsv$}

                      partTypeComponentList={partTypeComponentList}
                      setPartTypeComponentList={setPartTypeComponentList}

                      alertErrorMessage={alertErrorMessage}
                      setAlertErrorMessage={setAlertErrorMessage}
                      setCountError={setCountError}
                      Prompt={Prompt}
                      setDirty={setDirty}
                      setPristine={setPristine}
                    />
                  }
                </AMPAccordion>
              )
            }
          })
        )
      ) : (
        <div className="text-center">No Data Found</div>
      )}
    </>
  );
};


export const AssemblyPartDetailList = ({
  data,
  setLoader,
  inspectionDetailId,
  partTypeComponentId,
  inspectionTypeStatus,
  type,
  completed,
  partTypeComponentList,
  setPartTypeComponentList,
  // ajaxUpdatePartDetailObvs$,
  ajaxDeletePartDetailObvs$,
  partTypeComponentIds,

  alertErrorMessage,
  setAlertErrorMessage,
  setCountError,
  Prompt,
  setDirty,
  setPristine,

  ajaxPartDetailListObsv$
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
    let newPartTypeComponentList = response?.partTypeComponentList?.map((item, index) => {
      if (item?.partTypeComponentId === response?.partTypeComponentId) {
        return {
          ...item,
          inspectionPartTypeComponentDetailResponses: item?.inspectionPartTypeComponentDetailResponses?.map((itm, idx) => {
            if (itm?.id === response?.request?.Id) {
              return {
                ...itm,
                serialNumber: response?.request?.SerialNumber,
                heatCode: response?.request?.HeatCode,
                ponumber: response?.request?.PoNumber,
              }
            } else {
              return itm;
            }
          })
        }
      } else {
        return item;
      }
    })
    setPartTypeComponentList(newPartTypeComponentList)
    debugger
    setLoader(false);
  }
  // update
  const ajaxUpdatePartDetailObvs$ = useMemo(() => {
    return updatePartDetailSubComponentAjax$(
      DEFAULT_BASE_URL +
      VERSION +
      UPDATE_LEVELII_ASS_INSP_PART_DETAIL_SUBCOMPONENT,
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
      debugger
      reset(response?.params?.formData)
      
      // ajaxPartDetailListObsv$.next({
      //   body: {
      //     partTypeComponentIds: response?.params?.partTypeComponentIds,
      //     inspectionDetailId: inspectionDetailId,
      //     requestedById: parseInt(context?.userId)
      //   },
      //   // data: partTypeComponent?.content
      // })
      updatePartDetailList({
        partTypeComponentList: response?.params?.partTypeComponentList,
        partTypeComponentId: response?.params?.partTypeComponentId,
        request: response?.params?.request,
      })
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
    const request = {
      Id: data?.id,
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
      partTypeComponentList
    });
  };

  const onDelete = (id) => {
    ajaxDeletePartDetailObvs$.next({
      body: {
        id: id,
        RequestedById: parseInt(context?.userId)
      },
      partTypeComponentId,
      partTypeComponentList,
      partTypeComponentIds,
    });
  };

  useEffect(() => {
    if (formState?.isDirty) {
      setDirty();
      setAlertErrorMessage(true)
      setCountError(preState => preState + 1)
    } else if (alertErrorMessage !== ConstVariable?.INIT && !formState?.isDirty) {
      setCountError(preState => preState - 1)
    }
  }, [formState?.isDirty]);

  useEffect(() => {
    if (alertErrorMessage !== ConstVariable?.INIT && !alertErrorMessage) {
      reset({
        serialNumber: data?.serialNumber,
        heatCode: data?.heatCode,
        poNumber: data?.ponumber
      })
    }
  }, [alertErrorMessage])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border border-top-0">
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
            {(!formState?.isDirty) && (
              <img
                className="mx-1 mb-1"
                src={complete_icon}
                alt=""
                width="12"
                height="12"
              />
            )}
            {formState?.isDirty &&
              <span className="mx-1 light-red">!</span>
            }
            {data?.id !== ConstVariable?.DID && (
              <button
                aria-label="Delete"
                name="Delete"
                type="button"
                class="amp-button button-mini icon-mini btn-transition btn-transparent m-0 btn btn-amp-monochrome-amp-brand btn-md"
                onClick={() => onDelete(data?.id)}
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
                      fill-rule="evenodd"
                      d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                    />
                  </svg>
                </AMPTooltip>
              </button>
            )}
          </Col>
        )}
      </Row>
    </form>
  );
};


export const AddPartDetailComponent = ({
  inspectionDetailId,
  partTypeComponentId,
  setLoader,
  // ajaxAddPartDetailsObsv$,
  inspectionTypeStatus,
  type,
  completed,
  partTypeComponentIds,
  ajaxPartDetailListObsv$,

  partTypeComponentList,
  setPartTypeComponentList,

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
    formState
  } = useForm({});

  const context = useAccessState();

  const updatePartDetailList = (response) => {
    let newPartTypeComponentList = response?.partTypeComponentList?.map((item, index) => {
      if (item?.partTypeComponentId === response?.request?.PartTypeComponentId) {
        return {
          ...item,
          inspectionPartTypeComponentDetailResponses: item?.inspectionPartTypeComponentDetailResponses ? [
            ...item?.inspectionPartTypeComponentDetailResponses,
            {
              id: response?.id,
              serialNumber: response?.request?.SerialNumber,
              heatCode: response?.request?.HeatCode,
              ponumber: response?.request?.Ponumber,
            }
          ] : [{
            id: response?.id,
            serialNumber: response?.request?.SerialNumber,
            heatCode: response?.request?.HeatCode,
            ponumber: response?.request?.Ponumber,
          }]
        }
      } else {
        return item;
      }
    })
    setPartTypeComponentList(newPartTypeComponentList)
    debugger
    setLoader(false);
  }


  // add part details
  const ajaxAddPartDetailsObsv$ = useMemo(() => {
    return savePartDetailSubComponentAjax$(
      DEFAULT_BASE_URL +
      VERSION +
      POST_LEVELII_ASS_INSP_PART_DETAIL_SUBCOMPONENT,
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
      debugger
      updatePartDetailList({
        id: response?.content,
        partTypeComponentList: response?.params?.partTypeComponentList,
        request: response?.params?.request
      })
      reset({
        serialNumber: "",
        heatCode: "",
        poNumber: ""
      });
    } else {
      setLoader(false);
      toast.error(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });

  const onSubmit = (formData) => {
    const request = {
      InspectionDetailId: inspectionDetailId,
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
      // countError
    });
  };

  useEffect(() => {
    if (formState?.isDirty) {
      setDirty();
      setAlertErrorMessage(true)
      setCountError(preState => preState + 1)
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
        poNumber: ""
      })
    }
  }, [alertErrorMessage])

  return (
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
            {formState?.isDirty &&
              <span className="mx-1 light-red">!</span>
            }
          </Col>
        )}
      </Row>
    </form>
  );
};
