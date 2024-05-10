import React, { useEffect, useState } from "react";

const useAutoLogout = (startTime) => {
  const [timer, setTimer] = useState(startTime);
  useEffect(() => {
    const myInterval = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1);
      }
    }, 90000);
    const resetTimeout = () => {
      setTimer(startTime);
    };
    const events = [
      "load",
      "mousemove",
      "mousedown",
      "click",
      "scroll",
      "keypress",
    ];
    for (let i in events) {
      if(timer > 0)
      window.addEventListener(events[i], resetTimeout);
    }
    return () => {
      clearInterval(myInterval);
      for (let i in events) {
        window.removeEventListener(events[i], resetTimeout);
      }
    };
  });
  return timer;
};

export default useAutoLogout;
