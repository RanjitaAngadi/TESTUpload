// Component Name: AMPTab
// Purpose: For collapsable Items as card view
// Properties:
//   title = type string
//   div elements = type block scope with data for individual pill
// Developed by: Anik Chakraborty

import React from "react";
import { Nav, Tab } from "react-bootstrap";
import PropTypes from "prop-types";
import cx from "classnames";

export const AMPTab = React.memo((props) => {
  const {
    children,
    defaultActiveKey,
    id,
    size = "sm",
    handleSelect,
    activeKey,
  } = props;

  let _children = [];
  children?.forEach((c) => {
    if (c !== null) _children.push(c);
  });

  const onChange = (v) => {
    if (props.onChange) props.onChange(v);
  };

  return (
    <>
      <div
        className={cx("amp-tab-container ", {
          [`amp-tab-container-${size}`]: size,
        })}
      >
        <Tab.Container
          activeKey={activeKey}
          defaultActiveKey={
            defaultActiveKey
              ? defaultActiveKey
              : _children.findIndex((child) => {
                  !child?.props?.disabled || !child?.props?.noClick;
                })
          }
          id={id ? id : "amp-uncontrolled-tabs"}
          onSelect={(v) => {
            //onChange(v);
            handleSelect(v);
          }}
        >
          <Nav variant="pills pt-0 pb-0  pr-5 navbar navbar-expand-lg navbar-dark">
            {_children.map((each, idx) => {
              return each?.type === "div" ? (
                <Nav.Item key={idx}>
                  <Nav.Link
                    eventKey={idx.toString()}
                    className={each?.props?.commentClass}
                    disabled={each?.props?.disabled ? true : false}
                  >
                    {each?.props?.name}
                  </Nav.Link>
                </Nav.Item>
              ) : null;
            })}
          </Nav>
          <Tab.Content>
            {_children.map((each, idx) => {
              return (
                <Tab.Pane key={idx} className="p-0" eventKey={idx.toString()}>
                  {each?.props?.children}
                </Tab.Pane>
              );
            })}
          </Tab.Content>
        </Tab.Container>
      </div>
    </>
  );
});
AMPTab.propTypes = {
  // children: PropTypes.element.isRequired,
  title: PropTypes.string,
  size: PropTypes.oneOf(["sm", "mini", false]),
};
