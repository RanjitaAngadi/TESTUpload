import React, { useState, useMemo } from 'react'
import SearchPartComponent from './searchPartComponent';
import Modal from "react-bootstrap/Modal";
import { Row, Col, Button, Container } from "react-bootstrap";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import { ampJsonAjax } from "../../common/utils/ampAjax";
import AddOrEditComponentModal from './addOrEditPartComponent';
import { toast } from "react-toastify";
import { AMPToastConsts } from "../../common/const/AMPToastConst";
import {
    AMPModal,
    AMPModalHeader,
    AMPModalBody,
    AMPModalFooter,
} from "../../common/AMPModal";
import AMPLoader from '../../common/AMPLoader';
import {
    useAccessState,
} from "../../../utils/AppContext/loginContext";
import {
    useObservable,
    useObservableCallback,
} from "../../common/hooks/useObservable";
import {
    DEFAULT_BASE_URL,
    VERSION,
    GET_PART_COMPONENTS,
    ADD_OR_UPDATE_PART_COMPONENT,
    SEARCH_PART_COMPONENT,
    DELETE_PART_COMPONENT,
    ConstVariable,
} from "../../common/const";
import { DeleteModal } from "../../common/DeleteModal";
import { AMPMessage } from "../../common/const/AMPMessage";

const savePartComponentAjax$ = (URL, { errorHandler }) =>
    new Subject().pipe(
        mergeMap((params) =>
            ampJsonAjax.post(URL, params?.request).pipe(
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

const updatePartComponentAjax$ = (URL, { errorHandler }) =>
    new Subject().pipe(
        mergeMap((params) =>
            ampJsonAjax.put(
                URL,
                params?.request).pipe(
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

// delete component from part type
const deletePartComponentAjax$ = (URL, { errorHandler }) =>
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

export const ManagePartComponent = (props) => {
    const { closeDefaultModal, onAddToReplacement, showManageComponents, setShowManageComponents } = props;
    const [loader, setLoader] = useState(false)
    const [partComponentResult, setPartComponentResult] = useState(ConstVariable?.INIT)
    const [isModalOpen, setIsModalOpen] = useState({
        isAdd: '',
        isEdit: ''
    })

    const openAddModal = () => {
        setIsModalOpen({
            isAdd: true,
            isEdit: ''
        })
    }
    const openEditModal = (item) => {
        setIsModalOpen({
            isAdd: '',
            isEdit: item
        })
    }

    const closeModal = () => {
        setIsModalOpen({
            isAdd: '',
            isEdit: ''
        })
    }

    const [showDeleteModal, setShowDeleteModal] = useState()

    const context = useAccessState();
    // add part component start
    const ajaxAddPartComponentObsv$ = useMemo(() => {
        return savePartComponentAjax$(
            DEFAULT_BASE_URL +
            VERSION +
            ADD_OR_UPDATE_PART_COMPONENT,
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
    useObservableCallback(ajaxAddPartComponentObsv$, (response) => {
        if (response?.status && response?.content) {
            toast.success(AMPToastConsts.ADD_PART_TYPE_COMPONENT_SUCCESS, {
                position: toast.POSITION.TOP_CENTER,
            });
            closeModal()
            setLoader(false)
            let newPartComponent = {
                id: response?.content?.toString(),
                partNumber: response?.params?.request?.PartNumber,
                description: response?.params?.request?.Description,
                isClearanceRequired: response?.params?.request?.IsClearanceRequired,
                isTorqueRequired: response?.params?.request?.IsTorqueRequired,
                appliesToInspectionLevelI: response?.params?.request?.appliesToInspectionLevelI,
                appliesToInspectionLevelII: response?.params?.request?.appliesToInspectionLevelII,
                isActive: true
            }
            if (response?.params?.partComponentResult === "initial") {
                setPartComponentResult([newPartComponent])
            } else {
                setPartComponentResult([
                    ...response?.params?.partComponentResult,
                    newPartComponent
                ])
            }
        } else {
            setLoader(false);
            toast.error(response?.message, {
                position: toast.POSITION.TOP_CENTER,
            });
        }
    });
    // add part component end

    // update part component start 
    const ajaxUpdatePartComponentObs$ = useMemo(() => {
        return updatePartComponentAjax$(
            DEFAULT_BASE_URL +
            VERSION +
            ADD_OR_UPDATE_PART_COMPONENT, {
            errorHandler: (error) => {
                setLoader(false)
                toast.error(AMPToastConsts.UPDATE_PART_TYPE_COMPONENT_ERROR, {
                    position: toast.POSITION.TOP_CENTER,
                });
            },
        });
    }, []);

    useObservableCallback(ajaxUpdatePartComponentObs$, (response) => {
        if (response?.status) {
            toast.success(AMPToastConsts.UPDATE_PART_TYPE_COMPONENT_SUCCESS, {
                position: toast.POSITION.TOP_CENTER,
            });
            closeModal()
            setLoader(false)
            let updatedPartComponentList = response?.params?.partComponentResult?.map((item, idx) => {
                return item?.id === response?.params?.request?.Id
                    ? {
                        ...item,
                        partNumber: response?.params?.request?.PartNumber,
                        description: response?.params?.request?.Description,
                        isClearanceRequired: response?.params?.request?.IsClearanceRequired,
                        isTorqueRequired: response?.params?.request?.IsTorqueRequired,
                        appliesToInspectionLevelI: response?.params?.request?.appliesToInspectionLevelI,
                        appliesToInspectionLevelII: response?.params?.request?.appliesToInspectionLevelII,
                        isActive: response?.params?.request?.IsActive
                    } : item
            })
            setPartComponentResult(updatedPartComponentList)
        } else {
            setLoader(false)
            toast.error(response?.message, {
                position: toast.POSITION.TOP_CENTER,
            });
        }
    });
    // update part component end 

    // delete part component start
    const ajaxDeletePartComponentObvs$ = useMemo(() => {
        return deletePartComponentAjax$(
            DEFAULT_BASE_URL +
            VERSION +
            DELETE_PART_COMPONENT,
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
    useObservableCallback(ajaxDeletePartComponentObvs$, (response) => {
        if (response?.status) {
            toast.success(AMPToastConsts.DELETE_REPLECEMENT_COMP_PART_TYPE_SUCCESS, {
                position: toast.POSITION.TOP_CENTER,
            });
            let filteredData = partComponentResult?.filter(item => {
                return item?.id !== response?.content
            })
            setPartComponentResult(filteredData)
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
    // delete part component end

    const closeDeleteModal = () => {
        setShowDeleteModal("");
    };
    const onDelete = (id, partNumber) => {
        setShowDeleteModal({ id, partNumber });
    };
    const onConfirmDelete = (id) => {
        ajaxDeletePartComponentObvs$.next({ id: id });
    };

    return (
        <>
            {showManageComponents !== undefined ? <div>
                {(isModalOpen?.isAdd || isModalOpen?.isEdit) ?
                    (
                        <AddOrEditComponentModal
                            isModalOpen={isModalOpen}
                            closeModal={closeModal}
                            RequestedById={context?.userId}
                            loader={loader}
                            setLoader={setLoader}
                            partComponentResult={partComponentResult}
                            ajaxAddPartComponentObsv$={ajaxAddPartComponentObsv$}
                            ajaxUpdatePartComponentObs$={ajaxUpdatePartComponentObs$}
                        />
                    ) :
                    (<AMPModal
                        show
                        onHide={closeDefaultModal}
                        size="xl"
                        backdrop="static"
                        centered

                    >
                        <AMPModalHeader>
                            Manage Components
                            <AMPLoader isLoading={loader} />
                        </AMPModalHeader>

                        <AMPModalBody
                            isScroll
                            style={{
                                height: "calc(70vh)",
                                overflowY: 'auto',
                                maxHeight: "calc(100vh)",
                            }}>
                            <Container fluid>
                                <div id="results" className="form-container2 bg-form py-2">
                                    <SearchPartComponent replacementDetails={props} closeModal={closeModal}
                                        openAddModal={openAddModal} openEditModal={openEditModal}
                                        partComponentResult={partComponentResult}
                                        setPartComponentResult={setPartComponentResult} />
                                </div>
                            </Container>
                        </AMPModalBody>
                        <AMPModalFooter>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={((e) => closeDefaultModal())}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                onClick={onAddToReplacement}
                            >
                                Add to Replacement Component
                            </Button>
                        </AMPModalFooter>

                    </AMPModal>)}
            </div> :
                <div className="mb-5">
                    <p>
                        <span className="receiving-tag">
                            Manage Components
                        </span>
                    </p>
                    <SearchPartComponent replacementDetails={props} closeModal={closeModal}
                        openAddModal={openAddModal} openEditModal={openEditModal}
                        partComponentResult={partComponentResult}
                        setPartComponentResult={setPartComponentResult}
                        onDelete={onDelete}
                    />
                    {(isModalOpen?.isAdd || isModalOpen?.isEdit) && (
                        <AddOrEditComponentModal
                            isModalOpen={isModalOpen}
                            closeModal={closeModal}
                            RequestedById={context?.userId}
                            loader={loader}
                            setLoader={setLoader}
                            partComponentResult={partComponentResult}
                            ajaxAddPartComponentObsv$={ajaxAddPartComponentObsv$}
                            ajaxUpdatePartComponentObs$={ajaxUpdatePartComponentObs$}
                        />
                    )}
                </div>}
            {showDeleteModal && (
                <DeleteModal
                    confirmationMessage={AMPMessage.DEL_PART_TYPE_COMPONENT_CONFIRM + `(${showDeleteModal?.partNumber})?`}
                    showDeleteModal={showDeleteModal?.id}
                    onConfirmDelete={onConfirmDelete}
                    closeModal={closeDeleteModal}
                />
            )}
        </>
    )
}

export default ManagePartComponent







