import React, { useEffect, useCallback, forwardRef } from "react";
import { useForm, FormContext } from "react-hook-form";
// import { validationRulesMap } from "../../const";
import { AMPFieldWrapper } from "./AMPFieldWrapper/AMPFieldWrapper";
import PropTypes from "prop-types";

const getFormScema = (formScemaRegister, register) => {
  if (formScemaRegister) {
    function getRegister(ParaName) {
      return register(
        { name: ParaName },
        {
          required: true,
        }
      );
    }
    return () => {
      formScemaRegister.map((arg) => getRegister(arg.key));
    };
  }
};

//-----------------------------------------
// Generic Form Validation Component
//-----------------------------------------
export const AMPFormValidation = React.memo(
  forwardRef(
    (
      {
        children,
        onSubmit,
        manualValidation,
        stopManualValClb,
        customValidationRules = {},
        mode = "onSubmit",
        reValidateMode = "onChange",
        defaultValues,
        /* for backward compatability start */
        render,
        formScemaRegister = [],
        enableGlobalError = false,
        globalRuleKey = "groupFieldKey",
        /* for backward compatability end */
        ...props
      },
      ref
    ) => {
      const methods = useForm({
        mode,
        reValidateMode,
        defaultValues,
        ...props,
      });

      /* for backward compatability start */
      const { register, errors, setValue, setError, clearError } = methods;
      const oldFormParams = {
        ampRegister: register,
        ampErrors: errors,
        ampSetValue: setValue,
        ampSetError: setError,
        ampClearError: clearError,
        ...methods,
      };

      useEffect(getFormScema(formScemaRegister, register), [
        formScemaRegister,
        register,
      ]);

      useEffect(() => {
        if (formScemaRegister)
          formScemaRegister.map((arg) =>
            setTimeout(() => setValue(arg.key, arg.value))
          );
      }, [formScemaRegister, setValue]);

      /* End Backward Compatability end */

      const { handleSubmit, triggerValidation } = methods;

      const _onSubmit = useCallback(
        (e) => {
          e.stopPropagation();
          e.preventDefault();
          return handleSubmit(onSubmit)(e);
        },
        [onSubmit]
      );

      // // triger manual validation
      if (manualValidation) {
        (async () => {
          const result = await triggerValidation();
          stopManualValClb();
        })();
      }
      return (
        <form ref={ref} onSubmit={_onSubmit}>
          {enableGlobalError && (
            <AMPFieldWrapper
              className="amp-hidden"
              controlId="groupField"
              name="groupField"
              rules={["groupRule"]}
              ruleKey={`groupField_${globalRuleKey}`}
              marginClassName="m-0"
            >
              <input type="hidden" />
            </AMPFieldWrapper>
          )}
          {children || (render && render(oldFormParams))}
        </form>
      );
    }
  )
);

AMPFormValidation.propTypes = {
  onSubmit: PropTypes.func,
  manualValidation: PropTypes.bool,
  stopManualValClb: PropTypes.func,
  customValidationRules: PropTypes.object,
  render: PropTypes.func,
};
