import React from "react";
import PropTypes from "prop-types";

export default function AMPFieldSet({
  title,
  customisedClassName,
  fieldBgColor,
  children,
}) {
  return (
    <>
      <fieldset className={`fieldset-container  ${fieldBgColor}`}>
        {title && (
          <legend className={`fieldset-header ${customisedClassName}`}>
            {title}
          </legend>
        )}
        {children}
      </fieldset>
    </>
  );
}

AMPFieldSet.defaultProps = {
  title: null,
};
AMPFieldSet.propTypes = {
  title: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element,
  ]),
};
