import React from "react";
import { Nav, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";

export const UserBox = React.memo(() => {
  return (
    <div className="header-btn-lg pr-0">
      <div className="widget-content p-0">
        <div className="widget-content-wrapper">
          <div className="widget-content-right">
            <div className="user-box-wrapper">
              <NavDropdown
                title="NS"
                id="collasible-nav-dropdown"
                className="nav-bar-link nav_Link_text_color header-tab round-button"
              >
                <Link className="nav_Link_text_color nav_color" to="#">
                  Search Location
                </Link>
              </NavDropdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const UserBoxNavItem = React.memo(({ icon, title, linkTo }) => (
  <Link to={linkTo}>
    <Nav.Item>
      <div className="nav-link">
        &nbsp;{title}
      </div>
    </Nav.Item>
  </Link>
));
