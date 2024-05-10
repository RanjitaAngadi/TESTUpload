import React, { useEffect, useState, useMemo } from "react";
import {
  Form,
  Row,
  Col,
  Button,
  Table,
  Header,
  Container,
} from "react-bootstrap";
import { AMPFieldWrapper } from "./AMPFieldWrapper";
import { useForm, Controller } from "react-hook-form";
import Select, { components } from "react-select";
import AMPTooltip from "./AMPTooltip";

const TableIcon = ({
  addNewFields,
  cloneQuestionnaire,
  selectedQuestionResult,
  onDragAndDrop,
  sequenceResult,
  questionByPartAndInspectionObs$,
  versionListAjaxObs$,
  versionResult,
  setLoader,
  setShowLoading,
  setVersionNo,
  versionNo,
  activateStatus,
  setShowNewForm,
  maximumVersion,
  isMaxVersionActivated,
}) => {
  // const addNewFields = () => {
  //   props.addNewFields();
  // };
  const {
    handleSubmit,
    reset,
    watch,
    control,
    errors,
    setValue,
    register,
    getValues,
  } = useForm({});
  const selectedVersion = watch("version");
  // useEffect(() => {
  //   versionListAjaxObs$.next({
  //     partType: selectedQuestionResult?.params?.partType?.value,
  //     inspectionType:
  //       selectedQuestionResult?.params?.inspectionType?.value || null,
  //   });
  // }, [versionNo]);

  useEffect(() => {
    if (selectedQuestionResult?.content && versionResult) {
      //setValue("version", versionResult[versionResult?.length - 1]);
      setValue("version", {
        label: selectedQuestionResult?.content[0]?.version,
        value: selectedQuestionResult?.content[0]?.version,
      });
    }
    if (!selectedQuestionResult?.content) {
      setValue("version", 0);
    }
  }, [versionResult]);
  useEffect(() => {
    if (selectedVersion?.value) {
      setShowNewForm(false);
      setVersionNo(selectedVersion?.value);
      setShowLoading(true);
      questionByPartAndInspectionObs$.next({
        partType: selectedQuestionResult?.params?.partType,
        inspectionType: selectedQuestionResult?.params?.inspectionType || null,
        version: selectedVersion?.value,
      });

      // setLoader("Searching ...");
    }
  }, [selectedVersion?.value]);
  const colourStyles = {
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        backgroundColor: isFocused ? "#999999" : null,
        color: data?.color ? "blue" : null,
        fontWeight: data?.color ? 600 : null,
      };
    },
  };
  const { Option } = components;
  const IconOption = (props) => (
    <Option {...props}>
      {props.data.label}
      <i className={props?.data?.color ? `fa fa-check fa-fw` : ""}></i>
    </Option>
  );
  return (
    <Col>
      <Row>
        <Col md={12} sm={12} xs={12} lg={12}>
          <form>
            <div className="amp-action-btn-controls">
              <div className="float-left btn-control-action-icons-group">
                <AMPFieldWrapper
                  colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                  label="Version"
                  controlId="version"
                  name="version"
                >
                  <Controller
                    as={Select}
                    id="version"
                    placeholder=""
                    control={control}
                    options={versionResult}
                    onChange={([selected]) => {
                      return { value: selected };
                    }}
                    styles={colourStyles}
                    components={{ Option: IconOption }}
                  />
                </AMPFieldWrapper>
              </div>
              <div className="float-right btn-control-action-icons-group pt-5">
                {sequenceResult.length > 0 && (
                  <Button
                    aria-label="dragAndDrop"
                    variant="secondary"
                    className="m-2"
                    onClick={onDragAndDrop}
                  >
                    Update Sequence Order
                  </Button>
                )}
                {selectedQuestionResult?.content &&
                  selectedQuestionResult?.content[0]?.questionResponses
                    ?.length > 0 && (
                    <button
                      aria-label="Clone"
                      name="Clone"
                      type="button"
                      className="amp-button button-mini mt-2 icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                      onClick={cloneQuestionnaire}
                    >
                      <AMPTooltip text="Clone">
                        <svg
                          aria-hidden="true"
                          focusable="false"
                          data-prefix="far"
                          data-icon="clone"
                          className="svg-inline--fa fa-clone fa-w-16 "
                          role="img"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                        >
                          <path
                            fill="rgb(11, 26, 88)"
                            d="M464 0H144c-26.51 0-48 21.49-48 48v48H48c-26.51 0-48 21.49-48 48v320c0 26.51 21.49 48 48 48h320c26.51 0 48-21.49 48-48v-48h48c26.51 0 48-21.49 48-48V48c0-26.51-21.49-48-48-48zM362 464H54a6 6 0 0 1-6-6V150a6 6 0 0 1 6-6h42v224c0 26.51 21.49 48 48 48h224v42a6 6 0 0 1-6 6zm96-96H150a6 6 0 0 1-6-6V54a6 6 0 0 1 6-6h308a6 6 0 0 1 6 6v308a6 6 0 0 1-6 6z"
                          ></path>
                        </svg>
                      </AMPTooltip>
                    </button>
                  )}

                {(versionNo == 0 ||
                  versionNo > maximumVersion ||
                  (!activateStatus &&
                    isMaxVersionActivated?.isMaxVersion &&
                    !isMaxVersionActivated?.isQuestionnaireLinkedWithInspection)) && (
                  <button
                    aria-label="Add"
                    name="Add"
                    type="button"
                    className="amp-button button-mini mt-2 icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                    onClick={addNewFields}
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
                )}

                {/* <button
                aria-label="Delete"
                name="Delete"
                type="button"
                className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
              >
                <AMPTooltip text="Delete">
                  <svg
                    fill="rgb(11, 26, 88)"
                    viewBox="0 0 340 427.00131"
                    xmlns="http://www.w3.org/2000/svg"
                    className="svg-inline--fa amp-svg-icon amp-svg-delete fa-w-13 amp-icon"
                  >
                    <path d="m232.398438 154.703125c-5.523438 0-10 4.476563-10 10v189c0 5.519531 4.476562 10 10 10 5.523437 0 10-4.480469 10-10v-189c0-5.523437-4.476563-10-10-10zm0 0"></path>
                    <path d="m114.398438 154.703125c-5.523438 0-10 4.476563-10 10v189c0 5.519531 4.476562 10 10 10 5.523437 0 10-4.480469 10-10v-189c0-5.523437-4.476563-10-10-10zm0 0"></path>
                    <path d="m28.398438 127.121094v246.378906c0 14.5625 5.339843 28.238281 14.667968 38.050781 9.285156 9.839844 22.207032 15.425781 35.730469 15.449219h189.203125c13.527344-.023438 26.449219-5.609375 35.730469-15.449219 9.328125-9.8125 14.667969-23.488281 14.667969-38.050781v-246.378906c18.542968-4.921875 30.558593-22.835938 28.078124-41.863282-2.484374-19.023437-18.691406-33.253906-37.878906-33.257812h-51.199218v-12.5c.058593-10.511719-4.097657-20.605469-11.539063-28.03125-7.441406-7.421875-17.550781-11.5546875-28.0625-11.46875h-88.796875c-10.511719-.0859375-20.621094 4.046875-28.0625 11.46875-7.441406 7.425781-11.597656 17.519531-11.539062 28.03125v12.5h-51.199219c-19.1875.003906-35.394531 14.234375-37.878907 33.257812-2.480468 19.027344 9.535157 36.941407 28.078126 41.863282zm239.601562 279.878906h-189.203125c-17.097656 0-30.398437-14.6875-30.398437-33.5v-245.5h250v245.5c0 18.8125-13.300782 33.5-30.398438 33.5zm-158.601562-367.5c-.066407-5.207031 1.980468-10.21875 5.675781-13.894531 3.691406-3.675781 8.714843-5.695313 13.925781-5.605469h88.796875c5.210937-.089844 10.234375 1.929688 13.925781 5.605469 3.695313 3.671875 5.742188 8.6875 5.675782 13.894531v12.5h-128zm-71.199219 32.5h270.398437c9.941406 0 18 8.058594 18 18s-8.058594 18-18 18h-270.398437c-9.941407 0-18-8.058594-18-18s8.058593-18 18-18zm0 0"></path>
                    <path d="m173.398438 154.703125c-5.523438 0-10 4.476563-10 10v189c0 5.519531 4.476562 10 10 10 5.523437 0 10-4.480469 10-10v-189c0-5.523437-4.476563-10-10-10zm0 0"></path>
                  </svg>
                </AMPTooltip>
              </button> */}
              </div>
            </div>
          </form>{" "}
        </Col>
      </Row>
    </Col>
  );
};
export default TableIcon;
