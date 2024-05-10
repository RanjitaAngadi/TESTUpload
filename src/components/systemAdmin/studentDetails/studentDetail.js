import React, { useEffect, useState, useMemo } from "react";
import { date } from "yup";
import SearchStudent from "./searchStudent";
import AMPTooltip from "../../common/AMPTooltip";
import {
  Link,
  withRouter,
  Redirect,
  useLocation,
  useParams,
} from "react-router-dom";
import AMPFieldSet from "../../common/AMPFieldSet";
import AddStudent from "./AddStudent";
import ManageStudent from "./manageStudent";
import db from "./db.json";
import { AMPAccordion } from "../../common/AMPAccordion";
import { Row, Col, Table, Container } from "react-bootstrap";
import { ConstVariable } from "../../common/const";
import Studentlist from "./studentlist";
import { AMPToastConsts } from "../../common/const/AMPToastConst";
import { DeleteModal } from "../../common/DeleteModal";
import { toast } from "react-toastify";
import { AMPMessage } from "../../common/const/AMPMessage";

const StudentDetail = (props) => {
  const{
    isId,
    formName,

  
  }=props;
  const [errorMessage, setError] = useState("");
  const [searchParams, setSearchParams] = useState();
  const [student, setStudent] = useState(db?.content);
  const { id } = useParams();
  const [showDeleteModal, setShowDeleteModal] = useState();
  
 

  const onSearch = (formData) => {
    console.log("formdata", formData);
    let searchParams = {};
    const from = formData?.from && new Date(formData?.from);
    const to = formData?.to && new Date(formData?.to);

    if ((from && from?.getTime()) > (to && to?.getTime())) {
      setError("To Date must be greater than From Date");
    } else {
      setError("");
      searchParams = {
        startDate: formData?.from ? new Date(formData?.from) : null,
        endDate: formData?.to ? new Date(formData?.to) : null,
        stdname: formData?.stdname,
      };
      setSearchParams(searchParams);
    
    }
  };
  // useEffect(()=>{
  //   if(searchParams){

  //   }
  // },[])

  //Deleteing Receiving
  const onDelete = (id) => {
    setShowDeleteModal(id);
  };

 
  const closeDeleteModal = () => {
    setShowDeleteModal("");
  };
  const onConfirmDelete = (id) => {
    // let cloneStudent = [...student];
    // cloneStudent.splice(idx, 1);
    // setStudent(cloneStudent);
    
    fetch(`http://localhost:5000/content/`+ id, {
      method: "DELETE",
    })
    .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setStudent(data);
        setShowDeleteModal(id);
        toast.success(AMPToastConsts.STUDENT_DELETE_SUCCESS, {
          position: toast.POSITION.TOP_CENTER,
        });
      })
     
      .catchError((error) => {
        toast.error(AMPToastConsts.STUDENT_DELETE_ERROR, {
          position: toast.POSITION.TOP_CENTER,
        });
      })

  };

  const onView =()=>{
    fetch(`http://localhost:5000/content`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("list", data);
        setStudent(data);
      })
      .catch((err) => console.log("error"));
  };

 
  
  return (
    <>
      <div>
        <p>
          <span className="receiving-tag">Student Details</span>
        </p>
       
        <SearchStudent
          title="Search Pump"
          formName={ConstVariable.STUDENT}
          onSearch={onSearch}
          errorMessage={errorMessage}
        />
        <Col>
        <Row>
          <Col md={12} sm={12} xs={12} lg={12}>
          <div className="float-right btn-control-action-icons-group mb-1">
            <Link
              to={{
                pathname: "/Pump/studentDetails/manageStudent",
              }}
            >
              <button
                aria-label="Add"
                name="Add"
                type="button"
                className="amp-button button-mini mt-2 icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                //  onClick={}
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
            </Link>
          </div>
          </Col>
        </Row>
        </Col>
       
        <div className="form-container p-0 mb-4">
          
          {student && student?.length > 0 && searchParams &&(
            <AMPAccordion title="Student List" contentClassName="p-0">
              <Container fluid>
                <div
                  id="results"
                  className="form-container mx-0 bg-form py-2 mb-4"
                >
                  <Table
                    bordered
                    striped
                    hover
                    responsive
                    size="sm"
                    className="ws-nowrap"
                  >
                    <thead className="text-center fn-10">
                      <tr key={student.id}>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="fn-12">
                      {student.map((itm, idx) => {
                        return (
                          <React.Fragment key={idx}>
                            <tr>
                              <td className="text-center">{itm?.stdname}</td>
                              <td className="text-center">{itm?.age}</td>
                              <td className="text-center">{itm?.gender} </td>
                              <td>
                                <>
                                  <Row className="text-center mw-60 m-0 p-0">
                                    <Col
                                      lg="12"
                                      md="12"
                                      sm="6"
                                      xs="6"
                                      className="m-0 p-0"
                                    >
                                      <>
                                        {console.log(itm)}
                                        {itm?.id && (
                                          <Link
                                            to={{
                                              pathname: `/Pump/studentDetails/manageStudent`,
                                              state: {
                                                id: itm?.id,
                                              },
                                            }}
                                          >
                                            <button
                                              aria-label="Edit"
                                              name="Edit"
                                              type="button"
                                              className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 btn btn-amp-monochrome-amp-brand btn-md"
                                              //onClick={()=>handleEdit(itm.id)}
                                            >
                                              <AMPTooltip text="Edit">
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  width="19"
                                                  height="19"
                                                  fill="currentColor"
                                                  viewBox="0 0 16 16"
                                                  className="bi bi-pencil-square"
                                                >
                                                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                  <path
                                                    fill-rule="evenodd"
                                                    d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                                                  />
                                                </svg>
                                              </AMPTooltip>
                                            </button>
                                          </Link>
                                        )}
                                      </>

                                      <button
                                        aria-label="Delete"
                                        name="Delete"
                                        type="button"
                                        className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 btn btn-amp-monochrome-amp-brand btn-md"
                                        onClick={(e) => {
                                          onDelete(itm?.id);
                                        }}
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
                                              fill-rule="evenodd"
                                              d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                                            />
                                          </svg>
                                        </AMPTooltip>
                                      </button>
                                      <Link
                                        key={itm.id}
                                        to={{
                                          pathname: `/Pump/studentDetails/Studentlist`,
                                          state: {
                                            id: itm?.id,
                                          },
                                        }}
                                      >
                                        <button
                                          aria-label="View"
                                          name="View"
                                          type="button"
                                          className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                                          onClick={(e) => {
                                            onView();
                                          }}
                                        >
                                          <AMPTooltip text="View Pickup Entry Form">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              width="21"
                                              height="21"
                                              fill="currentColor"
                                              className="bi bi-eye"
                                              viewBox="0 0 16 16"
                                            >
                                              <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                                              <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                                            </svg>
                                          </AMPTooltip>
                                        </button>
                                      </Link>
                                    </Col>
                                  </Row>
                                </>
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </Container>
            </AMPAccordion>
          )}
        </div>
      </div>
      {showDeleteModal && (
        <DeleteModal
          modalName=""
          confirmationMessage={AMPMessage.DEL_STUDENT_CONFIRM}
          closeModal={closeDeleteModal}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          onConfirmDelete={onConfirmDelete}
        />
      )}
    </>
  );
};

export default StudentDetail;
