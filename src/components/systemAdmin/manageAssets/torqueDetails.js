import React, { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Row, Col, Container } from "react-bootstrap";
import { AMPAccordion } from "../../common/AMPAccordion";
import { AMPValidation } from "../../common/AMPAuthorization/AMPValidation";
import AMPLoader from "../../common/AMPLoader";
import { AMPFieldWrapper } from "../../common/AMPFieldWrapper";
import { AMPNumberTextBox } from "../../common";
import AMPTooltip from "../../common/AMPTooltip";
import * as yup from "yup";
import Select from "react-select";
import {
    AccessProvider,
    useAccessDispatch,
    useAccessState,
} from '../../../utils/AppContext/loginContext';
import complete_icon from '../../../styles/images/complete_icon.png';
import { DEFAULT_BASE_URL,
         VERSION,
         GET_PART_TYPE_COMPONENT_TORQUE_RANGE_IN_ASSET,
         SAVE_INSPECTION_SUBCOMPONENT_POST_TORQUE_RANGE_IN_ASSET,
         ConstVariable }
          from '../../common/const';

import db from './db.json';
import { Subject, throwError } from "rxjs";
import { catchError, mergeMap } from "rxjs/operators";
import { ampJsonAjax } from "../../common/utils/ampAjax";
import { useObservableCallback } from "../../common/hooks/useObservable";
import { toast } from "react-toastify";
import useUnsavedChangesWarning from "../../common/hooks/useUnsavedChangesWarning";
import { Redirect, useLocation, Link, useHistory } from "react-router-dom";

//Get Torque component api start
const getTorqueRangeAjaxObs$ = () =>
   new Subject().pipe(
     mergeMap((params)=>
       ampJsonAjax
             .get(
                DEFAULT_BASE_URL +
                VERSION +
                GET_PART_TYPE_COMPONENT_TORQUE_RANGE_IN_ASSET +
                params?.assetId + "/" + params?.partTypeId
             )
             .pipe(
                map((xhrResponse)=>{
                    return xhrResponse?.response;
                }),
                catchError((error)=>{
                    return throwError(error);
                })
             )
     )
   );
   
const saveInspectionTorqueRangeAjax$ = (URL,{errorHandler}) =>
    new Subject().pipe(
        mergeMap((params)=>
         ampJsonAjax.post(URL,params?.request).pipe(
             map((xhrResponse)=>{
                return {...xhrResponse.response, formData: params?.formData };
             }),
             catchError((error)=>{
                errorHandler(error.response);
                return [];
             })
         ))
    ) ; 
   
const TorqueDetails = (props) => {
    const {
        title,
        partTypeId,
        inspectionDetailId,
        gauge,
        inspectionTypeStatus,
        type,
        completed,
        //alertErrorMessage,
       // setAlertErrorMessage,
       assetId,

    } = props;

    const [alertErrorMessage, setAlertErrorMessage] = useState("initial");
    //const { handleSubmit, control } = useForm({});
    const [loader, setLoader] = useState(false);
    const [countError, setCountError] = useState(0)
    const [torquePartTypeComponent, setTorquePartTypeComponent] = useState(db?.torqueDetails);
    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();

   // const locationRef = useLocation();
   // const serviceCenterId = locationRef?.state?.serviceCenterId;
    //const AssetId = locationRef?.state?.AssetId;
    const wrenchtype = [
        { label: "Test Wrench", value: 1 },
        { label: "123456789", value: 2 },
        { label: "DIDOTEST", value: 3 },
        { label: "707070", value: 4 },
    ];

    useEffect(()=>{
          if(countError === 0){
             setAlertErrorMessage("initial")
             setCountError(0)
             setPristine()
          }
    },[countError])

    // get  torque api start
    const ajaxTorqueRangeObsv$ = useMemo(()=>{
        return getTorqueRangeAjaxObs$();
    },[]);
    useObservableCallback(
        ajaxTorqueRangeObsv$,
        (response) => {
            console.log("troque api" ,response);
            if(response?.status){
                setLoader(false);
                setTorquePartTypeComponent(response)
            } else {
                setLoader(false);
                setTorquePartTypeComponent([]);
            }
        },[]
    ); // get torque api ends 

    useEffect(()=>{
         if(partTypeId && assetId){
            setLoader(true);
            ajaxTorqueRangeObsv$.next({
                assetId,
                partTypeId
            });
         }
    },[]);

    const onSubmit = (formData) => {
        console.log("formData", formData);
    };

    return (
        <>
            {torquePartTypeComponent?.length > 0 ? (
                torquePartTypeComponent?.map((item, index) => {
                    return (
                        <AMPAccordion
                            key={item?.id}
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
                                            <AssetTorqueRangeForm
                                                key={idx}
                                                bearing={bearing}
                                                minimumValue={item?.minimumValue}
                                                maximumValue={item?.maximumValue}
                                                partTypeComponentId={item?.id}
                                                gauge={gauge}
                                                inspectionTypeStatus={inspectionTypeStatus}
                                                type={type}
                                                completed={completed}
                                                alertErrorMessage={alertErrorMessage}
                                                setAlertErrorMessage={setAlertErrorMessage}
                                                setCountError={setCountError}
                                                wrenchtype={wrenchtype}
                                                Prompt={Prompt}
                                                setDirty={setDirty}
                                                setPristine={setPristine}
                                                assetId={assetId}
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
    )
}

export default TorqueDetails

export const AssetTorqueRangeForm = ({

    bearing,
    minimumValue,
    maximumValue,
    partTypeComponentId,
    gauge,
    inspectionTypeStatus,
    type,
    completed,
    alertErrorMessage,
    setAlertErrorMessage,
    setCountError,
    wrenchtype,
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

    const ajaxSaveInspectionTorqueRangeObsv$ = useMemo(()=>{
        return saveInspectionTorqueRangeAjax$(
            DEFAULT_BASE_URL +
            VERSION +
            SAVE_INSPECTION_SUBCOMPONENT_POST_TORQUE_RANGE_IN_ASSET,{
                errorHandler: (error) => {
                    setLoader(false)
                    toast.error(AMPToastConsts.SAVE_INSPECTION_TORQUE_RANGE_ERROR, {
                      position: toast.POSITION.TOP_CENTER,
                    });
                  },
            });
    } , []);
 useObservableCallback(ajaxSaveInspectionTorqueRangeObsv$,
    (response)=>{
        if(response?.status){
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
        
    } );

    const onSubmit = formData => {
        console.log("onSubmittt",formData);
        const request = {
          id: torqueId === ConstVariable?.DID ? "" : torqueId,
          assetId:assetId,
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
                            options={wrenchtype}
                            // options={gauge}
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