import React, { forwardRef, memo } from "react";
import { Form } from "react-bootstrap";
import cx from "classnames";
import PropTypes from "prop-types";

const DEFAULT_PROPS_CLASS_NAME = "amp-checkbox";

export const AMPCheckbox = memo(
  forwardRef((props, ref) => {
    return (
      <>
        <Form.Check
          custom
          type={props.type}
          {...props}
          className={cx(DEFAULT_PROPS_CLASS_NAME, props.className)}
          ref={ref}
          //defaultValue={props.defaultValue}
        />
      </>
    );
  })
);
