import React, { forwardRef } from "react";
import cx from "classnames";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { omit } from "../../utils/utils";

import {
  far,
  faTrashAlt,
  faSave,
  faClone,
} from "@fortawesome/free-regular-svg-icons";

import {
  faHome,
  faCoffee,
  faCog,
  faSpinner,
  faQuoteLeft,
  faSquare,
  faCheckSquare,
  faCheckCircle,
  faAngleLeft,
  faAngleRight,
  faAngleUp,
  faAngleDown,
  faAngry,
  faAnkh,
  faAppleAlt,
  faArchive,
  faCalendarAlt,
  faArchway,
  faArrowAltCircleDown,
  faArrowAltCircleLeft,
  faArrowAltCircleRight,
  faArrowAltCircleUp,
  faArrowCircleDown,
  faArrowCircleLeft,
  faArrowCircleRight,
  faArrowCircleUp,
  faArrowDown,
  faArrowLeft,
  faUserCog,
  faSignOutAlt,
  faFileCsv,
  faFileExcel,
  faFilePdf,
  faFileWord,
  faTimes,
  faExclamation,
  faSearch,
  faSearchPlus,
  faSearchMinus,
  faPlus,
  faDownload,
  faTrash,
  faFileDownload,
  faBan,
  faBinoculars,
  faImage,
  faImages,
  faUserLock,
  faSyncAlt,
  faEdit,
  faBook,
  faEraser,
  faPrint,
} from "@fortawesome/free-solid-svg-icons";
import { AMPSVGIcon } from "./AMPSVGIcon";

library.add(
  fab,
  far,
  faCoffee,
  faCog,
  faSpinner,
  faQuoteLeft,
  faSquare,
  faCheckSquare,
  faCheckCircle,
  faAngleLeft,
  faCalendarAlt,
  faAngleRight,
  faAngleUp,
  faAngry,
  faAnkh,
  faAppleAlt,
  faArchive,
  faArchway,
  faArrowAltCircleDown,
  faArrowAltCircleLeft,
  faArrowAltCircleRight,
  faArrowAltCircleUp,
  faArrowCircleDown,
  faArrowCircleLeft,
  faArrowCircleRight,
  faArrowCircleUp,
  faArrowDown,
  faArrowLeft,
  faHome,
  faAngleDown,
  faUserCog,
  faSignOutAlt,
  faFileCsv,
  faFileExcel,
  faFilePdf,
  faFileWord,
  faTimes,
  faExclamation,
  faSearch,
  faSearchPlus,
  faSearchMinus,
  faPlus,
  faDownload,
  faTrash,
  faTrashAlt,
  faFileDownload,
  faSave,
  faBan,
  faClone,
  faBinoculars,
  faImage,
  faImages,
  faUserLock,
  faSyncAlt,
  faEdit,
  faBook,
  faEraser,
  faPrint
);

export const IconStyleOptions = {
  NONE: 0,
  ROUNDED_SQUARE: 1,
  CIRCLE: 2,
};

export const ColorOptions = {
  transparent: "transparent",
  primary: "primary",
  secondary: "secondary",
  alternate: "alternate",
  success: "success",
  info: "info",
  warning: "warning",
  danger: "danger",
  dark: "dark",
  black: "black",
  yellow: "yellow",
  green: "green",
  red: "red",
  white: "white",
  grey: "grey",
  ampBrand: "amp-brand",
  ampLight: "amp-light",
  ampAlternate: "amp-alternate",
};

const DEFAULT_PROPS = {
  iconSource: null, //className,svg
  className: "amp-icon",
  iconStyle: IconStyleOptions.NONE,
  border: false,
  borderThin: false,
  borderColor: ColorOptions.black,
  backgroundColor: ColorOptions.transparent,
  character: null,
};

const Icon = ({ iconSource = null, character, ...props }) => {
  return <AMPSVGIcon {...props}></AMPSVGIcon>;
};

export const AMPIcons = forwardRef((props, ref) => {
  let newProps = {
    ...DEFAULT_PROPS,
    ...props,
  };

  const {
    iconSource,
    iconStyle,
    border,
    borderThin,
    borderColor,
    backgroundColor,
    character,
    color,
    title,
    size,
  } = newProps;

  newProps = omit(newProps, [
    "iconSource",
    "iconStyle",
    "border",
    "borderThin",
    "borderColor",
    "backgroundColor",
    "character",
    "title",
  ]);

  if (iconStyle !== IconStyleOptions.NONE || border)
    return (
      <span
        {...newProps}
        ref={ref}
        title={title}
        id={props.id}
        className={cx(
          "amp-icon-wrapper",
          {
            "icon-bg-square": iconStyle === IconStyleOptions.ROUNDED_SQUARE,
            "icon-bg-circle": iconStyle === IconStyleOptions.CIRCLE,
            "icon-border": border,
            "icon-border-thin": borderThin,
            "icon-character": character !== null,
          },
          color &&
            color !== null &&
            color.indexOf("#") === -1 &&
            "icon-color-" + color,
          borderColor && borderColor !== null && "icon-border-" + borderColor,
          backgroundColor &&
            backgroundColor !== null &&
            "icon-bg-" + backgroundColor
        )}
      >
        <Icon
          iconSource={iconSource}
          character={character}
          {...newProps}
          className={cx(
            DEFAULT_PROPS.className,
            size && `amp-icon-${size}`,
            props.className,
            {}
          )}
        />
      </span>
    );
  else
    return (
      <Icon
        ref={ref}
        iconSource={iconSource}
        {...newProps}
        className={cx(
          DEFAULT_PROPS.className,
          size && `amp-icon-${size}`,
          props.className,
          color &&
            color !== null &&
            color.indexOf("#") === -1 &&
            "icon-color-" + color
        )}
      />
    );
});

AMPIcons.propTypes = {
  className: PropTypes.string,
  iconSource: PropTypes.oneOf([null, "className", "svg"]),
  icon: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
    PropTypes.object,
  ]),
  iconStyle: PropTypes.oneOf(Object.values(IconStyleOptions)),
  border: PropTypes.bool,
  borderThin: PropTypes.bool,
  borderColor: PropTypes.oneOf(Object.values(ColorOptions)),
  backgroundColor: PropTypes.oneOf(Object.values(ColorOptions)),
  character: PropTypes.string,
  color: PropTypes.string,
};
