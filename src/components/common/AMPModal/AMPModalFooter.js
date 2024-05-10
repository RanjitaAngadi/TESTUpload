import React from "react";
import { Modal, Container, Row, Col } from "react-bootstrap";
import cx from "classnames";
// import { AMPErrorAlert } from "../AMPAlert";

export const AMPModalFooter = (props) => {
  return (
    <>
      <Modal.Footer
        {...props}
        className={cx("AMPModalFooter", props.className)}
      >
        {props.children}
      </Modal.Footer>
    </>
  );
};

export const AMPModalAlertFooter = ({
  message,
  // as: Alert = AMPErrorAlert,
  children,
  errorColProps = { xs: 9 },
}) => {
  return (
    <Container fluid className="p-0">
      <Row>
        <Col {...errorColProps}>
          <Alert
            className="pt-0 pl-0 mt-2"
            contentJustifyClassName="justify-content-start"
            show={!!message}
          >
            {message}
          </Alert>
        </Col>
        {children}
      </Row>
    </Container>
  );
};
