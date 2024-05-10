import React, { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Row, Col, Button, Table, Image, Container } from "react-bootstrap";
import { Redirect, useLocation, Link } from "react-router-dom";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import * as yup from "yup";
import Select from "react-select";
import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";
import {
  DEFAULT_BASE_URL,
  VERSION,
  GET_PART_TYPE_COMPONENT_TORQUE_RANGE,
  SAVE_INSPECTION_SUBCOMPONENT_POST_TORQUE_RANGE,
  ConstVariable,
} from "../common/const";
import { ampJsonAjax } from "../common/utils/ampAjax";
import { AMPFieldWrapper } from "../common/AMPFieldWrapper";
import { AMPFile } from "../common/AMPFile";
import { AMPFormLayout } from "../common/AMPFormLayout";
import { AMPNumberTextBox, AMPTextArea } from "../common";
import { AMPNumberTextBox2 } from "../common/AMPNumberTextBox2";
import AMPTooltip from "../common/AMPTooltip";
import { AMPAccordion } from "../common/AMPAccordion";
import { AMPTextBoxReadOnly } from "../common/AMPTextBoxReadOnly";
import { AMPValidation } from "../common/AMPAuthorization/AMPValidation";
import { AMPToastConsts } from "../common/const/AMPToastConst";
import { toast } from "react-toastify";
import AMPLoader from "../common/AMPLoader";
import {
  AccessProvider,
  useAccessDispatch,
  useAccessState,
} from "../../utils/AppContext/loginContext";
import complete_icon from "../../styles/images/complete_icon.png";
import useUnsavedChangesWarning from "../common/hooks/useUnsavedChangesWarning";

//Get Torque Component api starts
const getTorqueRangeComponentAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax
        .get(
          DEFAULT_BASE_URL +
          VERSION +
          GET_PART_TYPE_COMPONENT_TORQUE_RANGE +
          params?.inspectionDetailId + "/" + params?.partTypeId
        )
        .pipe(
          map((xhrResponse) => {
            return xhrResponse?.response;
          }),
          catchError((error) => {
            return throwError(error);
          })
        )
    )
  );

const saveInspectionTorqueRangeAjax$ = (URL, { errorHandler }) =>
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


const AssemblyTorqueRange = (props) => {
  const {
    title,
    partTypeId,
    customerId,
    manufacturerId,
    inspectionDetailId,
    gauge,
    inspectionTypeStatus,
    type,
    completed,
    alertErrorMessage,
    setAlertErrorMessage,
  } = props;

  const { handleSubmit, control } = useForm({});

  const [open, setOpen] = useState(false);
  const [loader, setLoader] = useState(false);
  const [countError, setCountError] = useState(0)
  const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();
  const [torquePartTypeComponent, setTorquePartTypeComponent] = useState([]);

  useEffect(() => {
    if (countError === 0) {
      setAlertErrorMessage("initial")
      setCountError(0)
      setPristine()
    }
  }, [countError])


  // get torque api starts
  const ajaxTorqueRangeComponentObsv$ = useMemo(() => {
    return getTorqueRangeComponentAjaxObs$();
  }, []);
  useObservableCallback(
    ajaxTorqueRangeComponentObsv$,
    (response) => {
      if (response?.status) {
        setLoader(false);
        setTorquePartTypeComponent(response?.content);
      } else {
        setLoader(false);
        setTorquePartTypeComponent([]);
      }
    },
    []
  ); // get torque ends

  useEffect(() => {
    if (partTypeId && inspectionDetailId) {
      setLoader(true);
      ajaxTorqueRangeComponentObsv$.next({
        partTypeId,
        inspectionDetailId
      });
    }
  }, []);
  
  const onSubmit = (formData) => {
    console.log("formData", formData);
  };

  return (
    <>
      {torquePartTypeComponent?.length > 0 ? (
        torquePartTypeComponent?.map((item, index) => {
          return (
            <AMPAccordion
              title={`Part Number: ${item.partnumber} (${item.description})`}
              contentClassName="p-0"
              isOpen={false}
            >
              {item?.bearingQuantity > 0 ?
                <>
                  <Row className="border font-weight-bold text-center mx-0 py-1">
                    <Col xs={12} sm={12} md={12} lg={1}>Bearing</Col>
                    <Col xs={12} sm={4} md={4} lg={2}>Wrench Type</Col>
                    <Col xs={12} sm={4} md={4} lg={1}>Minimum</Col>
                    <Col xs={12} sm={4} md={4} lg={2}>Maximum</Col>
                    <Col xs={12} sm={4} md={4} lg={2}>Reading</Col>
                    <Col xs={12} sm={4} md={4} lg={3}>Comments</Col>
                    {inspectionTypeStatus !== 3 &&
                      <Col xs={12} sm={4} md={4} lg={1}>Actions</Col>
                    }
                  </Row>
                  <div className='list-table-style p-0'>
                    {item?.bearingValues?.map((bearing, idx) => (
                      <AssemblyTorqueRangeForm
                        key={idx}
                        bearing={bearing}
                        minimumValue={item?.minimumValue}
                        maximumValue={item?.maximumValue}
                        inspectionDetailId={inspectionDetailId}
                        partTypeComponentId={item?.id}
                        gauge={gauge}
                        inspectionTypeStatus={inspectionTypeStatus}
                        type={type}
                        completed={completed}
                        alertErrorMessage={alertErrorMessage}
                        setAlertErrorMessage={setAlertErrorMessage}
                        setCountError={setCountError}
                        Prompt={Prompt}
                        setDirty={setDirty}
                        setPristine={setPristine}
                      />
                    ))}
                  </div>
                </> :
                <Row>
                  <Col className="text-center text-danger">
                    No Data Found
                  </Col>
                </Row>
              }
            </AMPAccordion>
          );
        })
      ) : (
        <div className="text-center">No Data Found</div>
      )}
    </>
  );
};
export default AssemblyTorqueRange;

export const AssemblyTorqueRangeForm = ({
  bearing,
  minimumValue,
  maximumValue,
  inspectionDetailId,
  partTypeComponentId,
  gauge,
  inspectionTypeStatus,
  type,
  completed,
  alertErrorMessage,
  setAlertErrorMessage,
  setCountError,
  Prompt,
  setDirty,
  setPristine,
}) => {

  useEffect(() => {
    gauge?.filter((itm) => {
      if (
        parseInt(itm.value) === parseInt(bearing?.gaugeId)
      ) {
        setValue("wrenchType", itm)
      }
    });
  }, [gauge])

  const context = useAccessState()
  const [loader, setLoader] = useState(false)
  const [torqueId, setTorqueId] = useState(bearing?.id)

  const validationSchema = useMemo(
    () =>
      yup.object({
        wrenchType: yup.object().required("required"),
        reading: yup.number()
          .min(minimumValue, `value between ${minimumValue} - ${maximumValue} `)
          .max(maximumValue, `value between ${minimumValue} - ${maximumValue} `)
          .required(),
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

  const ajaxSaveInspectionTorqueRangeObsv$ = useMemo(() => {
    return saveInspectionTorqueRangeAjax$(
      DEFAULT_BASE_URL +
      VERSION +
      SAVE_INSPECTION_SUBCOMPONENT_POST_TORQUE_RANGE, {
      errorHandler: (error) => {
        setLoader(false)
        toast.error(AMPToastConsts.SAVE_INSPECTION_TORQUE_RANGE_ERROR, {
          position: toast.POSITION.TOP_CENTER,
        });
      },
    });
  }, []);
  useObservableCallback(ajaxSaveInspectionTorqueRangeObsv$,
    (response) => {
      if (response?.status) {
        setLoader(false)
        setTorqueId(response?.content)
        reset(response?.formData)
        toast.success(AMPToastConsts.SAVE_INSPECTION_TORQUE_RANGE_SUCCESS, {
          position: toast.POSITION.TOP_CENTER,
        });
      } else {
        setLoader(false)
        toast.error(response?.message, {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    });


  const onSubmit = formData => {
    const request = {
      id: torqueId === ConstVariable?.DID ? "" : torqueId,
      inspectionDetailId: inspectionDetailId,
      partTypeComponentId: partTypeComponentId,
      gaugeId: `${formData?.wrenchType?.value}`,
      bearingSequenceNumber: `${bearing?.bearingSequenceNumber}`,
      minimumValue: `${minimumValue}`,
      maximumValue: `${maximumValue}`,
      readingValue: `${formData?.reading}`,
      comment: formData?.comment,
      RequestedById: parseInt(context?.userId)
    }
    setLoader(true)
    ajaxSaveInspectionTorqueRangeObsv$.next({
      request,
      formData
    })
  }


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
      reset()
    }
  }, [alertErrorMessage])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border border-top-0">
      <AMPLoader isLoading={loader} />
      {/* render Prompt */}
      {Prompt}
      {/* /render Prompt */}
      <Row className="py-1 px-2 text-center">
        <Col xs={12} sm={12} md={12} lg={1} className="text-left">
          {`Bearing ${bearing?.bearingSequenceNumber}`}
        </Col>
        <Col xs={12} sm={4} md={4} lg={2} >
          <AMPFieldWrapper
            className="m-0 p-0"
            colProps={{
              md: 12,
              sm: 12,
              lg: 12,
              xs: 12,
            }}
            controlId="wrenchType"
            name="wrenchType"
            // required="true"
            fieldValidation={errors.wrenchType ? true : false}
            isDisabled={inspectionTypeStatus === 3}
          >
            <Controller
              as={Select}
              id="wrenchType"
              control={control}
              options={gauge}
              onChange={([selected]) => {
                // React Select return object instead of value for selection
                return { value: selected };
              }}
              defaultValue={
                gauge?.filter((itm) => {
                  if (
                    parseInt(itm.value) === parseInt(bearing?.gaugeId)
                  ) {
                    return itm;
                  } else return null;
                })
              }
            />
          </AMPFieldWrapper>
        </Col>
        <Col xs={12} sm={4} md={4} lg={1}>
          {minimumValue}
        </Col>
        <Col xs={12} sm={4} md={4} lg={2}>
          {maximumValue}
        </Col>
        <Col xs={12} sm={4} md={4} lg={2}>
          <AMPFieldWrapper
            className="m-0 p-0"
            colProps={{
              md: 12,
              sm: 12,
              lg: 12,
              xs: 12,
            }}
            controlId="reading"
            name="reading"
            // required="true"
            fieldValidationCustom={errors?.reading?.message}
            disabled={inspectionTypeStatus === 3}
          >

            <AMPNumberTextBox
              ref={register}
              step=".001"
              defaultValue={bearing?.reading}
              style={{ height: "36px", width: "100%" }}
            />
          </AMPFieldWrapper>
        </Col>
        <Col xs={12} sm={4} md={4} lg={3}>
          {/* {reading ? ( */}
          <textarea
            name="comment"
            id=""
            // cols="30"
            rows="1"
            ref={register}
            defaultValue={bearing?.comment}
            disabled={inspectionTypeStatus === 3}
            style={{ height: "36px", width: "100%" }}
          >
          </textarea>
        </Col>
        {inspectionTypeStatus !== 3 &&
          <Col xs={12} sm={4} md={4} lg={1} className="text-left">
            <button
              aria-label="Update"
              name="Update"
              type="submit"
              class="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
            >
              <AMPTooltip text="Update">
                <svg
                  fill="rgb(11, 26, 88)"
                  viewBox="0 0 64 64"
                  width="20px"
                  height="20px"
                  xmlns="http://www.w3.org/2000/svg"
                  class="svg-inline--fa amp-svg-icon amp-svg-floppy-disk fa-w-16 amp-icon"
                >
                  <path d="M61.707,10.293l-8-8A1,1,0,0,0,53,2H7A5.006,5.006,0,0,0,2,7V57a5.006,5.006,0,0,0,5,5H57a5.006,5.006,0,0,0,5-5V11A1,1,0,0,0,61.707,10.293ZM48,4V20a1,1,0,0,1-1,1H17a1,1,0,0,1-1-1V4ZM10,60V35a3,3,0,0,1,3-3H51a3,3,0,0,1,3,3V60Zm50-3a3,3,0,0,1-3,3H56V35a5.006,5.006,0,0,0-5-5H13a5.006,5.006,0,0,0-5,5V60H7a3,3,0,0,1-3-3V7A3,3,0,0,1,7,4h7V20a3,3,0,0,0,3,3H47a3,3,0,0,0,3-3V4h2.586L60,11.414Z"></path>
                  <path d="M39,19h6a1,1,0,0,0,1-1V7a1,1,0,0,0-1-1H39a1,1,0,0,0-1,1V18A1,1,0,0,0,39,19ZM40,8h4v9H40Z"></path>
                  <path d="M47,45H17a1,1,0,0,0,0,2H47a1,1,0,0,0,0-2Z"></path>
                  <path d="M47,39H17a1,1,0,0,0,0,2H47a1,1,0,0,0,0-2Z"></path>
                  <path d="M47,51H17a1,1,0,0,0,0,2H47a1,1,0,0,0,0-2Z"></path>
                </svg>
              </AMPTooltip>
            </button>
            {(torqueId !== ConstVariable?.DID
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
        }
      </Row>
    </form>
  )
}
