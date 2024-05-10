import React, { useState, useEffect, useMemo } from "react";
import { Row, Col, Container } from "react-bootstrap";
import { AMPFieldWrapper } from "../common/AMPFieldWrapper";
import AMPFieldSet from "../common/AMPFieldSet";
import { AMPFormLayout } from "../common/AMPFormLayout";
import { AMPValidation } from "../common/AMPAuthorization/AMPValidation";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import * as yup from "yup";

import { AMPToastConsts } from "../common/const/AMPToastConst";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import { ampJsonAjax } from "../common/utils/ampAjax";
import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";
import {
  DEFAULT_BASE_URL,
  VERSION,
  GET_PART_TYPE_VISUAL_COMPONENT_TRACEABILITY,
  SAVE_VISUAL_INSPECTION_REPLACEMENT_TRACEABILITY,
  SUBMIT_VISUAL_INSPECTION_REPLACEMENT_TRACEABILITY,
  ConstVariable,
} from "../common/const";
import { toast } from "react-toastify";
import AMPLoader from "../common/AMPLoader";
import AMPTooltip from "../common/AMPTooltip";
import complete_icon from "../../styles/images/complete_icon.png";
import useUnsavedChangesWarning from "../common/hooks/useUnsavedChangesWarning";

const getReplacementComponentAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax
        .get(
          DEFAULT_BASE_URL +
          VERSION +
          GET_PART_TYPE_VISUAL_COMPONENT_TRACEABILITY +
          params?.partTypeId +
          "/" +
          params?.inspectionDetailId +
          "/" +
          params?.inspectionLevel
        )
        .pipe(
          map((xhrResponse) => {
            return { ...xhrResponse?.response, level2Insp: params?.level2Insp };
          }),
          catchError((error) => {
            return throwError(error);
          })
        )
    )
  );

const saveReplacementComponentAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.post(URL, params?.request).pipe(
        map((xhrResponse) => {
          return { ...xhrResponse.response, formData: params?.formData };
        }),
        catchError((error) => {
          errorHandler(error.response);
          return [];
        })
      )
    )
  );

// const submitReplacementComponentAjax$ = (URL, { errorHandler }) =>
//   new Subject().pipe(
//     mergeMap((params) =>
//       ampJsonAjax.post(URL, params).pipe(
//         map((xhrResponse) => {
//           return xhrResponse.response;
//         }),
//         catchError((error) => {
//           errorHandler(error.response);
//           return [];
//         })
//       )
//     )
//   );

export const ReplacementComponent = ({
  inspectionLevelIdForApiCall,
  inspectionLevelId,
  inspectionTypeId,
  partTypeId,
  partTypeName,
  inspectionDetailId,
  visualInspectionDetailId,
  inspectionTypeStatus,
  type,
  completed,
  // setIsError,
  alertErrorMessage,
  setAlertErrorMessage,
  setIsReplacementRequired
}) => {

  const validationSchema = useMemo(
    () =>
      yup.object({
        partType: yup.object().required("Required"),
      }),
    []
  );
  const resolver = AMPValidation(validationSchema);
  const {
    handleSubmit,
    reset,
    watch,
    control,
    errors,
    setValue,
    register,
    getValues,
  } = useForm({
    defaultValues: { content: [] },
    resolver,
  });

  const [loader, setLoader] = useState(false);
  const [partTypeComponent, setPartTypeComponent] = useState(ConstVariable?.INIT);
  const [partTypeComponentVisual, setPartTypeComponentVisual] = useState([]);

  const [countError, setCountError] = useState(0)
  const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();
  useEffect(() => {
    if (countError === 0) {
      setAlertErrorMessage("initial")
      setCountError(0)
      setPristine()
    }
  }, [countError])

  // for visual inspection and level2-disassembly inspection
  const ajaxReplacementComponentObsv$ = useMemo(() => {
    return getReplacementComponentAjaxObs$();
  }, []);

  useObservableCallback(
    ajaxReplacementComponentObsv$,
    (response) => {
      if (response?.status) {
        setLoader(false);
        if (response?.level2Insp) {
          setPartTypeComponentVisual(response?.content);
        } else {
          setPartTypeComponent(response?.content);
        }
      } else {
        setLoader(false);
        toast.error(response?.message, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    },
    []
  );

  useEffect(() => {
    // let inspectionLevelIdForApiCall
    if (completed
      && partTypeComponent === ConstVariable?.INIT
      && partTypeId
      && (inspectionLevelId || inspectionLevelIdForApiCall)) {
      let inspectionLevel = inspectionLevelId
        ? (inspectionLevelId === 1 ? 18 : 19)
        : inspectionLevelIdForApiCall
      setLoader(true);
      ajaxReplacementComponentObsv$.next({
        partTypeId: partTypeId,
        inspectionDetailId: inspectionDetailId,
        level2Insp: false,
        inspectionLevel: inspectionLevel
      });
    }
  }, [completed, partTypeId, inspectionLevelId, inspectionLevelIdForApiCall]);

  useEffect(() => {
    if (completed && inspectionTypeId === 14 && partTypeId && inspectionLevelId) {
      let inspectionLevel = inspectionLevelId === 1 ? 18 : 19
      setLoader(true);
      ajaxReplacementComponentObsv$.next({
        partTypeId: partTypeId,
        inspectionDetailId: visualInspectionDetailId,
        level2Insp: true,
        inspectionLevel: inspectionLevel
      });
    }
  }, [completed, partTypeId, inspectionTypeId, inspectionLevelId, visualInspectionDetailId])

  // const ajaxSubmitReplacementComponentObsv$ = useMemo(() => {
  //   return submitReplacementComponentAjax$(
  //     DEFAULT_BASE_URL +
  //     VERSION +
  //     SUBMIT_VISUAL_INSPECTION_REPLACEMENT_TRACEABILITY,
  //     {
  //       errorHandler: (error) => {
  //         setLoader(false);
  //         toast.error(AMPToastConsts.VIRT_SUBMIT_ERROR, {
  //           position: toast.POSITION.TOP_CENTER,
  //         });
  //       },
  //     }
  //   );
  // }, []);
  // useObservableCallback(ajaxSubmitReplacementComponentObsv$, (response) => {
  //   if (response?.status) {
  //     setLoader(false);
  //     toast.success(AMPToastConsts.VIRT_SUBMIT_SUCCESS, {
  //       position: toast.POSITION.TOP_CENTER,
  //     });
  //   } else {
  //     setLoader(false);
  //     toast.error(response?.message, {
  //       position: toast.POSITION.TOP_CENTER,
  //     });
  //   }
  // });

  // const submitVisualInspReplacTraceability = () => {
  //   const ajaxParams = {
  //     InspectionDetailId: inspectionDetailId,
  //   };
  //   setLoader(true);
  //   ajaxSubmitReplacementComponentObsv$.next(ajaxParams);
  // };

  const [partTypeComponentFiltered, setPartTypeComponentFiltered] = useState(
    []
  );
  useEffect(() => {
    if (
      partTypeComponent?.partTypeComponentResponses &&
      partTypeComponentVisual?.partTypeComponentResponses
    ) {
      partTypeComponent?.partTypeComponentResponses?.map((item) =>
        partTypeComponentVisual?.partTypeComponentResponses?.map((data) => {
          if (item?.componentId === data?.componentId) {
            item?.quantityNeeded === data?.quantityNeeded ||
              item?.quantityNeeded !== 0
              ? setPartTypeComponentFiltered((partTypeComponentFiltered) => [
                ...partTypeComponentFiltered,
                item,
              ])
              : setPartTypeComponentFiltered((partTypeComponentFiltered) => [
                ...partTypeComponentFiltered,
                data,
              ]);
          }
        })
      );
    }
  }, [partTypeComponent, partTypeComponentVisual]);


  useEffect(() => {
    if (partTypeComponentFiltered) {
      const res = partTypeComponentFiltered?.some(itm => itm?.quantityNeeded > 0)
      setIsReplacementRequired(res)
    }
  }, [partTypeComponentFiltered])

  return (
    <>
      <AMPFieldSet fieldBgColor="bg-light p-2">
        <AMPLoader isLoading={loader} />
        <Row className="text-left">
          <Col xs={12} sm={12} md={4} lg={3} className="px-0">
            <span>Part Type:</span>
            <span className="font-weight-bold mx-0">{partTypeName}</span>
          </Col>
          {partTypeComponent?.expectedStockAvailabilityDate &&
            <Col xs={12} sm={12} md={8} lg={9} className="px-0">
              <span>Expected Stock Availability Date:</span>
              <span className="font-weight-bold mx-0">
                {partTypeComponent?.expectedStockAvailabilityDate}
              </span>
            </Col>
          }
        </Row>
        <Container striped="true" fluid className="mt-2 fn-13">
          {(partTypeComponentFiltered?.length > 0 ||
            partTypeComponent?.partTypeComponentResponses?.length > 0) &&
            <Row className="border font-weight-bold bg-white text-break text-center py-2">
              <Col xs={12} sm={6} md={4} lg={2}>
                Part #
              </Col>
              <Col xs={12} sm={6} md={4} lg={2}>
                Description
              </Col>
              <Col
                xs={12}
                sm={6}
                md={4}
                lg={(inspectionLevelId === 2 && inspectionTypeId === 1) ||
                  inspectionTypeStatus === 3 ? 2 : 1}>
                Stock Availability
              </Col>
              {(inspectionLevelId === 1 ||
                (inspectionLevelId === 2 && inspectionTypeId === 14)) && (
                  < Col xs={12} sm={6} md={4} lg={1}>
                    Available Quantity
                  </Col>
                )}
              <Col xs={12} sm={6} md={4} lg={1}
                className="px-1">
                Lead Time (In Days)
              </Col>
              <Col xs={12} sm={6} md={4} lg={2}>
                Comment
              </Col>
              <Col xs={12} sm={6} md={4} lg={2}>
                Quantity Needed
              </Col>
              {inspectionTypeStatus !== 3 && (
                <Col xs={12} sm={6} md={4} lg={1}>
                  Action
                </Col>
              )}
            </Row>
          }

          <Row>
            <Col className='list-table-style p-0'>
              {visualInspectionDetailId ? (
                <React.Fragment>
                  {partTypeComponentFiltered?.length > 0 &&
                    partTypeComponentFiltered?.map((item) => (
                      <ReplacementComponentForm
                        key={item?.id}
                        item={item}

                        inspectionDetailId={inspectionDetailId}
                        inspectionLevelId={inspectionLevelId}
                        inspectionTypeId={inspectionTypeId}
                        inspectionTypeStatus={inspectionTypeStatus}
                        type={type}
                        completed={completed}

                        alertErrorMessage={alertErrorMessage}
                        setAlertErrorMessage={setAlertErrorMessage}
                        setCountError={setCountError}
                        Prompt={Prompt}
                        setDirty={setDirty}
                        setPristine={setPristine}
                        setIsReplacementRequired={setIsReplacementRequired}
                      />
                    ))}
                  {!partTypeComponentFiltered?.length &&
                    <Row>
                      <Col className="text-center text-danger">No Data Found</Col>
                    </Row>
                  }
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {partTypeComponent?.partTypeComponentResponses?.length > 0 &&
                    partTypeComponent?.partTypeComponentResponses?.map((item) => (
                      <ReplacementComponentForm
                        key={item?.id}
                        item={item}
                        partTypeComponent={partTypeComponent}
                        inspectionDetailId={inspectionDetailId}
                        inspectionLevelId={inspectionLevelId}
                        inspectionTypeId={inspectionTypeId}
                        completed={completed}
                        inspectionTypeStatus={inspectionTypeStatus}
                        type={type}

                        alertErrorMessage={alertErrorMessage}
                        setAlertErrorMessage={setAlertErrorMessage}
                        setCountError={setCountError}
                        Prompt={Prompt}
                        setDirty={setDirty}
                        setPristine={setPristine}
                        setIsReplacementRequired={setIsReplacementRequired}
                      />
                    ))}
                  {partTypeComponent !== ConstVariable?.INIT
                    && !partTypeComponent?.partTypeComponentResponses &&
                    <Row>
                      <Col className="text-center text-danger">No Data Found</Col>
                    </Row>
                  }
                </React.Fragment>
              )}
            </Col>
          </Row>
        </Container>
      </AMPFieldSet>
    </>
  );
};

export const ReplacementComponentForm = ({
  item,
  inspectionDetailId,
  inspectionLevelId,
  inspectionTypeId,
  inspectionTypeStatus,
  type,
  completed,

  alertErrorMessage,
  setAlertErrorMessage,
  setCountError,
  Prompt,
  setDirty,
  setPristine,
  setIsReplacementRequired
}) => {
  const validationSchema = useMemo(
    () =>
      yup.object({
        quantity: yup.object().required("Required"),
      }),
    []
  );
  const resolver = AMPValidation(validationSchema);
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
  } = useForm({
    resolver,
  });

  let [options, setOptions] = useState([]);
  const [loader, setLoader] = useState(false);
  const [quantityValidation, setQuantityValidation] = useState(item?.quantityNeeded)

  useEffect(() => {
    fetchOption(item?.quantityRequired);
  }, []);
  useEffect(() => {
    if (item?.quantityNeeded !== 0) {
      setValue("quantity", { value: item?.quantityNeeded, label: item?.quantityNeeded });
    }
  }, [item?.quantityNeeded]);

  const fetchOption = (quantityRequired) => {
    for (let i = 1; i <= quantityRequired; i++) {
      options.push({ label: i, value: i });
    }
  };

  const ajaxSaveReplacementComponentObsv$ = useMemo(() => {
    return saveReplacementComponentAjax$(
      DEFAULT_BASE_URL +
      VERSION +
      SAVE_VISUAL_INSPECTION_REPLACEMENT_TRACEABILITY,
      {
        errorHandler: (error) => {
          setLoader(false);
          toast.error(AMPToastConsts.VIRT_SAVE_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  useObservableCallback(ajaxSaveReplacementComponentObsv$, (response) => {
    if (response?.status) {
      reset(response?.formData)
      setQuantityValidation(response?.formData?.quantity?.value)
      setLoader(false);
      if (type?.id === 14) {
        setIsReplacementRequired(true)
      }
      toast.success(AMPToastConsts.VIRT_SAVE_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
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
      PartTypeComponentId: item?.id,
      InspectionDetailId: inspectionDetailId,
      QuantityNeeded: formData?.quantity?.value,
    };
    setLoader(true);
    ajaxSaveReplacementComponentObsv$.next({
      request,
      formData
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
      if (quantityValidation !== 0) {
        reset({
          quantity: {
            label: quantityValidation,
            value: quantityValidation
          }
        })
      } else {
        reset({
          quantity: null
        })
      }
    }
  }, [alertErrorMessage])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border border-top-0">
      <AMPLoader isLoading={loader} />
      {/* render Prompt */}
      {Prompt}
      {/* /render Prompt */}
      <Row className="py-1 px-2 text-break text-center">
        <Col xs={12} sm={6} md={4} lg={2} className="mt-2 text-break description_text">
          {item?.partNumber}
        </Col>
        <Col xs={12} sm={6} md={4} lg={2} className="mt-2 text-break description_text">
          {item?.description}
        </Col>
        <Col
          xs={12}
          sm={6}
          md={4}
          lg={(inspectionLevelId === 2 && inspectionTypeId === 1) ||
            inspectionTypeStatus === 3 ? 2 : 1}
          className="mt-2 text-break description_text">
          {item?.stockAvailability ? item?.stockAvailability : "NA"}
        </Col>
        {(inspectionLevelId === 1 ||
          (inspectionLevelId === 2 && inspectionTypeId === 14)) && (
            <Col xs={12} sm={6} md={4} lg={1} className="mt-2 text-break description_text">
              {item?.availableQuantity ? item?.availableQuantity : "NA"}
            </Col>
          )}
        <Col xs={12} sm={6} md={4} lg={1} className="px-1 mt-2">
          {item?.leadTime ? item?.leadTime : "NA"}
        </Col>
        <Col xs={12} sm={6} md={4} lg={2} className="mt-2 text-break description_text">
          {item?.comments ? item?.comments : "NA"}
        </Col>
        <Col xs={12} sm={6} md={4} lg={2}>
          <AMPFormLayout>
            <AMPFieldWrapper
              colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
              controlId="quantity"
              name="quantity"
              // required="true"
              fieldValidation={errors.quantity ? true : false}
              className="mt-0 text-left"
              isDisabled={inspectionTypeStatus === 3}
            >
              <Controller
                as={Select}
                id="quantity"
                control={control}
                options={options}
                onChange={([selected]) => {
                  return { value: selected };
                }}
              />
            </AMPFieldWrapper>
          </AMPFormLayout>
        </Col>
        {inspectionTypeStatus !== 3 && (
          <Col xs={12} sm={6} md={4} lg={1} className="text-left">
            <button
              aria-label="Save"
              name="Save"
              type="submit"
              className="amp-button button-mini icon-mini btn-transition btn-transparent ml-2 m-0 btn btn-amp-monochrome-amp-brand btn-md"
            >
              <AMPTooltip text={"Save"}>
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
            {(quantityValidation !== 0
              && !formState?.isDirty) && (
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
          </Col>
        )}
      </Row>
    </form>
  );
};
