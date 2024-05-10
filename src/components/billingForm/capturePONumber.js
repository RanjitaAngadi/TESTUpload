import React, { useEffect, useMemo, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import {
    AMPModal,
    AMPModalHeader,
    AMPModalBody,
    AMPModalFooter,
} from "../common/AMPModal";
import { AMPFieldWrapper } from "../common/AMPFieldWrapper";
import { Row, Col, Button, Table, Container } from "react-bootstrap";
import {
    DEFAULT_BASE_URL,
    VERSION,
    SUBMIT_BILLING_PO_NUMBER,
} from "../common/const";
import { AMPFormLayout } from "../common/AMPFormLayout";
import { AMPTextBox } from "../common";

import AMPLoader from "../common/AMPLoader";
import { toast } from "react-toastify";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import {
    useObservable,
    useObservableCallback,
} from "../common/hooks/useObservable";

import { ampJsonAjax } from "../common/utils/ampAjax";
import { useAccessState } from "../../utils/AppContext/loginContext";


const submitBillingEntry$ = (URL, { errorHandler }) =>
    new Subject().pipe(
        mergeMap((params) =>
            ampJsonAjax.put(URL, params).pipe(
                map((xhrResponse) => {
                    return { ...xhrResponse.response, params };
                }),
                catchError((error) => {
                    console.error("Error in submit billing", error);
                    errorHandler(error.response);
                    return [];
                })
            )
        )
    ); // ENd of line

const CapturePONumberModal = ({
    modalName,
    isCapturePoNumberModalOpen,
    closeCapturePoNumberModal,
    offset,
    perPage,
    ajaxParams,
    ajaxSearchParams,
    searchPumpObs$,
    setIsCheck,
    setCheckedData,
    ...props
}) => {
    const {
        handleSubmit,
        reset,
        watch,
        control,
        register,
        getValues,
        setValue,
        errors,
    } = useForm({

    });

    const context = useAccessState()
    const [loader, setLoader] = useState(false)
    const [billingReceivedStatus, setBillingReceivedStatus] = useState(
        isCapturePoNumberModalOpen?.isPOApproved
    )

    
    useEffect(()=>{
        setValue('poNumber',isCapturePoNumberModalOpen?.poNumber)
    },[])

    const submitBillingStatusObs$ = useMemo(() => {
        return submitBillingEntry$(
            DEFAULT_BASE_URL + VERSION + SUBMIT_BILLING_PO_NUMBER,
            {
                errorHandler: (error) => {
                    toast.error(response?.message, {
                        position: toast.POSITION.TOP_CENTER,
                    });
                },
            }
        );
    }, []);
    /* Observer for update response from ajax request */
    useObservableCallback(submitBillingStatusObs$, (response) => {
        if (!response?.status) {
            setLoader(false)
            toast.error(response.message, {
                position: toast.POSITION.TOP_CENTER,
            });
        } else {
            if (ajaxParams && offset) {
                searchPumpObs$.next({
                    index: offset,
                    pageSize: perPage,
                    ajaxParams: ajaxParams,
                    ajaxSearchParams: ajaxSearchParams,
                });
            }
            setLoader(false)
            setIsCheck([]);
            setCheckedData([]);
            closeCapturePoNumberModal()
            toast.success(response?.message, {
                position: toast.POSITION.TOP_CENTER,
            });
        }
    }, [])

    const toggleHandler = (e) => {
        setBillingReceivedStatus(e.target.checked)
    }
    const onSubmit = (formData) => {
        const request = {
            WorkorderId: isCapturePoNumberModalOpen?.id,
            IsPOApproved: billingReceivedStatus,
            PONumber: formData?.poNumber
        }
        setLoader(true)
        submitBillingStatusObs$.next(request)
    }
    
    return (
        <>
            <AMPModal
                show
                onHide={closeCapturePoNumberModal}
                size="md"
                backdrop="static"
                centered
            >
                <AMPLoader isLoading={loader} />
                <AMPModalHeader>{modalName}</AMPModalHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <AMPModalBody>
                        <Container fluid>
                            <Row>
                                <Col className="font-weight-bold">Work Order # </Col>
                                <Col>{isCapturePoNumberModalOpen?.workorderNumber}</Col>
                            </Row>
                            <Row>
                                <Col className="font-weight-bold mt-1">Service Center </Col>
                                <Col className="mt-1">{isCapturePoNumberModalOpen?.serviceCenter}</Col>
                            </Row>
                            <Row>
                                <Col className="font-weight-bold mt-1">Customer </Col>
                                <Col className="mt-1">{isCapturePoNumberModalOpen?.customer}</Col>
                            </Row>
                            <Row>
                                <Col className="font-weight-bold mt-1">PO Status </Col>
                                <Col>
                                    <div className="custom-control custom-switch">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            id="customSwitches"
                                            name="isBillingReceived"
                                            defaultChecked={isCapturePoNumberModalOpen?.isPOApproved}
                                            onChange={(e) => toggleHandler(e)}
                                        // ref={register}
                                        />
                                        <label
                                            className="custom-control-label"
                                            htmlFor="customSwitches">
                                            {billingReceivedStatus
                                                ? 'Received'
                                                : 'Not Received'}
                                        </label>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col className="font-weight-bold mt-1">
                                    PO Number<span className="text-danger m-0">*</span>
                                </Col>
                                <Col>
                                    <AMPFormLayout className="pb-2">
                                        <AMPFieldWrapper
                                            colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
                                            // label="Part Number"
                                            controlId="poNumber"
                                            name="poNumber"
                                            placeholder="Enter PO Number"
                                            // required={true}
                                            fieldValidationCustom={errors?.poNumber ? "PO number is required" : false}                                
                                        >
                                            <AMPTextBox
                                                ref={register({ required: "Required" })}
                                            />
                                        </AMPFieldWrapper>
                                    </AMPFormLayout>
                                </Col>
                            </Row>
                        </Container>
                    </AMPModalBody>
                    <AMPModalFooter>
                        <Button type="submit" variant="secondary" className="px-5">
                            Submit
                        </Button>
                    </AMPModalFooter>
                </form>
            </AMPModal>
        </>
    );
}

export default CapturePONumberModal