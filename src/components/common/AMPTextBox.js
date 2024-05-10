import React, { forwardRef } from "react";

import { Form } from "react-bootstrap";
import PropTypes from "prop-types";
import cx from "classnames";
import { omit } from "../common/utils/utils";

const DEFAULT_PROPS = {
  className: "amp-textbox",
  size: "sm",
  type: "text",
  autoComplete: "off",
  required: false,
};

export const AMPTextBox = forwardRef((props, ref) => {
  let { required, ..._props } = props;
  _props = omit(_props, ["defaultValue", "value"]);

  return (
    <>
      <Form.Control
        {...DEFAULT_PROPS}
        // {...(("value" in props && { value: props.value || "" }) || {
        //   defaultValue: props.defaultValue,
        // })}
        {..._props}
        className={cx(DEFAULT_PROPS.className, props.className, {
          "field-mandatory": required,
        })}
        ref={ref}
        disabled={props.disabled}
      />
    </>
  );
});

AMPTextBox.propTypes = {
  maxLength: PropTypes.number,
  type: PropTypes.string,
};
