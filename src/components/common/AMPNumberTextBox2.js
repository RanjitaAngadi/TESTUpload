import React, { forwardRef, useMemo } from "react";
import { Form } from "react-bootstrap";
import cx from "classnames";
import { omit } from "../common/utils/utils";
import { useCombinedRefs } from "../common/utils/useCombinedRefs";

const DEFAULT_PROPS = {
  className: "amp-number-textbox",
  size: "sm",
  autoComplete: "off",
  type: "text",
  //step: 0.01,
  min: 0, //to avoid negative
  allowLeadingZero: false,
};

function getSelectionStart(o) {
  if (o.createTextRange) {
    var r = document.selection.createRange().duplicate();
    r.moveEnd("character", o.value.length);
    if (r.text == "") return o.value.length;
    return o.value.lastIndexOf(r.text);
  } else return o.selectionStart;
}

const getValueString = (orgStr, key, caratPos, end) => {
  if (caratPos === 0 && orgStr.length === end) {
    return key;
  } else
    return [orgStr.slice(0, caratPos), key, orgStr.slice(caratPos)].join("");
};

const getRegEx = (decimal, min, allowLeadingZero) => {
  const negative = min < 0;
  const regex = new RegExp(
    `^${(negative && "\\-?") || ""}${
      (allowLeadingZero && "(0+)?(\\d+)?") ||
      (decimal && decimal > 0 && "(\\d+)?(\\.)?(\\d{1," + decimal + "})?") ||
      "(\\d+)?"
    }$`
  );
  return regex;
};

const zeroRegex = /^\-?0([0-9])+$/;

export const AMPNumberTextBox2 = forwardRef((props, ref) => {
  const combinedRef = useCombinedRefs(ref);

  let { required, decimal, step, allowLeadingZero, onKeyPress, ..._props } = {
    ...DEFAULT_PROPS,
    className: "",
    ...props,
  };
  const { max, min } = _props;

  _props = omit(_props, ["defaultValue", "value"]);

  const regEx = useMemo(() => {
    return getRegEx(decimal, min, allowLeadingZero);
  }, [decimal, min, allowLeadingZero]);

  const _onKeyPress = (e) => {
    const _value = combinedRef.current.value;
    const caratPos = getSelectionStart(e.currentTarget);
    const selectionEnd = e.currentTarget.selectionEnd;

    if (e.key !== "Enter") {
      const _newValue = getValueString(_value, e.key, caratPos, selectionEnd);

      //const _newValue = `${_value}${e.key}`;
      const floatVal = parseFloat(_newValue);
      if ((!allowLeadingZero || decimal) && zeroRegex.test(_newValue)) {
        e.preventDefault();
        return;
      }
      if (!decimal && floatVal === 0 && /\-/.test(_newValue)) {
        e.preventDefault();
        return;
      }
      if (
        !regEx.test(_newValue) ||
        (max && floatVal > max) ||
        (min && floatVal < min)
      ) {
        e.preventDefault();
        return;
      }
    }
    onKeyPress && onKeyPress(e);
  };

  return (
    <Form.Control
      {...{ className: "" }}
      {...(("value" in props && { value: props.value }) || {
        defaultValue: props.defaultValue,
      })}
      {..._props}
      className={cx(DEFAULT_PROPS.className, props.className, {
        "field-mandatory": required,
      })}
      onKeyPress={_onKeyPress}
      ref={combinedRef}
      size={props?.size}
    />
  );
});
