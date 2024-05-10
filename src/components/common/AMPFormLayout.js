import React from "react";
import { Col, Row, Button } from "react-bootstrap";
//import { AMPButton } from "./AMPButton";
import PropTypes from "prop-types";
import cx from "classnames";

const DEFAULT_COL_PROPS = {
  xs: 12,
  sm: 12,
  md: 6,
  lg: 3,
};

const DEFAULT_BUTTON_GROUP_COL_PROPS = {
  xs: null,
  sm: null,
  md: null,
  lg: null,
};

const multiplySpan = (size, span) => {
  return size && (size = size * span) > 12 ? 12 : size;
};

const AMPCol = (props) => {
  let { span, xs, sm, md, lg, xl, ..._props } = {
    ...DEFAULT_COL_PROPS,
    ...props,
  };

  if (span) {
    xs = multiplySpan(xs, span);
    sm = multiplySpan(sm, span);
    md = multiplySpan(md, span);
    lg = multiplySpan(lg, span);
    xl = multiplySpan(xl, span);
  }
  _props = { ..._props, xs, sm, md, lg, xl };
  return <Col {..._props} />;
};

export const AMPButtonGroup = ({ children, ...props }) => {
  let _children = children;
  if (!Array.isArray(children)) {
    _children = [children];
  }

  const {
    marginClassName = "mt-2",
    displayClassName = "d-flex",
    justifyClassName = "justify-content-end",
    wrapClassName = "flex-wrap",
    buttonClassName,
    enableBottomMargin,
    colProps,
  } = props;

  return (
    <AMPCol {...DEFAULT_BUTTON_GROUP_COL_PROPS} {...colProps}>
      <div
        className={cx(
          "amp-button-group",
          marginClassName,
          displayClassName,
          justifyClassName,
          wrapClassName
        )}
      >
        {_children.map((child, idx) => (
          <div
            className={cx(
              "d-inline-block mb-1",
              buttonClassName,
              enableBottomMargin && "mb-1"
            )}
            key={idx}
          >
            {child}
          </div>
        ))}
      </div>
    </AMPCol>
  );
};

AMPButtonGroup.propTypes = {
  className: PropTypes.string,
  marginClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  displayClassName: PropTypes.string,
  justifyClassName: PropTypes.string,
  wrapClassName: PropTypes.string,
  buttonClassName: PropTypes.string,
  enableBottomMargin: PropTypes.bool,
};

const DEFAULT_PROPS = {
  footerActions: [],
  footerProps: {},
};

export const AMPFormLayout = React.memo((props) => {
  const _props = { ...DEFAULT_PROPS, ...props };
  const {
    fields,
    children,
    footerActions,
    footerActionIdx = 0,
    footerProps,
    footerComponent,
    submitButton,
    clearCallBack,
    allFieldsColProps,
    colProps,
    ...rowProps
  } = _props;

  let _footerActions = [];
  let _children = children;
  if (children && !Array.isArray(children)) {
    _children = [children];
  }

  if (submitButton) {
    _footerActions.push(
      <Button
        variant="secondary"
        size="lg"
        type="submit"
        {...(submitButton !== true ? submitButton : null)}
      >
        Submit
      </Button>
    );
  }

  if (clearCallBack) {
    _footerActions.push(
      <Button
        className="ml-2"
        variant="secondary"
        size="lg"
        type="clear"
        onClick={clearCallBack}
      >
        Clear
      </Button>
    );
  }

  if (footerActions)
    _footerActions.splice(footerActionIdx, 0, ...footerActions);

  return (
    <>
      <Row {...rowProps}>
        {fields &&
          fields.map(({ component, colProps }, idx) => (
            <AMPCol
              key={idx}
              {...allFieldsColProps}
              {...colProps}
              {...component.props.colProps}
            >
              {component}
            </AMPCol>
          ))}
        {_children &&
          _children.map(
            (field, idx) =>
              field && (
                <AMPCol
                  key={idx}
                  {...allFieldsColProps}
                  {...field?.props?.colProps}
                >
                  {field}
                </AMPCol>
              )
          )}
        {_footerActions && _footerActions.length > 0 && (
          <Col md={12} sm={12} lg={12} xs={12}>
            <AMPButtonGroup
              children={_footerActions}
              marginClassName="mb-3"
              {...footerProps}
            />
          </Col>
        )}
        {footerComponent}
      </Row>
    </>
  );
});

AMPFormLayout.propTypes = {
  fields: PropTypes.array,
  footerActions: PropTypes.array,
  footerActionIdx: PropTypes.number,
  footerProps: PropTypes.object,
  footerComponent: PropTypes.any,
  // submitButton: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  clearCallBack: PropTypes.func,
  allFieldsColProps: PropTypes.object,
};
