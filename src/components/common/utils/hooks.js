import React, { useEffect } from "react";

//-----------------------------------------
// useClickedOutside fo detect click event
// on the passed ref
//-----------------------------------------

export const useClickedOutside = (ref, callBack) => {
  useEffect(() => {
    const monitor = setInterval(function() {
      const elem = document.activeElement;
      if (elem && elem.tagName == "IFRAME") {
        callBack();
      }
    }, 100);
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callBack();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(monitor);
    };
  }, [ref, callBack]);
};
