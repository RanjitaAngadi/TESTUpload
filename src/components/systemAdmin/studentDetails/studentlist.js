import React, { useState, useEffect } from "react";
import AMPTooltip from "../../common/AMPTooltip";
import {
  Link,
  withRouter,
  Redirect,
  useLocation,
  useParams,
} from "react-router-dom";
import { date } from "yup";
import AMPFieldSet from "../../common/AMPFieldSet";
import db from "./db.json";
import { Row, Col, Table, Container } from "react-bootstrap";

export default function Studentlist(props) {
  const { isId } = props;
  const [student, setStudent] = useState(db?.content);
  
  const getStudentById = () => {
    
    let res =fetch(`http://localhost:5000/content/${isId}`, {
      method: "GET",
    })
      .then((res) => {
        console.log("response",res);
        res.json()
        
      })
      .then((data) => {
        console.log("listdata", data);
        setStudent(data);
        // setValue("from",data.from);
        // setValue("to",data.to);
        // setValue("stdname",data.stdname);
        // setValue("age",data.age);
        // setValue("gender",data.gender);
        // setValue("physics",data.physics);
        // setValue("chemestry",data.chemestry);
        // setValue("maths",data.maths);
        // setValue("biology",data.biology);
        // setValue("english",data.english);
      })
      .catch((err) => console.log("error"));
  };

  useEffect(() => {
    if(isId){
    getStudentById();}
  }, []);
  return (
    <div className="form-container p-0 mb-4">
      <AMPFieldSet
        fieldBgColor="bg_lightGrey pl-0 pr-0 pt-0"
        title="Student List"
      >
        <div className="container py-4">
          <Link className="btn btn-primary" to="/Pump/studentDetails">
            back
          </Link>

          <Container fluid>
            <div id="results" className="form-container mx-0 bg-form py-2 mb-4">
              <Table
                bordered
                striped
                hover
                responsive
                size="sm"
                className="ws-nowrap"
              >
                <thead className="text-center fn-10">
                  <tr key={isId}>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                  </tr>
                </thead>
                <tbody className="fn-12">
                  {student.map((itm, idx) => {
                       return (
                      <React.Fragment key={idx}>
                        <tr>
                          <td>{itm?.stdname}</td>
                          <td>{itm?.age}</td>
                          <td>{itm?.gender} </td>
                        </tr>
                      </React.Fragment>
                     ); 
                  } )} 
                </tbody>
              </Table>
            </div>
          </Container>
        </div>
      </AMPFieldSet>
    </div>
  );
}
