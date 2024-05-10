import React, { forwardRef } from "react";
import { Form } from "react-bootstrap";
import cx from "classnames";

const DEFAULT_PROPS = {
  className: "amp-file-upload form-control form-control-sm",
  size: "sm",
  autoComplete: "off",
  type: "file",
  multiple: "multiple",
};

export const AMPFile = forwardRef(({ required, ...props }, ref) => {
  const _props = { ...DEFAULT_PROPS, className: "", ...props };
  return (
    <>
      <Form.Control
        {..._props}
        className={cx(DEFAULT_PROPS.className, _props.className, {
          "field-mandatory": required,
        })}
        ref={ref}
      />
    </>
  );
});
