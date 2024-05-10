// Component Name: AMPAccordion
// Purpose: For collapsable Items as card view
// Properties:
//   title = type string
//   isOpen = type boolean for keep the subject by deffault open or close
//   isAccordion = type boolean for enabling or disabling the default feature of the accordion
// Developed by: Anik Chakraborty

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import Dropdown from "react-bootstrap/Dropdown";
import { Collapse, Button, Row } from "react-bootstrap";
import PropTypes from "prop-types";
import { omit } from "../common/utils/utils";
import cx from "classnames";
import { AMPButtonGroup } from "./AMPFormLayout";
import { useContentHeight } from "../common/hooks/layoutHooks";
import AMPTooltip from "./AMPTooltip";

export const AccordionLayoutContext = React.createContext();

const DEFAULT_PROPS = {
  contentClassName: "pt-1 px-2 pb-2",
};

const AccordionActionButton = ({
  data,
  params,
  onClick,
  includeCondition = true,
  ...action
}) => {
  let _includeCondition = true;
  if (typeof includeCondition === "boolean") {
    _includeCondition = includeCondition;
  } else if (typeof includeCondition === "function") {
    _includeCondition = includeCondition(data);
  } else if (typeof includeCondition === "string") {
    _includeCondition =
      data[includeCondition] !== undefined ? data[includeCondition] : true;
  }

  if (!_includeCondition) {
    return null;
  } else {
    return (
      <Button
        {...action}
        onClick={(e) => {
          onClick
            ? onClick(e, data, params, action)
            : console.error("No OnClick() provided for action", action);
        }}
      />
    );
  }
};

export const AMPAccordion = React.memo(
  forwardRef((props, ref) => {
    let _props = { ...DEFAULT_PROPS, ...props };
    const divRef = useRef(null);
    const [focused, setFocused] = useState(false);
    const {
      title = "",
      isOpen = true,
      isAccordion = true, //Enable expand/collapse
      contentClassName,
      marginClassName = "my-2",
      noBorder = false,
      className,
      noRoundedBorder = false,
      toggleCallback,
      accordionActions = [],
      focusable = false,
      onDelete,
      data,
      index,
      onhandleSubmit,
      onSave,
      showIconForSave,
      showDropdownIcon,
      openSelectOption,
      dropdownOptions
    } = _props;
    _props = omit(_props, [
      "isOpen",
      "isAccordion",
      "title",
      "contentClassName",
      "focusable",
    ]);
    const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
      <a
        href=""
        ref={ref}
        onClick={e => {
          e.preventDefault();
          onClick(e);
        }}
      >
        {children}
        <i className="fa fa-bars"></i>
      </a>
    ));
    const [accordionToggle, setAccordionToggle] = useState(isOpen);
    let toggleButtons;
    if (isAccordion) {
      toggleButtons = (
        <div className="control-icon col-lg-2 col-md-2 col-xs-2 col-sm-2">
          <div className="row">
            <div className="col-lg-2 col-md-2 col-xs-2 col-sm-2"></div>
            <div className="col-lg-10 col-md-10 col-xs-10 col-sm-10">
            <div className="row">
              <div className="col-lg-5 col-md-5 col-xs-5 col-sm-5">
              {props?.showDropdownIcon && 
                 <Dropdown>
                 <Dropdown.Toggle as={CustomToggle} />
                 <Dropdown.Menu size="sm" title="" className="pointer">
                   <Dropdown.Header onClick={openSelectOption}>{dropdownOptions}</Dropdown.Header>
                   
                 </Dropdown.Menu>
               </Dropdown>
              }
              </div>
              {accordionToggle && _props.showIcon && !_props.showIconForSave && (
                <button
                  aria-label="Update"
                  name="Update"
                  type="button"
                  onClick={() =>
                    _props.showIcon &&
                    !_props.showIconForSave &&
                    onhandleSubmit(index, data.id, data.sequence)
                  }
                  className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                >
                  <AMPTooltip
                    text={
                      _props.showIcon && !_props.showIconForSave && "Update"
                    }
                  >
                    <svg
                      fill="rgb(11, 26, 88)"
                      viewBox="0 0 64 64"
                      width="20px"
                      height="20px"
                      xmlns="http://www.w3.org/2000/svg"
                      className="svg-inline--fa amp-svg-icon amp-svg-floppy-disk fa-w-16 amp-icon"
                    >
                      <path d="M61.707,10.293l-8-8A1,1,0,0,0,53,2H7A5.006,5.006,0,0,0,2,7V57a5.006,5.006,0,0,0,5,5H57a5.006,5.006,0,0,0,5-5V11A1,1,0,0,0,61.707,10.293ZM48,4V20a1,1,0,0,1-1,1H17a1,1,0,0,1-1-1V4ZM10,60V35a3,3,0,0,1,3-3H51a3,3,0,0,1,3,3V60Zm50-3a3,3,0,0,1-3,3H56V35a5.006,5.006,0,0,0-5-5H13a5.006,5.006,0,0,0-5,5V60H7a3,3,0,0,1-3-3V7A3,3,0,0,1,7,4h7V20a3,3,0,0,0,3,3H47a3,3,0,0,0,3-3V4h2.586L60,11.414Z"></path>
                      <path d="M39,19h6a1,1,0,0,0,1-1V7a1,1,0,0,0-1-1H39a1,1,0,0,0-1,1V18A1,1,0,0,0,39,19ZM40,8h4v9H40Z"></path>
                      <path d="M47,45H17a1,1,0,0,0,0,2H47a1,1,0,0,0,0-2Z"></path>
                      <path d="M47,39H17a1,1,0,0,0,0,2H47a1,1,0,0,0,0-2Z"></path>
                      <path d="M47,51H17a1,1,0,0,0,0,2H47a1,1,0,0,0,0-2Z"></path>
                    </svg>
                  </AMPTooltip>
                </button>
              )}
              {_props.showIcon && !_props.showIconForSave && accordionToggle && (
                <button
                  aria-label="Delete"
                  name="Delete"
                  type="button"
                  onClick={() => onDelete(_props.data.id)}
                  className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                >
                  <AMPTooltip text="Delete">
                    <svg
                      fill="rgb(11, 26, 88)"
                      viewBox="0 0 340 427.00131"
                      xmlns="http://www.w3.org/2000/svg"
                      width="20px"
                      height="20px"
                      className="svg-inline--fa amp-svg-icon amp-svg-delete fa-w-13 amp-icon"
                    >
                      <path d="m232.398438 154.703125c-5.523438 0-10 4.476563-10 10v189c0 5.519531 4.476562 10 10 10 5.523437 0 10-4.480469 10-10v-189c0-5.523437-4.476563-10-10-10zm0 0"></path>
                      <path d="m114.398438 154.703125c-5.523438 0-10 4.476563-10 10v189c0 5.519531 4.476562 10 10 10 5.523437 0 10-4.480469 10-10v-189c0-5.523437-4.476563-10-10-10zm0 0"></path>
                      <path d="m28.398438 127.121094v246.378906c0 14.5625 5.339843 28.238281 14.667968 38.050781 9.285156 9.839844 22.207032 15.425781 35.730469 15.449219h189.203125c13.527344-.023438 26.449219-5.609375 35.730469-15.449219 9.328125-9.8125 14.667969-23.488281 14.667969-38.050781v-246.378906c18.542968-4.921875 30.558593-22.835938 28.078124-41.863282-2.484374-19.023437-18.691406-33.253906-37.878906-33.257812h-51.199218v-12.5c.058593-10.511719-4.097657-20.605469-11.539063-28.03125-7.441406-7.421875-17.550781-11.5546875-28.0625-11.46875h-88.796875c-10.511719-.0859375-20.621094 4.046875-28.0625 11.46875-7.441406 7.425781-11.597656 17.519531-11.539062 28.03125v12.5h-51.199219c-19.1875.003906-35.394531 14.234375-37.878907 33.257812-2.480468 19.027344 9.535157 36.941407 28.078126 41.863282zm239.601562 279.878906h-189.203125c-17.097656 0-30.398437-14.6875-30.398437-33.5v-245.5h250v245.5c0 18.8125-13.300782 33.5-30.398438 33.5zm-158.601562-367.5c-.066407-5.207031 1.980468-10.21875 5.675781-13.894531 3.691406-3.675781 8.714843-5.695313 13.925781-5.605469h88.796875c5.210937-.089844 10.234375 1.929688 13.925781 5.605469 3.695313 3.671875 5.742188 8.6875 5.675782 13.894531v12.5h-128zm-71.199219 32.5h270.398437c9.941406 0 18 8.058594 18 18s-8.058594 18-18 18h-270.398437c-9.941407 0-18-8.058594-18-18s8.058593-18 18-18zm0 0"></path>
                      <path d="m173.398438 154.703125c-5.523438 0-10 4.476563-10 10v189c0 5.519531 4.476562 10 10 10 5.523437 0 10-4.480469 10-10v-189c0-5.523437-4.476563-10-10-10zm0 0"></path>
                    </svg>
                  </AMPTooltip>
                </button>
              )}

              {/* add icon */}
              {_props?.showIconForAdd && accordionToggle && (
                <button
                  aria-label="Add"
                  name="Add"
                  type="button"
                  className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                  onClick={_props?.addPartComponent}
                >
                  <AMPTooltip text="Add New">
                    <svg
                      fill="rgb(11, 26, 88)"
                      viewBox="0 0 510 510"
                      // width="24px"
                      // height="24px"
                      xmlns="http://www.w3.org/2000/svg"
                      className="svg-inline--fa amp-svg-icon amp-svg-add fa-w-16 amp-icon"
                    >
                      <path
                        d="M256,0C114.844,0,0,114.844,0,256s114.844,256,256,256s256-114.844,256-256S397.156,0,256,0z M256,490.667
                    C126.604,490.667,21.333,385.396,21.333,256S126.604,21.333,256,21.333S490.667,126.604,490.667,256S385.396,490.667,256,490.667
                      z"
                      ></path>
                      <path
                        d="M394.667,245.333h-128v-128c0-5.896-4.771-10.667-10.667-10.667s-10.667,4.771-10.667,10.667v128h-128
                      c-5.896,0-10.667,4.771-10.667,10.667s4.771,10.667,10.667,10.667h128v128c0,5.896,4.771,10.667,10.667,10.667
                    s10.667-4.771,10.667-10.667v-128h128c5.896,0,10.667-4.771,10.667-10.667S400.563,245.333,394.667,245.333z"
                      ></path>
                    </svg>
                  </AMPTooltip>
                </button>
              )}
              {/* /add icon */}
              <div className="col-lg-5 col-md-5 col-xs-5 col-sm-5">
              {!accordionToggle ? (
                <div
                  onClick={() => toggleAccordion()}
                  className="amp-button button-mini float-right icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                >
                  <svg
                    fill="#2a297e"
                    width="20px"
                    height="20px"
                    viewBox="0 0 490.656 490.656"
                    color="white"
                    xmlns="http://www.w3.org/2000/svg"
                    className="svg-inline--fa amp-svg-icon amp-svg-down-arrow fa-w-16 amp-icon icon-color-white"
                  >
                    <path
                      d="M487.536,120.445c-4.16-4.16-10.923-4.16-15.083,0L245.339,347.581L18.203,120.467c-4.16-4.16-10.923-4.16-15.083,0
c-4.16,4.16-4.16,10.923,0,15.083l234.667,234.667c2.091,2.069,4.821,3.115,7.552,3.115s5.461-1.045,7.531-3.136l234.667-234.667
C491.696,131.368,491.696,124.605,487.536,120.445z"
                    ></path>
                  </svg>
                </div>
              ) : (
                <button
                  aria-label="up"
                  name="up"
                  type="button"
                  onClick={() => toggleAccordion()}
                  className="amp-button button-mini float-right icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                >
                  <svg
                    fill="#2a297e"
                    viewBox="0 0 490.656 490.656"
                    color="#fff"
                    width="20px"
                    height="20px"
                    xmlns="http://www.w3.org/2000/svg"
                    className="svg-inline--fa amp-svg-icon amp-svg-up-arrow fa-w-16 amp-icon icon-color-white"
                  >
                    <path
                      d="M487.536,355.12L252.869,120.453c-4.16-4.16-10.923-4.16-15.083,0L3.12,355.12c-4.16,4.16-4.16,10.923,0,15.083
 c4.16,4.16,10.923,4.16,15.083,0l227.115-227.136l227.115,227.136c2.091,2.069,4.821,3.115,7.552,3.115s5.461-1.045,7.552-3.115
 C491.696,366.043,491.696,359.28,487.536,355.12z"
                    ></path>
                  </svg>
                </button>
              )}
              </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      toggleButtons = "";
    }

    useEffect(() => {
      setAccordionToggle(isOpen);
    }, [isOpen]);

    const collapse = () => {
      setAccordionToggle(false);
      toggleCallback && toggleCallback(false);
    };
    const expand = () => {
      setAccordionToggle(true);

      toggleCallback && toggleCallback(true);
    };

    const toggleAccordion = () => {
      const _accordion = !accordionToggle;

      setAccordionToggle(_accordion);
      toggleCallback && toggleCallback(_accordion);
    };

    useImperativeHandle(ref, () => {
      return {
        collapse,
        expand,
        toggleAccordion,
        getInstance: () => divRef.current,
      };
    });

    let _accordionActions = accordionActions;
    if (focusable) {
      _accordionActions = [...accordionActions]; //make a copy to avoid appending to same array
      _accordionActions.push({
        isToggle: true,
        icon: ["restore", "focus"],
        name: ["Show Less", "Show More"],
        defaultToggle: focused,
        onToggle: setFocused,
        key: focused,
      });
    }

    return (
      <div
        ref={divRef}
        className={cx(
          "amp-accordion accordion-panel",
          marginClassName,
          className,
          noRoundedBorder && "accordion-no-rounded-border",
          noBorder && "accordion-no-border"
        )}
      >
        <div
          className={cx("accordion-item", {
            "no-header": title === "",
          })}
        >
          {/* {title !== "" && ( */}
          <div className="title p-1">
            {isAccordion ? (
              <div
                className="toggle-button row"
                block
                variant=""
                // onClick={toggleAccordion}
              >
                <div className="link col-lg-10 col-md-10 col-xs-10 col-sm-10">
                  {title}
                </div>
                {toggleButtons}
              </div>
            ) : (
              <div className="toggle-button cursor-default" block variant="">
                <div className="link">{title}</div>
              </div>
            )}

            {accordionToggle && _accordionActions.length > 0 && (
              <Row>
                <AMPButtonGroup
                  className="ml-3 mr-1"
                  marginClassName={false}
                  wrapClassName="flex-nowrap"
                >
                  {_accordionActions.map((buttonProps, idx) => (
                    <AccordionActionButton key={idx} {...buttonProps} />
                  ))}
                </AMPButtonGroup>
              </Row>
            )}
          </div>
          {/* )} */}

          <Collapse in={accordionToggle}>
            <div>
              <AMPAccordionContent
                contentClassName={contentClassName}
                focused={focused}
                focusable={focusable}
                setFocused={setFocused}
              >
                {_props.children}
              </AMPAccordionContent>
            </div>
          </Collapse>
        </div>
      </div>
    );
  })
);

const AMPAccordionContent = React.memo(
  ({ contentClassName, children, focused, focusable, setFocused }) => {
    const contentHeight = useContentHeight({ delta: 0 });
    const _contentHeight = contentHeight - 130;
    const content = (
      <div className="amp-accordion-content">
        <div className={contentClassName}>{children}</div>
      </div>
    );
    return (
      (focusable && (
        <AccordionLayoutContext.Provider
          value={{ setFocused, focused, contentHeight: _contentHeight }}
        >
          {content}
        </AccordionLayoutContext.Provider>
      )) ||
      content
    );
  }
);

AMPAccordion.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element.isRequired,
    PropTypes.node.isRequired,
  ]),
  title: PropTypes.string,
  isOpen: PropTypes.bool,
  isAccordion: PropTypes.bool,
  contentClassName: PropTypes.string,
  toggleCallback: PropTypes.func,
};
