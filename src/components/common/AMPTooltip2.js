import React, { useEffect } from 'react'

const AMPTooltip2 = ({ children, title, dataPlacement }) => {
    useEffect(() => {
        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })
    }, [])
    return (
        <span
            data-toggle="tooltip"
            data-placement={dataPlacement}
            title={title}>
            {children}
        </span>
    )
}

export default AMPTooltip2