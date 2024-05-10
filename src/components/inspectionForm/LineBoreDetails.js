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
    GET_LINE_BORE_DETAILS,
    POST_LINE_BORE_DETAILS,
    PUT_LINE_BORE_DETAILS,
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

const saveLineBoreDetailAjax$ = (URL, { errorHandler }) =>
    new Subject().pipe(
        mergeMap((params) =>
            ampJsonAjax.post(URL, params?.body).pipe(
                map((xhrResponse) => {
                    return {
                        ...xhrResponse.response,
                        partTypeId: params?.partTypeId,
                        inspectionDetailId: params?.inspectionDetailId,
                        request: params?.body,
                        currentBoreCount: params?.currentBoreCount,
                        lineBoreData: params?.lineBoreData,
                        formData: params?.formData
                    };
                }),
                catchError((error) => {
                    errorHandler(error.response);
                    return [];
                })
            )
        )
    );

const updateLineBoreDetailAjax$ = (URL, { errorHandler }) =>
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

export const LineBoreDetails = ({
    partTypeId,
    loader,
    setLoader,
    lineBoreData,
    setLineBoreData,
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
    const [uniqueLocation, setUniqueLocation] = useState(ConstVariable?.INIT);

    useEffect(() => {
        if (countError === 0) {
            setAlertErrorMessage("initial")
            setCountError(0)
            setPristine()
        }
    }, [countError])


    function unique(args) {
        return [].concat.apply([], args)?.map(item => item?.locationName).filter(function (elem, index, self) {
            return self.indexOf(elem) === index;
        });
    }

    let arr = []
    useEffect(() => {
        if (lineBoreData !== ConstVariable?.INIT && lineBoreData?.length > 0) {
            lineBoreData.forEach(element => arr?.push(element?.readings))
            let result = unique(arr)
            setUniqueLocation(result)
        }
    }, [lineBoreData])

    return (
        <div>
            <AMPLoader isLoading={loader} />
            {(lineBoreData !== ConstVariable?.INIT &&
                lineBoreData?.length !== 0
            ) && (
                    <div id="results" className="form-container bg-form GeeksforGeeks mb-1">
                        <Container striped="true" fluid className="pt-2">
                            <>
                                {uniqueLocation !== ConstVariable?.INIT && (
                                    <Row className="border font-weight-bold py-2">
                                        <Col xs={12} sm={6} md={2} lg={2}>Bearing</Col>
                                        {uniqueLocation?.map((item, idx) => (
                                            <Col xs={12} sm={6} md={2} lg={2} key={idx}>{item} (in Inches)</Col>
                                        ))}
                                        {inspectionTypeStatus !== 3 && (
                                            <Col xs={12} sm={6} md={2} lg={2}>Action</Col>
                                        )}
                                    </Row>)}
                                <Row>
                                    <Col className='list-table-style p-0'>
                                        {lineBoreData?.map((item, idx) => (
                                            <LineBoreDetailForm
                                                key={idx}
                                                item={item}
                                                uniqueLocation={uniqueLocation}
                                                partTypeId={partTypeId}
                                                inspectionDetailId={inspectionDetailId}
                                                setLoader={setLoader}
                                                lineBoreData={lineBoreData}
                                                setLineBoreData={setLineBoreData}
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

                            </>
                        </Container>
                    </div>
                )}

            {(lineBoreData !== ConstVariable?.INIT &&
                lineBoreData?.length === 0
            ) &&
                <div className="text-center">No Data Found</div>
            }
        </div>
    )
}

export const LineBoreDetailForm = ({
    item,
    uniqueLocation,
    partTypeId,
    inspectionDetailId,
    setLoader,
    lineBoreData,
    setLineBoreData,
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

    const [validationError, setValidationError] = useState(false)

    const renderLocation = (uniqueLocation, readings) => {
        return uniqueLocation?.map((data, index) => {
            if (readings?.some((itm, idx) => itm?.locationName === data)) {
                return readings?.map((i, ix) => {
                    if (data === i?.locationName) {
                        return <Col xs={12} sm={6} md={2} lg={2} key={ix}>
                            <AMPFieldWrapper
                                colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
                                controlId={`${i?.locationName}`}
                                name={`${i?.locationName}`}
                                readOnly={inspectionTypeStatus === 3}
                            >
                                <AMPNumberTextBox
                                    ref={register}
                                    step=".001"
                                    defaultValue={i?.value}
                                />
                            </AMPFieldWrapper>
                        </Col>
                    }
                })
            } else {
                return <Col xs={12} sm={3} md={2} lg={2}>
                    N/A
                </Col>
            }
        })
    }

    const updateLineBoreReadings = (response) => {
        let newLineBoreData = response?.lineBoreData?.map((item, idx) => {
            if (item?.borecount === response?.currentBoreCount) {
                return {
                    ...item,
                    readings: item?.readings?.map((itm, ix) => {
                        let tempID = response?.content?.find(ele => ele?.boreNumber === itm?.boreNumber);
                        let tempValue = response?.request?.find(ele => ele?.boreNumber === itm?.boreNumber);
                        return {
                            ...itm,
                            inspectionBoreDetailId: tempID?.id,
                            value: tempValue?.Value
                        }
                    })
                }
            } else {
                return item
            }
        });
        setLineBoreData(newLineBoreData)
        if (newLineBoreData?.every(
            (item, idx) => item?.readings[0]?.inspectionBoreDetailId !== ConstVariable?.DID)
        ) {
            setIsError(false)
        }
        setLoader(false)
    }

    const saveLineBoreDetailObsv$ = useMemo(() => {
        return saveLineBoreDetailAjax$(
            DEFAULT_BASE_URL +
            VERSION +
            POST_LINE_BORE_DETAILS,
            {
                errorHandler: (error) => {
                    setLoader(false);
                    toast.error(
                        AMPToastConsts.SAVE_LINE_BORE_DETAILS_ERROR,
                        {
                            position: toast.POSITION.TOP_CENTER,
                        }
                    );
                },
            }
        );
    }, []);
    useObservableCallback(saveLineBoreDetailObsv$, (response) => {
        if (response?.status) {
            // setLoader(false); // to be commented
            toast.success(AMPToastConsts.SAVE_LINE_BORE_DETAILS_SUCCESS, {
                position: toast.POSITION.TOP_CENTER,
            });
            reset(response?.formData);
            updateLineBoreReadings({
                content: response?.content,
                currentBoreCount: response?.currentBoreCount,
                request: response?.request,
                lineBoreData: response?.lineBoreData
            })
        } else {
            setLoader(false);
            toast.error(response?.message, {
                position: toast.POSITION.TOP_CENTER,
            });
        }
    });

    const updateLineBoreDetailObsv$ = useMemo(() => {
        return updateLineBoreDetailAjax$(
            DEFAULT_BASE_URL +
            VERSION +
            PUT_LINE_BORE_DETAILS,
            {
                errorHandler: (error) => {
                    setLoader(false);
                    toast.error(
                        AMPToastConsts.UPDATE_LINE_BORE_DETAILS_ERROR,
                        {
                            position: toast.POSITION.TOP_CENTER,
                        }
                    );
                },
            }
        );
    }, []);
    useObservableCallback(updateLineBoreDetailObsv$, (response) => {
        if (response?.status) {
            setLoader(false);
            toast.success(AMPToastConsts.UPDATE_LINE_BORE_DETAILS_SUCCESS, {
                position: toast.POSITION.TOP_CENTER,
            });
            reset(response?.params?.formData);
        } else {
            setLoader(false);
            toast.error(response?.message, {
                position: toast.POSITION.TOP_CENTER,
            });
        }
    });


    const onSubmit = (formData) => {
        if (Object?.keys(formData)?.some((key) => (formData[key] === '' || parseFloat(formData[key]) < 0.001))) {
            setValidationError("Please enter positive numbers with maximum 3 decimal digits")
        } else if (item?.readings[0]?.inspectionBoreDetailId === ConstVariable?.DID) {
            setValidationError(false)
            setLoader(true)
            let request = item?.readings.map(el => {
                return {
                    boreNumber: el?.boreNumber,
                    inspectionDetailId: inspectionDetailId,
                    locationId: el?.locationId,
                    Value: parseFloat(formData[el.locationName])
                }
            });
            saveLineBoreDetailObsv$.next({
                body: request,
                partTypeId,
                inspectionDetailId,
                currentBoreCount: item?.borecount,
                lineBoreData,
                formData: formData,
            })
        } else {
            setValidationError(false)
            setLoader(true)
            let request = item?.readings.map(el => {
                return {
                    id: el?.inspectionBoreDetailId,
                    boreNumber: el?.boreNumber,
                    inspectionDetailId: inspectionDetailId,
                    locationId: el?.locationId,
                    Value: parseFloat(formData[el.locationName])
                }
            });
            updateLineBoreDetailObsv$?.next({
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
                            {validationError &&
                                <div className="validation-error-message">
                                    {validationError}
                                </div>
                            }
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} sm={6} md={2} lg={2} className="mt-2">
                            Bearing {item?.borecount}
                        </Col>
                        {uniqueLocation !== ConstVariable?.INIT &&
                            renderLocation(uniqueLocation, item?.readings)
                        }
                        {inspectionTypeStatus !== 3 && (
                            <Col xs={12} sm={6} md={2} lg={2} className="mt-1">
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

                                {(item?.readings[0]?.inspectionBoreDetailId !== ConstVariable?.DID
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
