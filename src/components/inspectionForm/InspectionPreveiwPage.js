import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import { ampJsonAjax } from "../common/utils/ampAjax";
import AMPFieldSet from "../common/AMPFieldSet";
import AMPLoader from "../common/AMPLoader";

//On SUbmit Final Inspection Questionnaire
const submitFinalInspectionQuestionnaireAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.put(URL).pipe(
        map((xhrResponse) => {
          return xhrResponse;
        }),
        catchError((error) => {
          console.error("Error in update Work Order Form", error);
          errorHandler(error.response);
          return [];
        })
      )
    )
  ); // ENd of line

const InspectionPreveiwPage = (props) => {
  const {
    loader,
    setLoader,
    inspectionDetailId,
    getPreveiwInspectionObs$,
    previewInspectionList,
    type,
  } = props;
  const { register, handleSubmit, watch, errors } = useForm({});

  const onSubmit = (formData) => {

  };

  useEffect(() => {
    if (getPreveiwInspectionObs$) {
      setLoader(true);
      getPreveiwInspectionObs$.next(inspectionDetailId);
    }
  }, [getPreveiwInspectionObs$]);
  return (
    <div>
      <AMPLoader isLoading={loader} />
      <AMPFieldSet title="Preview Section">
        {(type?.id === 10 ||
          type?.id === 11 ||
          type?.id === 14 ||
          type?.id === 16) &&
          previewInspectionList?.some((el) => el.questionAnswer === 2) && (
            <div className="text-red text-center fs-6">
              All the questions should be answered as 'Yes' before submitting
            </div>
          )}
        {previewInspectionList?.map((itm) => {
          return (
            <div>
              {itm?.sequence} {itm?.questionText}:-
              <span className="font-weight-bold text-green">
                {itm?.questionAnswer === 1 ? "Yes" : "No"}
              </span>
            </div>
          );
        })}
      </AMPFieldSet>
    </div>
  );
};
export default InspectionPreveiwPage;
