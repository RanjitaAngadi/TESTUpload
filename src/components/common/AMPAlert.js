import React from "react";
import { Alert, Fade, Collapse, Col, Container } from "react-bootstrap";
import cx from "classnames";

export const AMPAlert = ({
  show = true,
  noBackground = true,
  noBorder = true,
  marginClassName = "mt-1 mb-0",
  paddingClassName = "",
  className,
  contentJustifyClassName = "justify-content-center",
  children,
  listUnstyled = false,
  animate = true,
  ...props
}) => {
  const ampAlertComp = (
    <Alert
      className={cx(
        "amp-alert",
        paddingClassName,
        marginClassName,
        noBackground && "no-background",
        noBorder && "no-border",
        listUnstyled && "list-unstyled",
        className
      )}
      transition={null}
      {...props}
    >
      <div className={`d-flex ${contentJustifyClassName}`}>{children}</div>
    </Alert>
  );
  return (
    (animate && (
      <Fade in={show} appear>
        <div>
          <Collapse in={show} appear>
            {ampAlertComp}
          </Collapse>
        </div>
      </Fade>
    )) ||
    (show && ampAlertComp) ||
    null
  );
};

export const AMPErrorAlert = ({ hideIcon, ...props }) => (
  <AMPAlert variant="danger" {...props}>
    {/* {!hideIcon && <AMPIcons iconSource="svg" icon="error" size="lg" />} */}
    <Col xs="auto my-auto">{props.children}</Col>
  </AMPAlert>
);

export const AMPInfoAlert = (props) => (
  <AMPAlert variant="amp-brand" {...props} />
);

export const AMPUserNote = (props) => (
  <AMPAlert
    variant="amp-brand"
    noBackground={false}
    noBorder={false}
    animate={false}
    marginClassName="mt-3 mb-0"
    paddingClassName="p-3"
    contentJustifyClassName=""
    {...props}
  />
);
