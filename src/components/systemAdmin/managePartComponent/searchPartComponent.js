import React, { useState, useEffect, useMemo } from 'react'
import AMPFieldSet from "../../common/AMPFieldSet";
import { AMPFormLayout } from "../../common/AMPFormLayout";
import { useForm } from "react-hook-form";
import { AMPFieldWrapper } from "../../common/AMPFieldWrapper";
import { AMPTextBox } from "../../common";
import {
    Row,
    Col,
    Button
} from "react-bootstrap";
import AMPTooltip from "../../common/AMPTooltip";

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
    GET_PART_COMPONENTS,
    SEARCH_PART_COMPONENT,
    ConstVariable,
} from "../../common/const";
import {
    useAccessState,
} from "../../../utils/AppContext/loginContext";
import AMPLoader from '../../common/AMPLoader';
import PartComponentList from './partComponentList';

const getPartComponentListAjaxObs$ = () =>
    new Subject().pipe(
        mergeMap((param) =>
            ampJsonAjax.get(DEFAULT_BASE_URL + VERSION + GET_PART_COMPONENTS).pipe(
                map((xhrResponse) => {
                    return xhrResponse?.response;
                }),
                catchError((error) => {
                    return throwError(error);
                })
            )
        )
    ); // End of Line

const searchPartComponentListAjaxObs$ = () =>
    new Subject().pipe(
        mergeMap((params) =>
            ampJsonAjax.get(
                DEFAULT_BASE_URL
                + VERSION
                + SEARCH_PART_COMPONENT
                + params?.request
            ).pipe(
                map((xhrResponse) => {
                    return xhrResponse?.response;
                }),
                catchError((error) => {
                    return throwError(error);
                })
            )
        )
    ); // End of Line

const SearchPartComponent = ({ replacementDetails, closeModal, openAddModal,
    openEditModal, partComponentResult, setPartComponentResult, onDelete }) => {
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
    const { setShowManagePartComponents, setShowManageComponents, showManageComponents } = replacementDetails;

    const context = useAccessState();
    const [loader, setLoader] = useState(false)

    const partComponentAjaxObsv$ = useMemo(() => {
        return getPartComponentListAjaxObs$();
    }, []);

    useObservableCallback(
        partComponentAjaxObsv$,
        (response) => {
            if (response?.status && response?.content?.length !== 0) {
                setLoader(false)
                // setPartComponentResult(null)
                setPartComponentResult(response?.content);
                if (replacementDetails?.showCheckbox) {
                    setShowManagePartComponents(response?.content);
                }
            } else {
                setLoader(false)
                setPartComponentResult([])
                if (replacementDetails?.showCheckbox) {
                    setShowManagePartComponents([])
                }
            }
        },
        []
    );

    // search part component start
    const searchComponentAjaxObsv$ = useMemo(() => {
        return searchPartComponentListAjaxObs$();
    }, []);

    useObservableCallback(
        searchComponentAjaxObsv$,
        (response) => {
            if (response?.status && response?.content?.length !== 0) {
                setLoader(false)
                setPartComponentResult(response?.content)
            } else {
                setLoader(false)
                setPartComponentResult([])
            }
        },
        []
    );

    const onSearch = (formData) => {
        if (formData?.partNumber?.trim()) {
            setLoader(true)
            searchComponentAjaxObsv$.next({
                request: formData?.partNumber?.trim()
            })
        } else {
            setLoader(true)
            partComponentAjaxObsv$.next()
        }
    }
    // search part component end

    const clearSearch = () => {
        reset()
        // setLoader(true)
        // partComponentAjaxObsv$.next()
    }

    return (
        <div id="results" className="form-container bg-form GeeksforGeeks pt-1 pb-5">
            <AMPFieldSet title="Search Component">
                <form onSubmit={handleSubmit(onSearch)}>
                    <AMPFormLayout className="pb-2">
                        <AMPFieldWrapper
                            colProps={{ md: 12, sm: 12, lg: 4, xs: 12 }}
                            label="Part Number"
                            controlId="partNumber"
                            name="partNumber"
                            placeholder="Enter Part Number"
                        >
                            <AMPTextBox
                                style={{ height: "36px" }}
                                ref={register}
                            />
                        </AMPFieldWrapper>
                        <div colProps={{ md: 12, sm: 12, lg: 8, xs: 12 }}>
                            <Row>
                                <Col md={3} sm={3} lg={3} xs={3}>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="form-button1"
                                        onClick={clearSearch}
                                        block
                                    >
                                        Clear
                                    </Button>
                                </Col>
                                <Col md={9} sm={9} lg={4} xs={9}>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="form-button1"
                                        block
                                    >
                                        Search
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    </AMPFormLayout>
                </form>
            </AMPFieldSet>
            <div className="float-right btn-control-action-icons-group mb-1">
                <button
                    aria-label="Add"
                    name="Add"
                    type="button"
                    className="amp-button button-mini mt-2 icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                    onClick={openAddModal}
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
            {partComponentResult !== ConstVariable?.INIT
                && partComponentResult?.length !== 0 &&
                <PartComponentList
                    openEditModal={openEditModal}
                    closeModal={closeModal}
                    partComponentResult={partComponentResult}
                    replacementDetails={replacementDetails}
                    onDelete={onDelete}
                />
            }
            {(partComponentResult !== ConstVariable?.INIT
                && partComponentResult?.length === 0) &&
                <Row className="text-center text-danger ">
                    <Col>No Data Found</Col>
                </Row>
            }
            {/* {(isModalOpen?.isAdd || isModalOpen?.isEdit) && (
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
            )} */}

            <AMPLoader isLoading={loader} />
        </div>
    )
}

export default SearchPartComponent