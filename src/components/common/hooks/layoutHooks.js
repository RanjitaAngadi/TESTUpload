import React, { useContext, useEffect } from "react";

const LayoutContext = React.createContext({ contentHeight: 200 });
export const useContentHeight = ({ delta = 130, minHeight = 200 } = {}) => {
  const layoutContext = useContext(LayoutContext);
  const contentHeight = layoutContext.contentHeight - delta;
  if (contentHeight < minHeight) return minHeight;
  return contentHeight;
};
