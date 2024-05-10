import React, { useState, useEffect, useContext, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { Form, Row, Col, Button } from "react-bootstrap";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import { AMPAccordion } from "../common/AMPAccordion";
import { AMPFieldWrapper } from "../common/AMPFieldWrapper";
import { AMPFormLayout } from "../common/AMPFormLayout";
import { ampJsonAjax } from "../common/utils/ampAjax";
import { FormValidation } from "../common/const/validations";
import { toast } from "react-toastify";
import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";
import AMPFieldSet from "../common/AMPFieldSet";
import { AMPFieldGroup } from "../common/AMPFieldWrapper/AMPFieldGroup";
import { AMPCheckbox } from "../common/AMPCheckbox";
import { AMPTextArea } from "../common";
import * as yup from "yup";
import { AMPErrorAlert } from "../common/AMPAlert";
import {
  GET_ALL_QUESTIONNAIRE,
  DEFAULT_BASE_URL,
  VERSION,
  GET_QUESTIONNAIRE_BY_PART_INSPECTION_OR_SAVE_QUESTIONNAIRE,
} from "../common/const";
import { AMPToastConsts } from "../common/const/AMPToastConst";
import { AMPValidation } from "../common/AMPAuthorization/AMPValidation";

import {
  AccessProvider,
  useAccessDispatch,
  useAccessState,
} from "../../utils/AppContext/loginContext";

//On create New Questionnaire
const saveQuestionnaireAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.post(URL, params).pipe(
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
// Get all questions
const getAllQuestionnaireListAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax
        .get(
          DEFAULT_BASE_URL +
            VERSION +
            GET_ALL_QUESTIONNAIRE +
            param?.partType?.value +
            "/" +
            param?.inspectionType?.value +
            "/" +
            param?.version
        )
        .pipe(
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
            console.log("error", error);
            return throwError(error);
          })
        )
    )
  );
const CreateQuestionaireForm = ({
  params,
  questionByPartAndInspectionObs$,
  versionNo,
  setShowNewForm,
  selectedQuestionResult,
}) => {
  const [showErrorMessage, setErrorMessage] = useState("");

  const ajaxObsv$ = useMemo(() => {
    return getAllQuestionnaireListAjaxObs$();
  }, []);

  const result = useObservable(ajaxObsv$, []); // All Questionnaire result
  useEffect(() => {
    const ajaxParams = {
      ...params,
      version:
        selectedQuestionResult?.content &&
        selectedQuestionResult?.content[0]?.questionResponses?.length === 0
          ? 0
          : versionNo,
    };

    if (ajaxObsv$) ajaxObsv$.next(params);
  }, []);
  /** Its for Saving rule */
  const saveQuestionnaire$ = useMemo(() => {
    return saveQuestionnaireAjax$(
      DEFAULT_BASE_URL +
        VERSION +
        GET_QUESTIONNAIRE_BY_PART_INSPECTION_OR_SAVE_QUESTIONNAIRE,
      {
        errorHandler: (error) => {
          toast.error(AMPToastConsts.QUESTIONNAIRE_CREATE_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  /* Observer for save response from ajax request */
  useObservableCallback(saveQuestionnaire$, (response) => {
    if (!response?.response?.status) {
      toast.error(response.response.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      questionByPartAndInspectionObs$.next({
        partType: params?.partType,
        inspectionType: params?.inspectionType || null,
        version: versionNo,
      });
      setShowNewForm(false);
      toast.success(AMPToastConsts.QUESTIONNAIRE_CREATE_RULE_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  });
  const onSave = (formData) => {
    if (!formData?.questionText && !formData?.questionTextSelect?.label) {
      setErrorMessage(FormValidation.BOTH_QUESTION_TYPE_EMPTY);
    } else {
      setErrorMessage("");

      const ajaxParams = {
        PartTypeId: parseInt(params?.partType?.value),
        InspectionTypeId: parseInt(params?.inspectionType?.value),
        QuestionText:
          formData?.questionTextSelect?.label || formData?.questionText,
        TriggersLevelType: 1, // Hard Coded//parseInt(formData?.TriggersLevelType),
        Instructions: formData?.QuestionInstructions,
        IsPictureToBeAdded:
          formData?.isPictureToBeAdded === "true" ? true : false,
        version: versionNo,
      };
      saveQuestionnaire$.next(ajaxParams);
    }
  };

  const { handleSubmit, reset, watch, control, register, errors } = useForm({});
  const createNewQuestion = watch("createNewQuestion");
  return (
    <form onSubmit={handleSubmit(onSave)}>
      <AMPAccordion
        title="Create New Question"
        contentClassName="p-0"
        isOpen={true}
        showIconForSave="false"
      >
        <div className="p-2">
          {showErrorMessage && (
            <AMPErrorAlert show={true}>{showErrorMessage}</AMPErrorAlert>
          )}
          <AMPFormLayout className="px-2">
            <AMPFieldWrapper
              controlId="createNewQuestion"
              colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
              name="createNewQuestion"
            >
              <AMPCheckbox
                label="Create New Question Text"
                // type="radio"
                ref={register}
              />
            </AMPFieldWrapper>

            {!createNewQuestion ? (
              <AMPFieldWrapper
                colProps={{ md: 4, sm: 12, lg: 4, xs: 12 }}
                label="Questions"
                controlId="questionTextSelect"
                name="questionTextSelect"
                required="true"
              >
                <Controller
                  id="questionTextSelect"
                  as={Select}
                  control={control}
                  options={result}
                  onChange={([selected]) => {
                    return { value: selected };
                  }}
                />
              </AMPFieldWrapper>
            ) : (
              <AMPFieldWrapper
                label="Question"
                colProps={{ md: 8, sm: 12, lg: 8, xs: 12 }}
                controlId="questionText"
                name="questionText"
                required="true"
              >
                {/* <Form.Control as="textarea" rows={3} /> */}
                <AMPTextArea ref={register} />
              </AMPFieldWrapper>
            )}
          </AMPFormLayout>
          <AMPFieldSet fieldBgColor="bg-white">
            <AMPFormLayout className="m-2 ">
            
              <AMPFieldWrapper
                label="Instructions"
                colProps={{ md: 6, sm: 12, lg: 6, xs: 12 }}
                controlId="QuestionInstructions"
                name="QuestionInstructions"
              >
                <AMPTextArea ref={register} />
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
                          name="isPictureToBeAdded"
                          value={true}
                          ref={register}
                        />
                        Yes
                      </Form.Label>
                    </Col>

                    <Col lg={6} md={6} xs={12} sm={12}>
                      <Form.Label className="form-label mt-1 ml-1 input-radio">
                        <input
                          type="radio"
                          name="isPictureToBeAdded"
                          value={false}
                          ref={register}
                          defaultChecked={true}
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

        <Row>
          <Col className="text-right my-2">
            <Button
              type="submit"
              variant="secondary"
              className="px-5"
              size="md"
            >
              Save
            </Button>
          </Col>
        </Row>
      </AMPAccordion>
    </form>
  );
};

export default CreateQuestionaireForm;
