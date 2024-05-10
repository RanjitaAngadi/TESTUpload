import React, { useEffect, useState } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { decode as base64_decode, encode as base64_encode } from 'base-64';
import ReactGA from 'react-ga';
import jwt_decode from "jwt-decode";
import Loader from "react-loader-spinner";
import "./styles/App.scss";
import "./styles/theme.scss";
import "./styles/utilities.scss";
import "./styles/_AMPFields.scss";
import "./styles/_AMPFloatingLabel.scss";
import "./styles/_AMPDropdown.scss";
import "./styles/AMPFieldSet.scss";
import "./styles/AMPTabs.scss";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import "regenerator-runtime/runtime.js";
import Home from "./Home";
//import Documentation from "./components/mainComponent/Documentation";
import WorkOrderByLocation from "./components/workOrders/index";
import Footer from "./components/mainComponent/Footer";
import Header from "./components/mainComponent/Header";
import { toast } from "react-toastify";
import {
  AccessProvider,
  useAccessDispatch,
  useAccessState,
} from "./utils/AppContext/loginContext";
import Questionaire from "./components/systemAdmin";
import { DEFAULT_BASE_URL, GET_PUSH_NOTIFICATION, VERSION, ConstVariable } from "./components/common/const";
import ReceivingForm from "./components/receivingForm/ReceivingForm";
import ReceivingFullForm from "./components/receivingForm/ReceivingFullForm";
import WorkOrderForm from "./components/workOrders/WorkOrderForm";
import history from "./history.js";
import { ReplacementComponentConfiguration } from "./components/systemAdmin/componentConfiguration/ReplacementComponentConfiguration";
import InspectionForm from "./components/inspectionForm/index";
import { ClearanceRangesConfiguration } from "./components/systemAdmin/componentConfiguration/ClearanceRangeConfiguration";
import { TorqueRangesConfiguration } from "./components/systemAdmin/componentConfiguration/TorqueRangeConfiguration";
import { InventoryLeadTimeConfiguration } from "./components/systemAdmin/componentConfiguration/InventoryLeadTimeConfiguration";
import PickUpForm from "./components/pickUp";
import InventoryForm from "./components/inventory";
import PickUpEntryForm from "./components/pickUp/pickUpEntryForm";
import { CreateOrUpdateInventory } from "./components/inventory/createOrUpdateInventory";
import { InspectionReport } from "./components/workOrders/InspectionReport";
import { ReceivingReport } from "./components/workOrders/ReceivingReport";
import useAutoLogout from "./useAutoLogout";
import MoveWorkOrderAndAsset from "./components/systemAdmin/MoveWorkOrdersAndAsset";
import BillingForm from "./components/billingForm"
import ManagePartComponent from "./components/systemAdmin/managePartComponent/managePartComponent";
import ManageAssets from "./components/systemAdmin/manageAssets/manageAssets";
import AssetDetails from "./components/systemAdmin/manageAssets/assetDetails";
import AddOrEditAsset from "./components/systemAdmin/manageAssets/addOrEditAsset";
import StudentDetail from "./components/systemAdmin/studentDetails/studentDetail";
import ManageStudent from "./components/systemAdmin/studentDetails/manageStudent";
import AddStudent from "./components/systemAdmin/studentDetails/AddStudent";
import Studentlist from "./components/systemAdmin/studentDetails/studentlist";

const Main = () => {
  const context = useAccessState();
  const [stateData, setStateData] = useState();
  const [showHomeUrl, setHomeUrl] = useState(false);
  const [loggout, setLogout] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState([])

  const params = new window.URLSearchParams(window.location.search);
  // var claim = params.get("claim");
  var claim = "133da8d0-72ec-eb11-940c-b8ca3a676d9f"; //pumpadmin
  // var claim = "F149F0E7-B546-EC11-940D-B8CA3A676D9D"; //pump inventory
  // var claim = "a0fadd0c-7ef7-ec11-8105-00505689d479"; //management local

  const dispatch = useAccessDispatch();
  const timer = useAutoLogout(10);
  if (timer === 0) {
    sessionStorage.clear();
    window.location.href = DEFAULT_BASE_URL + VERSION + "amp/";
  }
  useEffect(() => {
    let token = window.sessionStorage.getItem("token");
    let sessionClaim = window.sessionStorage.getItem("claim");
    if (window.sessionStorage.getItem("token")) {
      const { exp } = jwt_decode(window.sessionStorage.getItem("token"));
      const expirationTime = exp * 1000 + 60000;
      if (Date.now() >= expirationTime) {
        sessionStorage.clear();
        setLogout(true);
        window.location.href = DEFAULT_BASE_URL + VERSION + "amp/";
      }

      const decode = jwt_decode(window.sessionStorage.getItem("token"));
      //const token = window.sessionStorage.getItem("token");
      const tokenDetails = {
        features: decode.Role,
        firstName: decode?.FirstName,
        lastName: decode?.LastName,
        userName: decode?.UserName,
        userType: decode?.UserType,
        userId: decode?.UserId,
        token: window.sessionStorage.getItem("token"),
        claim: claim,
        serviceCenterIds: decode?.ServiceCenterIds,
        isNotificationEnabled: decode?.IsNotificationEnabled,
      };
      dispatch({ type: "login", payload: tokenDetails });
    }

    else if (sessionClaim !== claim || !token) {
      fetch(
        DEFAULT_BASE_URL +
        VERSION +
        `pumpapi/authorize/${claim ? claim : window.sessionStorage.getItem("claim")
        }`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      )
        .then((response) => {
          if (!response.ok) {
            dispatch({ type: "logout", payload: "" });
            setStateData((state) => ({
              ...state,
              loginError: true,
            }));

            //window.location.href = DEFAULT_BASE_URL + VERSION + "amp/";
            // <Redirect to="/amp" />;
          } else return response.json();
        })
        .then((data) => {
          const decode = jwt_decode(data.token);

          const token = data.token;
          const tokenDetails = {
            features: decode.Role,
            firstName: decode?.FirstName,
            lastName: decode?.LastName,
            userName: decode.UserName,
            userType: decode?.UserType,
            userId: decode?.UserId,
            token: token,
            claim: claim,
            serviceCenterIds: decode?.ServiceCenterIds,
            isNotificationEnabled: decode?.IsNotificationEnabled,
          };
          dispatch({ type: "login", payload: tokenDetails });
          setStateData((data) => ({
            token: data?.token,
            loginError: false,
          }));
          window.sessionStorage.setItem("token", data.token);
          if (claim) {
            window.sessionStorage.setItem("claim", claim);
          }
          if (params.has("claim")) {
            setHomeUrl(true);
          }
        })
        .catch((error) => {
          // <Redirect to="/amp" />;
          console.log("error: " + error);
        });
    }
  }, []);
  const authorisationData = base64_encode(ConstVariable.USR_NAME + ":" + ConstVariable.USR_PWD);
  // For notification service
  useEffect(() => {
    if (context?.token && context?.isNotificationEnabled === "True") {
      let connection = new HubConnectionBuilder().withUrl(DEFAULT_BASE_URL + VERSION + GET_PUSH_NOTIFICATION +
        "?UserId=" + context?.userId + "&Authorization=" + authorisationData).build();
      connection.start()
        .then(result => {
          connection.on('ReceiveNotification', data => {
            const sessionNotification = [];
            const storeData = JSON.parse(sessionStorage.getItem("notificationMessage"));
            if (storeData?.length > 0) {
              sessionNotification.push(data, ...JSON.parse(sessionStorage.getItem("notificationMessage")));
            }
            else {
              sessionNotification.push(data)
            }
            window.sessionStorage.setItem("notificationMessage", JSON.stringify(sessionNotification));
            setNotificationMessage(JSON.parse(sessionStorage.getItem("notificationMessage")));
            toast(<div><i className="fa fa-bell icon-d"></i> {data}</div>, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              className: 'pointer-none',

            });
          })
        })
        .catch(err => console.log(err));
    }
  }, [context?.token]);
  // For google analytics purpose    
  ReactGA.initialize(window.location.origin?.includes("ampppweb") ? 'UA-158915880-1' : (window.location.origin)?.includes("weirinaction") ? 'UA-158915880-3' : (window.location.origin)?.includes("ampdev") ? 'G-C08VWPWR20' : 'UA-158915880-2');
  return (
    <>
      <Router history={history}>
        {showHomeUrl && <Redirect to="/Pump/" />}
        {context?.token ? (
          <>
            <Header setNotificationMessage={setNotificationMessage} notificationMessage={notificationMessage} />
            <div className="container-form-fluid">
              <Switch>
                <Route
                  exact
                  path="/amp"
                  render={() => {
                    return <Redirect to="/Pump/" />;
                  }}
                />
                <Route exact path="/Pump/" component={Home}></Route>
                <Route path="/Pump/receivings" component={ReceivingForm}>
                </Route>
                <Route
                  path="/Pump/ReceivingFullForm"
                >
                  <ReceivingFullForm isCreate={true} />
                </Route>
                <Route
                  path={`/Pump/UpdateReceivingFullForm`}
                >
                  <ReceivingFullForm isCreate={false} />
                </Route>
                <Route path="/Pump/WorkOrder">
                  <WorkOrderByLocation />
                </Route>
                <Route
                  path={`/Pump/EditWorkOrder`}
                >
                  <WorkOrderForm isCreate={false} />
                </Route>
                <Route
                  path={`/Pump/CreateOrUpdateAsset`}
                >
                  <ReceivingFullForm />
                </Route>
                <Route exact path="/Pump/Questionaire">
                  <Questionaire />
                </Route>
                <Route exact path="/Pump/ReplacementComponentConfiguration">
                  <ReplacementComponentConfiguration />
                </Route>
                <Route exact path="/Pump/inspectionForm">
                  <InspectionForm />
                </Route>
                <Route exact path="/Pump/ClearanceRangeConfiguration">
                  <ClearanceRangesConfiguration />
                </Route>
                <Route exact path="/Pump/TorqueRangeConfiguration">
                  <TorqueRangesConfiguration />
                </Route>
                <Route exact path="/Pump/InventoryLeadTimeConfiguration">
                  <InventoryLeadTimeConfiguration />
                </Route>
                <Route path={`/Pump/moveWorkOrderAndAsset`}>
                  <MoveWorkOrderAndAsset />
                </Route>
                <Route path="/Pump/PickUp">
                  <PickUpForm />
                </Route>
                <Route exact path="/Pump/Inventory">
                  <InventoryForm />
                </Route>
                <Route exact path="/Pump/createOrUpdateInventory">
                  <CreateOrUpdateInventory />
                </Route>
                <Route
                  path={`/Pump/InitiatePickUp`}
                >
                  <PickUpEntryForm isCreate={true} />
                </Route>
                <Route
                  path={`/Pump/UpdatePickup`}
                >
                  <PickUpEntryForm isCreate={false} />
                </Route>
                <Route exact path={`/Pump/InspectionReport`}>
                  <InspectionReport />
                </Route>
                <Route exact path={`/Pump/ReceivingReport`}>
                  <ReceivingReport />
                </Route>
                <Route exact path={`/Pump/Billing`}>
                  <BillingForm />
                </Route>
                <Route exact path={`/Pump/manageComponents`}>
                  <ManagePartComponent />
                </Route>
                <Route exact path={`/Pump/manageAssets`}>
                  <ManageAssets />
                </Route>
                <Route exact path={`/Pump/manageAssets/assetDetails`}>
                  <AssetDetails />
                </Route>
                <Route exact path={`/Pump/manageAssets/addOrEditAsset`}>
                  <AddOrEditAsset />
                </Route>
                <Route exact path={`/Pump/studentDetails`}>
                  <StudentDetail/>
                </Route>
                <Route exact path={`/Pump/studentDetails/manageStudent`}>
                  <ManageStudent/>
                </Route>
                <Route exact path={`/Pump/studentDetails/AddStudent`}>
                  <AddStudent/>
                </Route>
                <Route exact path={`/Pump/studentDetails/studentlist`}>
                  <Studentlist/>
                </Route>
              </Switch>
            </div>
          </>
        ) : (
          <div className="container-form-fluid text-center">
            <Loader type="ThreeDots" color="#00BFFF" height={100} width={100} />
          </div>
        )}
      </Router>

      <Footer />
    </>
  );
};
export default Main;
