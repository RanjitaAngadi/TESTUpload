import React, { useState, useMemo, useEffect } from "react";
import AMPFieldSet from "../../common/AMPFieldSet";
import { AMPFieldWrapper } from "../../common/AMPFieldWrapper";
import { AMPFormLayout } from "../../common/AMPFormLayout";
import { AMPTextBox } from "../../common";
import { useForm, Controller } from "react-hook-form";
import { Form, Row, Col, Button } from "react-bootstrap";
import { AMPNumberTextBox } from "../../common";
import db from "./db.json";
import { date } from "yup";
import * as yup from "yup";
import { AMPValidation } from "../../common/AMPAuthorization/AMPValidation";
import {
  Link,
  withRouter,
  Redirect,
  useLocation,
  useParams,
} from "react-router-dom";
import { toast } from "react-toastify";
import { AMPMessage } from "../../common/const/AMPMessage";
import AMPLoader from "../../common/AMPLoader";
import { AMPToastConsts } from "../../common/const/AMPToastConst";
import { AMPAlert } from "../../common/AMPAlert";

const AddStudent = (props) => {
  const {
    title,
    errorMessage,
    // isId,
  } = props;
  const validationSchema = useMemo(
    () =>
      yup.object({
        to: yup.string().required("Required"),
        from: yup.string().required("Required"),
        stdname: yup.string().required("Required"),
        age: yup.number().positive().required("Required"),
        gender: yup.string().required("Required"),
        isChecked: yup.boolean("check this field"),
        showTextBox1: yup.boolean("select the checkbox"),
        showTextBox2: yup.boolean("select the checkbox"),
        showTextBox3: yup.boolean("select the checkbox"),
        showTextBox4: yup.boolean("select the checkbox"),
        showTextBox5: yup.boolean("select checkbox"),
        physics: yup.number().when("showTextBox1", {
          is: (value) => value && value === 0,
          then: yup.number().min(35).max(100),
        }),
        chemestry: yup.number().when("showTextBox2", {
          is: (value) => value && value === 0,
          then: yup.number().min(35).max(100).notRequired(),
        }),
        maths: yup.number().when("showTextBox3", {
          is: (value) => value && value === 0,
          then: yup.number().min(35).max(100).notRequired(),
        }),
        biology: yup.number().when("showTextBox4", {
          is: (value) => value && value === 0,
          then: yup.number().min(35).max(100).notRequired(),
        }),
        english: yup.number().when("showTextBox5", {
          is: (value) => value && value === 0,
          then: yup.number().min(35).max(100).notRequired(),
        }),
        //physics: yup.number().min(35).max(100).required("Required"),
        //chemestry: yup.number().min(35).max(100).required("Required"),
        // maths: yup.number().min(35).max(100).required("Required"),
        // biology: yup.number().min(35).max(100).required("Required"),
        // english: yup.number().min(35).max(100).required("Required"),
      }),
    []
  );
  const resolver = AMPValidation(validationSchema);
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
    resolver,
  });

  const locationRef = useLocation();
  const isId = locationRef?.state?.id;
  const [student, setStudent] = useState();

  const [showTextBox1, setShowTextBox1] = useState(false);
  const [showTextBox2, setShowTextBox2] = useState(false);
  const [showTextBox3, setShowTextBox3] = useState(false);
  const [showTextBox4, setShowTextBox4] = useState(false);
  const [showTextBox5, setShowTextBox5] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmit, setSubmit] = useState(false);

  const poststudent = (formData) => {
    fetch("http://localhost:5000/content", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (response.ok) {
          toast.success(AMPToastConsts.STUDENT_ADD_SUCCESS, {
            position: toast.POSITION.TOP_CENTER,
          });
        } else {
          toast.error(AMPToastConsts.STUDENT_ADD_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
        response.json();
        // toast.success(AMPToastConsts.STUDENT_ADD_SUCCESS, {
        //   position: toast.POSITION.TOP_CENTER,
        // });
      })
      .then((data) => {
        console.log("PostSucessData:", data);
        setStudent(student);
      })
      .catch((error) => {
        //console.log("Error", error);
        toast.error(AMPToastConsts.STUDENT_ADD_ERROR, {
          position: toast.POSITION.TOP_CENTER,
        });
      });
  };

  const putstudent = (formData) => {
    fetch(`http://localhost:5000/content/${isId}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(formData),
    })
      //.then((res) => res.json())
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error status: ${response.status}`);
        }
        toast.success(AMPToastConsts.STUDENT_UPDATE_SUCCESS, {
          position: toast.POSITION.TOP_CENTER,
        });
        return response.json();
      })
      .then((data) => {
        console.log("UpdateSucessData:", data);
        setStudent(student);
      })
      .catch((error) => {
        //console.log("Error", error);
        //
        toast.error(AMPToastConsts.STUDENT_UPDATE_ERROR, {
          position: toast.POSITION.TOP_CENTER,
        });
      });
  };

  const getStudentBId = () => {
    fetch(`http://localhost:5000/content/${isId}`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("getbyid", data);
        const fields = ["from", "to", "stdname", "age", "gender"];
        const content = {
          from: data.from,
          to: data.to,
          stdname: data.stdname,
          age: data.age,
          gender: data.gender,
        };
        fields.forEach((field) => setValue(field, content[field]));
        // setValue("from", data.from);
        // setValue("to", data.to);
        // setValue("stdname", data.stdname);
        // setValue("age", data.age);
        // setValue("gender", data.gender);
        setValue("physics", data.physics);
        setValue("chemestry", data.chemestry);
        if (data.physics) {
          setIsChecked(true);
          setShowTextBox1(true);
          setValue("physics", data.physics);
        }

        if (data.chemestry) {
          setShowTextBox2(true);
          setIsChecked(true);
          setValue("chemestry", data.chemestry);
        }
        setValue("maths", data.maths);
        if (data.maths) {
          setShowTextBox3(true);
          setIsChecked(true);
          setValue("maths", data.maths);
        }
        setValue("biology", data.biology);
        if (data.biology) {
          setShowTextBox4(true);
          setIsChecked(true);
          setValue("biology", data.biology);
        }
        setValue("english", data.english);
        if (data.english) {
          setShowTextBox5(true);
          setIsChecked(true);
          setValue("english", data.english);
        }
      })
      .catch(
        (error) => console.log("error in getby id")
        // toast.error(response?.message, {
        //   position: toast.POSITION.TOP_CENTER,
        // })
      );
  };
  useEffect(() => {
    if (isId) {
      getStudentBId();
    }
  }, []);

  const onSubmit = (formData) => {
    console.log("submit-formdata", formData);
    // var isValid = true;
    // if (
    //   [
    //     formData.physics,
    //     formData.chemestry,
    //     formData.maths,
    //     formData.biology,
    //     formData.english,
    //   ].includes(0, "0", null)
    // ) {
    //   isValid = false;
    // }
    // if (isValid) {
    //   if (isId) {
    //     setSubmit(true);
    //     putstudent(formData);
    //   } else {
    //     setSubmit(true);
    //     poststudent(formData);
    //   }
    // } else {
    //   AMPAlert(
    //     toast.error(AMPToastConsts.STUDENT_ADD_ERROR, {
    //       position: toast.POSITION.TOP_CENTER,
    //     })
    //   );
    // }
    var isValid = true;
    if (
      (formData.physics === 0 )||
      (formData.chemestry === 0) ||
      (formData.maths === 0) ||
      (formData.biology === 0 )||
      (formData.english === 0)
      && isValid
    ) {
      AMPAlert(
        toast.error(AMPToastConsts.STUDENT_ADD_ERROR, {
          position: toast.POSITION.TOP_CENTER,
        })
      );
    } else {
      isValid = false;
      if (isId) {
        setSubmit(true);
        putstudent(formData);
      } else {
        setSubmit(true);
        poststudent(formData);
      }
    }
  };

  return (
    <>
      <div className="mx-2">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Row>
            <Col>
              <AMPFieldSet title="Student Information">
                {/* <AMPLoader isLoading={loader} /> */}
                <AMPFormLayout>
                  <AMPFieldWrapper
                    colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                    label="From"
                    controlId="dateRange"
                    name="from"
                    fieldValidation={errors.from ? true : false}
                  >
                    <Form.Control size="sm" type="date" ref={register} />
                  </AMPFieldWrapper>

                  <AMPFieldWrapper
                    colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                    label="To"
                    controlId="dateRange"
                    name="to"
                    fieldValidation={errors.to ? true : false}
                  >
                    <Form.Control size="sm" type="date" ref={register} />
                  </AMPFieldWrapper>

                  <AMPFieldWrapper
                    colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                    label="Student Name"
                    controlId="stdname"
                    name="stdname"
                    placeholder="Enter student Name"
                    fieldValidation={errors.stdname ? true : false}
                  >
                    <AMPTextBox style={{ height: "36px" }} ref={register} />
                  </AMPFieldWrapper>

                  <AMPFieldWrapper
                    colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                    label="Age"
                    controlId="age"
                    name="age"
                    fieldValidation={errors.age ? true : false}
                  >
                    <AMPNumberTextBox ref={register} defaultValue="0" />
                  </AMPFieldWrapper>

                  <AMPFieldWrapper
                    colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                    label="Gender"
                    controlId="gender"
                    name="gender"
                    fieldValidation={errors.gender ? true : false}
                  >
                    <AMPTextBox ref={register} size="sm" type="text" />
                  </AMPFieldWrapper>

                  <div colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}>
                    <Form.Label className="form-label mt-3 mb-0">
                      Subject
                    </Form.Label>

                    <Col lg={12} md={6} xs={12} sm={12}>
                      <Row>
                        <Col lg={6} md={6} xs={12} sm={12}>
                          <Form.Label className="form-label mt-0 ml-1 ">
                            <input
                              type="checkbox"
                              name="physics"
                              controlId="physics"
                              //checked={isChecked}
                              ref={register}
                              style={{ padding: 2, margin: 4 }}
                              onChange={() => {
                                setShowTextBox1(!showTextBox1);
                                setIsChecked(isChecked);
                              }}
                            />
                            Physics
                          </Form.Label>
                          {showTextBox1 ? (
                            <AMPFieldWrapper
                              colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                              //label="physics"
                              controlId="physics"
                              name="physics"
                              placeholder="Enter the Number"
                              fieldValidation={errors.physics ? true : false}
                            >
                              <AMPNumberTextBox
                                style={{ height: "36px", width: "100%" }}
                                ref={register}
                                defaultValue="0"
                              />
                            </AMPFieldWrapper>
                          ) : (
                            <></>
                          )}
                        </Col>

                        <Col lg={6} md={6} xs={12} sm={12}>
                          <Form.Label className="form-label mt-0 ml-1 ">
                            <input
                              type="checkbox"
                              name="chemestry"
                              controlId="chemestry"
                              //checked={isChecked}
                              ref={register}
                              style={{ padding: 2, margin: 4 }}
                              onChange={() => {
                                setShowTextBox2(!showTextBox2);
                                setIsChecked(isChecked);
                              }}
                            />
                            Chemestry
                          </Form.Label>
                          {showTextBox2 ? (
                            <AMPFieldWrapper
                              colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                              // label="chemestry"
                              controlId="chemestry"
                              name="chemestry"
                              placeholder="Enter the Number"
                              fieldValidation={errors.chemestry ? true : false}
                            >
                              <AMPNumberTextBox
                                style={{ height: "36px", width: "100%" }}
                                ref={register}
                                defaultValue="0"
                              />
                            </AMPFieldWrapper>
                          ) : (
                            <></>
                          )}
                        </Col>
                        <Col lg={6} md={6} xs={12} sm={12}>
                          <Form.Label className="form-label mt-0 ml-1 ">
                            <input
                              type="checkbox"
                              name="maths"
                              controlId="maths"
                              // checked={isChecked}
                              ref={register}
                              style={{ padding: 2, margin: 4 }}
                              onChange={() => {
                                setShowTextBox3(!showTextBox3);
                                setIsChecked(isChecked);
                              }}
                            />
                            Maths
                          </Form.Label>
                          {showTextBox3 ? (
                            <AMPFieldWrapper
                              colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                              //label="maths"
                              controlId="maths"
                              name="maths"
                              placeholder="Enter the Number"
                              fieldValidation={errors.maths ? true : false}
                            >
                              <AMPNumberTextBox
                                style={{ height: "36px", width: "100%" }}
                                ref={register}
                                defaultValue="0"
                              />
                            </AMPFieldWrapper>
                          ) : (
                            <></>
                          )}
                        </Col>
                        <Col lg={6} md={6} xs={12} sm={12}>
                          <Form.Label className="form-label mt-0 ml-1 ">
                            <input
                              type="checkbox"
                              name="biology"
                              controlId="biology"
                              //checked={isChecked}
                              ref={register}
                              style={{ padding: 2, margin: 4 }}
                              onChange={() => {
                                setShowTextBox4(!showTextBox4);
                                setIsChecked(isChecked);
                              }}
                            />
                            Biology
                          </Form.Label>
                          {showTextBox4 ? (
                            <AMPFieldWrapper
                              colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                              //label="biology"
                              controlId="biology"
                              name="biology"
                              placeholder="Enter the Number"
                              fieldValidation={errors.biology ? true : false}
                            >
                              <AMPNumberTextBox
                                style={{ height: "36px", width: "100%" }}
                                ref={register}
                                defaultValue="0"
                              />
                            </AMPFieldWrapper>
                          ) : (
                            <></>
                          )}
                        </Col>
                        <Col lg={6} md={6} xs={12} sm={12}>
                          <Form.Label className="form-label mt-0 ml-1 ">
                            <input
                              type="checkbox"
                              name="english"
                              controlId="english"
                              //checked={isChecked}
                              ref={register}
                              style={{ padding: 2, margin: 4 }}
                              onChange={() => {
                                setShowTextBox5(!showTextBox5);
                                setIsChecked(isChecked);
                              }}
                            />
                            English
                          </Form.Label>
                          {showTextBox5 ? (
                            <AMPFieldWrapper
                              colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                              //label="english"
                              controlId="english"
                              name="english"
                              placeholder="Enter the Number"
                              fieldValidation={errors.english ? true : false}
                            >
                              <AMPNumberTextBox
                                style={{ height: "36px", width: "100%" }}
                                ref={register}
                                defaultValue="0"
                              />
                            </AMPFieldWrapper>
                          ) : (
                            <></>
                          )}
                        </Col>
                      </Row>
                    </Col>
                  </div>
                </AMPFormLayout>
              </AMPFieldSet>
              <Row>
                <Col className="text-right my-2">
                  {isId ? (
                    <Button type="submit" variant="secondary" className="px-5">
                      Update
                    </Button>
                  ) : (
                    <Button type="submit" variant="secondary" className="px-5">
                      Submit
                    </Button>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
        </form>
      </div>
    </>
  );
};

export default AddStudent;
