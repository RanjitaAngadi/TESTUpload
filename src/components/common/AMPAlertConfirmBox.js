import React, { useState, useEffect } from 'react'

const AMPAlertConfirmBox = (props) => {
    const { onConfirmSubmit, showConfirmModal, closeModal, confirmationMessage } =
        props;

    useEffect(() => {
        let r = confirm(confirmationMessage);
        if (r == true) {
            onConfirmSubmit(showConfirmModal)
        } else {
            closeModal()
        }
    }, [])
    
    return (
        <div></div>
    )
}

export default AMPAlertConfirmBox
