import cx from "classnames";
import React, { useState, useMemo } from "react";
import { Form } from "react-bootstrap";
import PropTypes from "prop-types";
import { useFormContext, Controller } from "react-hook-form";
import { equals, type as Type, head, keys, values, isEmpty } from "ramda";
import { omit } from "../utils/utils";

const DEFAULT_CLASSNAME = "amp-field-wrapper";

/**
 * @deprecated In favor of AMPFieldWrapper
 */
export const AMPFieldWrapper2 = (props) => {
  console.warn("AMPFieldWrapper2 is deprecated in favor of AMPFieldWrapper!");
  const {
    children: field,
    type = "",
    controlId,
    label = "",
    marginClassName = "mb-0 mt-amp-125",
    //validMessage,
    defaultValue = undefined,
    rules = [],
    name,
    names,
    onChange = ([v]) => v,
    valueName = undefined,
    options = undefined,
    isFormField = true,
    value = undefined,
    alwaysFloat,
  } = props;

  //--------------------------------------
  // form validation logic for controller
  //--------------------------------------
  //const fieldRef = useRef(null);
  const {
    errors: { [name]: { message: errorMessage = undefined } = {} } = {},
    getValues = undefined,
    validationRulesMap,
    control,
  } = useFormContext() || {};
  const _isFormField = (control && isFormField) || false;

  //console.log("validationRulesMap", validationRulesMap);
  /*   // Set focus on Error field to continue typing
  useEffect(() => {
    if (errorMessage) {
      fieldRef &&
        fieldRef.current &&
        fieldRef.current.id === name &&
        fieldRef.current.focus();
    }
  }, [errorMessage]); */

  const _value = (!_isFormField && value) || (getValues && getValues(name));
  const floatLabel = !_isFormField
    ? alwaysFloat || _value
    : type === "range"
    ? _value && [isEmpty(_value.from), isEmpty(_value.to)]
    : _value;

  const [wrapperState, setWrapperState] = useState(
    type === "range"
      ? {
          isFocused: false,
          from: { isFocused: false },
          to: { isFocused: false },
        }
      : {
          isFocused: false,
        }
  );
  const isInvalid = !!errorMessage;
  const required = rules.includes("required") || undefined;
  const validate = rules.reduce((obj, k) => {
    const [rule, args = []] = (equals(Type(k), "Object") && [
      head(keys(k)),
      head(values(k)),
    ]) || [k, undefined];
    return {
      ...obj,
      ...{
        [rule]: (val) =>
          [rule] &&
          validationRulesMap[rule](
            { name, value: getValues && getValues(name), label },
            ...args
          ),
      },
    };
  }, {});
  const controllerProps = useMemo(
    () => ({
      ...(onChange && { onChange }),
      ...((options && { options }) || {}),
      ...((valueName && { valueName }) || {}),
      ...((defaultValue && { defaultValue }) || {}),
      rules: { validate },
      name: props.name,
    }),
    [props]
  );
  let {
    props: { inputGroupClassName },
  } = field;

  let children = undefined;

  if (type === "range") {
    const [fromErrorMessage = "", toErrorMessage = ""] = (errorMessage &&
      errorMessage.split(",")) || [undefined, undefined];
    const rangeErrorComponent = {
      fromError: (
        <Form.Control.Feedback type="amp-field-error invalid">
          {fromErrorMessage}
        </Form.Control.Feedback>
      ),
      toError: (
        <Form.Control.Feedback type="amp-field-error invalid">
          {toErrorMessage}
        </Form.Control.Feedback>
      ),
    };
    const onFocus = [
      () => {
        if (!wrapperState.from.isFocused) {
          setWrapperState({
            ...wrapperState,
            isFocused: true,
            from: { isFocused: true },
          });
          if (field.props.onFocus) {
            if (Array.isArray(field.props.onFocus)) {
              field.props.onFocus[0]();
            } else {
              field.props.onFocus();
            }
          }
        }
      },
      () => {
        if (!wrapperState.to.isFocused) {
          setWrapperState({
            ...wrapperState,
            isFocused: true,
            to: { isFocused: true },
          });
          if (field.props.onFocus) {
            if (Array.isArray(field.props.onFocus)) {
              field.props.onFocus[1]();
            } else {
              field.props.onFocus();
            }
          }
        }
      },
    ];

    const onBlur = [
      () => {
        if (wrapperState.from.isFocused) {
          setWrapperState({
            ...wrapperState,
            isFocused: wrapperState.to.isFocused,
            from: { isFocused: false },
          });
          if (field.props.onBlur) {
            if (Array.isArray(field.props.onBlur)) {
              field.props.onBlur[0]();
            } else {
              field.props.onBlur();
            }
          }
        }
      },
      () => {
        if (wrapperState.to.isFocused) {
          setWrapperState({
            ...wrapperState,
            isFocused: wrapperState.from.isFocused,
            to: { isFocused: false },
          });
          if (field.props.onBlur) {
            if (Array.isArray(field.props.onBlur)) {
              field.props.onBlur[1]();
            } else {
              field.props.onBlur();
            }
          }
        }
      },
    ];
    let field_new = [field].map((child, ind) =>
      React.cloneElement(child, {
        ...((!_isFormField && { onChange, value }) || {}),
        key: ind,
        onFocus,
        onBlur,
        controlId,
        names,
        floatLabel: (floatLabel && [!!floatLabel.from || !!floatLabel.to]) || [
          false,
          false,
        ],
        label,
        wrapperState,
        ...child.props,
        inputGroupClassName: cx(inputGroupClassName, {
          focused: wrapperState.isFocused,
        }),
        rangeErrorComponent,
      })
    );
    children = field_new;
  } else {
    const onFocus = (event) => {
      if (!wrapperState.isFocused) {
        setWrapperState({ isFocused: true });
      }

      if (field.props.onFocus) field.props.onFocus();
    };

    const onBlur = (event) => {
      if (wrapperState.isFocused) {
        setWrapperState({ isFocused: false });
      }

      if (field.props.onBlur) field.props.onBlur();
    };

    let groupProps = {};
    if (type === "group" || type === "autosuggest") {
      groupProps = {
        controlId,
        inputGroupClassName: cx(inputGroupClassName, {
          focused: wrapperState.isFocused,
        }),
      };
    }
    let field_new = [field].map((child, ind) =>
      React.cloneElement(child, {
        ...((!_isFormField && { onChange, value }) || {}),
        //ref: fieldRef,
        key: ind,
        onFocus,
        onBlur,
        ...groupProps,
        ...child.props,
      })
    );
    children = field_new;
  }

  let newProps = omit(props, [
    "floatLabel",
    "label",
    "marginClassName",
    "colProps",
  ]);
  if (type === "range") {
    newProps = omit(newProps, ["controlId", "type", "name"]);

    return (
      <Form.Group
        {...newProps}
        className={cx(
          DEFAULT_CLASSNAME,
          "range-field",
          props.className,
          marginClassName ? marginClassName : "",
          {
            "is-invalid": isInvalid,
          }
        )}
      >
        <div className="position-relative">
          {(_isFormField && (
            <Controller
              as={({
                onChange,
                value = undefined,
                selected = [],
                ...props
              }) => {
                const childProps = {
                  onChange,
                  ...(required && { required }),
                  ...(value && { selected: value }),
                  ...props,
                };
                const element = children.map((child, ind) => {
                  return React.cloneElement(
                    child,
                    { ...childProps, key: ind },
                    child.children
                  );
                });
                return element;
              }}
              {...controllerProps}
            />
          )) ||
            children}
        </div>
      </Form.Group>
    );
  } else {
    return (
      <Form.Group
        {...newProps}
        className={cx(
          DEFAULT_CLASSNAME,
          props.className,
          marginClassName ? marginClassName : "",
          {
            "floating-label-active":
              wrapperState.isFocused || !isEmpty(floatLabel || {}),
            "input-group-field": type === "group" || type === "autosuggest",
            "is-invalid": isInvalid,
          }
        )}
      >
        <div className="position-relative">
          {(_isFormField && (
            <Controller
              as={({
                onChange,
                value = undefined,
                selected = null,
                options = undefined,
                ...props
              }) => {
                const childProps = {
                  onChange,
                  ...(required && { required }),
                  ...((selected && { selected }) ||
                    (type === "autosuggest" && { selected: value }) || {
                      value,
                    }),
                  ...((options && { options }) || {}),
                  ...props,
                };
                const element = children.map((child, ind) => {
                  return React.cloneElement(
                    child,
                    { ...childProps, key: ind },
                    child.children
                  );
                });
                return element;
              }}
              {...controllerProps}
            />
          )) ||
            children}
          {label && <Form.Label key={1}>{label}</Form.Label>}
          <Form.Control.Feedback type="amp-field-error invalid">
            {errorMessage}
          </Form.Control.Feedback>
        </div>
      </Form.Group>
    );
  }
};

AMPFieldWrapper2.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  controlId: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  floatLabel: PropTypes.oneOfType([PropTypes.bool, PropTypes.array]),
  type: PropTypes.oneOf(["group", "default"]),
  selected: PropTypes.array,
  onChange: PropTypes.func,
  marginClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  colProps: PropTypes.object,
};
