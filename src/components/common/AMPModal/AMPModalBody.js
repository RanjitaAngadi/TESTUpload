import React, { useCallback, useRef } from "react";
import { Modal, Container } from "react-bootstrap";
import PerfectScrollbar from "react-perfect-scrollbar";
import cx from "classnames";

// const resizeDebounceObv = new Subject().pipe(debounceTime(100));

// const handleResize = () => {
//   resizeDebounceObv.next();
// };

export const AMPModalBodyContent = ({
  className,
  disableBackground,
  handleResize,
  isScroll,
  children,
}) => {
  return (
    <Container
      fluid={true}
      className={cx(
        "body-content",
        //disableBackground && isScroll && "pl-0 pr-3",
        disableBackground && "disable-background",
        disableBackground && (className || "p-0"),
        !disableBackground && (className || "pt-1 px-2 pb-2")
      )}
    >
      {isScroll ? (
        <div>
          <div>{children}</div>
        </div>
      ) : (
        children
      )}
    </Container>
  );
};

export const AMPModalBody = ({
  disableBackground = false,
  isScroll = false,
  className,
  contentClassName,
  scrollContainerClassName,
  ...props
}) => {
  const scrollbarRef = useRef();
  const handleUpdateScroll = useCallback(() => {
    //if (scrollbarRef.current)
    scrollbarRef.current.updateScroll();
  }, []);

  // useObservableCallback(resizeDebounceObv, () => {
  //   handleUpdateScroll(scrollbarRef);
  // });

  return (
    <>
      <Modal.Body
        {...props}
        className={cx("ampModalBody", className, isScroll && "pr-1")}
      >
        {isScroll ? (
          <PerfectScrollbar ref={scrollbarRef}>
            <div className={cx(scrollContainerClassName, "pr-3")}>
              <AMPModalBodyContent
                className={contentClassName}
                // handleResize={handleResize}
                disableBackground={disableBackground}
                isScroll={isScroll}
              >
                {props.children}
              </AMPModalBodyContent>
            </div>
          </PerfectScrollbar>
        ) : (
          <AMPModalBodyContent
            // handleResize={handleResize}
            disableBackground={disableBackground}
            isScroll={isScroll}
          >
            {props.children}
          </AMPModalBodyContent>
        )}
      </Modal.Body>
    </>
  );
};
