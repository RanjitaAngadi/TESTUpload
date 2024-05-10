import { eq, get } from "lodash";
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import { anyPass, isNil, isEmpty } from "ramda";

export function omit(obj, omitKeys) {
  var result = {};
  Object.keys(obj).forEach(function (key) {
    if (omitKeys.indexOf(key) === -1) {
      result[key] = obj[key];
    }
  });
  return result;
}

export const isEmptyOrNull = anyPass([isNil, isEmpty]);
/**
 * Returns a filtered copy of an object with only the specified keys.
 */
export function pick(obj, keys) {
  var pickKeys = Array.isArray(keys) ? keys : [keys];
  var length = pickKeys.length;
  var key;
  var result = {};

  while (length > 0) {
    length -= 1;
    key = pickKeys[length];
    result[key] = obj[key];
  }

  return result;
}

export function getObjectBySelector(sourceObj, selector) {
  let selectors = selector.split(".");
  let val = sourceObj;
  selectors.forEach((e) => {
    if (!val || val === null) {
      return false; //to break
    }
    val = val[e];
  });
  return val;
}

export const lodashUtils = {
  eq,
  get,
  cloneDeep,
  isEqual,
};

/*
cond format :
{
  cond1:{id:1,value:'A'}
  cond2:{id:4,value:'D'}
}
out = {cond1:[item1,item10],cond2:[item2,...matching items]}
*/
export const pickObjFromArray = (src, cond) => {
  let out = {};
  const condListArray = Object.entries(cond);
  condListArray.forEach(([condKey]) => {
    out[condKey] = [];
  });
  src.forEach((item, i) => {
    condListArray.forEach(([condKey, condObj]) => {
      let match = true;
      Object.entries(condObj).forEach(([key, value]) => {
        match = match && item[key] === value;
      });
      if (match) {
        out[condKey].push(item);
      }
    });
  });
  return out;
};

const fallbackCopyTextToClipboard = (text) => {
  let textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
};

export const copyTextToClipboard = (text) => {
  (navigator.clipboard && navigator.clipboard.writeText(text)) ||
    fallbackCopyTextToClipboard(text);
};

export const print = (elem) => {
  debugger;
  let frame = document.createElement("IFRAME");
  frame.domain = document.domain;
  frame.style.position = "absolute";
  frame.style.top = "-10000px";
  document.body.appendChild(frame);
  frame.domain = document.domain;
  frame.contentDocument.write(elem.innerHTML);
  frame.contentWindow.scrollTo(600, 0);
  frame.contentWindow.print();
  frame.parentNode.removeChild(frame);
};
