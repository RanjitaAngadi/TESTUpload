import React, { useState, useEffect, useMemo } from 'react'
import ReactGA from 'react-ga';
import { Form, Row, Col, Button, Table, Container } from "react-bootstrap";
import { AMPFieldWrapper } from "../../common/AMPFieldWrapper";
import AMPFieldSet from "../../common/AMPFieldSet";
import { AMPFormLayout } from "../../common/AMPFormLayout";
import { AMPNumberTextBox, AMPTextBox } from "../../common";
import AMPAuthorization from "../../common/AMPAuthorization/AMPAuthorization";
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
    UPDATE_PART_TYPE_COMPONENT_TRACEABILITY,
    ConstVariable,
    SAVE_TRACEABILITY_COMPONENT,
    DELETE_REPLACEMENT_COMPONENT_PART_TYPE,
} from "../../common/const";
import { toast } from "react-toastify";
import AMPLoader from '../../common/AMPLoader';
import AMPTooltip from '../../common/AMPTooltip';
import {
    AccessProvider,
    useAccessDispatch,
    useAccessState,
} from "../../../utils/AppContext/loginContext";
import complete_icon from "../../../styles/images/complete_icon.png";
import useUnsavedChangesWarning from '../../common/hooks/useUnsavedChangesWarning';
import { ManagePartComponent } from '../managePartComponent/managePartComponent';
import { DeleteModal } from "../../common/DeleteModal";
import { AMPMessage } from "../../common/const/AMPMessage";

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
                    let response = xhrResponse?.response;
                    return { response, params };
                }),
                catchError((error) => {
                    return throwError(error);
                })
            )
        )
    );

const updateReplacementComponentTraceabilityAjax$ = (URL, { errorHandler }) =>
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

// delete component from part type
const deleteComponentFromPartTypeAjax$ = (URL, { errorHandler }) =>
    new Subject().pipe(
        mergeMap((params) =>
            ampJsonAjax.put(URL + params?.id).pipe(
                map((xhrResponse) => {
                    return { ...xhrResponse?.response, params };
                }),
                catchError((error) => {
                    console.error("Error in deleting part type component", error);
                    errorHandler(error.response);
                    return [];
                })
            )
        )
    );

export const ReplacementComponentConfiguration = () => {
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
                    Replacement Component Configuration
                </span>
            </p>

            <ReplacementComponentConfigurationFetch
                partTypeResult={partTypeResult}
            />

        </div>
    )
}


const savePartDetailToReplacementComponentAjax$ = (URL, { errorHandler }) =>
    new Subject().pipe(
        mergeMap((params) =>
            ampJsonAjax.post(URL, params?.ajaxParams).pipe(
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

export const ReplacementComponentConfigurationFetch = ({ partTypeResult }) => {
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
    const [partTypeComponent, setPartTypeComponent] = useState(ConstVariable?.INIT);
    const [showManageComponents, setShowManageComponents] = useState(false);
    const [showManagePartComponents, setShowManagePartComponents] = useState([])
    const [isCheck, setIsCheck] = useState([]);
    const [checkedData, setCheckedData] = useState([]);
    const [isCheckAll, setIsCheckAll] = useState(false);
    const [selectedpartType, setSelectedpartType] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState()


    let partTypeChange = watch("partType")
    let partTypeId = partTypeChange?.value;

    const addNewFields = () => {
        setShowManageComponents(true);
        setCheckedData([]);
        setIsCheckAll(false);
        setIsCheck([]);
        // return <CommonQuestionnaireForm itm="" idx="" isOpen="true" />;
    };

    const closeDefaultModal = (id) => {

        if (id) {
            ajaxReplacementComponentTraceabilityObsv$.next(id)
        }
        setShowManageComponents(false);
        setCheckedData([]);
        setIsCheckAll(false);
        setIsCheck([]);
    }

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
            if (response?.response?.status) {
                setLoader(false)
                setPartTypeComponent(response?.response?.content);
                setSelectedpartType(response?.params)

            } else {
                setLoader(false)
                setPartTypeComponent([])
            }
        },
        []
    );
    useEffect(() => {
        if (partTypeId) {
            setLoader(true)
            ajaxReplacementComponentTraceabilityObsv$.next(partTypeId)
        }
    }, [partTypeId])


    const onSearch = (formData) => {

    }

    const ajaxAddPartDetailsToReplacementComponentObsv$ = useMemo(() => {
        return savePartDetailToReplacementComponentAjax$(
            DEFAULT_BASE_URL +
            VERSION +
            SAVE_TRACEABILITY_COMPONENT,
            {
                errorHandler: (error) => {
                    setLoader(false);
                    toast.error(
                        AMPToastConsts.ADD_PART_TYPE_COMPONENT_ERROR,
                        {
                            position: toast.POSITION.TOP_CENTER,
                        }
                    );
                },
            }
        );
    }, []);
    useObservableCallback(ajaxAddPartDetailsToReplacementComponentObsv$, (response) => {
        if (response?.status) {
            toast.success(
                AMPToastConsts.ADD_PART_TYPE_COMPONENT_SUCCESS,
                {
                    position: toast.POSITION.TOP_CENTER,
                }
            );

            closeDefaultModal(response?.params?.partTypeId);

        } else {
            setLoader(false);
            toast.error(response?.message, {
                position: toast.POSITION.TOP_CENTER,
            });
        }
    });
    // on Add to Replacement Part Type list from Manage Component 
    const onAddToReplacement = (formData) => {
        let commonPartNumber = [];
        let componentIds = []
        // let result = partTypeComponent.filter(o1 => checkedData.some(o2 => o1.partNumber === o2.partNumber));
        partTypeComponent?.map((item) => {
            checkedData?.map((itm) => {

                if (itm.partNumber === item.partNumber) {

                    return commonPartNumber?.push(item.partNumber);
                }
            })
        });

        if (commonPartNumber?.length > 0) {
            toast.error(`${commonPartNumber.join(", ")}  are already associated with selected Part type`, {
                position: toast.POSITION.TOP_CENTER,
            });
        }
        else {
            if (checkedData?.length > 0) {
                checkedData?.map((itm) => {
                    return componentIds?.push(itm?.id);
                });
                const ajaxParams = {
                    RequestedById: context?.userId,
                    PartTypeId: partTypeId.toString(),
                    ComponentIds: componentIds.join(",")
                }
                ajaxAddPartDetailsToReplacementComponentObsv$.next({ ajaxParams, partTypeId });
            }
            else {
                toast.info(AMPToastConsts.SELECT_ATLEAST_ONE_COMPONENT_MANDATORY, {
                    position: toast.POSITION.TOP_CENTER,
                });
            }
        }
    };

    // delete component from part type
    const ajaxDeleteComponentFromPartTypeObvs$ = useMemo(() => {
        return deleteComponentFromPartTypeAjax$(
            DEFAULT_BASE_URL +
            VERSION +
            DELETE_REPLACEMENT_COMPONENT_PART_TYPE,
            {
                errorHandler: (error) => {
                    setLoader(false);
                    toast.error(
                        AMPToastConsts.DELETE_REPLECEMENT_COMP_PART_TYPE_ERROR,
                        {
                            position: toast.POSITION.TOP_CENTER,
                        }
                    );
                },
            }
        );
    });
    useObservableCallback(ajaxDeleteComponentFromPartTypeObvs$, (response) => {
        if (response?.status) {
            toast.success(AMPToastConsts.DELETE_REPLECEMENT_COMP_PART_TYPE_SUCCESS, {
                position: toast.POSITION.TOP_CENTER,
            });
            let filteredData = partTypeComponent?.filter(item => {
                return item?.id !== response?.content
            })
            setPartTypeComponent(filteredData)
            setLoader(false);
            setShowDeleteModal("")
        } else {
            setLoader(false);
            toast.error(response?.message, {
                position: toast.POSITION.TOP_CENTER,
            });
            setShowDeleteModal("")
        }
    });

    const handleSelectAll = (e) => {
        const { id, checked } = e.target;
        setIsCheckAll(!isCheckAll);
        setCheckedData(showManagePartComponents.filter((item) => item.isActive === true))

        setIsCheck(
            showManagePartComponents?.map((li) => {

                return li.id;

            })
        );
        if (isCheckAll) {
            setIsCheck([]);
            setCheckedData([])
        }
    };
    const handleClick = (e, itm) => {
        const { id, checked } = e.target;
        setIsCheck([...isCheck, id]);
        if (!checked) {
            setIsCheck(isCheck.filter((item) => item !== id));
            setCheckedData(checkedData.filter((item) => item.id !== id))
        }
        if (checked) {
            setCheckedData([...checkedData, itm])
        }
    };

    const closeDeleteModal = () => {
        setShowDeleteModal("");
    };
    const onDelete = (id, partNumber) => {
        setShowDeleteModal({ id, partNumber });
    };
    const onConfirmDelete = (id) => {
        ajaxDeleteComponentFromPartTypeObvs$.next({ id: id });
    };

    return (
        <div id="results" className="form-container bg-form GeeksforGeeks">
            <AMPLoader isLoading={loader} />
            <Row>
                <Col>
                    <form onSubmit={handleSubmit(onSearch)}>
                        <AMPFieldSet title="Search Replacement Components">
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

            {partTypeComponent !== 'initial' && (
                <AMPAuthorization hasToken={context?.features?.includes("AD-MGT-COMP")}>
                    <Row>
                        <Col>

                            <div className="float-right btn-control-action-icons-group mb-1">
                                <button
                                    aria-label="Add"
                                    name="Add"
                                    type="button"
                                    className="amp-button button-mini mt-2 icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                                    onClick={addNewFields}
                                >
                                    <AMPTooltip text="Add New">
                                        <svg
                                            fill="rgb(11, 26, 88)"
                                            viewBox="0 0 510 510"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="svg-inline--fa amp-svg-icon amp-svg-add fa-w-16 amp-icon"
                                        >
                                            <path
                                                d="M256,0C114.844,0,0,114.844,0,256s114.844,256,256,256s256-114.844,256-256S397.156,0,256,0z M256,490.667
                                C126.604,490.667,21.333,385.396,21.333,256S126.604,21.333,256,21.333S490.667,126.604,490.667,256S385.396,490.667,256,490.667
                                  z"
                                            ></path>
                                            <path
                                                d="M394.667,245.333h-128v-128c0-5.896-4.771-10.667-10.667-10.667s-10.667,4.771-10.667,10.667v128h-128
                                  c-5.896,0-10.667,4.771-10.667,10.667s4.771,10.667,10.667,10.667h128v128c0,5.896,4.771,10.667,10.667,10.667
                                s10.667-4.771,10.667-10.667v-128h128c5.896,0,10.667-4.771,10.667-10.667S400.563,245.333,394.667,245.333z"
                                            ></path>
                                        </svg>
                                    </AMPTooltip>
                                </button>
                            </div>

                        </Col>
                    </Row>
                </AMPAuthorization>)}

            <div>
                {partTypeComponent !== ConstVariable?.INIT &&
                    partTypeComponent?.length > 0 &&
                    <Container striped="true" fluid className="my-4 fn-14">
                        <Row className="border font-weight-bold py-2 text-center text-break">
                            <Col xs={3} sm={3} md={3} lg={3}>Part Number</Col>
                            <Col xs={3} sm={3} md={3} lg={3}>Description</Col>
                            <Col xs={3} sm={3} md={3} lg={3}>Required Quantity</Col>
                            <Col xs={3} sm={3} md={3} lg={3}>Action</Col>
                        </Row>
                        <Row>
                            <Col className='list-table-style p-0'>
                                {partTypeComponent?.map(item => (
                                    <ReplacementComponentConfigurationForm
                                        key={item?.id}
                                        id={item?.id}
                                        componentId={item?.componentId}
                                        partNumber={item?.partNumber}
                                        description={item?.description}
                                        quantityRequired={item?.quantityRequired}
                                        setPartTypeComponent={setPartTypeComponent}
                                        context={context}
                                        Prompt={Prompt}
                                        setDirty={setDirty}
                                        setCountError={setCountError}
                                        alertErrorMessage={alertErrorMessage}
                                        setAlertErrorMessage={setAlertErrorMessage}
                                        ajaxDeleteComponentFromPartTypeObvs$={ajaxDeleteComponentFromPartTypeObvs$}
                                        onDelete={onDelete}
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
                {showManageComponents &&
                    // <DefaultModal closeDefaultModal={closeDefaultModal} onAddToReplacement={onAddToReplacement}>
                    <ManagePartComponent
                        closeDefaultModal={closeDefaultModal}
                        onAddToReplacement={onAddToReplacement}
                        showCheckbox={true}
                        setShowManageComponents={setShowManageComponents}
                        showManageComponents={showManageComponents}
                        replacementPartDetails={partTypeComponent}
                        setShowManagePartComponents={setShowManagePartComponents}
                        handleSelectAll={handleSelectAll}
                        handleClick={handleClick}
                        isCheck={isCheck}
                        checkedData={checkedData}
                        isCheckAll={isCheckAll}
                    />
                    //  {/* </DefaultModal> */}
                }
            </div>
            {showDeleteModal && (
                <DeleteModal
                    confirmationMessage={AMPMessage.DEL_PART_TYPE_COMPONENT_CONFIRM + `(${showDeleteModal?.partNumber})?`}
                    showDeleteModal={showDeleteModal?.id}
                    onConfirmDelete={onConfirmDelete}
                    closeModal={closeDeleteModal}
                />
            )}
        </div>
    )
}

export const ReplacementComponentConfigurationForm = ({
    id,
    componentId,
    partNumber,
    description,
    quantityRequired,
    setPartTypeComponent,
    context,
    Prompt,
    setDirty,
    setCountError,
    alertErrorMessage,
    setAlertErrorMessage,
    ajaxDeleteComponentFromPartTypeObvs$,
    onDelete,
}) => {
    const validationSchema = useMemo(
        () =>
            yup.object({
                quantity: yup.number()
                    .positive("positive number ")
                    .integer("integer number ")
                    .max(500, "less than or equal to 500 ")
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

    useEffect(() => {
        setValue("quantity", quantityRequired)
    }, [])

    const ajaxUpdateReplacementComponentTraceability$ = useMemo(() => {
        return updateReplacementComponentTraceabilityAjax$(
            DEFAULT_BASE_URL +
            VERSION +
            UPDATE_PART_TYPE_COMPONENT_TRACEABILITY, {
            errorHandler: (error) => {
                setLoader(false)
                toast.error(AMPToastConsts.CONFIG_RCT_UPDATE_ERROR, {
                    position: toast.POSITION.TOP_CENTER,
                });
            },
        });
    }, []);

    useObservableCallback(ajaxUpdateReplacementComponentTraceability$, (response) => {
        if (response?.status) {
            reset(response?.formData)
            setLoader(false)
            toast.success(AMPToastConsts.CONFIG_RCT_UPDATE_SUCCESS, {
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
            QuantityRequired: parseInt(formData?.quantity),
            RequestedById: parseInt(context?.userId)
        }
        setLoader(true)
        ajaxUpdateReplacementComponentTraceability$.next({
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

    // const deleteReplacement = (id) => {
    //     setLoader(true)
    //     ajaxDeleteComponentFromPartTypeObvs$.next({
    //         id
    //     })
    // }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="border border-top-0">
            <AMPLoader isLoading={loader} />
            {/* render prompt */}
            {Prompt}
            {/* render prompt */}
            <Row className="py-1 px-2 text-break">
                <Col xs={3} sm={3} md={3} lg={3}>{partNumber}</Col>
                <Col xs={3} sm={3} md={3} lg={3}>{description}</Col>
                <Col xs={3} sm={3} md={3} lg={3}>
                    <AMPFormLayout>
                        <AMPFieldWrapper
                            colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
                            controlId="quantity"
                            name="quantity"
                            fieldValidationCustom={errors?.quantity?.message}
                        >
                            <AMPNumberTextBox
                                ref={register}
                            />
                        </AMPFieldWrapper>
                    </AMPFormLayout>
                </Col>
                <Col xs={3} sm={3} md={3} lg={3}>
                    <Row className="m-0 p-0 text-center">
                        <Col className='m-0 p-0'>
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
                                    className="mx-1 mb-1 mr-2"
                                    src={complete_icon}
                                    alt=""
                                    width="12"
                                    height="12"
                                />
                            )}
                            {formState?.isDirty &&
                                <span className="mx-1 light-red mr-2">!</span>
                            }
                            {/* </Col>
                        <Col className='m-0 p-0' xs={6} sm={6} md={6} lg={6}> */}
                            <button
                                aria-label="Delete"
                                name="Delete"
                                type="button"
                                className="amp-button button-mini icon-mini btn-transition btn-transparent mt-2 m-0 btn btn-amp-monochrome-amp-brand btn-md"
                                onClick={() => onDelete(id, partNumber)}
                            >
                                <AMPTooltip text="Delete">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        fill="currentColor"
                                        className="svg-inline--fa amp-svg-icon amp-svg-delete fa-w-13 amp-icon"
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
                        </Col>
                    </Row>
                </Col>
            </Row>
        </form>
    )
}

