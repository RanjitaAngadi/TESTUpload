import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import Select from "react-select";
import {
  AMPModal,
  AMPModalHeader,
  AMPModalBody,
  AMPModalFooter,
} from "../common/AMPModal";
import { toast } from "react-toastify";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import * as yup from "yup";
import { AMPFieldWrapper } from "../common/AMPFieldWrapper";
import { Row, Col, Button } from "react-bootstrap";
import { AMPFormValidation } from "../common/AMPFormValidation";
import {
  DEFAULT_BASE_URL,
  VERSION,
  CLONE_ALL_QUESTIONNAIRE,
} from "../common/const/endpoints";
import { AMPFormLayout } from "../common/AMPFormLayout";
import { AMPValidation } from "../common/AMPAuthorization/AMPValidation";
import { AMPToastConsts } from "../common/const/AMPToastConst";
import { useObservableCallback } from "../common/hooks/useObservable";
import { ampJsonAjax } from "../common/utils/ampAjax";
import { AMPErrorAlert } from "../common/AMPAlert";

//On clone  Questionnaire
const cloneQuestionnaireAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.post(URL, params.data).pipe(
        map((xhrResponse) => {
          return { ...xhrResponse.response, params };
        }),
        catchError((error) => {
          console.error("Error in create Questionnaire", error);
          errorHandler(error.response);
          return [];
        })
      )
    )
  ); // ENd of line
export const QuestionnaireCloneModal = (props) => {
  const [ShowErrorMessage, setShowErrorMessage] = useState();
  const onSubmit = (data) => { };
  const validationSchema = useMemo(
    () =>
      yup.object({
        partType: yup.object().required("Required"),
        inspectionType: yup.object().required("Required"),
      }),
    []
  );
  const resolver = AMPValidation(validationSchema);
  const { handleSubmit, reset, watch, control, register, errors } = useForm({
    resolver,
  });

  const {
    partTypeResult,
    inspectionResult,
    params,
    setSelectedQuestionForClone,
    versionNo,
  } = props;

  const closeQuestionnaireModal = () => {
    props.closeQuestionnaireModal();
  };
  /** Its for Clone Questionnaire */
  const cloneQuestionnaire$ = useMemo(() => {
    return cloneQuestionnaireAjax$(
      DEFAULT_BASE_URL + VERSION + CLONE_ALL_QUESTIONNAIRE,
      {
        errorHandler: (error) => {
          toast.error(AMPToastConsts.QUESTIONNAIRE_CLONE_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  /* Observer for clone response from ajax request */
  useObservableCallback(cloneQuestionnaire$, (response) => {
    if (!response?.status) {
      toast.error(response.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      closeQuestionnaireModal();
      toast.success(AMPToastConsts.QUESTIONNAIRE_CLONE_SUCCESS, {
        position: toast.POSITION.TOP_CENTER,
      });
      setSelectedQuestionForClone(response?.params?.newCloneData);
      setShowErrorMessage("");
    }
  });
  const handleSubmitDocument = (formData) => {
    const partType = formData?.partType?.value;
    const inspectionType = parseInt(formData?.inspectionType?.value);
    const newCloneData = formData;
    const clonePartType = parseInt(params?.partType?.value);
    const cloneInspectionType = parseInt(params?.inspectionType?.value);
    const ajaxParams = {
      data: {
        PartTypeId: partType,
        InspectionTypeId: inspectionType,
        ClonePartTypeId: clonePartType,
        CloneInspectionTypeId: cloneInspectionType,
        version: versionNo,
      },
      newCloneData: newCloneData,
    };
    setShowErrorMessage("");
    cloneQuestionnaire$.next(ajaxParams);
  };
  return (
    <>
      <AMPModal
        show
        onHide={closeQuestionnaireModal}
        size="xs"
        backdrop="static"
      >
        <AMPModalHeader>{props.modalName}</AMPModalHeader>

        <form onSubmit={handleSubmit(handleSubmitDocument)}>
          <AMPModalBody
            isScroll
            style={{
              height: 240,
              maxHeight: "calc(100vh)",
            }}
          >
            <AMPFormLayout className="pb-5">
              <AMPFieldWrapper
                colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
                label="Part Type"
                controlId="partType"
                name="partType"
                required="true"
                fieldValidation={errors.partType ? true : false}
              >
                <Controller
                  as={Select}
                  control={control}
                  options={partTypeResult}
                  onChange={([selected]) => {
                    return { value: selected };
                  }}
                />
              </AMPFieldWrapper>

              <AMPFieldWrapper
                colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
                label="Inspection Type"
                controlId="inspectionType"
                name="inspectionType"
                required="true"
                fieldValidation={errors.inspectionType ? true : false}
              >
                <Controller
                  as={Select}
                  control={control}
                  options={inspectionResult}
                  onChange={([selected]) => {
                    return { value: selected };
                  }}
                />
              </AMPFieldWrapper>
            </AMPFormLayout>
          </AMPModalBody>

          <AMPModalFooter>
            <Row>
              <Col lg="6" md="6" sm="12" xs="12">
                <Button type="submit" variant="primary" block>
                  Submit
                </Button>
              </Col>
              <Col lg="6" md="6" sm="12" xs="12">
                <Button
                  type="cancel"
                  variant="secondary"
                  onClick={closeQuestionnaireModal}
                >
                  Cancel
                </Button>
              </Col>
            </Row>
          </AMPModalFooter>
        </form>
      </AMPModal>
    </>
  );
};
