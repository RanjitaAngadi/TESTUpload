import React, { forwardRef } from "react";
import cx from "classnames";
import Button from "react-bootstrap/Button";
import PropTypes from "prop-types";
import { AMPIcons, ColorOptions } from "./AMPIcons";
import { omit } from "../../utils/utils";
import { withTooltip } from "./AMPTooltip";
import { useState } from "react";
import { useCallback } from "react";

export const ButtonMode = {
  ICON_LABEL: 1,
  LABEL: 2,
  ICON: 3,
  LABEL_ICON: 4,
  ICON_MINI: 5,
  LABEL_MINI: 6,
  LABEL_FULL_MINI: 7,
};

export const ButtonConfig = {
  default: {
    className: "amp-button",
    backgroundStyle: false,
    hoverStyle: "btn-transition",
    outline: true,
    color: "primary",
    name: "Button",
    mode: ButtonMode.LABEL,
    htmlType: "button",
    size: "sm",
    wider: false,
    shape: null,
    shadow: false,
  },
  search: {
    color: "primary",
    name: "Search",
    icon: "search",
    mode: ButtonMode.LABEL,
    htmlType: "submit",
  },
  update: {
    color: "primary",
    name: "Update",
    mode: ButtonMode.LABEL,
    htmlType: "submit",
  },
  submit: {
    color: "primary",
    name: "Submit",
    htmlType: "submit",
  },
  save: {
    color: "primary",
    name: "Save",
    htmlType: "submit",
    icon: ["far", "save"],
    mode: ButtonMode.LABEL,
  },
  saveall: {
    color: "primary",
    name: "Save All",
    htmlType: "submit",
  },
  select: {
    name: "Select",
  },
  close: {
    color: "alternate",
    name: "Close",
    mode: ButtonMode.LABEL,
  },
  edit: {
    color: "primary",
    name: "Edit",
    icon: "edit",
    mode: ButtonMode.LABEL,
  },
  add: {
    color: "primary",
    name: "Add",
    icon: "plus",
  },
  clear: {
    color: "secondary",
    name: "Clear",
    htmlType: "reset",
    icon: "eraser",
  },
  next: {
    color: "secondary",
    name: "Next",
    htmlType: "next",
    icon: "next",
  },
  refresh: {
    color: "alternate",
    name: "Refresh",
    htmlType: "button",
    icon: "sync-alt",
    mode: ButtonMode.LABEL,
  },
  reload: {
    color: "alternate",
    name: "Reload",
    htmlType: "button",
    icon: "sync-alt",
    mode: ButtonMode.LABEL,
  },
  generate: {
    color: "alternate",
    name: "Generate",
    htmlType: "button",
  },
  delete: {
    color: "danger",
    name: "Delete",
    icon: "times",
    mode: ButtonMode.LABEL,
  },
  remove: {
    color: "danger",
    name: "Remove",
    icon: ["far", "trash-alt"],
  },
  upload: {
    color: "primary",
    name: "Upload",
    htmlType: "submit",
  },
  ok: {
    color: "primary",
    name: "Ok",
  },
  yes: {
    color: "primary",
    name: "Yes",
  },
  no: {
    color: "secondary",
    name: "no",
  },
  cancel: {
    color: "secondary",
    name: "Cancel",
    icon: "ban",
  },
  download: {
    color: "alternate",
    name: "Download",
    icon: "download",
    mode: ButtonMode.LABEL,
  },
  export: {
    color: "alternate",
    name: "Export",
    icon: "file-download",
    mode: ButtonMode.LABEL,
  },
  print: {
    color: "alternate",
    name: "Print",
    icon: "print",
    mode: ButtonMode.LABEL,
  },
  reset: {
    color: "alternate",
    name: "Reset",
    mode: ButtonMode.LABEL,
  },
  clearfilter: {
    color: "alternate",
    name: "Clear Filter",
    mode: ButtonMode.LABEL,
  },
  copy: {
    color: "alternate",
    name: "Copy",
    icon: ["far", "clone"],
    mode: ButtonMode.LABEL,
  },
  lookup: {
    color: "dark",
    name: "Lookup",
    icon: "binoculars",
    mode: ButtonMode.LABEL,
  },
  zoomin: {
    color: "primary",
    name: "Zoom In",
    icon: "search-plus",
    mode: ButtonMode.LABEL,
  },
  zoomout: {
    color: "primary",
    name: "Zoom Out",
    icon: "search-minus",
    mode: ButtonMode.LABEL,
  },
  image: {
    color: "primary",
    name: "Image",
    icon: "image",
    mode: ButtonMode.LABEL,
  },
  lockuser: {
    color: "danger",
    name: "Lock User",
    icon: "user-lock",
    mode: ButtonMode.LABEL,
  },
  link: {
    color: "link",
    name: "link",
    mode: ButtonMode.LABEL,
    hoverStyle: "",
    outline: false,
  },
  primary: {
    color: "primary",
    name: "primary",
    mode: ButtonMode.LABEL,
  },
  secondary: {
    color: "secondary",
    name: "secondary",
    mode: ButtonMode.LABEL,
  },
  alternate: {
    color: "alternate",
    name: "alternate",
    mode: ButtonMode.LABEL,
  },
  success: {
    color: "success",
    name: "success",
    mode: ButtonMode.LABEL,
  },
  info: {
    color: "info",
    name: "info",
    mode: ButtonMode.LABEL,
  },
  warning: {
    color: "warning",
    name: "warning",
    mode: ButtonMode.LABEL,
  },
  danger: {
    color: "danger",
    name: "danger",
    mode: ButtonMode.LABEL,
  },
  dark: {
    color: "dark",
    name: "dark",
    mode: ButtonMode.LABEL,
  },
  "amp-brand": {
    color: "amp-brand",
    name: "amp-brand",
    mode: ButtonMode.LABEL,
  },
  "amp-light": {
    color: "amp-light",
    name: "amp-light",
    mode: ButtonMode.LABEL,
  },
  "amp-alternate": {
    color: "amp-alternate",
    name: "amp-alternate",
    mode: ButtonMode.LABEL,
  },
  "approve-reject": {
    name: ["Approve", "Reject"],
    icon: ["approve", "reject"],
    iconProps: { iconSource: "svg" },
    isToggle: true,
  },
  next: {
    name: "Next",
    htmlType: "submit",
  },
};

const AMPButtonFinal = forwardRef((props, ref) => {

  let {
    tooltip = false,
    htmlType,
    mode,
    icon,
    wider,
    hoverStyle,
    backgroundStyle = false,
    name,
    shape,
    variant,
    outline,
    color,
    shadow,
    iconProps = {},
    tooltipProps = {},
    marginClassName = "mr-1",
  } = props;


  variant = variant ? variant : outline ? "outline" : false;
  variant = variant
    ? variant + (color ? "-" + color : "")
    : color
    ? color
    : undefined;

  let newProps = { "aria-label": name, ...props, variant };

  newProps = omit(newProps, [
    "tooltip",
    "htmlType",
    "mode",
    "icon",
    "wider",
    "hoverStyle",
    "backgroundStyle",
    "shape",
    "color",
    "outline",
    "iconProps",
    "buttonConfig",
    "shadow",
    "isToggle",
    "tooltipProps",
    "marginClassName",
  ]);

  if (mode === ButtonMode.LABEL) newProps = omit(newProps, ["title"]);

  let children = <></>;
  if (!newProps.children || newProps.children == null) {
    switch (mode) {
      case ButtonMode.LABEL_FULL_MINI:
      case ButtonMode.LABEL: {
        children = <div className="text-nowrap">{newProps.name}</div>;
        break;
      }
      case ButtonMode.LABEL_MINI: {
        let [labelChar] = newProps.name;
        children = <div className="text-nowrap">{labelChar}</div>;
        break;
      }
      case ButtonMode.LABEL_ICON: {
        children = (
          <div className="text-nowrap">
            {newProps.name}
            <AMPIcons className="ml-1" icon={icon} {...iconProps} />
          </div>
        );
        break;
      }
      case ButtonMode.ICON_MINI:
      case ButtonMode.ICON: {
        children = <AMPIcons icon={icon} {...iconProps} />;
        break;
      }
      case ButtonMode.ICON_LABEL: {
        children = (
          <div className="text-nowrap">
            <AMPIcons className="mr-1" icon={icon} {...iconProps} />
            {newProps.name}
          </div>
        );

        break;
      }
      default: {
      }
    }
  }

  const button = (
    <Button
      ref={ref}
      {...newProps}
      className={cx(
        ButtonConfig.default.className,
        (mode !== ButtonMode.ICON_MINI &&
          mode !== ButtonMode.LABEL_MINI &&
          mode !== ButtonMode.LABEL_FULL_MINI &&
          marginClassName) ||
          "",
        {
          "btn-wide": wider,
          "btn-shadow": shadow,
          "button-mini":
            mode === ButtonMode.ICON_MINI || mode === ButtonMode.LABEL_MINI,
          "label-mini": mode === ButtonMode.LABEL_MINI,
          "label-full-mini": mode === ButtonMode.LABEL_FULL_MINI,
          "icon-mini": mode === ButtonMode.ICON_MINI,
          "shape-circle": shape === "circle",
        },
        hoverStyle,
        backgroundStyle,
        props.className
      )}
      type={htmlType}
    >
      {newProps.children ? newProps.children : <>{children}</>}
    </Button>
  );
  return button;
});

export const AMPButton = forwardRef((props, ref) => {
  const { type = "default" } = props;
  const selectedConfig = ButtonConfig[type.toLowerCase()];
  const newProps = {
    ...ButtonConfig.default,
    ...selectedConfig,
    ...props,
  };

  const { isToggle, defaultToggle, onToggle, ..._newProps } = newProps;
  const button = <AMPButtonFinal ref={ref} {..._newProps} />;

  return (isToggle && asToggle(button, { defaultToggle, onToggle })) || button;
});

export const ButtonIconConfig = {
  default: {
    mode: ButtonMode.ICON_MINI,
    iconProps: { iconSource: "svg" },
    backgroundStyle: "btn-transparent",
    outline: false,
    variant: "amp-monochrome",
    color: ColorOptions.ampBrand,
    icon: "question_default",
    //name: "My Icon Button",
  },
  save: {
    icon: "floppy-disk",
  },
  add: {
    icon: "add",
  },
  clear: {
    icon: "clear",
  },
  reload: {
    icon: "refresh",
  },
  "export-csv": {
    name: "Export CSV",
    icon: "csv",
  },
  delete: {
    icon: "delete",
  },
  print: {
    name: "Print",
    icon: "printer",
  },
  edit: {
    name: "Edit",
    icon: "edit",
  },
  options: {
    name: "Options",
    icon: "gear",
  },
  lookup: {
    icon: "search",
  },
  info: {
    icon: "info",
  },
  approve: {
    icon: "approve",
    name: "Approve",
  },
  propose: {
    icon: "propose",
    name: "Propose",
  },
  price: {
    icon: "price",
    name: "Price",
  },
  whereused: {
    icon: "whereused",
    name: "Where Used",
  },
  timeline: {
    icon: "timeline",
    name: "Version Timeline",
  },
  change: {
    icon: "change",
    name: "Change",
  },
  history: {
    icon: "history",
    name: "History",
  },
  obsolete: {
    icon: "obsolete",
    name: "Obsolete",
  },
  cancel: {
    icon: "cancel",
  },
  close: {
    icon: "cancel",
  },
  copy: {
    icon: "copy",
    name: "Copy",
  },
  spec: {
    icon: "spec",
    name: "Spec",
  },
  back: {
    name: "Back",
    icon: "back",
  },
  next: {
    name: "Next",
    icon: "next",
  },
  history: {
    icon: "history",
  },
  visibility: {
    icon: "visibility",
  },
  clearfilter: {
    icon: "unfilter",
  },
  reset: {
    icon: "reset",
  },
  report: {
    icon: "report",
  },
  "approve-reject": {
    name: ["Approve", "Reject"],
    icon: ["approve", "reject"],
    isToggle: true,
  },
  next: {
    icon: "next",
  },
  res_code: {
    icon: "res_code",
    name: " Res Codes",
  },
  legend: {
    icon: "legend",
    name: "Service Code Legend",
  },
};

export const AMPToggleButton = ({ children, ...toggleProps }) => {

  const {
    onToggle = (toggle) => {
    },
    defaultToggle = false,
  } = toggleProps;
  const {
    icon: [onIcon, OffIcon],
    name: [onName, offName] = ["on", "off"],
    ...props
  } = children.props;

  const [toggle, setToggle] = useState(defaultToggle);

  const _toggleProps = (toggle && { icon: onIcon, name: onName }) || {
    icon: OffIcon,
    name: offName,
  };

  const onClick = useCallback(() => {
    const _toggle = !toggle;
    //return true in onToggle to prevent toggle state.
    !onToggle(_toggle) && setToggle(_toggle); //to allow blocking
  }, [toggle]);

  return React.cloneElement(children, {
    ...props,
    ..._toggleProps,
    onClick,
  });
};

export const asToggle = (children, toggleProps) => {
  return React.createElement(AMPToggleButton, {
    children,
    ...toggleProps,
  });
};

export const AMPIconButton = forwardRef((props, ref) => {
  const { type = "default" } = props;
  const selectedIconConfig = ButtonIconConfig[type.toLowerCase()];
  const selectedConfig = ButtonConfig[type.toLowerCase()];
  let newProps = {
    ...ButtonConfig.default,
    ...ButtonIconConfig.default,
    ...selectedConfig,
    mode: ButtonMode.ICON_MINI,
    ...selectedIconConfig,
    ...props,
  };

  return <AMPButton ref={ref} tooltip {...newProps} />;
});

export const AMPPrimaryIconButton = (props) => {
  const DEFAULT_PROPS = {
    color: ColorOptions.ampBrand,
  };

  return <AMPIconButton {...DEFAULT_PROPS} {...props} />;
};

export const AMPGridPrimaryIconButton = (props) => {
  const DEFAULT_PROPS = {
    className: "m-0 ml-2",
    color: ColorOptions.ampBrand,
    size: "md",
  };

  return <AMPIconButton {...DEFAULT_PROPS} {...props} />;
};

export const AMPGridSecondaryIconButton = forwardRef((props, ref) => {
  const DEFAULT_PROPS = {
    className: "m-0 ml-2",
    color: ColorOptions.ampAlternate,
  };

  return <AMPIconButton ref={ref} {...DEFAULT_PROPS} {...props} />;
});

export const AMPGridRowActionIconButton = forwardRef((props, ref) => {
  const DEFAULT_PROPS = {
    className: "mx-1",
    color: ColorOptions.ampBrand,
  };

  return <AMPIconButton ref={ref} {...DEFAULT_PROPS} {...props} />;
});

export const AMPPageHeaderIconButton = (props) => {
  const DEFAULT_PROPS = {
    className: "m-0 ml-2",
    color: ColorOptions.ampLight,
    size: "lg",
  };

  return <AMPIconButton {...DEFAULT_PROPS} {...props} />;
};

export const AMPAccordionHeaderIconButton = (props) => {
  const DEFAULT_PROPS = {
    className: "ml-2 my-0",
    color: ColorOptions.white,
    size: "md",
  };

  return <AMPIconButton {...DEFAULT_PROPS} {...props} />;
};

AMPButton.propTypes = {
  className: PropTypes.string,
  type: PropTypes.oneOf([
    ...Object.keys(ButtonConfig),
    ...Object.keys(ButtonIconConfig),
  ]),
  mode: PropTypes.oneOf(Object.values(ButtonMode)),
  outline: PropTypes.bool,
  backgroundStyle: PropTypes.oneOf([false, "btn-transparent"]),
  hoverStyle: PropTypes.oneOf(["", "btn-transition", "btn-hover-shine"]),
  wider: PropTypes.bool,
  size: PropTypes.string,
  color: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  htmlType: PropTypes.oneOf(["submit", "reset", "button"]),
  shape: PropTypes.oneOf(["square", "circle"]),
  iconProps: PropTypes.object,
  buttonConfig: PropTypes.oneOf([false, PropTypes.object]),
  shadow: PropTypes.bool,
};
