import React from "react";
import Modal from "react-bootstrap/Modal";
import cx from "classnames";
import { AMPModalBody } from "./AMPModalBody";
import { AMPModalHeader } from "./AMPModalHeader";
import { AMPModalFooter, AMPModalAlertFooter } from "./AMPModalFooter";

export const AMPModal = (props) => {
  const _props = { backdrop: "static", ...props };
  return (
    <>
      <Modal
        {..._props}
        dialogClassName={cx("AMPModalDialog", props.dialogClassName)}
        className={cx("AMPModal", props.className)}
      >
        {props.children}
      </Modal>
    </>
  );
};

export { AMPModalHeader, AMPModalBody, AMPModalFooter, AMPModalAlertFooter };
