import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import Select from "react-select";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Form, Row, Col, Button } from "react-bootstrap";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import * as yup from "yup";
import { AMPFieldWrapper } from "../common/AMPFieldWrapper";
import AMPFieldSet from "../common/AMPFieldSet";
import { AMPFormLayout } from "../common/AMPFormLayout";
import { AMPTextArea } from "../common";
import { AMPAccordion } from "../common/AMPAccordion";
import TableIcon from "../common/TableIcon";
import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";
import {
  GET_ALL_QUESTIONNAIRE,
  DEFAULT_BASE_URL,
  VERSION,
  GET_INSPECTION_TYPE,
  GET_QUESTIONNAIRE_BY_PART_INSPECTION_OR_SAVE_QUESTIONNAIRE,
  GET_PART_TYPE,
  UPDATE_QUESTIONNAIRE_SEQUENCE,
  GET_QUESTIONNAIRE_VERSION,
  ACTIVATE_QUESTIONNAIRE,
} from "../common/const";
import { toast } from "react-toastify";

import { ampJsonAjax } from "../common/utils/ampAjax";
import AMPTooltip from "../common/AMPTooltip";
import CreateQuestionaireForm from "./createQuestionnaireForm";
import { useAccessState } from "../../utils/AppContext/loginContext";
import { transduce } from "ramda";
import { AMPValidation } from "../common/AMPAuthorization/AMPValidation";
import { AMPToastConsts } from "../common/const/AMPToastConst";
import { DeleteModal } from "../common/DeleteModal";
import AMPLoader from "../common/AMPLoader";
import { QuestionnaireCloneModal } from "./QuestionnaireCloneModal";
import { AMPMessage } from "../common/const/AMPMessage";
import { AMPUpdateConfirmBox } from "../common/AMPUpdateConfirmBox";

toast.configure();
// Get all questions
const getQuestionnaireListByPartAndInspection = () =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax
        .get(
          DEFAULT_BASE_URL +
          VERSION +
          GET_QUESTIONNAIRE_BY_PART_INSPECTION_OR_SAVE_QUESTIONNAIRE +
          "/" +
          params.partType.value +
          "/" +
          params.inspectionType.value +
          "/" +
          params.version
        )
        .pipe(
          map((xhrResponse) => {
            return { ...xhrResponse.response, params };
          }),
          catchError((error) => {
            return throwError(error);
          })
        )
    )
  ); //ENd Of Line

//Update Questionnaire
const updateQuestionnaireAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.put(URL, params).pipe(
        map((xhrResponse) => {
          return xhrResponse;
        }),
        catchError((error) => {
          console.error("Error in create Questionnaire", error);
          errorHandler(error.response);

          return [];
        })
      )
    )
  ); // ENd of line
//Update Questionnaire
const activateQuestionnaireAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.put(URL + params).pipe(
        map((xhrResponse) => {
          return xhrResponse;
        }),
        catchError((error) => {
          console.error("Error in activating Questionnaire", error);
          errorHandler(error.response);

          return [];
        })
      )
    )
  ); // ENd of line

// Delete Questionnaire
const deleteQuestionnaireAjax$ = (URL) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.delete(URL + "/" + params.id).pipe(
        map((xhrResponse) => {
          return xhrResponse;
        }),
        catchError((error) => {
          console.error("Error in create Questionnaire", error);
          errorHandler(error.response);
          return [];
        })
      )
    )
  ); // ENd of line
//Get Inspection Type
const getInspectionTypeListAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax.get(DEFAULT_BASE_URL + VERSION + GET_INSPECTION_TYPE).pipe(
        map((xhrResponse) => {
          const filteredData = xhrResponse.response.content.map((item) => {
            return {
              label: item.value,
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
//Get Version List
const getVersionListAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax
        .get(
          DEFAULT_BASE_URL +
          VERSION +
          GET_QUESTIONNAIRE_VERSION +
          params?.partType +
          "/" +
          params?.inspectionType
        )
        .pipe(
          map((xhrResponse) => {
            const filteredData = xhrResponse?.response?.content.map((item) => {
              return {
                label: item?.version,
                value: item?.version,
                color: item?.isActive,
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

//Get Part Type
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

//Update Questionnaire Sequence on drag and drop
const updateQuestionnaireSequenceAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.put(URL, params).pipe(
        map((xhrResponse) => {
          return xhrResponse;
        }),
        catchError((error) => {
          console.error("Error in create Questionnaire", error);
          errorHandler(error.response);

          return [];
        })
      )
    )
  ); // ENd of line
const QuestionnaireForm = (addQuestionnaireColumn) => {
  useEffect(() => {
    $('[data-toggle="tooltip"]').tooltip();
    return () => { };
  }, []);

  const inspectionAjaxObsv$ = useMemo(() => {
    return getInspectionTypeListAjaxObs$();
  }, []);
  const inspectionResult = useObservable(inspectionAjaxObsv$, []); // Inspection Result
  const partTypeAjaxObsv$ = useMemo(() => {
    return getPartTypeListAjaxObs$();
  }, []);
  const partTypeResult = useObservable(partTypeAjaxObsv$, []); // Part Type Result

  useEffect(() => {
    if (partTypeAjaxObsv$) partTypeAjaxObsv$.next();
    if (inspectionAjaxObsv$) inspectionAjaxObsv$.next();
  }, [inspectionAjaxObsv$, partTypeAjaxObsv$]);

  return (
    <div>
      <p>
        <span className="receiving-tag">Configure Questionnaire</span>
      </p>
      <QuestionnaireFullForm
        inspectionResult={inspectionResult}
        partTypeResult={partTypeResult}
      />
    </div>
  );
};
const QuestionnaireFullForm = ({ inspectionResult, partTypeResult }) => {
  const [index, setIndex] = useState(0);
  const [showLoader, setLoader] = useState("");
  const [loader, setShowLoading] = useState(false);
  const [selectedQuestionResult, setSelectedQuestionResult] = useState([]);
  const [sequenceResult, setSequenceResult] = useState([]);
  const [selectedQuestionForClone, setSelectedQuestionForClone] = useState();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState();
  const [validationData, setValidationData] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [versionNo, setVersionNo] = useState(0);
  const [activateStatus, setActivateStatus] = useState(false);
  const [versionResult, setVersionResult] = useState([]);
  const [maximumVersion, setMaxVersion] = useState(false);
  const [isMaxVersionActivated, setIsMaxVersionActivated] = useState(); //To check whethet latest version is or was activated anytime before

  const questionByPartAndInspectionObs$ = useMemo(() => {
    return getQuestionnaireListByPartAndInspection();
  }, []);

  useObservableCallback(questionByPartAndInspectionObs$, (response) => {
    setSelectedQuestionResult(response);
    if (
      response?.status &&
      response?.content[0]?.questionResponses.length > 0
    ) {
      setSelectedQuestionResult(response);
      setLoader("");
      setSequenceResult([]);
      setVersionNo(response?.content[0]?.version);
      setActivateStatus(response?.content[0]?.isActive);
      setIsMaxVersionActivated({
        isMaxVersion: response?.content[0]?.isMaxVersion,
        isQuestionnaireLinkedWithInspection:
          response?.content[0]?.isQuestionnaireLinkedWithInspection,
      });
    } else {
      // setLoader("");
      // setLoader("");

      setLoader(!response?.content ? response?.message : "No Records Found");
      setActivateStatus(false);
      setVersionNo(!response?.content ? 0 : response?.content[0]?.version);
    }

    versionListAjaxObs$.next({
      partType: response?.params?.partType?.value,
      inspectionType: response?.params?.inspectionType?.value || null,
    });
  });
  const versionListAjaxObs$ = useMemo(() => {
    return getVersionListAjaxObs$();
  }, []);
  useObservableCallback(versionListAjaxObs$, (response) => {
    setShowLoading(false);
    setVersionResult(response);
    const maxVersion = response.reduce(
      (acc, itm) => (acc = acc > itm.value ? acc : itm.value),
      0
    );
    setMaxVersion(maxVersion);
  });
  const validationSchema = useMemo(
    () =>
      yup.object({
        partType: yup.object().required("Required"),
        inspectionType: yup.object().required("Required"),
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

  const { fields, remove } = useFieldArray({
    control,
    name: "content",
  });
  const updateQuestionnaire$ = useMemo(() => {
    return updateQuestionnaireAjax$(
      DEFAULT_BASE_URL +
      VERSION +
      GET_QUESTIONNAIRE_BY_PART_INSPECTION_OR_SAVE_QUESTIONNAIRE,

      {
        errorHandler: (error) => {
          toast.error(AMPToastConsts.QUESTIONNAIRE_UPDATE_ERROR, {
            // Set to 15sec
            position: toast.POSITION.TOP_CENTER,
            autoClose: 15000,
          });
        },
      }
    );
  });

  useObservableCallback(updateQuestionnaire$, (response) => {
    if (!response?.response?.status) {
      toast.error(response.response.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      questionByPartAndInspectionObs$.next({
        partType: selectedQuestionResult?.params?.partType,
        inspectionType: selectedQuestionResult?.params?.inspectionType || null,
        version: versionNo,
      });
      setShowNewForm(false);
      toast.success(AMPToastConsts.QUESTIONNAIRE_UPDATE_RULE_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });
  //Activate Questionnaire starts
  const activateQuestionnaire$ = useMemo(() => {
    return activateQuestionnaireAjax$(
      DEFAULT_BASE_URL + VERSION + ACTIVATE_QUESTIONNAIRE,

      {
        errorHandler: (error) => {
          toast.error(AMPToastConsts.QUESTIONNAIRE_UPDATE_ERROR, {
            // Set to 15sec
            position: toast.POSITION.TOP_CENTER,
            autoClose: 15000,
          });
        },
      }
    );
  });

  useObservableCallback(activateQuestionnaire$, (response) => {
    if (!response?.response?.status) {
      toast.error(response.response.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      questionByPartAndInspectionObs$.next({
        partType: selectedQuestionResult?.params?.partType,
        inspectionType: selectedQuestionResult?.params?.inspectionType || null,
        version: versionNo,
      });

      setShowLoading(false);
      setShowConfirmModal(false);
      toast.success(AMPToastConsts.QUESTIONNAIRE_ACTIVATE_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });
  const onConfirmSubmit = () => {
    if (!activateStatus) {
      activateQuestionnaire$.next(selectedQuestionResult?.content[0]?.id);
    }
  };
  //Activate Questionnaire ends
  const onActivateClick = () => {
    setShowConfirmModal(true);
  };
  const updateQuestionnaireSequence$ = useMemo(() => {
    return updateQuestionnaireSequenceAjax$(
      DEFAULT_BASE_URL + VERSION + UPDATE_QUESTIONNAIRE_SEQUENCE,

      {
        errorHandler: (error) => {
          toast.error(AMPToastConsts.QUESTIONNAIRE_UPDATE_SEQUENCE_ERROR, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 15000,
          });
        },
      }
    );
  });

  // useObservableCallback for drag and drop sequnce order
  useObservableCallback(updateQuestionnaireSequence$, (response) => {
    if (!response?.response?.status) {
      toast.error(response.response.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      questionByPartAndInspectionObs$.next({
        partType: selectedQuestionResult?.params?.partType,
        inspectionType: selectedQuestionResult?.params?.inspectionType || null,
        version: versionNo,
      });

      setShowNewForm(false);
      toast.success(AMPToastConsts.QUESTIONNAIRE_UPDATE__SEQUENCE_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  }); // End of Line

  const onhandleSubmit = (idx, id, sequence) => {
    setValidationData(false);
    if (sequenceResult.length > 0) {
      toast.error(AMPToastConsts.QUESTIONNAIRE_UPDATE_WHILE_SEQUENCE_ERROR, {
        // Set to 15sec
        position: toast.POSITION.TOP_CENTER,
        autoClose: 15000,
      });
    } else {
      const partTypeId = selectedQuestionResult?.params?.partType?.value;
      const inspectionTypeId =
        selectedQuestionResult?.params?.inspectionType?.value;
      const questionText = getValues(`content[${idx}].text`);
      const instructions = getValues(`content[${idx}].instructions`);
      const isPictureToBeAdded = getValues(
        `content[${idx}].isPictureToBeAdded`
      );
      const ajaxParams = {
        QuestionId: id,
        Sequence: sequence,
        PartTypeId: parseInt(partTypeId),
        InspectionTypeId: parseInt(inspectionTypeId),
        QuestionText: questionText,
        TriggersLevelType: 1,
        Instructions: instructions,
        IsPictureToBeAdded: isPictureToBeAdded === "true" ? true : false,
      };

      partTypeId &&
        inspectionTypeId &&
        id &&
        updateQuestionnaire$.next(ajaxParams);
    }
  };

  const onSearch = (data) => {
    setShowLoading(true);
    setShowNewForm(false);
    let partType = data?.partType;
    setValidationData(false);
    let inspectionType = data?.inspectionType;
    questionByPartAndInspectionObs$.next({
      partType: partType,
      inspectionType: inspectionType || null,
      version: 0,
    });

    setLoader("Searching ...");
  };
  const addNewFields = () => {
    setShowNewForm("true");
    // return <CommonQuestionnaireForm itm="" idx="" isOpen="true" />;
  };

  const cloneQuestionnaire = () => {
    setShowQuestionnaireModal(true);
  };
  const data = [];
  const reorder = (list, startIndex, endIndex) => {
    const result = list;
    const [removed] = list[0]?.questionResponses?.splice(startIndex, 1);
    list[0]?.questionResponses?.splice(endIndex, 0, removed);
    setSequenceResult(list);
    return list;
  };
  const getItemStyle = (isDragging, draggableStyle) => ({
    // styles we need to apply on draggables
    ...draggableStyle,
  });

  const onDragAndDrop = () => {
    const abc = sequenceResult[0]?.questionResponses.map((itm) => {
      return {
        QuestionId: itm.id,
        Sequence: itm.sequence,
      };
    });
    const ajaxParams = {
      Questionnaires: sequenceResult[0]?.questionResponses.map((itm, idx) => {
        return {
          QuestionId: itm.id,
          Sequence: idx + 1,
        };
      }),
    };
    updateQuestionnaireSequence$.next(ajaxParams);
  };
  useEffect(() => {
    if (
      selectedQuestionForClone?.partType &&
      selectedQuestionForClone?.inspectionType
    ) {
      setValue("partType", selectedQuestionForClone?.partType);
      setValue("inspectionType", selectedQuestionForClone?.inspectionType);
      setShowLoading(true);
      questionByPartAndInspectionObs$.next({
        partType: selectedQuestionForClone?.partType,
        inspectionType: selectedQuestionForClone?.inspectionType,
        version: 0,
      });
    }
  }, [selectedQuestionForClone]);

  const CommonQuestionnaireForm = ({ itm, idx, isOpen }) => {
    return (
      <Draggable key={itm?.id} draggableId={itm?.id} index={idx}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={getItemStyle(
              snapshot.isDragging,
              provided.draggableProps.style
            )}
          >
            <Row>
              <Col lg={12} md={12} xs={12} sm={12}>
                <AMPAccordion
                  title={"Question " + (idx + 1) + ":" + itm.text}
                  contentClassName="p-0"
                  isOpen={false}
                  showIcon={
                    versionNo == 0 ||
                    versionNo > maximumVersion ||
                    (!activateStatus &&
                      isMaxVersionActivated?.isMaxVersion &&
                      !isMaxVersionActivated?.isQuestionnaireLinkedWithInspection)
                  }
                  data={itm}
                  index={idx}
                  onDelete={onDelete}
                  onhandleSubmit={onhandleSubmit}
                >
                  <div className="p-2">
                    <AMPFormLayout className="px-2">
                      <AMPFieldWrapper
                        label="Question"
                        colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
                        controlId="text"
                        name={`content[${idx}].text`}
                        required="true"
                        disabled={true}
                      >
                        <AMPTextArea
                          ref={register}
                          defaultValue={`${itm.text}`}
                        />
                      </AMPFieldWrapper>
                    </AMPFormLayout>
                    <AMPFieldSet fieldBgColor="bg-white">
                      <AMPFormLayout className="m-2 ">
                        <AMPFieldWrapper
                          label="Instructions"
                          colProps={{ md: 6, sm: 12, lg: 6, xs: 12 }}
                          controlId="instructions"
                          name={`content[${idx}].instructions`}
                        >
                          <AMPTextArea
                            ref={register}
                            defaultValue={`${itm.instructions}`}
                          />
                        </AMPFieldWrapper>
                        <div className="amp-position-relative">
                          <Form.Label className="form-label mt-1">
                            Requires Pictures to be taken?
                          </Form.Label>

                          <Col lg={12} md={6} xs={12} sm={12}>
                            <Row>
                              {/* <div className="amp-position-relative"> */}
                              <Col lg={6} md={6} xs={12} sm={12}>
                                <Form.Label className="form-label mt-1 ml-1 input-radio">
                                  <input
                                    type="radio"
                                    name={`content[${idx}].isPictureToBeAdded`}
                                    value={true}
                                    ref={register}
                                    key="key4"
                                    defaultChecked={
                                      itm.isPictureToBeAdded === true
                                    }
                                  />
                                  Yes
                                </Form.Label>
                              </Col>
                              <Col lg={6} md={6} xs={12} sm={12}>
                                <Form.Label className="form-label mt-1 ml-1 input-radio">
                                  <input
                                    type="radio"
                                    name={`content[${idx}].isPictureToBeAdded`}
                                    value={false}
                                    ref={register}
                                    key="key5"
                                    defaultChecked={
                                      itm?.isPictureToBeAdded === false
                                    }
                                  />
                                  No
                                </Form.Label>
                              </Col>
                              {/* </div> */}
                            </Row>
                          </Col>
                        </div>
                      </AMPFormLayout>
                    </AMPFieldSet>
                  </div>
                </AMPAccordion>
              </Col>
            </Row>
          </div>
        )}
      </Draggable>
    );
  };

  const closeDeleteModal = () => {
    setShowDeleteModal("");
  };
  const closeQuestionnaireModal = () => {
    setShowQuestionnaireModal(false);
  };

  // Confirm Update Modal
  const closeConfirmModal = () => {
    setShowConfirmModal(false);
  };

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    const content = reorder(
      selectedQuestionResult.content,
      result.source.index,
      result.destination.index
    );
  };

  const deleteQuestionnaire$ = useMemo(() => {
    return deleteQuestionnaireAjax$(
      DEFAULT_BASE_URL +
      VERSION +
      GET_QUESTIONNAIRE_BY_PART_INSPECTION_OR_SAVE_QUESTIONNAIRE,
      {
        errorHandler: (error) => {
          toast.error(AMPToastConsts.QUESTIONNAIRE_DELETE_ERROR, {
            // Set to 15sec
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  });
  useObservableCallback(deleteQuestionnaire$, (response) => {
    // setValidationData(true);

    questionByPartAndInspectionObs$.next({
      partType: selectedQuestionResult.params?.partType,
      inspectionType: selectedQuestionResult.params?.inspectionType || null,
      version: versionNo,
    });
    setShowDeleteModal("");
    toast.success(AMPToastConsts.QUESTIONNAIRE_DELETED_ERROR, {
      position: toast.POSITION.TOP_CENTER,
    });
    //setShowNewForm(false);
  });
  const closeModal = () => {
    props.closeDeleteModal();
  };
  const onDelete = (id) => {
    if (sequenceResult.length > 0) {
      toast.error(AMPToastConsts.QUESTIONNAIRE_UPDATE_WHILE_SEQUENCE_ERROR, {
        // Set to 15sec
        position: toast.POSITION.TOP_CENTER,
        autoClose: 15000,
      });
    } else {
      setShowDeleteModal(id);
    }
  };
  const onConfirmDelete = (id) => {
    deleteQuestionnaire$.next({ id: id });
  };

  useEffect(() => {
    if (selectedQuestionResult?.content) {
      reset({
        partType: selectedQuestionResult?.params?.partType,
        inspectionType: selectedQuestionResult?.params?.inspectionType,
        content: selectedQuestionResult?.content,
      });
    }
  }, [selectedQuestionResult]);
  return (
    <div id="results" className="form-container bg-form GeeksforGeeks">
      <Row>
        <Col xs={12} md={12} lg={12} sm={12}>
          <AMPLoader isLoading={loader === true} />
          <form onSubmit={handleSubmit(onSearch)}>
            <AMPFieldSet title="Search Questionnaire">
              <AMPFormLayout className="pb-5">
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
                      // React Select return object instead of value for selection
                      return { value: selected };
                    }}
                  />
                </AMPFieldWrapper>

                <AMPFieldWrapper
                  colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                  label="Inspection Type"
                  controlId="inspectionType"
                  name="inspectionType"
                  required="true"
                  fieldValidation={errors.inspectionType ? true : false}
                >
                  <Controller
                    as={Select}
                    id="inspectionType"
                    control={control}
                    options={inspectionResult}
                    onChange={([selected]) => {
                      return { value: selected };
                    }}
                  />
                </AMPFieldWrapper>

                <Col lg={4} md={6} xs={12} sm={12}>
                  <Button
                    type="submit"
                    variant="primary"
                    className="form-button"
                    block
                  >
                    Search
                  </Button>
                </Col>
              </AMPFormLayout>
            </AMPFieldSet>
          </form>
          {selectedQuestionResult?.params?.partType?.value &&
            selectedQuestionResult?.params?.inspectionType?.value && (
              <TableIcon
                addNewFields={addNewFields}
                selectedQuestionResult={selectedQuestionResult}
                cloneQuestionnaire={cloneQuestionnaire}
                onDragAndDrop={onDragAndDrop}
                sequenceResult={sequenceResult}
                questionByPartAndInspectionObs$={
                  questionByPartAndInspectionObs$
                }
                versionListAjaxObs$={versionListAjaxObs$}
                versionResult={versionResult}
                setLoader={setLoader}
                setVersionNo={setVersionNo}
                versionNo={versionNo}
                setShowLoading={setShowLoading}
                activateStatus={activateStatus}
                setShowNewForm={setShowNewForm}
                maximumVersion={maximumVersion}
                isMaxVersionActivated={isMaxVersionActivated}
              />
            )}
          {/* </Col>
      </Row>

      // <Row>
      //   <Col md={12} sm={12} xs={12} lg={12}> */}
          {showNewForm && (
            <CreateQuestionaireForm
              params={selectedQuestionResult.params}
              questionByPartAndInspectionObs$={questionByPartAndInspectionObs$}
              setShowNewForm={setShowNewForm}
              versionNo={versionNo}
              selectedQuestionResult={selectedQuestionResult}
            />
          )}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {sequenceResult.length > 0
                    ? sequenceResult[0]?.questionResponses?.map(
                      (itm, idx) =>
                        !showLoader && (
                          <CommonQuestionnaireForm
                            itm={itm}
                            idx={idx}
                            isOpen="true"
                          />
                        )
                    )
                    : fields[0]?.questionResponses?.map(
                      (itm, idx) =>
                        !showLoader && (
                          <CommonQuestionnaireForm
                            itm={itm}
                            idx={idx}
                            isOpen="true"
                          />
                        )

                      // </form>
                    )}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {<div className="text-center pt-2 pb-2">{showLoader}</div>}
        </Col>
      </Row>
      {selectedQuestionResult?.content &&
        selectedQuestionResult?.content[0]?.questionResponses.length > 0 &&
        selectedQuestionResult?.params?.partType?.value &&
        selectedQuestionResult?.params?.inspectionType?.value && (
          <div class="float-right btn-control-action-icons-group p-4 mb-5">
            {selectedQuestionResult?.content &&
              !selectedQuestionResult?.content[0]?.isActive ? (
              <Button
                aria-label="activate"
                variant="outline-secondary"
                className="m-2"
                onClick={onActivateClick}
              >
                Activate
              </Button>
            ) : (
              <Button
                aria-label="activate"
                variant="primary"
                className="m-2"
                onClick={onActivateClick}
              >
                Activated
              </Button>
            )}
          </div>
        )}
      {showDeleteModal && (
        <DeleteModal
          modalName=""
          confirmationMessage={AMPMessage.DEL_QUEST_CONFIRM}
          closeModal={closeDeleteModal}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          onConfirmDelete={onConfirmDelete}
          questionByPartAndInspectionObs$={questionByPartAndInspectionObs$}
          selectedQuestionResult={selectedQuestionResult}
          setSelectedQuestionResult={setSelectedQuestionResult}
          setValidationData={setValidationData}
        />
      )}

      {showQuestionnaireModal && (
        <QuestionnaireCloneModal
          modalName="Clone Questionnaire"
          partTypeResult={partTypeResult}
          inspectionResult={inspectionResult}
          setSelectedQuestionForClone={setSelectedQuestionForClone}
          closeQuestionnaireModal={closeQuestionnaireModal}
          params={selectedQuestionResult.params}
          versionNo={versionNo}
        />
      )}
      {showConfirmModal && (
        <AMPUpdateConfirmBox
          modalName=""
          confirmationMessage={
            "After Activating the Questionnaire no changes will be allowed to this version. Are you sure you want to Activate this Questionnaire?"
          }
          closeModal={closeConfirmModal}
          showConfirmModal={showConfirmModal}
          setShowConfirmModal={setShowConfirmModal}
          onConfirmSubmit={onConfirmSubmit}
        />
      )}
    </div>
  );
};

export default QuestionnaireForm;
