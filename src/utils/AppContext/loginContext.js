import React from "react";
const accessStateContext = React.createContext();
const accessDispatchContext = React.createContext();

function AccessReducer(state, action) {
  switch (action.type) {
    case "login": {
      return {
        token: action?.payload?.token,
        userName: action?.payload?.userName,
        features: action?.payload?.features,
        firstName: action?.payload?.firstName,
        lastName: action?.payload?.lastName,
        userType: action?.payload?.userType,
        userId: action?.payload?.userId,
        claim: action?.payload?.claim,
        serviceCenterIds: action?.payload?.serviceCenterIds,
        isNotificationEnabled: action?.payload?.isNotificationEnabled,
        login: true,
      };
    }
    case "logout": {
      return {
        token: action?.payload?.token,
        userName: action?.payload?.userName,
        features: action?.payload?.features,
        firstName: action?.payload?.firstName,
        lastName: action?.payload?.lastName,
        userType: action?.payload?.userType,
        userId: action?.payload?.userId,
        claim: action?.payload?.claim,
        serviceCenterIds: action?.payload?.serviceCenterIds,
        isNotificationEnabled: action?.payload?.isNotificationEnabled,
        login: false,
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function AccessProvider({ children }) {
  const [state, dispatch] = React.useReducer(AccessReducer, {
    token: "",
    userName: "",
    features: "",
    firstName: "",
    lastName: "",
    userType: "",
    userId: "",
    claim: "",
    serviceCenterIds:"",
    login: false,
    isNotificationEnabled:""
  });

  return (
    <accessStateContext.Provider value={state}>
      <accessDispatchContext.Provider value={dispatch}>
        {children}
      </accessDispatchContext.Provider>
    </accessStateContext.Provider>
  );
}

function useAccessState() {
  const context = React.useContext(accessStateContext);
  if (context === undefined) {
    throw new Error("useAccessState must be used within a AccessProvider");
  }
  return context;
}

function useAccessDispatch() {
  const context = React.useContext(accessDispatchContext);
  if (context === undefined) {
    throw new Error("useAccessDispatch must be used within a AccessProvider");
  }
  return context;
}

export { AccessProvider, useAccessState, useAccessDispatch };
