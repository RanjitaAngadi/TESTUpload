import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactGA from 'react-ga';
import { useForm, Controller } from "react-hook-form";
import ReactExport from "react-data-export";
import { CSVLink } from "react-csv";

import {
  Row,
  Col,
  Button,
} from "react-bootstrap";
import { useLocation, useHistory } from "react-router-dom";
import * as yup from "yup";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import Select from "react-select";
import {
  DEFAULT_BASE_URL,
  VERSION,
  GET_REPLACEMENT_COMPONENT_FOR_INVENTORY,
  SAVE_REPLACEMENT_COMPONENT_FOR_INVENTORY,
  SUBMIT_PART_INVENTORY_ENTRY,
  PUT_INVENTORY_REPLACEMENT,
  DELETE_INVENTORY_REPLACEMENT,
  APPROVE_INVENTORY_REPLACEMENT_LIST,
  ConstVariable,
} from "../common/const";
import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";
import AMPFieldSet from "../common/AMPFieldSet";
import AMPLoader from "../common/AMPLoader";
import { AMPFormLayout } from "../common/AMPFormLayout";
import { AMPFieldWrapper } from "../common/AMPFieldWrapper";
import { AMPNumberTextBox, AMPTextArea, AMPTextBox } from "../common";
import { AMPToastConsts } from "../common/const/AMPToastConst";
import { ampJsonAjax } from "../common/utils/ampAjax";

import { toast } from "react-toastify";
import { AMPErrorAlert } from "../common/AMPAlert";
import AMPTooltip from "../common/AMPTooltip";
import { AMPValidation } from "../common/AMPAuthorization/AMPValidation";
import {
  AccessProvider,
  useAccessDispatch,
  useAccessState,
} from "../../utils/AppContext/loginContext";
import { AMPAccordion } from "../common/AMPAccordion";
import complete_icon from "../../styles/images/complete_icon.png";
import useUnsavedChangesWarning from "../common/hooks/useUnsavedChangesWarning";
import { AMPMessage } from "../common/const/AMPMessage";
import { DeleteModal } from "../common/DeleteModal";

const getReplacementComponentForInventoryAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax
        .get(
          DEFAULT_BASE_URL +
          VERSION +
          GET_REPLACEMENT_COMPONENT_FOR_INVENTORY +
          params
        )
        .pipe(
          map((xhrResponse) => {
            return xhrResponse?.response;
          }),
          catchError((error) => {
            return throwError(error);
          })
        )
    )
  );

const saveReplacementComponentForInventoryAjax$ = (URL, { errorHandler }) =>
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

const updateReplacementComponentForInventoryAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.put(URL, params?.request).pipe(
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
const updateInventoryQuantityNeededAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.put(
        URL +
        params?.id + "/" +
        params?.quantityNeeded +
        "/QuantityNeeded"
      ).pipe(
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



const deleteReplacementComponentAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.put(URL + params?.id + "/Delete").pipe(
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


const approveInventoryListAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.put(URL + params?.id + "/Approve",).pipe(
        map((xhrResponse) => {
          return xhrResponse?.response;
        }),
        catchError((error) => {
          errorHandler(error.response);
          return [];
        })
      )
    )
  ); // ENd of line

const submitInventoryEntryFormAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.put(URL, params).pipe(
        map((xhrResponse) => {
          return xhrResponse?.response;
        }),
        catchError((error) => {
          errorHandler(error.response);
          return [];
        })
      )
    )
  ); // ENd of line

export const CreateOrUpdateInventory = () => {
  const locationRef = useLocation();
  const history = useHistory()

  const [isBack, setIsBack] = useState(false);
  const csvLink = useRef();
  const moveToBack = () => {
    setIsBack(true);
    history.push({
      pathname: `/Pump/Inventory`,
    });
  };
  const onSubmit = (formData) => {
    console.log("formData:", formData);
  };
  // For google analytics purpose
  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, [])
  return (
    <>
      <div className="mb-5">
        <p>
          <div className="mb-1 ml-2">
            <button
              aria-label="Back"
              name="Back"
              type="button"
              className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-lg"
              onClick={moveToBack}
            >
              <AMPTooltip text="Back">
                <svg
                  fill="currentColor"
                  viewBox="0 0 512 512"
                  xmlns="http://www.w3.org/2000/svg"
                  className="svg-inline--fa ifx-svg-icon ifx-svg-back fa-w-16 ifx-icon"
                >
                  <path
                    d="M256,0C114.844,0,0,114.844,0,256s114.844,256,256,256s256-114.844,256-256S397.156,0,256,0z M256,490.667
                                    C126.604,490.667,21.333,385.396,21.333,256S126.604,21.333,256,21.333S490.667,126.604,490.667,256S385.396,490.667,256,490.667
                                    z"
                  ></path>
                  <path
                    d="M394.667,245.333H143.083l77.792-77.792c4.167-4.167,4.167-10.917,0-15.083c-4.167-4.167-10.917-4.167-15.083,0l-96,96
                                    c-4.167,4.167-4.167,10.917,0,15.083l96,96c2.083,2.083,4.813,3.125,7.542,3.125c2.729,0,5.458-1.042,7.542-3.125
                                    c4.167-4.167,4.167-10.917,0-15.083l-77.792-77.792h251.583c5.896,0,10.667-4.771,10.667-10.667S400.563,245.333,394.667,245.333
                                    z"
                  ></path>
                </svg>
              </AMPTooltip>
            </button>
            <span className="receiving-tag mx-1">Part Inventory Entry Form</span>
          </div>

        </p>
        <InventoryEntryForm locationRef={locationRef} csvLink={csvLink} />
      </div>
    </>
  );
};

export const InventoryEntryForm = ({ locationRef, csvLink }) => {
  const {
    id,
    assetId,
    workorderAssetId,
    workorderNumber,
    manufacturerSerialNumber,
    inspectionLevel,
    inspectionType,
    serviceCenterId,
  } = locationRef?.state;
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

  });

  const context = useAccessState();
  const [error, setError] = useState(false);
  const [loader, setLoader] = useState(false);
  const [dataForExport, setDataForExport] = useState(false);

  const [countError, setCountError] = useState(0)
  const [alertErrorMessage, setAlertErrorMessage] = useState("initial")
  const [Prompt, setDirty, setPristine] = useUnsavedChangesWarning();

  const [showDeleteModal, setShowDeleteModal] = useState()

  useEffect(() => {
    if (countError === 0) {
      setAlertErrorMessage("initial")
      setCountError(0)
      setPristine()
    }
  }, [countError])

  const closeDeleteModal = () => {
    setShowDeleteModal("");
  };
  const onDelete = (id) => {
    setShowDeleteModal(id);
  };

  // delete component from part type
  const deleteInventoryComponentObvs$ = useMemo(() => {
    return deleteReplacementComponentAjax$(
      DEFAULT_BASE_URL +
      VERSION +
      DELETE_INVENTORY_REPLACEMENT,
      {
        errorHandler: (error) => {
          setLoader(false);
          toast.error(
            AMPToastConsts.DELETE_INVENTORY_REPLACEMENT_ERROR,
            {
              position: toast.POSITION.TOP_CENTER,
            }
          );
        },
      }
    );
  });
  useObservableCallback(deleteInventoryComponentObvs$, (response) => {
    if (response?.status) {
      ajaxReplacementComponentObsv$.next(workorderAssetId);
      toast.success(AMPToastConsts.DELETE_INVENTORY_REPLACEMENT_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
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

  const onConfirmDelete = (id) => {
    deleteInventoryComponentObvs$.next({ id: id });
  };

  //Get clearance api starts
  const [replacementComponent, setReplacementComponent] = useState(
    ConstVariable?.INIT
  );
  const [partTypeAvailabilityStatus, setPartTypeAvailabilityStatus] = useState(
    ConstVariable?.INIT
  );

  const ajaxReplacementComponentObsv$ = useMemo(() => {
    return getReplacementComponentForInventoryAjaxObs$();
  }, []);
  useObservableCallback(
    ajaxReplacementComponentObsv$,
    (response) => {
      if (response?.status) {
        setLoader(false);
        setError(false);
        setReplacementComponent(response?.content);

        setDataForExport(
          response?.content?.data?.inventoryDetailResponses?.map((item) => {
            const [currentStockAvaialbility] =
              response?.content?.partAvailabilityStatus?.filter((itm) => {
                return itm?.id === item?.stockAvailability;
              });
            return {
              ...item,
              leadTime: item?.leadTime || "NA",
              workorderNumber: workorderNumber,
              manufacturerSerialNumber: manufacturerSerialNumber,
              stockAvailability: currentStockAvaialbility?.value,
              inspectionLevel:
                inspectionLevel === "PumpLevel1"
                  ? "Level 1 (Visual)"
                  : "Level 2 (Disassembly)",
            };
          })
        );
        setPartTypeAvailabilityStatus(
          response?.content?.partAvailabilityStatus?.map((item) => {
            return {
              label: item.value,
              value: item.id,
            };
          })
        );
      } else {
        setLoader(false);
        setReplacementComponent([]);
        setPartTypeAvailabilityStatus([]);
      }
    },
    []
  ); // Get Clerance api ends

  useEffect(() => {
    if (workorderAssetId) {
      setLoader(true);
      ajaxReplacementComponentObsv$.next(workorderAssetId);
    }
  }, [workorderAssetId]);
  const onClickData = () => {
    csvLink.current.link.click();
  };
  const getCsvData = () => {
    const csvData = [
      [
        "Work Order Number",
        "Manufacturer Serial Number",
        "Inspection Level",
        "Part Number",
        "Description",
        "Quantity Needed",
        "Stock Availability",
        "Lead Time",

        "Comment",
      ],
    ];
    let i;
    for (i = 0; i < dataForExport?.length; i += 1) {
      csvData.push([
        `${dataForExport[i]?.workorderNumber}`,
        `${dataForExport[i]?.manufacturerSerialNumber}`,
        `${dataForExport[i]?.inspectionLevel}`,

        `${dataForExport[i]?.partNumber}`,
        `${dataForExport[i]?.description}`,
        `${dataForExport[i]?.quantityNeeded}`,
        `${dataForExport[i]?.stockAvailability}`,
        `${dataForExport[i]?.leadTime}`,

        `${dataForExport[i]?.comments}`,
      ]);
    }
    return csvData;
  };
  // update
  const approveInventoryListObsv$ = useMemo(() => {
    return approveInventoryListAjax$(
      DEFAULT_BASE_URL + VERSION + APPROVE_INVENTORY_REPLACEMENT_LIST,
      {
        errorHandler: (error) => {
          setLoader(false);
          toast.error(AMPToastConsts.APPROVE_INVENTORY_LIST_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);

  useObservableCallback(approveInventoryListObsv$, (response) => {
    if (response?.status) {
      setLoader(false);
      ajaxReplacementComponentObsv$.next(workorderAssetId);
      toast.success(AMPToastConsts.APPROVE_INVENTORY_LIST_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      setLoader(false);
      toast.error(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });

  const submitPartInventoryForm = (inventoryId) => {
    let ajaxParams = {
      inventoryId: inventoryId,
      requestedById: parseInt(context?.userId),
    };
    if (
      replacementComponent?.data?.inventoryDetailResponses?.some(
        (i) => i?.inventoryDetailId === ConstVariable?.DID
      )
    ) {
      setError("Please configure all the replacement components before submitting!");
    } else {
      setError(false);
      setLoader(true);
      ajaxsubmitInventoryEntryForm$.next(ajaxParams);
    }
  };


  const ajaxsubmitInventoryEntryForm$ = useMemo(() => {
    return submitInventoryEntryFormAjax$(
      DEFAULT_BASE_URL + VERSION + SUBMIT_PART_INVENTORY_ENTRY,
      {
        errorHandler: (error) => {
          setLoader(false);
          toast.error(AMPToastConsts.SUBMIT_PART_INVENTORY_ENTRY_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);

  useObservableCallback(ajaxsubmitInventoryEntryForm$, (response) => {
    if (response?.status) {
      // setLoader(false);
      ajaxReplacementComponentObsv$.next(workorderAssetId);
      toast.success(AMPToastConsts.SUBMIT_PART_INVENTORY_ENTRY_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      setLoader(false);
      toast.error(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });
  const approveInventoryList = (id) => {
    // setLoader(true)
    approveInventoryListObsv$.next({ id: id })
  }

  const onSubmit = (formData) => {
    console.log("formData:", formData);
  };


  const ExcelFile = ReactExport.ExcelFile;
  const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
  const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
  return (
    <div id="results" className="form-container bg-form pt-2 mb-4">
      {/* {replacementComponent?.data?.status === "Completed" && ( */}
      <ExcelFile
        element={<Button>Export to Excel</Button>}
        filename={`inventory_${workorderNumber}`}
      >
        <ExcelSheet
          data={[...dataForExport, workorderNumber]}
          name="InventoryDetails"
        >
          <ExcelColumn label="Work order Number" value="workorderNumber" />
          <ExcelColumn
            label="Manufacturer Serial Number"
            value="manufacturerSerialNumber"
          />
          <ExcelColumn label="Inspection Level" value="inspectionLevel" />

          <ExcelColumn label="Part Number" value="partNumber" />
          <ExcelColumn label="Description" value="description" />
          <ExcelColumn label="Quantity Needed" value="quantityNeeded" />
          <ExcelColumn label="Stock Availability" value="stockAvailability" />
          <ExcelColumn label="Lead Time" value="leadTime" />

          <ExcelColumn label="Comment" value="comments" />
        </ExcelSheet>
      </ExcelFile>
      {/* )} */}

      {/* {replacementComponent?.data?.status === "Completed" && ( */}
      <Button onClick={onClickData}>Export to csv</Button>
      {/* )} */}
      <CSVLink
        filename={`inventory_${workorderNumber}.csv`}
        data={getCsvData()}
        className="hidden"
        ref={csvLink}
        target="_blank"
      ></CSVLink>

      <AMPLoader isLoading={loader} />
      <AMPFieldSet title="">
        <Row>
          <Col xs={12} sm={6} md={6} lg={4}>
            <div className="font-weight-bold">Work Order Number</div>
            <div> {workorderNumber} </div>
          </Col>
          <Col xs={12} sm={6} md={6} lg={4}>
            <div className="font-weight-bold">Manufacturer Serial Number</div>
            <div> {manufacturerSerialNumber} </div>
          </Col>
          <Col xs={12} sm={6} md={6} lg={4}>
            <div className="font-weight-bold">Inspection Level</div>
            <div>
              {inspectionLevel === "PumpLevel1"
                ? "Level 1 (Visual)"
                : "Level 2 (Disassembly)"}
            </div>
          </Col>
        </Row>
      </AMPFieldSet>
      {error && <AMPErrorAlert show={true}>{error}</AMPErrorAlert>}
      <AMPAccordion
        title={`Replacement Components`}
        contentClassName="p-0"
        isOpen={true}
      >
        {replacementComponent !== ConstVariable?.INIT &&
          partTypeAvailabilityStatus !== ConstVariable?.INIT &&
          partTypeAvailabilityStatus?.length > 0 &&
          replacementComponent?.data?.inventoryDetailResponses?.length > 0 && (
            <>
              <Row className="border font-weight-bold text-center fn-13 mx-0 mt-1 py-1">
                <Col xs={12} sm={4} md={4} lg={2}>
                  Part #
                </Col>
                <Col xs={12} sm={4} md={4} lg={2}>
                  Description{" "}
                </Col>
                <Col xs={12} sm={4} md={4} lg={1}>
                  Quantity Needed
                </Col>
                <Col xs={12} sm={4} md={4} lg={2}>
                  Stock Availability
                </Col>
                <Col xs={12} sm={4} md={4} lg={1}>
                  Available Quantity
                </Col>
                <Col xs={12} sm={4} md={4} lg={1}>
                  Lead Time(InDays)
                </Col>
                <Col xs={12} sm={4} md={4} lg={2}>
                  Comments
                </Col>
                {(context?.features?.includes("INV-ENTRY") &&
                  replacementComponent?.data?.status !== "Completed") && (
                    <Col xs={12} sm={4} md={4} lg={1}>
                      Action
                    </Col>
                  )}
              </Row>
              <Row>
                <Col className='list-table-style'>
                  {replacementComponent?.data?.inventoryDetailResponses?.map(
                    (item, idx) => (
                      <ReplacementComponentForm
                        key={idx}
                        item={item}
                        partTypeAvailabilityStatus={partTypeAvailabilityStatus}
                        locationRef={locationRef}
                        ajaxReplacementComponentObsv$={
                          ajaxReplacementComponentObsv$
                        }
                        loader={loader}
                        setLoader={setLoader}
                        inventoryStatus={replacementComponent?.data?.status}
                        replacementComponent={replacementComponent}
                        Prompt={Prompt}
                        setDirty={setDirty}
                        setCountError={setCountError}
                        alertErrorMessage={alertErrorMessage}
                        setAlertErrorMessage={setAlertErrorMessage}
                        manufacturerSerialNumber={manufacturerSerialNumber}
                        serviceCenterId={serviceCenterId}
                        onDelete={onDelete}
                      />
                    )
                  )}
                </Col>
              </Row>

            </>
          )}
        {replacementComponent?.length === 0 && (
          <Row className="text-center text-danger">
            <Col>No Data Found</Col>
          </Row>
        )}
      </AMPAccordion>
      {(replacementComponent?.data?.inventoryDetailResponses?.length > 0
        && context?.features?.includes("INV-ENTRY")
        && !context?.features?.includes("INS-APRREP") &&
        replacementComponent?.data?.status !== "Completed") && (
          <Row>
            <Col>
              <Button
                type="submit"
                variant="primary"
                className="float-right px-5 my-2"
                size="md"
                onClick={() => submitPartInventoryForm(replacementComponent?.data?.inventoryId)}
              >
                Submit
              </Button>
            </Col>
          </Row>
        )}
      {(replacementComponent?.data?.inventoryDetailResponses?.length > 0
        && context?.features?.includes("INS-APRREP") &&
        replacementComponent?.data?.status === "PendingReview") && (
          <Row>
            <Col>
              <Button
                type="submit"
                variant="primary"
                className="float-right px-5 my-2"
                size="md"
                onClick={() => approveInventoryList(workorderAssetId)}
              >
                Approve
              </Button>
            </Col>
          </Row>
        )}
      {/* </form> */}
      {showDeleteModal && (
        <DeleteModal
          confirmationMessage={AMPMessage.DEL_REPL_COMP_CONFIRM}
          showDeleteModal={showDeleteModal}
          onConfirmDelete={onConfirmDelete}
          closeModal={closeDeleteModal}
        />
      )}
    </div>
  );
};

export const ReplacementComponentForm = ({
  item,
  partTypeAvailabilityStatus,
  locationRef,
  ajaxReplacementComponentObsv$,
  loader,
  setLoader,
  inventoryStatus,
  replacementComponent,
  Prompt,
  setDirty,
  setCountError,
  alertErrorMessage,
  setAlertErrorMessage,
  onDelete
}) => {
  const validationSchema = useMemo(
    () =>
      yup.object(context?.features?.includes("INS-APRREP") ? {} : {
        availability: yup.object().required("required"),
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
    // resolver,
  });

  const context = useAccessState();
  const [lTime, setlTime] = useState(item?.leadTime);
  const [inventoryId, setInventoryId] = useState(item?.inventoryDetailId);

  const {
    id,
    assetId,
    workorderAssetId,
    workorderNumber,
    manufacturerSerialNumber,
    serviceCenterId
  } = locationRef?.state;

  let PART_AVAILABILITY = watch("availability");
  const [leadTimeError, setLeadTimeError] = useState(false);
  const [availabilityError, setavailabilityError] = useState(false);

  useEffect(() => {
    if (
      item?.stockAvailability !== 0 &&
      partTypeAvailabilityStatus !== ConstVariable?.INIT
    ) {
      partTypeAvailabilityStatus?.filter((itm) => {
        if (itm?.value === item?.stockAvailability) {
          setValue("availability", itm)
        }
      });
    }
  }, []);

  useEffect(() => {
    const zero = 0;
    if (PART_AVAILABILITY?.value === 1 || PART_AVAILABILITY?.value === 3) {
      setValue("leadTime", zero);
    } else {
      setValue("leadTime", item?.leadTime);
    }
  }, [PART_AVAILABILITY?.value]);


  const ajaxSaveReplacementComponentObsv$ = useMemo(() => {
    return saveReplacementComponentForInventoryAjax$(
      DEFAULT_BASE_URL + VERSION + SAVE_REPLACEMENT_COMPONENT_FOR_INVENTORY,
      {
        errorHandler: (error) => {
          setLoader(false);
          toast.error(
            AMPToastConsts.SAVE_REPLACEMENT_COMPONENT_FOR_INVENTORY_ERROR,
            {
              position: toast.POSITION.TOP_CENTER,
            }
          );
        },
      }
    );
  }, []);
  useObservableCallback(ajaxSaveReplacementComponentObsv$, (response) => {
    if (response?.status) {
      reset({
        ...response?.params?.formData,
        leadTime: response?.params?.request?.leadTime
      })
      setInventoryId(response?.content);
      ajaxReplacementComponentObsv$.next(workorderAssetId);
      toast.success(
        AMPToastConsts.SAVE_REPLACEMENT_COMPONENT_FOR_INVENTORY_SUCCESS,
        {
          position: toast.POSITION.TOP_CENTER,
        }
      );
    } else {
      setLoader(false);
      toast.error(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });

  // update
  const ajaxUpdateReplacementComponentRange$ = useMemo(() => {
    return updateReplacementComponentForInventoryAjax$(
      DEFAULT_BASE_URL + VERSION + SAVE_REPLACEMENT_COMPONENT_FOR_INVENTORY,
      {
        errorHandler: (error) => {
          setLoader(false);
          toast.error(
            AMPToastConsts.UPDATE_REPLACEMENT_COMPONENT_FOR_INVENTORY_ERROR,
            {
              position: toast.POSITION.TOP_CENTER,
            }
          );
        },
      }
    );
  }, []);

  useObservableCallback(ajaxUpdateReplacementComponentRange$, (response) => {
    if (response?.status) {
      reset({
        ...response?.params?.formData,
        leadTime: response?.params?.request?.leadTime
      })
      setLoader(false);
      toast.success(
        AMPToastConsts.UPDATE_REPLACEMENT_COMPONENT_FOR_INVENTORY_SUCCESS,
        {
          position: toast.POSITION.TOP_CENTER,
        }
      );
    } else {
      setLoader(false);
      toast.error(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });

  const updateInventoryQuantityNeededObsv$ = useMemo(() => {
    return updateInventoryQuantityNeededAjax$(
      DEFAULT_BASE_URL + VERSION + PUT_INVENTORY_REPLACEMENT,
      {
        errorHandler: (error) => {
          setLoader(false);
          toast.error(
            AMPToastConsts.UPDATE_INVENTORY_QUANTITY_NEEDED_ERROR,
            {
              position: toast.POSITION.TOP_CENTER,
            }
          );
        },
      }
    );
  }, []);

  useObservableCallback(updateInventoryQuantityNeededObsv$, (response) => {
    if (response?.status) {
      reset({
        ...response?.params?.formData,
        leadTime: response?.params?.request?.leadTime
      })
      setLoader(false);
      toast.success(
        AMPToastConsts.UPDATE_INVENTORY_QUANTITY_NEEDED_SUCCESS,
        {
          position: toast.POSITION.TOP_CENTER,
        }
      );
    } else {
      setLoader(false);
      toast.error(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });

  const onSubmit = (formData) => {
    if (context?.features?.includes("INS-APRREP")) {
      setLoader(true);
      updateInventoryQuantityNeededObsv$.next({
        id: item?.inspectionTraceabilityComponentDetailId,
        quantityNeeded: formData?.quantityNeeded,
        formData: formData
      })
    } else {
      if (!formData?.availability?.value) {
        setavailabilityError("Required")
      } else if (PART_AVAILABILITY?.value === 2 && !formData?.leadTime) {
        setLeadTimeError("Lead Time is Required");
      } else if (PART_AVAILABILITY?.value === 2 && parseInt(formData?.leadTime) < 1) {
        setLeadTimeError("lead Time shouldn't be less than 1");
      } else if (parseInt(PART_AVAILABILITY?.value === 2 && formData?.leadTime) > 90) {
        setLeadTimeError("lead Time shouldn't be greater than 90");
      } else {
        setavailabilityError(false)
        setLeadTimeError(false);
        const request = {
          workorderId: id,
          workorderAssetId: workorderAssetId,
          assetId: assetId,
          inventoryDetailId:
            inventoryId === ConstVariable?.DID ? ConstVariable?.DID : inventoryId,
          partTypeComponentId: item?.partTypeComponentId,
          availableQuantity: parseInt(formData?.availableQuantity),
          leadTime: parseInt(formData?.leadTime) || 0,
          stockAvailability: formData?.availability?.value,
          comments: formData?.comment,
          requestedById: parseInt(context?.userId),
          ServiceCenterId: parseInt(serviceCenterId),
          manufacturerSerialNumber: manufacturerSerialNumber,
        };

        if (inventoryId === ConstVariable?.DID) {
          setLoader(true);
          ajaxSaveReplacementComponentObsv$.next({
            request,
            formData,
            replacementComponent
          });
        } else {
          setLoader(true);
          ajaxUpdateReplacementComponentRange$.next({
            request,
            formData
          });
        }
      }
    }
  };

  useEffect(() => {
    if (
      formState?.isDirty &&
      inventoryStatus !== "Completed"
    ) {
      setAlertErrorMessage(true)
      setDirty()
      setCountError(preState => preState + 1)
    } else if (
      alertErrorMessage !== ConstVariable?.INIT &&
      !formState?.isDirty &&
      inventoryStatus !== "Completed"
    ) {
      setCountError(preState => preState - 1)
    }
  }, [formState?.isDirty])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border border-top-0">
      {/* render prompt */}
      {Prompt}
      {/* render prompt */}
      <Row className="px-2 text-break text-center fn-13">
        <Col xs={12} sm={4} md={4} lg={2} className="mt-2 text-break description_text">
          {item?.partNumber}
        </Col>
        <Col xs={12} sm={4} md={4} lg={2} className="mt-2 text-break description_text">
          {item?.description}
        </Col>
        <Col xs={12} sm={4} md={4} lg={1}>
          <AMPFieldWrapper
            colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
            controlId="quantityNeeded"
            name="quantityNeeded"
            fieldValidationCustom={leadTimeError ? leadTimeError : false}
            disabled={!context?.features?.includes("INS-APRREP")
              || !context?.features?.includes("INV-ENTRY")}
          >
            <AMPNumberTextBox
              defaultValue={item?.quantityNeeded}
              ref={register}
              className="height-c"
            />
          </AMPFieldWrapper>
          {/* {item?.quantityNeeded} */}
        </Col>
        <Col xs={12} sm={4} md={4} lg={2}>
          <AMPFormLayout>
            <AMPFieldWrapper
              colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
              controlId="availability"
              name="availability"
              fieldValidationCustom={availabilityError ? availabilityError : false}
              isDisabled={!context?.features?.includes("INV-ENTRY")
                || context?.features?.includes("INS-APRREP")}
            >
              <Controller
                as={Select}
                id="quantity"
                control={control}
                options={partTypeAvailabilityStatus}
                onChange={([selected]) => {
                  return { value: selected };
                }}
                defaultValue={
                  partTypeAvailabilityStatus?.filter((itm) => {
                    if (itm?.value === item?.stockAvailability) {
                      return itm;
                    } else return null;
                  })
                }
              />
            </AMPFieldWrapper>
          </AMPFormLayout>
        </Col>
        <Col xs={12} sm={4} md={4} lg={1}>
          {(!context?.features?.includes("INV-ENTRY")) ? (
            <div className="mt-2">
              {item?.availableQuantity ? item?.availableQuantity : "NA"}
            </div>
          ) : (
            <AMPFieldWrapper
              colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
              controlId="availableQuantity"
              name="availableQuantity"
              fieldValidation={errors?.availableQuantity}
              disabled={context?.features?.includes("INS-APRREP")}
            >
              <AMPNumberTextBox
                defaultValue={item?.availableQuantity}
                ref={register}
                className="height-c"
              />
            </AMPFieldWrapper>
          )}
        </Col>
        <Col xs={12} sm={4} md={4} lg={1}>
          {(!context?.features?.includes("INV-ENTRY")) ? (
            <div className="mt-2">
              {item?.leadTime ? item?.leadTime : "NA"}
            </div>
          ) : (
            <>
              <AMPFieldWrapper
                colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
                controlId="leadTime"
                name="leadTime"
                fieldValidationCustom={leadTimeError ? leadTimeError : false}
                disabled={
                  PART_AVAILABILITY?.value === 1
                  || PART_AVAILABILITY?.value === 3
                  || context?.features?.includes("INS-APRREP")}
              >
                <AMPNumberTextBox
                  defaultValue={
                    PART_AVAILABILITY?.value === 1 || PART_AVAILABILITY?.value === 3 ?
                      "0" : item?.leadTime}
                  ref={register}
                  className="height-c"
                />
              </AMPFieldWrapper>
              {/* )} */}
            </>
          )}
        </Col>
        <Col xs={12} sm={4} md={4} lg={2} className="text-break description_text">
          {(!context?.features?.includes("INV-ENTRY")) ?
            <div className="mt-2">
              {item?.comments ? item?.comments : "NA"}
            </div> :
            <>
              <textarea
                controlId="comment"
                name="comment"
                defaultValue={item?.comments}
                rows="1"
                ref={register}
                className="mt-2"
                style={{ height: "36px", width: "100%" }}
                disabled={context?.features?.includes("INS-APRREP")}
              >
              </textarea>
            </>
          }
        </Col>
        {context?.features?.includes("INV-ENTRY") && (
          <Col xs={12} sm={4} md={4} lg={1} className="text-left ws-nowrap">
            <button
              aria-label="Update"
              name="Update"
              type="submit"
              className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 mt-2 btn btn-amp-monochrome-amp-brand btn-md"
            >
              <AMPTooltip
                text={inventoryId === ConstVariable?.DID ? "Save" : "Update"}
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
            {context?.features?.includes("INS-APRREP") && (
              <button
                aria-label="Delete"
                name="Delete"
                type="button"
                className="amp-button button-mini icon-mini btn-transition btn-transparent mt-2 m-0 btn btn-amp-monochrome-amp-brand btn-md"
                onClick={() => onDelete(item?.inspectionTraceabilityComponentDetailId)}
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
                      fillRule="evenodd"
                      d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                    />
                  </svg>
                </AMPTooltip>
              </button>
            )}

            {(item?.inventoryDetailId !== ConstVariable?.DID && !formState?.isDirty) && (
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
        )}
      </Row>
    </form>
  );
};
