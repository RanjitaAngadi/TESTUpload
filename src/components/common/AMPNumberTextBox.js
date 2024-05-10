import React, { forwardRef } from "react";
import { Form } from "react-bootstrap";
import PropTypes from "prop-types";
import cx from "classnames";
import { omit } from "../common/utils/utils";

const DEFAULT_PROPS = {
  className: "amp-number-textbox",
  size: "sm",
  autoComplete: "off",
  type: "number",
  step: 1,
  numberOnly: false,
  required: false,
  readOnly: false,
};

/**
 * @deprecated In favor of AMPNumberTextBox2
 */
export const AMPNumberTextBox = forwardRef((props, ref) => {
  console.warn("AMPNumberTextBox is deprecated in favor of AMPNumberTextBox2!");
  const _props = { ...DEFAULT_PROPS, className: "", ...props };
  const { maxLength, onKeyPress, required } = _props;
  let newProps = omit(_props, ["numberOnly", "required"]);

  const handleKeyPress = (e) => {
    let regEx;
    if (_props.numberOnly) {
      regEx = /[0-9]$/;
    } else {
      regEx = /[0-9.]$/;
    }
    if (
      e.key !== "Enter" &&
      (!regEx.test(e.key) || e.target.value.length + 1 > maxLength)
    ) {
      e.preventDefault();
      return;
    }
    if (onKeyPress) onKeyPress(e);
  };

  return (
    <>
      <Form.Control
        {...newProps}
        className={cx(DEFAULT_PROPS.className, newProps.className, {
          "field-mandatory": required,
        })}
        onKeyPress={handleKeyPress}
        ref={ref}
      />
    </>
  );
});

AMPNumberTextBox.propTypes = {
  maxLength: PropTypes.number,
};
