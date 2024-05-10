import React from "react";
import PropTypes from "prop-types";

export default function AMPAuthorization({
  hasToken,
  showError,
  errMessage,
  children,
}) {
  if (!hasToken)
    return showError ? (
      <div className="text-center text-danger">{errMessage}</div>
    ) : null;
  return <>{children}</>;
}

AMPAuthorization.defaultProps = {
  showError: false,
  errMessage: "You are not Authorize to this page, Please Connect to the Admin",
};
AMPAuthorization.propTypes = {
  hasAnyToken: PropTypes.number,
  showError: PropTypes.bool,
  errMessage: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element,
  ]),
};
