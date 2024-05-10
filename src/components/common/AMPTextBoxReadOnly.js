import React from "react";

export const AMPTextBoxReadOnly = (props) => {
  const _props = {
    ...props,
    className:
      "form-control form-control-sm amp-text-overflow disabled " +
      props.className,
  };
  return (
    <>
      <div {..._props}>{props.value}</div>
    </>
  );
};
