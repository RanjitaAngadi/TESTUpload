import React, { forwardRef } from "react";
import { FormCheck } from "react-bootstrap";
import cx from "classnames";
import PropTypes from "prop-types";

const DEFAULT_PROPS_CLASS_NAME = "amp-radio";

export const AMPRadioButton = forwardRef((props, ref) => {
  return (
    <>
      <FormCheck
        custom
        type="radio"
        label=""
        {...props}
        className={cx(DEFAULT_PROPS_CLASS_NAME, props.className)}
        ref={ref}
      />
    </>
  );
});
