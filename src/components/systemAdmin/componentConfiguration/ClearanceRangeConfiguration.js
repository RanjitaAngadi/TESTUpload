import React, { useState, useEffect, useMemo } from 'react';
import ReactGA from 'react-ga';
import { Row, Col, Container } from "react-bootstrap";
import { AMPFieldWrapper } from "../../common/AMPFieldWrapper";
import AMPFieldSet from "../../common/AMPFieldSet";
import { AMPFormLayout } from "../../common/AMPFormLayout";
import { AMPNumberTextBox, AMPTextBox } from "../../common";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import Select from "react-select";
import * as yup from "yup";
import { AMPToastConsts } from "../../common/const/AMPToastConst";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import { ampJsonAjax } from "../../common/utils/ampAjax";
import {
    useObservable,
    useObservableCallback,
} from "../../common/hooks/useObservable";
import {
    DEFAULT_BASE_URL,
    VERSION,
    GET_PART_TYPE,
    GET_PART_TYPE_COMPONENT_CLEARANCE_RANGE,
    UPDATE_PART_TYPE_COMPONENT_CLEARANCE_RANGE,
    ConstVariable,
} from "../../common/const";
import { toast } from "react-toastify";
import AMPLoader from '../../common/AMPLoader';
import { AMPValidation } from '../../common/AMPAuthorization/AMPValidation';
import AMPTooltip from '../../common/AMPTooltip';

import {
    AccessProvider,
    useAccessDispatch,
    useAccessState,
} from "../../../utils/AppContext/loginContext";

import complete_icon from "../../../styles/images/complete_icon.png";
import useUnsavedChangesWarning from '../../common/hooks/useUnsavedChangesWarning';

const getPartTypeListAjaxObs$ = () =>
    new Subject().pipe(
        mergeMap((param) =>
            ampJsonAjax.get(DEFAULT_BASE_URL + VERSION + GET_PART_TYPE).pipe(
                map((xhrResponse) => {
                    const filteredData = xhrResponse?.response?.content.map((item) => {
                        return {
                            label: item.name,
                            value: item.id,
                        };
                    });
                    return filteredData;
                }),
                catchError((error) => {
                    return throwError(error);
                })
            )
        )
    ); // End of Line

const getClearanceRangeComponentAjaxObs$ = () =>
    new Subject().pipe(
        mergeMap((params) =>
            ampJsonAjax.get(DEFAULT_BASE_URL +
                VERSION +
                GET_PART_TYPE_COMPONENT_CLEARANCE_RANGE +
                params
            ).pipe(
                map((xhrResponse) => {
                    return xhrResponse?.response;
                }),
                catchError((error) => {
                    return throwError(error);
                })
            )
        )
    );

const updateClearanceRangeAjax$ = (URL, { errorHandler }) =>
    new Subject().pipe(
        mergeMap((params) =>
            ampJsonAjax.put(
                URL,
                params?.request).pipe(
                    map((xhrResponse) => {
                        return { ...xhrResponse?.response, formData: params?.formData };
                    }),
                    catchError((error) => {
                        errorHandler(error.response);
                        return [];
                    })
                )
        )
    ); // ENd of line

export const ClearanceRangesConfiguration = () => {
    const partTypeAjaxObsv$ = useMemo(() => {
        return getPartTypeListAjaxObs$();
    }, []);
    const partTypeResult = useObservable(partTypeAjaxObsv$, []);
    useEffect(() => {
        if (partTypeAjaxObsv$) partTypeAjaxObsv$.next();
    }, [partTypeAjaxObsv$]);
    // For google analytics purpose
    useEffect(() => {
        ReactGA.pageview(window.location.pathname + window.location.search);
    }, [])
    return (
        <div className="mb-5">
            <p>
                <span className="receiving-tag">
                    Clearance Range Configuration
                </span>
            </p>
            <FetchClearanceRangesConfiguration
                partTypeResult={partTypeResult}
            />
        </div>
    )
}

export const FetchClearanceRangesConfiguration = ({
    partTypeResult,
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

    const context = useAccessState()
    const [loader, setLoader] = useState(false)
    const [countError, setCountError] = useState(0)
    const [alertErrorMessage, setAlertErrorMessage] = useState("initial")
    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();
    const [partTypeComponent, setPartTypeComponent] = useState(ConstVariable?.INIT)

    let partTypeChange = watch("partType")
    let partTypeId = partTypeChange?.value

    useEffect(() => {
        if (countError === 0) {
            setAlertErrorMessage("initial")
            setCountError(0)
            setPristine()
        }
    }, [countError])

    useEffect(() => {
        setAlertErrorMessage("initial")
        setCountError(0)
        setPristine()
    }, [partTypeId])

    const ajaxClearanceRangeComponentObsv$ = useMemo(() => {
        return getClearanceRangeComponentAjaxObs$();
    }, [])

    useObservableCallback(
        ajaxClearanceRangeComponentObsv$,
        (response) => {
            if (response?.status) {
                setLoader(false)
                setPartTypeComponent(response?.content)
            } else {
                setLoader(false)
                setPartTypeComponent([])
                // toast.error(response?.message, {
                //     position: toast.POSITION.TOP_CENTER,
                // });
            }
        },
        []
    );

    useEffect(() => {
        if (partTypeId) {
            setLoader(true)
            ajaxClearanceRangeComponentObsv$.next(partTypeId)
        }
    }, [partTypeId])

    const onSearch = (formData) => {

    }
    return (
        <div id="results" className="form-container bg-form GeeksforGeeks">
            <AMPLoader isLoading={loader} />
            <Row>
                <Col>
                    <form onSubmit={handleSubmit(onSearch)}>
                        <AMPFieldSet title="Search Clearance Components">
                            <AMPFormLayout className="pb-2">
                                <AMPFieldWrapper
                                    colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                                    label="Part Type"
                                    controlId="partType"
                                    name="partType"
                                    required="true"
                                    fieldValidation={errors.partType ? true : false}
                                >
                                    <Controller
                                        as={Select}
                                        id="partType"
                                        control={control}
                                        options={partTypeResult}
                                        onChange={([selected]) => {
                                            return { value: selected };
                                        }}
                                    />
                                </AMPFieldWrapper>
                            </AMPFormLayout>
                        </AMPFieldSet>
                    </form>
                </Col>
            </Row>
            <div>
                {partTypeComponent !== ConstVariable?.INIT &&
                    partTypeComponent?.length > 0 &&
                    <Container striped fluid className="my-4 fn-14">
                        <Row className="border font-weight-bold py-2 text-break">
                            <Col xs={6} sm={3} md={3} lg={2}>Part Number</Col>
                            <Col xs={6} sm={3} md={3} lg={2}>Description</Col>
                            <Col xs={6} sm={3} md={3} lg={2}>Quantity</Col>
                            <Col xs={6} sm={3} md={3} lg={2}>Minimum</Col>
                            <Col xs={6} sm={3} md={3} lg={2}>Maximum</Col>
                            <Col xs={6} sm={3} md={3} lg={2}>Action</Col>
                        </Row>
                        <Row>
                            <Col className='list-table-style p-0'>
                                {partTypeComponent?.map(item => (
                                    <ClearanceRangesConfigurationForm
                                        key={item?.id}
                                        id={item?.id}
                                        componentId={item?.componentid}
                                        partNumber={item?.partnumber}
                                        description={item?.description}
                                        bearingQuantity={item?.bearingQuantity}
                                        minimumValue={item?.minimumValue}
                                        maximumValue={item?.maximumValue}
                                        context={context}
                                        Prompt={Prompt}
                                        setDirty={setDirty}
                                        setCountError={setCountError}
                                        alertErrorMessage={alertErrorMessage}
                                        setAlertErrorMessage={setAlertErrorMessage}
                                    />
                                ))}
                            </Col>
                        </Row>
                    </Container>
                }
                {partTypeComponent?.length === 0 &&
                    <Row className="text-center text-danger">
                        <Col>No Data Found</Col>
                    </Row>
                }
            </div>
        </div>
    )
}


export const ClearanceRangesConfigurationForm = ({
    id,
    componentId,
    partNumber,
    description,
    bearingQuantity,
    minimumValue,
    maximumValue,
    context,
    Prompt,
    setDirty,
    setCountError,
    alertErrorMessage,
    setAlertErrorMessage,
}) => {

    const validationSchema = useMemo(
        () =>
            yup.object({
                quantity: yup.number()
                    .positive("positive number ")
                    .integer("integer number ")
                    .max(5, "less than or equal to 5 ")
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
        // resolver,
    });

    const [loader, setLoader] = useState(false)

    useEffect(() => {
        const fields = [
            "quantity",
            "min",
            "max"
        ];
        const content = {
            quantity: bearingQuantity,
            min: minimumValue,
            max: maximumValue
        }
        fields.forEach((field) => setValue(field, content[field]));
    }, [])

    const ajaxUpdateClearanceRange$ = useMemo(() => {
        return updateClearanceRangeAjax$(
            DEFAULT_BASE_URL +
            VERSION +
            UPDATE_PART_TYPE_COMPONENT_CLEARANCE_RANGE, {
            errorHandler: (error) => {
                setLoader(false)
                toast.error(AMPToastConsts.CLEARANCE_RANGE_CONFIGURATION_SAVE_ERROR, {
                    position: toast.POSITION.TOP_CENTER,
                });
            },
        });
    }, []);

    useObservableCallback(ajaxUpdateClearanceRange$, (response) => {
        if (response?.status) {
            reset(response?.formData)
            setLoader(false)
            toast.success(AMPToastConsts.CLEARANCE_RANGE_CONFIGURATION_SAVE_SUCCESS, {
                position: toast.POSITION.TOP_CENTER,
            });
        } else {
            setLoader(false)
            toast.error(response?.message, {
                position: toast.POSITION.TOP_CENTER,
            });
        }
    });

    const onSubmit = (formData) => {
        const request = {
            Id: id,
            ClearanceRangeBearingQuantity: parseInt(formData?.quantity),
            RequestedById: parseInt(context?.userId),
            ClearanceMinimumValue: formData?.min,
            ClearanceMaximumValue: formData?.max

        }
        setLoader(true)
        ajaxUpdateClearanceRange$.next({
            request,
            formData
        })
    }

    useEffect(() => {
        if (formState?.isDirty) {
            setAlertErrorMessage(true)
            setDirty()
            setCountError(preState => preState + 1)
        } else if (alertErrorMessage !== ConstVariable?.INIT && !formState?.isDirty) {
            setCountError(preState => preState - 1)
        }
    }, [formState?.isDirty])

    return (
        <form novalidate onSubmit={handleSubmit(onSubmit)} className="border border-top-0">
            <AMPLoader isLoading={loader} />
            {/* render prompt */}
            {Prompt}
            {/* render prompt */}
            <Row className="py-1 px-2 text-break">
                <Col xs={6} sm={3} md={3} lg={2}>{partNumber}</Col>
                <Col xs={6} sm={3} md={3} lg={2}>{description}</Col>
                <Col xs={6} sm={3} md={3} lg={2}>
                    <AMPFormLayout>
                        <AMPFieldWrapper
                            colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
                            controlId="quantity"
                            name="quantity"
                            fieldValidationCustom={errors?.quantity?.message}
                        >
                            <AMPNumberTextBox
                                ref={register({
                                    valueAsNumber: true,
                                    pattern: {
                                        value: /^[0-9]+$/,
                                        message: 'accepts only integer Values'
                                    },
                                    required: 'required',
                                    min: { value: 1, message: "quantity cannot be less than 1" },
                                    max: { value: 5, message: "should be less than or equal to 5" },
                                })}
                            />
                        </AMPFieldWrapper>
                    </AMPFormLayout>
                </Col>
                <Col xs={6} sm={3} md={3} lg={2}>
                    <AMPFormLayout>
                        <AMPFieldWrapper
                            colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
                            controlId="min"
                            name="min"
                            fieldValidationCustom={errors?.min ? errors.min.message : false}
                        >
                            <AMPNumberTextBox
                                ref={register({
                                    min: {
                                        value: 0,
                                        message: "please enter positive numbers with maximum 3 decimal digits"
                                    },
                                    validate: (min) => parseFloat(getValues('max')) >= parseFloat(min) || 'should be less than or equal to max value',
                                    pattern: {
                                        value: /^[0-9]\d{0,9}(\.\d{1,3})?%?$/,
                                        message: 'cannot accept more than 3 decimal digits',
                                    },
                                    required: "required",
                                })}
                                step=".001"
                            />
                        </AMPFieldWrapper>
                    </AMPFormLayout>
                </Col>
                <Col xs={6} sm={3} md={3} lg={2}>
                    <AMPFormLayout>
                        <AMPFieldWrapper
                            colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
                            controlId="max"
                            name="max"
                            fieldValidationCustom={errors?.max ? errors.max.message : false}
                        >
                            <AMPNumberTextBox
                                ref={register({
                                    min: {
                                        value: 0,
                                        message: "please enter positive numbers with maximum 3 decimal digits"
                                    },
                                    validate: (max) => parseFloat(getValues('min')) <= parseFloat(max) || 'should be more than or equal to min value',
                                    pattern: {
                                        value: /^[0-9]\d{0,9}(\.\d{1,3})?%?$/,
                                        message: 'cannot accept more than 3 decimal digits',
                                    },
                                    required: "required"
                                })}
                                step=".001"
                            />
                        </AMPFieldWrapper>
                    </AMPFormLayout>
                </Col>
                <Col xs={6} sm={3} md={3} lg={2}>
                    <button
                        aria-label="Update"
                        name="Update"
                        type="submit"
                        className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 mt-2 btn btn-amp-monochrome-amp-brand btn-md"
                    >
                        <AMPTooltip
                            text={"Update"}
                        >
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
                    {(id !== ConstVariable?.DID && !formState?.isDirty) && (
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
            </Row>
        </form>
    )
}
