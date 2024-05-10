import React from "react";
import PropTypes from "prop-types";
import Loader from "react-loader-spinner";

export default function AMPLoader({ isLoading }) {
  return (
    <>
      {isLoading && (
        <div className={isLoading ? "parentDisable" : ""} width="100%">
          <Loader className="overlay-box" type="ThreeDots" color="#00BFFF" />
        </div>
      )}
    </>
  );
}

AMPLoader.defaultProps = {
  isLoading: false,
};
AMPLoader.propTypes = {
  isLoading: PropTypes.bool.isRequired,
};
