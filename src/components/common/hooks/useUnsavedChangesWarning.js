import React, { useState, useEffect } from 'react'
import { Prompt } from "react-router-dom"
import { AMPMessage } from '../const'
const useUnsavedChangesWarning = (message = AMPMessage?.UNSAVED_ALERT_MESSAGE) => {
    const [isDirty, setDirty] = useState(false)

    useEffect(() => {

        window.onbeforeunload = isDirty && (() => message)

        return () => {
            window.onbeforeunload = function(){
                return null
            }
        }
    }, [isDirty])

    const routerPropmt = (
        <Prompt when={isDirty} message={message} />
    )

    return [routerPropmt, () => setDirty(true), () => setDirty(false)]
}

export default useUnsavedChangesWarning
