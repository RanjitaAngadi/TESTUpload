import React, { forwardRef } from "react";
import cx from "classnames";
import { Form } from "react-bootstrap";
import PropTypes from "prop-types";
import { omit } from "../common/utils/utils";

const DEFAULT_PROPS = {
  className: "amp-textarea",
  maxLength: 250,
};

export const AMPTextArea = forwardRef(
  ({ required, showCounter = true, ...props }, ref) => {
    let _props = { ...DEFAULT_PROPS, className: "", ...props };
    _props = omit(_props, ["defaultValue", "value"]);
    const { maxLength } = _props;
    const value = ("value" in props && props.value) || "" || props.defaultValue;
    const count = (value && value.length) || 0;
    return (
      <>
        <Form.Control
          // {...(("value" in props && { value: props.value || "" }) || {
          //   defaultValue: props.defaultValue,
          // })}

          placeholder="Type Here"
          {..._props}
          className={cx(DEFAULT_PROPS.className, _props.className, {
            "field-mandatory": required,
          })}
          as="textarea"
          ref={ref}
          defaultValue={props.defaultValue}
        />
        {showCounter && (
          <div className="amp-textarea-counter">
            <span>{count}</span>/<span>{maxLength}</span> (Additional characters
            will be truncated)
          </div>
        )}
      </>
    );
  }
);

AMPTextArea.propTypes = {
  maxLength: PropTypes.number,
  showCounter: PropTypes.bool,
};
