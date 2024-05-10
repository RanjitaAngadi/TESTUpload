import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Form, Row, Col, Button } from "react-bootstrap";
import { AMPAccordion } from "../../common/AMPAccordion";
import AMPFieldSet from "../../common/AMPFieldSet";
import { AMPFormLayout } from "../../common/AMPFormLayout";
import { AMPFieldWrapper } from "../../common/AMPFieldWrapper";
import { AMPTextBox } from "../../common";
import { Link } from "react-router-dom";
import AMPTooltip from "../../common/AMPTooltip";
import Studentlist from "./studentlist";

const Searchstudent = (props) => {
  const { handleSubmit, reset, watch, control, register, setValue, getValues } =
    useForm({});
  const { title, 
          errorMessage, 
          onSearch,
          searchParams, 
          poststudent,
        } = props;

  useEffect(() => {
    const fields = ["stdname", "from", "to"];
    let searchItems;
    if (searchItems) {
      fields?.forEach((field) => {
        setValue(field, searchItems[field]);
      });
        setValue("stdname", searchItems?.stdname);
    }
  }, []);

  
  const onClear = () => {
    reset({
      from: "",
      to: "",
      stdname: "",
    });
  };

  return (
    <>
      <div className="form-container p-0">
        <AMPFieldSet title="Search Student">
          <form className="pt-1" onSubmit={handleSubmit(onSearch)}>
            <AMPAccordion title={title} contentClassName="p-0">
              <Row className="m-2">
                <Col xs={12} md={12} lg={12} sm={12}>
                  <AMPFormLayout className="pb-2">
                 
                    <AMPFieldWrapper
                      colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                      label="From"
                      controlId="dateRange"
                      name="from"
                      // required="true"
                      fieldValidationCustom={errorMessage}
                    >
                      <Form.Control size="sm" type="date" ref={register} />
                    </AMPFieldWrapper>

                    <AMPFieldWrapper
                      colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                      label="To"
                      controlId="dateRange"
                      name="to"
                      // required="true"
                      fieldValidationCustom={errorMessage}
                    >
                      <Form.Control size="sm" type="date" ref={register} />
                    </AMPFieldWrapper>

                    <AMPFieldWrapper
                      colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                      label=" Student Name"
                      controlId="stdname"
                      placeholder="Enter the Name"
                      name="stdname"
                    >
                      <AMPTextBox
                        className="text-uppercase"
                        ref={register}
                        size="sm"
                      />
                    </AMPFieldWrapper>
                    <div colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}>
                      <Row>
                        <Col md={3} sm={3} lg={3} xs={3}>
                          <Button
                            type="button"
                            variant="secondary"
                            className="form-button mb-2"
                            onClick={onClear}
                            block
                          >
                            Clear
                          </Button>
                        </Col>
                        <Col md={9} sm={9} lg={9} xs={9}>
                          <Button
                            type="submit"
                            variant="primary"
                            className="form-button float-right mb-2"
                            block
                          >
                            Search
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  </AMPFormLayout>
                </Col>
              </Row>
            </AMPAccordion>
          </form>
        </AMPFieldSet>
      </div>
    </>
  );
};

export default Searchstudent;
