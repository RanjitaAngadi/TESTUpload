import React from "react";
import { Modal, Col, Container } from "react-bootstrap";
import cx from "classnames";

const AMPModalTitle = ({ children }) => (
  <div className="h5 modal-title">{children}</div>
);
export const AMPModalHeader = ({
  headerActions,
  customHeader = false,
  ...props
}) => {
  return (
    <>
      <Modal.Header
        closeButton
        {...props}
        className={cx("AMPModalHeader", props.className)}
      >
        {(customHeader && customHeader) ||
          (headerActions && (
            <Container fluid className="p-0">
              <div className="d-flex justify-content-between">
                <Col className="p-0">
                  <AMPModalTitle>{props.children}</AMPModalTitle>
                </Col>
                <div>{headerActions}</div>
              </div>
            </Container>
          )) || <AMPModalTitle>{props.children}</AMPModalTitle>}
      </Modal.Header>
    </>
  );
};
