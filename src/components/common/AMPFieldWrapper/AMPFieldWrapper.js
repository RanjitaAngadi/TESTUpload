import cx from "classnames";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Form } from "react-bootstrap";
import PropTypes from "prop-types";
import { useFormContext } from "react-hook-form";
import { isEmpty } from "ramda";
import { RangeFieldController, FieldController } from "./FieldController";
import { isEmptyOrNull, lodashUtils } from "../utils/utils";
import { AMPErrorAlert } from "../AMPAlert";

const rangeFields = ["numberRange", "range"];

const selectedValueFields = [
  "range",
  "autosuggest",
  "datepicker",
  "timepicker",
  "dropdown",
];
const DEFAULT_CLASSNAME = "amp-field-wrapper";

const RangeFieldWrapper = React.memo((props) => {
  const {
    children: field,
    className,
    marginClassName,
    controlId,
    label,
    type,
    value,
    selected,
    required,
    errorMessage = {},
    isInvalid,
    onChange,
    alwaysFloat,
    defaultValue,
    name,
    rules,
    ..._props
  } = props;

  const [wrapperState, setWrapperState] = useState({
    isFocused: false,
    from: {
      isFocused: false,
      errorMessage: errorMessage.from,
    },
    to: { isFocused: false, errorMessage: errorMessage.to },
  });

  //Required for Error Animation
  useEffect(() => {
    let _state = { ...wrapperState };
    if (!!errorMessage.common) {
      _state = {
        ..._state,
        to: { ...wrapperState.to, errorMessage: undefined },
        from: { ...wrapperState.from, errorMessage: undefined },
      };
      if (!lodashUtils.isEqual(wrapperState, _state)) setWrapperState(_state);
    } else {
      if (
        !!errorMessage.from &&
        errorMessage.from !== wrapperState.from.errorMessage
      ) {
        _state = {
          ..._state,
          from: { ...wrapperState.from, errorMessage: errorMessage.from },
        };
        if (!lodashUtils.isEqual(wrapperState, _state)) setWrapperState(_state);
      }

      if (
        !!errorMessage.to &&
        errorMessage.to !== wrapperState.to.errorMessage
      ) {
        _state = {
          ..._state,
          to: { ...wrapperState.to, errorMessage: errorMessage.to },
        };
        if (!lodashUtils.isEqual(wrapperState, _state)) setWrapperState(_state);
      }
    }
  }, [setWrapperState, wrapperState, errorMessage]);

  const _value = selected || value || {};

  const _alwaysFloat = alwaysFloat || [
    !isEmptyOrNull(_value.from),
    !isEmptyOrNull(_value.to),
  ];

  const onFocus = useCallback(
    [
      () => {
        if (!wrapperState.from.isFocused) {
          setWrapperState({
            ...wrapperState,
            isFocused: true,
            from: { ...wrapperState.form, isFocused: true },
          });
        }
        if (field.props.onFocus) {
          if (Array.isArray(field.props.onFocus)) {
            field.props.onFocus[0]();
          } else {
            field.props.onFocus();
          }
        }
      },
      () => {
        if (!wrapperState.to.isFocused) {
          setWrapperState({
            ...wrapperState,
            isFocused: true,
            to: { ...wrapperState.to, isFocused: true },
          });
        }
        if (field.props.onFocus) {
          if (Array.isArray(field.props.onFocus)) {
            field.props.onFocus[1]();
          } else {
            field.props.onFocus();
          }
        }
      },
    ],
    [field, wrapperState, setWrapperState]
  );

  const onBlur = useCallback(
    [
      (e) => {
        if (wrapperState.from.isFocused) {
          setWrapperState({
            ...wrapperState,
            isFocused: wrapperState.to.isFocused,
            from: { ...wrapperState.form, isFocused: false },
          });
        }
        if (field.props.onBlur) {
          if (Array.isArray(field.props.onBlur)) {
            field.props.onBlur[0](e);
          } else {
            field.props.onBlur(e);
          }
        }
      },
      (e) => {
        if (wrapperState.to.isFocused) {
          setWrapperState({
            ...wrapperState,
            isFocused: wrapperState.from.isFocused,
            to: { ...wrapperState.to, isFocused: false },
          });
        }
        if (field.props.onBlur) {
          if (Array.isArray(field.props.onBlur)) {
            field.props.onBlur[1](e);
          } else {
            field.props.onBlur(e);
          }
        }
      },
    ],

    [field, wrapperState, setWrapperState]
  );

  const onCalendarClose = useCallback(
    [
      (e) => {
        if (wrapperState.from.isFocused) {
          setWrapperState({
            ...wrapperState,
            isFocused: wrapperState.to.isFocused,
            from: { ...wrapperState.form, isFocused: false },
          });
        }
        if (field.props.onCalendarClose) {
          if (Array.isArray(field.props.onCalendarClose)) {
            field.props.onCalendarClose[0](e);
          } else {
            field.props.onCalendarClose(e);
          }
        }
      },
      (e) => {
        if (wrapperState.to.isFocused) {
          setWrapperState({
            ...wrapperState,
            isFocused: wrapperState.from.isFocused,
            to: { ...wrapperState.to, isFocused: false },
          });
        }
        if (field.props.onCalendarClose) {
          if (Array.isArray(field.props.onCalendarClose)) {
            field.props.onCalendarClose[1](e);
          } else {
            field.props.onCalendarClose(e);
          }
        }
      },
    ],

    [field, wrapperState, setWrapperState]
  );

  let field_new;
  if (field) {
    let {
      props: { inputGroupClassName },
    } = field;

    field_new = [field].map((child, idx) =>
      React.cloneElement(child, {
        ..._props,
        ...child.props,
        key: idx,
        onFocus,
        onBlur,
        ...(type === "range" && {
          onCalendarClose,
        }),
        controlId,
        required,
        alwaysFloat: _alwaysFloat,
        isInvalid,
        label,
        wrapperState,
        ...((selected && { selected }) || { value }),
        ...(onChange && { onChange }),
        inputGroupClassName: cx(inputGroupClassName, {
          focused: wrapperState.isFocused,
        }),
      })
    );
  }
  const children = field_new;

  return (
    <>
      <Form.Group
        className={cx(
          DEFAULT_CLASSNAME,
          "range-field",
          props.className,
          marginClassName ? marginClassName : ""
          /* {
            "is-invalid": isInvalid,
          } */
        )}
        {..._props}
      >
        <div className="amp-position-relative">
          {children}
          {
            <div className={`${(!!errorMessage.common && "is-invalid") || ""}`}>
              <Form.Control.Feedback type="d-flex justify-content-center amp-field-error invalid">
                {errorMessage.common}
              </Form.Control.Feedback>
            </div>
          }
        </div>
      </Form.Group>
    </>
  );
});

const RegularFieldWrapper = React.memo((props) => {
  const {
    children: field,
    className,
    marginClassName,
    controlId,
    label,
    type,
    isGroup = false,
    value,
    selected,
    required,
    errorMessage,
    isInvalid,
    onChange,
    alwaysFloat,
    defaultValue,
    name,
    rules,
    options,
    labelClassName,
    fieldValidation,
    fieldValidationCustom,
    ..._props
  } = props;

  const [wrapperState, setWrapperState] = useState({
    isFocused: false,
    errorMessage: errorMessage,
  });

  //Required for Error Animation
  useEffect(() => {
    if (!!errorMessage && errorMessage !== wrapperState.errorMessage)
      setWrapperState({ ...wrapperState, errorMessage });
  }, [setWrapperState, wrapperState, errorMessage]);

  const _value = selected || field?.props?.value || value;

  const floatLabel =
    alwaysFloat || wrapperState.isFocused || !isEmptyOrNull(_value);

  const onFocus = useCallback(
    (event) => {
      if (
        !wrapperState.isFocused &&
        (props.fieldValidation || props.fieldValidationCustom)
      ) {
        setWrapperState({ ...wrapperState, isFocused: true });
      }
      if (field.props.onFocus) field.props.onFocus(event);
    },
    [field, wrapperState, setWrapperState]
  );

  const onBlur = useCallback(
    (event) => {
      if (wrapperState.isFocused) {
        setWrapperState({ ...wrapperState, isFocused: false });
      }

      if (field.props.onBlur) field.props.onBlur(event);
    },
    [field, wrapperState, setWrapperState]
  );

  const onCalendarClose = useCallback(
    (event) => {
      if (wrapperState.isFocused) {
        setWrapperState({ ...wrapperState, isFocused: false });
      }

      if (field.props.onCalendarClose) field.props.onCalendarClose(event);
    },
    [field, wrapperState, setWrapperState]
  );

  let field_new;
  //if (field) {
  let {
    props: { inputGroupClassName },
  } = field;

  let groupProps = {};
  if (isGroup || type === "group") {
    groupProps = {
      inputGroupClassName: cx(inputGroupClassName, {
        focused: wrapperState.isFocused,
      }),
    };
  }
  field_new = useMemo(
    () =>
      [field].map((child, idx) =>
        React.cloneElement(child, {
          ...child.props,
          ...groupProps,
          ..._props,
          key: idx,
          onFocus,
          onBlur,
          ...((type === "datepicker" || type === "timepicker") && {
            onCalendarClose,
          }),
          required,
          name: name,
          ...((selected && { selected }) || { value: _value }),
          ...(onChange && { onChange }),
          ...(options && { options }),

          //onChange: onChange ? onChange : child.props.onChange,
        })
      ),
    [field, _value, selected, options, name, _props]
  );
  //}
  const children = field_new;
  return (
    <Form.Group
      controlId={controlId}
      {..._props}
      className={cx(
        DEFAULT_CLASSNAME,
        className,
        marginClassName && marginClassName,
        {
          "floating-label-active": "",
          "input-group-field": isGroup || type === "group",
          "is-invalid": isInvalid,
        }
      )}
    >
      <div className="amp-position-relative">
        {label && (
          <Form.Label className={labelClassName} key={1}>
            {label}
            {required && <span className="m-0 text-red">*</span>}
          </Form.Label>
        )}
        {children}
        {(type === "groupError" && (
          <AMPErrorAlert show={isInvalid}>
            {wrapperState.errorMessage}
          </AMPErrorAlert>
        )) || (
          <Form.Control.Feedback type="amp-field-error invalid">
            {wrapperState.errorMessage}
          </Form.Control.Feedback>
        )}

        {props.fieldValidation && (
          <Form.Control.Feedback
            className="error-message"
            type="amp-field-error "
          >
            {label} is required
          </Form.Control.Feedback>
        )}
        {props.fieldValidationCustom && (
          <Form.Control.Feedback
            className="error-message"
            type="amp-field-error "
          >
            {props.fieldValidationCustom}
          </Form.Control.Feedback>
        )}
      </div>
    </Form.Group>
  );
});

export const AMPFieldWrapper = React.memo(
  ({
    children: field,
    marginClassName = "mb-0 mt-amp-125",
    isFormField = true,
    type = "default",
    valueKey,
    valueName,
    onChange,
    colProps,
    isGroup,
    ruleKey,
    ...props
  }) => {
    const { control } = useFormContext() || {};
    const _isFormField = (control && props.name && isFormField) || false;

    const _valueName =
      valueName ||
      (selectedValueFields.includes(type) && "selected") ||
      undefined;

    const wrappedField = useMemo(
      () =>
        (rangeFields.includes(type) && (
          <RangeFieldWrapper
            marginClassName={marginClassName}
            type={type}
            {...(type === "group" && { isGroup: true })}
            {...(!_isFormField && { onChange })}
            {...props}
          >
            {field}
          </RangeFieldWrapper>
        )) ||
        ((type === "autosuggest" || type === "dropdown") && (
          <RegularFieldWrapper
            marginClassName={marginClassName}
            isGroup
            type={type}
            {...(!_isFormField && { onChange })}
            {...props}
          >
            <AutosuggestFieldWrapper {...field.props}>
              {field}
            </AutosuggestFieldWrapper>
          </RegularFieldWrapper>
        )) || (
          <RegularFieldWrapper
            marginClassName={type === "hidden" ? "m-0" : marginClassName}
            type={type}
            {...(type === "group" && { isGroup: true })}
            {...(!_isFormField && { onChange })}
            {...props}
          >
            {field}
          </RegularFieldWrapper>
        ),
      [
        props,
        type,
        colProps,
        _isFormField,
        isGroup,
        marginClassName,
        field,
        onChange,
        field.props,
        _valueName,
        marginClassName,
      ]
    );
    const component = useMemo(
      () =>
        _isFormField ? (
          rangeFields.includes(type) ? (
            <RangeFieldController
              wrapperOnChange={onChange}
              valueName={_valueName}
              ruleKey={ruleKey}
              {...props}
            >
              {wrappedField}
            </RangeFieldController>
          ) : (
            <FieldController
              wrapperOnChange={onChange}
              valueName={_valueName}
              ruleKey={ruleKey}
              {...props}
            >
              {wrappedField}
            </FieldController>
          )
        ) : (
          wrappedField
        ),
      [_isFormField, _valueName, wrappedField, onChange, ruleKey, props, type]
    );
    return component;
  }
);

const AutosuggestFieldWrapper = React.memo(
  ({ children: field, selected, onChange, multiple, ...props }) => {
    const isArray = multiple || (selected && Array.isArray(selected)) || false;

    const _selected = !isArray ? (selected && [selected]) || [] : selected;

    const _onChange = useCallback(
      (v) => {
        return (
          onChange &&
          onChange(
            (isArray && (v || [])) || (v && v.length > 0 && v[0]) || null
          )
        );
      },
      [isArray, onChange]
    );
    return React.cloneElement(field, {
      ...field.props,
      ...props,
      selected: _selected,
      multiple: multiple || field.props.multiple,
      onChange,
      ...(!multiple && { onChange: _onChange }),
    });
  }
);

AMPFieldWrapper.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  controlId: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  floatLabel: PropTypes.oneOfType([PropTypes.bool, PropTypes.array]),
  type: PropTypes.oneOf([
    "group",
    "default",
    "hidden",
    "numberRange",
    "groupError",
    ...selectedValueFields,
  ]),
  isGroup: PropTypes.bool,
  selected: PropTypes.array,
  onChange: PropTypes.func,
  marginClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  colProps: PropTypes.object,
};
