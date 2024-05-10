import React from "react";
import ReactDOM from "react-dom";
import "./styles/App.scss";
import "./styles/theme.scss";
import "./styles/utilities.scss";
import "./styles/_AMPFields.scss";
import "./styles/_AMPFloatingLabel.scss";
import "./styles/_AMPDropdown.scss";
import "./styles/AMPFieldSet.scss";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import "./styles/_AMPAccordions.scss";
import "./styles/_AMPButton.scss";
import "./styles/table.scss";
import "./styles/_variables.scss";
import "react-toastify/dist/ReactToastify.css";
import {
  AccessProvider,
  useAccessDispatch,
} from "./utils/AppContext/loginContext";
import Main from "./Main";

const App = () => {
  const params = new window.URLSearchParams(window.location.search);
  return (
  
    <AccessProvider>
      <div className="app-container">  
        <Main />
      </div>
    </AccessProvider>
  );
};
ReactDOM.render(<App />, document.getElementById("root"));
