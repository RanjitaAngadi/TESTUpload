import React, { useEffect } from "react";
import {
  Navbar,
  Nav,
  NavDropdown,
  Form,
  Button,
  FormControl,
  InputGroup,
  Col,
  Row,
} from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  NavLink,
} from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { GoSearch } from "react-icons/go";
import { cursor, DEFAULT_BASE_URL, VERSION } from "../common/const";
import AMPFlexCenter from "../common/AMPFlex/AMPFlexCenter";
import { UserBox } from "./UserBox";
import AMPAuthorization from "../common/AMPAuthorization/AMPAuthorization";
import { useAccessState } from "../../utils/AppContext/loginContext";

const Header = (props) => {
  const { setNotificationMessage, notificationMessage } = props;
  const context = useAccessState();
  const onLogout = () => {
    window.location.href = DEFAULT_BASE_URL + VERSION + "amp/";
    window.sessionStorage.clear();
  };

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

      <i class="fa fa-bell" style={{ color: '#ffa711' }}>({notificationMessage?.length > 0 && notificationMessage?.slice(0, 25)?.length || (JSON.parse(sessionStorage.getItem("notificationMessage")) && (JSON.parse(sessionStorage.getItem("notificationMessage")))?.slice(0, 25)?.length) || 0})</i>

    </a>
  ));

  return (
    <Navbar collapseOnSelect expand="md" className="sticky-nav">
      <div className="container">
        <a className="navbar-brand" href="#">
          <img
            src="src/styles/images/Logo_SPM.png"
            height="53px"
            width="212px"
          />
        </a>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse className="Header" id="responsive-navbar-nav">
          <Nav className="header-tabs">
            <Link
              className=" header-tab p-1"
              to="/Pump/"
              activeclassname="header-tab-active"
            >
              <FaHome size="1.8em" style={cursor} className="mt-2 mr-2 ml-2" />
            </Link>
            <Link
              className="txt-dec-none nav_Link_text_color header-tab"
              style={{ textDecoration: "none" }}
              to="/Pump/receivings"
            >
              Receiving
            </Link>

            <Link
              className="txt-dec-none nav_Link_text_color header-tab "
              style={{ textDecoration: "none" }}
              to="/Pump/WorkOrder"
            >
              Work Order
            </Link>
            <Link
              className="txt-dec-none nav_Link_text_color header-tab"
              style={{ textDecoration: "none" }}
              to="/Pump/PickUp"
            >
              Pickup
            </Link>
            <Link
              className="txt-dec-none nav_Link_text_color header-tab"
              style={{ textDecoration: "none" }}
              to="/Pump/Inventory"
            >
              Inventory
            </Link>
            <Link
              className="txt-dec-none nav_Link_text_color header-tab"
              style={{ textDecoration: "none" }}
              to="/Pump/Billing"
            >
              Billing
            </Link>

            {(context?.features?.includes("AD-CON-QUES") || context?.features?.includes("AD-CON-CT") ||
              context?.features?.includes("AD-CON-CR") || context?.features?.includes("AD-CON-TR") || context?.features?.includes("AD-CON-LT") ||
              context?.features?.includes("AD-MOVE-WA")) ? (
              <NavDropdown
                title="Administration"
                id="collasible-nav-dropdown"
                className="nav_Link_text_color header-tab fn_12 mt_neg5"
              >
                <AMPAuthorization
                  hasToken={context?.features?.includes("AD-CON-QUES")}
                >
                  <NavDropdown.Item
                    href="/Pump/Questionaire"
                    className="txt-dec-none nav_Link_text_color header-tab"
                  >
                    Inspection Questionnaire
                  </NavDropdown.Item>
                </AMPAuthorization>
                <AMPAuthorization
                  hasToken={context?.features?.includes("AD-CON-CT")}
                >
                  <NavDropdown.Item
                    className="txt-dec-none nav_Link_text_color header-tab text-left"
                    href="/Pump/ReplacementComponentConfiguration"
                  >
                    Replacement Component Configuration
                  </NavDropdown.Item>
                </AMPAuthorization>
                <AMPAuthorization
                  hasToken={context?.features?.includes("AD-CON-CR")}
                >
                  <NavDropdown.Item
                    className="txt-dec-none nav_Link_text_color header-tab"
                    href="/Pump/ClearanceRangeConfiguration"
                  >
                    Clearance Range Configuration
                  </NavDropdown.Item>
                </AMPAuthorization>
                <AMPAuthorization
                  hasToken={context?.features?.includes("AD-CON-TR")}
                >
                  <NavDropdown.Item
                    className="txt-dec-none nav_Link_text_color header-tab"
                    href="/Pump/TorqueRangeConfiguration"
                  >
                    Torque Range Configuration
                  </NavDropdown.Item>
                </AMPAuthorization>
                <AMPAuthorization
                  hasToken={context?.features?.includes("AD-CON-LT")}
                >
                  <NavDropdown.Item
                    className="txt-dec-none nav_Link_text_color header-tab"
                    href="/Pump/InventoryLeadTimeConfiguration"
                  >
                    Inventory Lead Time Configuration
                  </NavDropdown.Item>
                </AMPAuthorization>
                <AMPAuthorization
                  hasToken={context?.features?.includes("AD-MOVE-WA")}
                >
                  <NavDropdown.Item
                    className="txt-dec-none nav_Link_text_color header-tab"
                    href="/Pump/moveWorkOrderAndAsset"
                  >
                    Move Work orders and Assets
                  </NavDropdown.Item>
                </AMPAuthorization>

                <AMPAuthorization
                  hasToken={context?.features?.includes("AD-MGT-COMP")}
                >
                  <NavDropdown.Item
                    className="txt-dec-none nav_Link_text_color header-tab"
                    href="/Pump/manageComponents"
                  >
                    Manage Components
                  </NavDropdown.Item>
                </AMPAuthorization>
                <AMPAuthorization
                  hasToken={true}
                >
                  <NavDropdown.Item
                    className="txt-dec-none nav_Link_text_color header-tab"
                    href="/Pump/manageAssets"
                  >
                    Manage Assets
                  </NavDropdown.Item>
                </AMPAuthorization>
                <AMPAuthorization
                  hasToken={true}
                >
                  <NavDropdown.Item
                    className="txt-dec-none nav_Link_text_color header-tab"
                    href="/Pump/studentDetails"
                  >
                    Student Details
                  </NavDropdown.Item>
                </AMPAuthorization>
              </NavDropdown>) : (
              <NavDropdown
                title="Administration"
                id="collasible-nav-dropdown"
                className="nav_Link_text_color header-tab fn_12 mt_neg5"
              >
                <NavDropdown.Item
                  className="txt-dec-none nav_Link_text_color header-tab text-center text-danger"
                >
                  {AMPAuthorization.defaultProps?.errMessage}
                </NavDropdown.Item>
              </NavDropdown>
            )}


          </Nav>
          {context?.isNotificationEnabled === "True" && <Nav className="ml-auto header-tabs">
            <Dropdown className="nav_Link_text_color header-tab fn_12 mt_neg5">
              <Dropdown.Toggle as={CustomToggle} />
              <Dropdown.Menu size="sm" title="" className=" dropdown-notification border border-left-0">
                {/* show 25 latest notifications */}
                {((notificationMessage?.length > 0 && notificationMessage?.slice(0, 25)) || (JSON.parse(sessionStorage.getItem("notificationMessage")) && JSON.parse(sessionStorage.getItem("notificationMessage"))?.slice(0, 25)))?.map((item, idx) => {
                  return <Dropdown.Header className="txt-dec-none bg-notification w-100 fw-bold text-left">{item}</Dropdown.Header>
                })}
                {(notificationMessage?.length === 0 && !JSON.parse(sessionStorage.getItem("notificationMessage"))) &&
                  <Dropdown.Header className="txt-dec-none bg-notification border-bottom w-100 fw-bold text-left text-center">No Notification</Dropdown.Header>}
              </Dropdown.Menu>
            </Dropdown>
          </Nav>}
          <Nav className="ml-auto header-tabs">

            <NavDropdown
              title={(context?.firstName + " " + context?.lastName)
                .split(" ")
                .map((n) => n[0]?.toUpperCase())
                .join("")}
              alignRight
              id="collasible-nav-dropdown"
              className="nav_Link_text_color header-tab fn_12 mt_neg5"
            >
              <Link
                className="txt-dec-none nav_Link_text_color header-tab"
                to=""
                onClick={onLogout}
              >
                Logout
              </Link>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
}

export default Header;
