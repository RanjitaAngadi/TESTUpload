import { useEffect, useState } from "react";

export const useObservable = (
  observable,
  defaultValue = null,
  dependencies = []
) => {
  const [state, setState] = useState(defaultValue);

  useEffect(() => {
    const sub = observable.subscribe(setState);
    return () => sub.unsubscribe();
  }, [observable, ...dependencies]);

  return state;
};

// export const useObservableRedux = (
//   observable,
//   reduxAction,
//   reduxSelector = undefined,
//   defaultValue,
//   dependencies = []
// ) => {
//   const dispatch = useDispatch();

//   const result = useSelector((state) => {
//     if (typeof reduxSelector === "string") {
//       return lodashUtils.get(state, reduxSelector);
//     } else if (typeof reduxSelector === "function") {
//       return reduxSelector(state);
//     } else {
//       return undefined;
//     }
//   });

//   useEffect(() => {
//     if (isEmptyOrNull(result)) {
//       const sub = observable.subscribe((val) => {
//         dispatch(reduxAction(val));
//       });
//       return () => sub.unsubscribe();
//     }
//   }, [observable, ...dependencies]);

//   return result || defaultValue;
// };

export const useObservableCallback = (
  observable,
  callback,
  errorCallback = undefined,
  dependencies = []
) => {
  useEffect(() => {
    const sub = observable.subscribe(callback, errorCallback);
    return () => sub.unsubscribe();
  }, [observable, ...dependencies]);
};
