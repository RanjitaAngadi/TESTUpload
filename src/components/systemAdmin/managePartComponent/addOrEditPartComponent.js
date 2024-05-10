import React, { useEffect, useState } from 'react'
import { AMPFormLayout } from "../../common/AMPFormLayout";
import { useForm } from "react-hook-form";
import { AMPFieldWrapper } from "../../common/AMPFieldWrapper";
import { AMPTextBox } from "../../common";
import { AMPCheckbox } from "../../common/AMPCheckbox";
import {
    Container,
    Form,
    Row,
    Col,
    Button,
} from "react-bootstrap";
import AMPTooltip from "../../common/AMPTooltip";
import {
    AMPModal,
    AMPModalHeader,
    AMPModalBody,
    AMPModalFooter,
} from "../../common/AMPModal";

import AMPLoader from '../../common/AMPLoader';

const AddOrEditComponentModal = (props) => {
    const {
        isModalOpen,
        closeModal,
        RequestedById,
        loader,
        setLoader,
        partComponentResult,
        ajaxAddPartComponentObsv$,
        ajaxUpdatePartComponentObs$,
    } = props
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

    const [validationError, setValidationError] = useState('')
    const CLEARANCE_WATCH = watch("isClearanceRequired") || isModalOpen?.isEdit?.isClearanceRequired?.toString()
    const TORQUE_WATCH = watch("isTorqueRequired") || isModalOpen?.isEdit?.isTorqueRequired?.toString()

    useEffect(() => {
        if (isModalOpen?.isEdit) {
            const fields = [
                "partNumber",
                "partDescription",
            ]
            const content = {
                partNumber: isModalOpen?.isEdit?.partNumber,
                partDescription: isModalOpen?.isEdit?.description,
            }
            fields.forEach((field) => setValue(field, content[field]));
        }
    }, [])

    const onSubmit = (formData) => {
        const request = {
            PartNumber: formData?.partNumber,
            Description: formData?.partDescription,
            IsClearanceRequired: formData?.isClearanceRequired === "true",
            IsTorqueRequired: formData?.isTorqueRequired === "true",
            appliesToInspectionLevelI: formData?.appliesToInspectionLevelI,
            appliesToInspectionLevelII: formData?.appliesToInspectionLevelII,
            RequestedById: RequestedById
        }
        if (!formData?.appliesToInspectionLevelI &&
            !formData?.appliesToInspectionLevelII) {
            setValidationError("Please select atleact 1 checkbox")
        } else if (isModalOpen?.isEdit) {
            setValidationError('')
            setLoader(true)
            const updateRequest = {
                ...request,
                Id: isModalOpen?.isEdit?.id,
                IsActive: formData?.isActiveStatus === "true",
            }
            ajaxUpdatePartComponentObs$.next({
                request: updateRequest,
                partComponentResult,
            })
        } else {
            setValidationError('')
            setLoader(true)
            ajaxAddPartComponentObsv$.next({
                request: request,
                partComponentResult,
            })
        }
    }
    return (
        <>
            <AMPModal
                show
                onHide={closeModal}
                size="lg"
                backdrop="static"
                centered
            >
                <AMPModalHeader>
                    {isModalOpen?.isAdd
                        ? <span>Add Component</span>
                        : <span>Edit Component</span>
                    }
                    <AMPLoader isLoading={loader} />
                </AMPModalHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <AMPModalBody>
                        <Container fluid>
                            <div id="results" className="form-container2 bg-form py-2">

                                <AMPFormLayout className="pb-2">
                                    <AMPFieldWrapper
                                        colProps={{ md: 6, sm: 12, lg: 6, xs: 12 }}
                                        label="Part Number"
                                        controlId="partNumber"
                                        name="partNumber"
                                        placeholder="Enter Part Number"
                                        required={true}
                                        fieldValidation={errors?.partNumber ? true : false}
                                    >
                                        <AMPTextBox
                                            style={{ height: "36px" }}
                                            ref={register({ required: "Required" })}
                                        />
                                    </AMPFieldWrapper>
                                    <AMPFieldWrapper
                                        colProps={{ md: 6, sm: 12, lg: 6, xs: 12 }}
                                        label="Part Description"
                                        controlId="partDescription"
                                        name="partDescription"
                                        placeholder="Enter Part Description"
                                        required={true}
                                        fieldValidation={errors?.partDescription ? true : false}
                                    >
                                        <AMPTextBox
                                            style={{ height: "36px" }}
                                            ref={register({ required: "Required" })}
                                        />
                                    </AMPFieldWrapper>
                                    <div
                                        colProps={{ md: 6, sm: 12, lg: 6, xs: 12 }}
                                        className="amp-position-relative"
                                    >
                                        <Form.Label className="form-label mt-3 mb-0">
                                            Is Clearance Required?
                                        </Form.Label>
                                        <Col lg={12} md={6} xs={12} sm={12}>
                                            <Row>
                                                {/* <div className="amp-position-relative"> */}
                                                <Col lg={6} md={6} xs={12} sm={12}>
                                                    <Form.Label className="form-label mt-0 ml-1 input-radio">
                                                        <input
                                                            type="radio"
                                                            name="isClearanceRequired"
                                                            value={true}
                                                            ref={register}
                                                            defaultChecked={isModalOpen?.isEdit?.isClearanceRequired === true}
                                                            disabled={TORQUE_WATCH === "true"}
                                                        />
                                                        Yes
                                                    </Form.Label>
                                                </Col>

                                                <Col lg={6} md={6} xs={12} sm={12}>
                                                    <Form.Label className="form-label mt-0 ml-1 input-radio">
                                                        <input
                                                            type="radio"
                                                            name="isClearanceRequired"
                                                            value={false}
                                                            ref={register}
                                                            defaultChecked={
                                                                isModalOpen?.isEdit?.isClearanceRequired === false
                                                                || isModalOpen?.isAdd === true
                                                            }
                                                            disabled={TORQUE_WATCH === "true"}
                                                        />
                                                        No
                                                    </Form.Label>
                                                </Col>
                                                {/* </div> */}
                                            </Row>
                                        </Col>
                                    </div>
                                    <div
                                        colProps={{ md: 6, sm: 12, lg: 6, xs: 12 }}
                                        className="amp-position-relative"
                                    >
                                        <Form.Label className="form-label mt-3 mb-0">
                                            Is Torque Required?
                                        </Form.Label>
                                        <Col lg={12} md={6} xs={12} sm={12}>
                                            <Row>
                                                {/* <div className="amp-position-relative"> */}
                                                <Col lg={6} md={6} xs={12} sm={12}>
                                                    <Form.Label className="form-label mt-0 ml-1 input-radio">
                                                        <input
                                                            type="radio"
                                                            name="isTorqueRequired"
                                                            value={true}
                                                            ref={register}
                                                            defaultChecked={isModalOpen?.isEdit?.isTorqueRequired === true}
                                                            disabled={CLEARANCE_WATCH === "true"}
                                                        />
                                                        Yes
                                                    </Form.Label>
                                                </Col>
                                                <Col lg={6} md={6} xs={12} sm={12}>
                                                    <Form.Label className="form-label mt-0 ml-1 input-radio">
                                                        <input
                                                            type="radio"
                                                            name="isTorqueRequired"
                                                            value={false}
                                                            ref={register}
                                                            defaultChecked={
                                                                isModalOpen?.isEdit?.isTorqueRequired === false
                                                                || isModalOpen?.isAdd === true
                                                            }
                                                            disabled={CLEARANCE_WATCH === "true"}
                                                        />
                                                        No
                                                    </Form.Label>
                                                </Col>
                                                {/* </div> */}
                                            </Row>
                                        </Col>
                                    </div>
                                    <div
                                        colProps={{ md: 6, sm: 12, lg: 6, xs: 12 }}
                                        className="amp-position-relative"
                                    >
                                        <Form.Label className="form-label mt-1 mb-0">
                                            Inspection Level<span className='text-danger mx-0'>*</span>
                                        </Form.Label>
                                        <Col lg={12} md={12} xs={12} sm={12}>
                                            <Row>
                                                <Col lg={6} md={12} xs={12} sm={12}>
                                                    <AMPFieldWrapper
                                                        controlId="appliesToInspectionLevelI"
                                                        colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
                                                        name="appliesToInspectionLevelI"
                                                        className="mt-0"
                                                    >
                                                        <AMPCheckbox
                                                            label="Level I"
                                                            ref={register}
                                                            defaultChecked={isModalOpen?.isEdit?.appliesToInspectionLevelI === true}
                                                        />
                                                    </AMPFieldWrapper>
                                                </Col>
                                                <Col lg={6} md={12} xs={12} sm={12}>
                                                    <AMPFieldWrapper
                                                        controlId="appliesToInspectionLevelII"
                                                        colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
                                                        name="appliesToInspectionLevelII"
                                                        className="mt-0"
                                                    >
                                                        <AMPCheckbox
                                                            label="Level II"
                                                            ref={register}
                                                            defaultChecked={isModalOpen?.isEdit?.appliesToInspectionLevelII === true}
                                                        />
                                                    </AMPFieldWrapper>
                                                </Col>
                                            </Row>
                                            {validationError && (
                                                <div className="validation-error-message">
                                                    {validationError}
                                                </div>
                                            )}
                                        </Col>
                                    </div>
                                    {isModalOpen?.isEdit && (
                                        <div
                                            colProps={{ md: 6, sm: 12, lg: 6, xs: 12 }}
                                            className="amp-position-relative"
                                        >
                                            <Form.Label className="form-label mt-1 mb-0">
                                                Is Status Active?
                                            </Form.Label>
                                            <Col lg={12} md={6} xs={12} sm={12}>
                                                <Row>
                                                    {/* <div className="amp-position-relative"> */}
                                                    <Col lg={6} md={6} xs={12} sm={12}>
                                                        <Form.Label className="form-label mt-1 ml-1 input-radio">
                                                            <input
                                                                type="radio"
                                                                name="isActiveStatus"
                                                                value={true}
                                                                ref={register}
                                                                defaultChecked={
                                                                    isModalOpen?.isEdit?.isActive === true
                                                                }
                                                            />
                                                            Yes
                                                        </Form.Label>
                                                    </Col>

                                                    <Col lg={6} md={6} xs={12} sm={12}>
                                                        <Form.Label className="form-label mt-1 ml-1 input-radio">
                                                            <input
                                                                type="radio"
                                                                name="isActiveStatus"
                                                                value={false}
                                                                ref={register}
                                                                defaultChecked={
                                                                    isModalOpen?.isEdit?.isActive === false
                                                                }
                                                            />
                                                            No
                                                        </Form.Label>
                                                    </Col>
                                                    {/* </div> */}
                                                </Row>
                                            </Col>
                                        </div>
                                    )}
                                </AMPFormLayout>
                            </div>
                        </Container>
                    </AMPModalBody>
                    <AMPModalFooter>
                        <Button
                            type="submit"
                            variant="primary"
                            className="px-5"
                        >
                            {isModalOpen?.isAdd ? "Add" : "Update"}
                        </Button>
                    </AMPModalFooter>
                </form>
            </AMPModal>
        </>
    )
}
const Checkbox = ({ id, type, name, handleClick, isChecked }) => {
    return (
        <input
            id={id}
            name={name}
            type={type}
            onChange={handleClick}
            checked={isChecked}
        />
    );
};
export default AddOrEditComponentModal