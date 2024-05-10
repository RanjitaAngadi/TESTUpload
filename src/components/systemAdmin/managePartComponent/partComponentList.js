import React, { useState } from 'react'
import {
    Row,
    Col,
    Table,
} from "react-bootstrap";
import AMPTooltip from "../../common/AMPTooltip";

export const PartComponentList = (props) => {
    const {
        openEditModal,
        closeModal,
        partComponentResult,
        showCheckbox,
        replacementDetails,
        onDelete,
    } = props
    const {
        isCheckAll,
        isCheck,
        handleSelectAll,
        handleClick
    } = replacementDetails;

    return (
        <div>
            <Table striped bordered hover responsive size="sm" className="fn-14">
                <thead>
                    <tr className="text-center">
                        {replacementDetails?.showCheckbox && <th>
                            <Checkbox
                                type="checkbox"
                                name="selectAll"
                                id="selectAll"
                                handleClick={handleSelectAll}
                                isChecked={isCheckAll}
                            />
                        </th>}
                        <th>Part Number</th>
                        <th>Part Description</th>
                        <th>Inspection Level</th>
                        <th>Is Clearance Required</th>
                        <th>Is Torque Required</th>
                        <th>Active Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody className="fn-14">
                    {partComponentResult && partComponentResult?.map((item, idx) => (
                        <tr key={item?.id} className="text-center">
                            {replacementDetails?.showCheckbox && <td className="text-center">

                                {item?.isActive && <Checkbox
                                    key={item.id}
                                    type="checkbox"
                                    name={name}
                                    id={item.id}
                                    handleClick={(e) => handleClick(e, item)}
                                    isChecked={isCheck?.includes(item.id)}
                                />}
                            </td>}
                            <td className="text-left">{item?.partNumber}</td>
                            <td className="text-left">{item?.description}</td>
                            <td
                            // className="text-left"
                            >
                                {item?.appliesToInspectionLevelI && "Level I"}
                                {(item?.appliesToInspectionLevelI &&
                                    item?.appliesToInspectionLevelII) && ", "}
                                {item?.appliesToInspectionLevelII && "Level II"}
                            </td>
                            <td>{item?.isClearanceRequired ? "Yes" : "No"}</td>
                            <td>{item?.isTorqueRequired ? "Yes" : "No"}</td>
                            <td>{item?.isActive ? "Yes" : "No"}</td>
                            <td>
                                <Row className="text-center m-0 p-0">
                                    <Col className='m-0 p-0' xs={6} sm={6} md={6} lg={6}>
                                        <button
                                            aria-label="Edit"
                                            name="Edit"
                                            type="button"
                                            className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 btn btn-amp-monochrome-amp-brand btn-md"
                                            onClick={() => openEditModal(item)}
                                        >
                                            <AMPTooltip text="Edit">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="19"
                                                    height="19"
                                                    fill="currentColor"
                                                    viewBox="0 0 16 16"
                                                    className="bi bi-pencil-square"
                                                >
                                                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                    <path
                                                        fill-rule="evenodd"
                                                        d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                                                    />
                                                </svg>
                                            </AMPTooltip>
                                        </button>
                                    </Col>
                                    <Col className='m-0 p-0' xs={6} sm={6} md={6} lg={6}>
                                        <button
                                            aria-label="Delete"
                                            name="Delete"
                                            type="button"
                                            className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 btn btn-amp-monochrome-amp-brand btn-md"
                                            onClick={() => onDelete(item?.id, item?.partNumber)}
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
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
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
export default PartComponentList