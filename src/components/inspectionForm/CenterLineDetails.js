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
import { AMPNumberTextBox, AMPTextBox } from "../common";
import { AMPFieldWrapper } from "../common/AMPFieldWrapper";
import {
    useObservable,
    useObservableCallback,
} from "../common/hooks/useObservable";
import {
    DEFAULT_BASE_URL,
    VERSION,
    POST_CENTER_LINE_DETAILS,
    PUT_CENTER_LINE_DETAILS,
    ConstVariable,
} from "../common/const";
import { ampJsonAjax } from "../common/utils/ampAjax";
import AMPLoader from "../common/AMPLoader";
import complete_icon from "../../styles/images/complete_icon.png";
import useUnsavedChangesWarning from "../common/hooks/useUnsavedChangesWarning";

const saveCenterLineDetailAjax$ = (URL, { errorHandler }) =>
    new Subject().pipe(
        mergeMap((params) =>
            ampJsonAjax.post(URL, params?.body).pipe(
                map((xhrResponse) => {
                    return {
                        ...xhrResponse.response,
                        params
                    };
                }),
                catchError((error) => {
                    errorHandler(error.response);
                    return [];
                })
            )
        )
    );

const updateCenterLineDetailAjax$ = (URL, { errorHandler }) =>
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

export const CenterLineDetails = ({
    partTypeId,
    loader,
    setLoader,
    centerLineData,
    setCenterLineData,
    inspectionDetailId,
    inspectionTypeStatus,
    type,
    completed,
    setIsError,
    alertErrorMessage,
    setAlertErrorMessage,
}) => {

    const [countError, setCountError] = useState(0);
    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();

    useEffect(() => {
        if (countError === 0) {
            setAlertErrorMessage("initial")
            setCountError(0)
            setPristine()
        }
    }, [countError])

    return (
        <div>
            <AMPLoader isLoading={loader} />
            {(centerLineData !== ConstVariable?.INIT && centerLineData?.length !== 0) && (
                <div id="results" className="form-container bg-form GeeksforGeeks mb-4">
                    <Container striped="true" fluid className="pt-2">
                        <Row className="border font-weight-bold py-2">
                            <Col xs={6} sm={6} md={2} lg={2}>Location</Col>
                            <Col xs={12} sm={6} md={4} lg={4}>Drive Side (in Inches)</Col>
                            <Col xs={12} sm={6} md={4} lg={4}>Non-Drive Side (in Inches)</Col>
                            {inspectionTypeStatus !== 3 && (
                                <Col xs={6} sm={6} md={2} lg={2}>Action</Col>
                            )}
                        </Row>
                        <Row>
                            <Col className='list-table-style p-0'>
                                {centerLineData?.map((item, idx) => (
                                    <CenterLineDetailForm
                                        key={idx}
                                        item={item}
                                        partTypeId={partTypeId}
                                        inspectionDetailId={inspectionDetailId}
                                        setLoader={setLoader}
                                        setCenterLineData={setCenterLineData}
                                        centerLineData={centerLineData}
                                        inspectionTypeStatus={inspectionTypeStatus}
                                        setIsError={setIsError}
                                        alertErrorMessage={alertErrorMessage}
                                        setAlertErrorMessage={setAlertErrorMessage}
                                        setCountError={setCountError}
                                        Prompt={Prompt}
                                        setDirty={setDirty}
                                        setPristine={setPristine}
                                    />
                                ))}
                            </Col>
                        </Row>
                    </Container>
                </div>
            )}
            {(centerLineData !== ConstVariable?.INIT &&
                centerLineData?.length === 0
            ) && (
                    <div className="text-center">No Data Found</div>
                )}
        </div>
    )
}

export const CenterLineDetailForm = ({
    item,
    partTypeId,
    inspectionDetailId,
    setLoader,
    centerLineData,
    setCenterLineData,
    inspectionTypeStatus,
    setIsError,
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

    const saveCenterLineDetailObsv$ = useMemo(() => {
        return saveCenterLineDetailAjax$(
            DEFAULT_BASE_URL +
            VERSION +
            POST_CENTER_LINE_DETAILS,
            {
                errorHandler: (error) => {
                    setLoader(false);
                    toast.error(
                        AMPToastConsts.SAVE_CENTER_LINE_DETAILS_ERROR,
                        {
                            position: toast.POSITION.TOP_CENTER,
                        }
                    );
                },
            }
        );
    }, []);
    useObservableCallback(saveCenterLineDetailObsv$, (response) => {
        if (response?.status) {
            toast.success(AMPToastConsts.SAVE_CENTER_LINE_DETAILS_SUCCESS, {
                position: toast.POSITION.TOP_CENTER,
            });

            let newCenterLineData = response?.params?.centerLineData?.map((item, index) => {
                return response?.content[0]?.boreLocationTypeId === item?.locationId ?
                    {
                        inspectionBoreDetailId: response?.content[0]?.id,
                        locationId: item?.locationId,
                        locationName: item?.locationName,
                        driveSideValue: response?.params?.body[0]?.driveSideValue,
                        nonDriveSideValue: response?.params?.body[0]?.nonDriveSideValue
                    } : item;
            })
            setCenterLineData(newCenterLineData)
            if (newCenterLineData?.every(
                (item, idx) => item?.inspectionBoreDetailId !== ConstVariable?.DID)
            ) {
                setIsError(false)
            }
            reset(response?.params?.formData);
            setLoader(false);
        } else {
            setLoader(false);
            toast.error(response?.message, {
                position: toast.POSITION.TOP_CENTER,
            });
        }
    });

    const updateCenterLineDetailObsv$ = useMemo(() => {
        return updateCenterLineDetailAjax$(
            DEFAULT_BASE_URL +
            VERSION +
            PUT_CENTER_LINE_DETAILS,
            {
                errorHandler: (error) => {
                    setLoader(false);
                    toast.error(
                        AMPToastConsts.UPDATE_CENTER_LINE_DETAILS_ERROR,
                        {
                            position: toast.POSITION.TOP_CENTER,
                        }
                    );
                },
            }
        );
    }, []);
    useObservableCallback(updateCenterLineDetailObsv$, (response) => {
        if (response?.status) {
            toast.success(AMPToastConsts.UPDATE_CENTER_LINE_DETAILS_SUCCESS, {
                position: toast.POSITION.TOP_CENTER,
            });
            reset(response?.params?.formData);
            setLoader(false);
        } else {
            setLoader(false);
            toast.error(response?.message, {
                position: toast.POSITION.TOP_CENTER,
            });
        }
    });

    const onSubmit = (formData) => {
        if (item?.inspectionBoreDetailId === ConstVariable?.DID) {
            setLoader(true)
            let request = [{
                inspectionDetailId: inspectionDetailId,
                locationId: item?.locationId,
                driveSideValue: parseFloat(formData?.driveSide),
                nonDriveSideValue: parseFloat(formData?.nonDriveSide)
            }]
            saveCenterLineDetailObsv$?.next({
                body: request,
                partTypeId,
                inspectionDetailId,
                centerLineData,
                formData: formData,
            })
        } else {
            setLoader(true)
            let request = [{
                id: item?.inspectionBoreDetailId,
                inspectionDetailId: inspectionDetailId,
                locationId: item?.locationId,
                driveSideValue: parseFloat(formData?.driveSide),
                NonDriveSideValue: parseFloat(formData?.nonDriveSide)
            }]
            updateCenterLineDetailObsv$?.next({
                request: request,
                formData: formData,
            })
        }
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
            <Row className="py-1 px-2">
                <Col>
                    <Row>
                        <Col>
                            {/* render Prompt */}
                            {Prompt}
                            {/* /render Prompt */}
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6} sm={6} md={2} lg={2} className="mt-2">
                            Location {item?.locationName}
                        </Col>
                        <Col xs={12} sm={6} md={4} lg={4}>
                            <AMPFieldWrapper
                                colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
                                controlId="driveSide"
                                name="driveSide"
                                fieldValidationCustom={errors?.driveSide?.message}
                                readOnly={inspectionTypeStatus === 3}
                            >
                                <AMPNumberTextBox
                                    ref={register({
                                        required: "Required",
                                        min: {
                                            value: 0.001,
                                            message: "Please enter positive numbers with maximum 3 decimal digits"
                                        }
                                    })}
                                    step=".001"
                                    defaultValue={item?.driveSideValue}
                                />
                            </AMPFieldWrapper>
                        </Col>
                        <Col xs={12} sm={6} md={4} lg={4}>
                            <AMPFieldWrapper
                                colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
                                controlId="nonDriveSide"
                                name="nonDriveSide"
                                fieldValidationCustom={errors?.nonDriveSide?.message}
                                readOnly={inspectionTypeStatus === 3}
                            >
                                <AMPNumberTextBox
                                    ref={register({
                                        required: "Required",
                                        min: {
                                            value: 0.001,
                                            message: "Please Enter Positive Number With 3 Decimal Digits Only"
                                        }
                                    })}
                                    step=".001"
                                    defaultValue={item?.nonDriveSideValue}
                                />
                            </AMPFieldWrapper>
                        </Col>
                        {inspectionTypeStatus !== 3 && (
                            <Col xs={6} sm={6} md={2} lg={2} className="mt-1">
                                <button
                                    aria-label="save"
                                    name="save"
                                    type="submit"
                                    className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 mt-1 btn btn-amp-monochrome-amp-brand btn-md"
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
                                {(item?.inspectionBoreDetailId !== ConstVariable?.DID
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
                </Col>
            </Row>
        </form>
    )
}
