import React, { useCallback, useMemo } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { equals, type as Type, head, keys, values } from "ramda";
import { lodashUtils } from "../utils/utils";

const processRules = (
  obj,
  k,
  validationRulesMap,
  { name, label, getValues }
) => {
  const [rule, args = []] = (equals(Type(k), "Object") && [
    head(keys(k)),
    head(values(k)),
  ]) || [k, undefined];

  return {
    ...obj,
    ...{
      [rule]: (val) => {
        return (
          [rule] &&
          validationRulesMap[rule](
            { name, value: val, label, getValues },
            ...(Array.isArray(args) ? args : [args])
          )
        );
      },
    },
  };
};

const checkRangeRequiredRule = (rules) => {
  let requiredRule =
    rules
      .filter((item, i) => {
        return (
          typeof item === "object" && Object.keys(item).includes("required")
        );
      })
      .reduce((obj, item) => {
        return item;
      }, undefined) ||
    (rules.includes("required") && { required: ["from", "to"] });

  return requiredRule || {};
};

export const RangeFieldController = React.memo(
  ({
    children: field,
    rules = [],
    defaultValue,
    valueName,
    name,
    label,
    wrapperOnChange,
    ruleKey,
    ...props
  }) => {
    const { errors, validationRulesMap, getValues } = useFormContext();

    const { message: errorMessage = undefined } =
      lodashUtils.get(errors, name) || {};

    let _errorMessage = {};
    if (errorMessage) {
      if (errorMessage.includes(",")) {
        const [fromErrorMessage, toErrorMessage] = errorMessage.split(",") || [
          undefined,
          undefined,
        ];
        _errorMessage = { from: fromErrorMessage, to: toErrorMessage };
      } else {
        _errorMessage = { common: errorMessage };
      }
    }
    /* const [fromErrorMessage, toErrorMessage] = (errorMessage && errorMessage.includes(",") &&
      errorMessage.split(",")) || [undefined, undefined];

    const _errorMessage = { common: from: fromErrorMessage, to: toErrorMessage }; */

    const onChange = useCallback(
      ([v]) => {
        if (wrapperOnChange) wrapperOnChange(v);
        //console.log("range onChange wrapper", v);
        return v;
      },
      [field]
    );

    const requiredRule = checkRangeRequiredRule(rules);

    const required = [
      (requiredRule &&
        requiredRule.required &&
        requiredRule.required.includes("from") &&
        true) ||
        false,
      (requiredRule &&
        requiredRule.required &&
        requiredRule.required.includes("to") &&
        true) ||
        false,
    ];

    //console.log("render test", name);
    const validate = useMemo(() => {
      //console.log("render test memo", name);
      let _rules;
      if (rules.includes("required")) {
        _rules = [...rules];
        _rules.splice(_rules.indexOf("required"), 1, requiredRule);
      } else {
        _rules = rules;
      }
      return _rules.reduce(
        (obj, k) =>
          processRules(obj, k, validationRulesMap, { name, label, getValues }),
        {}
      );
    }, [name]);

    return (
      <>
        <Controller
          key={`${ruleKey || name}`}
          name={name}
          defaultValue={defaultValue}
          as={field}
          {...props}
          {...(required && { required })}
          label={label}
          valueName={valueName}
          isInvalid={[
            !!_errorMessage.from || _errorMessage.common,
            !!_errorMessage.to || _errorMessage.common,
          ]}
          errorMessage={_errorMessage}
          rules={{ validate }}
          onChange={onChange}
        />
      </>
    );
  }
);

export const FieldController = React.memo(
  ({
    children: field,
    rules = [],
    defaultValue,
    valueName,
    name,
    label,
    wrapperOnChange,
    ruleKey,
    ...props
  }) => {
    const { errors, validationRulesMap, getValues } = useFormContext();

    const { message: errorMessage = undefined } =
      lodashUtils.get(errors, name) || {};

    const onChange = useCallback(
      ([v]) => {
        if (wrapperOnChange) wrapperOnChange(v);
        //console.log("onChange wrapper", v);
        return v;
      },
      [field]
    );

    const required = rules.includes("required") || undefined;

    const validate = rules.reduce(
      (obj, k) =>
        processRules(obj, k, validationRulesMap, { name, label, getValues }),
      {}
    );

    return (
      <>
        <Controller
          key={`${ruleKey || name}-${+(props.disabled || false)}`}
          name={name}
          defaultValue={defaultValue}
          as={field}
          onChange={onChange}
          {...props}
          {...(required && { required })}
          label={label}
          valueName={valueName}
          isInvalid={!!errorMessage}
          errorMessage={errorMessage}
          rules={{ validate }}
        />
      </>
    );
  }
);
