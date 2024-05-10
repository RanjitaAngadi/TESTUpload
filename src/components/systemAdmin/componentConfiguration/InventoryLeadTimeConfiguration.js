import React, { useState, useEffect, useMemo } from 'react';
import ReactGA from 'react-ga';
import { Form, Row, Col, Button, Table, Container } from "react-bootstrap";
import { AMPFieldWrapper } from "../../common/AMPFieldWrapper";
import AMPFieldSet from "../../common/AMPFieldSet";
import { AMPFormLayout } from "../../common/AMPFormLayout";
import { AMPNumberTextBox, AMPTextBox } from "../../common";
import { AMPValidation } from "../../common/AMPAuthorization/AMPValidation";
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
    GET_PART_TYPE_COMPONENT_TRACEABILITY,
    GET_LEAD_TIME_COMPONENT,
    POST_LEAD_TIME_COMPONENT,
    PUT_LEAD_TIME_COMPONENT,
    ConstVariable,
} from "../../common/const";
import { toast } from "react-toastify";
import AMPLoader from '../../common/AMPLoader';
import AMPTooltip from '../../common/AMPTooltip';
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

const getReplacementComponentTraceabilityAjaxObs$ = () =>
    new Subject().pipe(
        mergeMap((params) =>
            ampJsonAjax.get(DEFAULT_BASE_URL +
                VERSION +
                GET_PART_TYPE_COMPONENT_TRACEABILITY +
                params
            ).pipe(
                map((xhrResponse) => {

                    const filteredComponentID = xhrResponse?.response?.content?.map((item) => {
                        return item?.componentId;
                    });
                    return { ...xhrResponse?.response, filteredComponentID };
                }),
                catchError((error) => {
                    return throwError(error);
                })
            )
        )
    );


const getLeadTimeComponentAjaxObs$ = (URL, { errorHandler }) =>
    new Subject().pipe(
        mergeMap((params) =>
            ampJsonAjax
                .post(URL, params?.filteredComponentID)
                .pipe(
                    map((xhrResponse) => {
                        return {
                            ...xhrResponse.response,
                            partTypeComponent: params?.partTypeComponent
                        };
                    }),
                    catchError((error) => {
                        console.error("Error in Search Work Order", error);
                        errorHandler(error.response);
                        return [];
                    })
                )
        )
    ); // ENd of line
const saveLeadTimeComponentAjax$ = (URL, { errorHandler }) =>
    new Subject().pipe(
        mergeMap((params) =>
            ampJsonAjax.post(URL, params?.request).pipe(
                map((xhrResponse) => {
                    return { ...xhrResponse.response, params };
                }),
                catchError((error) => {
                    setIsAssetAdding(false);
                    errorHandler(error.response);
                    return [];
                })
            )
        )
    );

const updateLeadTimeComponentAjax$ = (URL, { errorHandler }) =>
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

export const InventoryLeadTimeConfiguration = () => {
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
                    Inventory Lead Time Configuration
                </span>
            </p>
            <FetchConfigureInventoryLeadTime
                partTypeResult={partTypeResult}
            />
        </div>
    )
}

export const FetchConfigureInventoryLeadTime = ({
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

    const [loader, setLoader] = useState(false)
    const [countError, setCountError] = useState(0)
    const [alertErrorMessage, setAlertErrorMessage] = useState("initial")
    const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();
    const [leadTimeComponent, setLeadTimeComponent] = useState(ConstVariable?.INIT)

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

    const ajaxReplacementComponentTraceabilityObsv$ = useMemo(() => {
        return getReplacementComponentTraceabilityAjaxObs$();
    }, [])

    useObservableCallback(
        ajaxReplacementComponentTraceabilityObsv$,
        (response) => {
            if (response?.status) {
                // setLoader(false)
                ajaxLeadTimeComponentObsv$.next({
                    filteredComponentID: response?.filteredComponentID,
                    partTypeComponent: response?.content
                })
            } else {
                setLoader(false)
                setLeadTimeComponent([])
                // toast.error(response?.message, {
                //     position: toast.POSITION.TOP_CENTER,
                // });
            }
        },
        []
    );


    const ajaxLeadTimeComponentObsv$ = useMemo(() => {
        return getLeadTimeComponentAjaxObs$(
            DEFAULT_BASE_URL + VERSION + GET_LEAD_TIME_COMPONENT,
            {
                errorHandler: (error) => {
                    setLoader(false);
                    toast.error(AMPToastConsts.LEAD_TIME_ERROR, {
                        position: toast.POSITION.TOP_CENTER,
                    });
                },
            }
        );
    }, []);
    /* Observer for save response from ajax request */
    useObservableCallback(ajaxLeadTimeComponentObsv$, (response) => {
        if (response?.partTypeComponent) {
            const updatedComponentList = response?.partTypeComponent?.map((item, idx) => {
                let abc = ""
                let uID = ""
                response?.content?.map((data, idx) => {
                    if (data?.partTypeComponentId === item?.componentId) {
                        abc = data?.leadTimeInDays;
                        uID = data?.id;
                    }
                })
                return { ...item, uniqueID: uID, leadTimeInDays: abc }
            })
            setLeadTimeComponent(updatedComponentList)
            setLoader(false);
        }
    });

    useEffect(() => {
        if (partTypeId) {
            setLoader(true)
            ajaxReplacementComponentTraceabilityObsv$.next(partTypeId)
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
                        <AMPFieldSet title="Search Inventory Components">
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
                {leadTimeComponent !== ConstVariable?.INIT &&
                    leadTimeComponent?.length > 0 &&
                    <Container striped="true" fluid className="my-4 fn-14">
                        <Row className="border font-weight-bold py-2 text-break">
                            <Col xs={6} sm={3} md={3} lg={3}>Part Number</Col>
                            <Col xs={6} sm={3} md={3} lg={3}>Description</Col>
                            <Col xs={6} sm={3} md={3} lg={3}>Lead Time ( in Days )</Col>
                            <Col xs={6} sm={3} md={3} lg={3}>Action</Col>
                        </Row>
                        <Row>
                            <Col className='list-table-style p-0'>
                                {leadTimeComponent?.map((item, idx) => (
                                    <ConfigureInventoryLeadTimeForm
                                        key={item?.id}
                                        id={item?.id} componentId={item?.componentId}
                                        uniqueID={item?.uniqueID}
                                        partNumber={item?.partNumber}
                                        description={item?.description}
                                        leadTimeInDays={item?.leadTimeInDays}
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
                {leadTimeComponent?.length === 0 &&
                    <Row className="text-center text-danger">
                        <Col>No Data Found</Col>
                    </Row>
                }
            </div>
        </div>
    )
}

export const ConfigureInventoryLeadTimeForm = ({
    id,
    uniqueID,
    leadTimeInDays,
    componentId,
    partNumber,
    description,
    Prompt,
    setDirty,
    setCountError,
    alertErrorMessage,
    setAlertErrorMessage,
}) => {
    const validationSchema = useMemo(
        () =>
            yup.object({
                leadTime: yup.number()
                    .positive("positive number ")
                    .integer("integer number ")
                    .max(90, "less than or equal to 90 ")
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

    const [loader, setLoader] = useState(false)
    const [uID, setUID] = useState(uniqueID)
    const [leadTime, setLeadTime] = useState(leadTimeInDays)

    useEffect(() => {
        setValue("leadTime", leadTime)
    }, [leadTime])

    const ajaxSaveLeadTimeComponentObsv$ = useMemo(() => {
        return saveLeadTimeComponentAjax$(
            DEFAULT_BASE_URL +
            VERSION +
            POST_LEAD_TIME_COMPONENT, {
            errorHandler: (error) => {
                setLoader(false)
                toast.error(AMPToastConsts.ADD_OR_UPDATE_LEAD_TIME_ERROR, {
                    position: toast.POSITION.TOP_CENTER,
                });
            },
        });
    }, []);
    useObservableCallback(ajaxSaveLeadTimeComponentObsv$,
        (response) => {
            if (response?.status) {
                reset(response?.params?.formData)
                setUID(response?.content)
                toast.success(AMPToastConsts.ADD_OR_UPDATE_LEAD_TIME_SUCCESS, {
                    position: toast.POSITION.TOP_CENTER,
                });
                setLoader(false)
            } else {
                setLoader(false)
                toast.error(response?.message, {
                    position: toast.POSITION.TOP_CENTER,
                });
            }
        });


    // update lead time
    const ajaxUpdateLeadTimeComponent$ = useMemo(() => {
        return updateLeadTimeComponentAjax$(
            DEFAULT_BASE_URL +
            VERSION +
            PUT_LEAD_TIME_COMPONENT, {
            errorHandler: (error) => {
                setLoader(false)
                toast.error(AMPToastConsts.UPDATE_LEAD_TIME_ERROR, {
                    position: toast.POSITION.TOP_CENTER,
                });
            },
        });
    }, []);

    useObservableCallback(ajaxUpdateLeadTimeComponent$, (response) => {
        if (response?.status) {
            reset(response?.formData)
            setLoader(false)
            toast.success(AMPToastConsts.UPDATE_LEAD_TIME_SUCCESS, {
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
        let request = {
            partTypeComponentId: componentId,
            leadTimeInDays: formData?.leadTime
        }
        if (uID) {
            request = { ...request, id: uID }
            setLoader(true)
            ajaxUpdateLeadTimeComponent$.next({
                request,
                formData
            })
        } else {
            setLoader(true)
            ajaxSaveLeadTimeComponentObsv$.next({
                request,
                formData
            })
        }
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
        <form onSubmit={handleSubmit(onSubmit)} className="border border-top-0">
            <AMPLoader isLoading={loader} />
            {/* render prompt */}
            {Prompt}
            {/* render prompt */}
            <Row className="py-1 px-2 text-break">
                <Col xs={6} sm={3} md={3} lg={3}>{partNumber}</Col>
                <Col xs={6} sm={3} md={3} lg={3}>{description}</Col>
                <Col xs={6} sm={3} md={3} lg={3}>
                    <AMPFormLayout>
                        <AMPFieldWrapper
                            colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
                            controlId="leadTime"
                            name="leadTime"
                            fieldValidationCustom={errors?.leadTime?.message}
                        >
                            <AMPNumberTextBox
                                ref={register}
                            />
                        </AMPFieldWrapper>
                    </AMPFormLayout>
                </Col>
                <Col xs={6} sm={3} md={3} lg={3}>
                    <button
                        aria-label="Update"
                        name="Update"
                        type="submit"
                        className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 mt-2 btn btn-amp-monochrome-amp-brand btn-md"
                    >
                        <AMPTooltip
                            text={uID ? "Update" : "Save"}
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
                    {(uID && !formState?.isDirty) && (
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
