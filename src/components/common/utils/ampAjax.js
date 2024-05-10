import { ajax } from "rxjs/ajax";
import {
  DEFAULT_AJAX_JSON_SETTINGS,
  DEFAULT_AJAX_FORM_SETTINGS,
  DEFAULT_AJAX_STREAM_SETTINGS,
  DEFAULT_AJAX_EXCEL_SETTINGS,
  DEFAULT_AJAX_JSON_PUT_SETTINGS,
  DEFAULT_AJAX_POST_FILE_JSON_SETTINGS,
} from "../const";
import * as queryString from "query-string";
import Axios from "axios";
export { queryString };
//This is for content-type JSON
export const ampJsonAjax = {
  get: (
    url,
    headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${window.sessionStorage.getItem("token")}`,
    },
    settings = {}
  ) =>
    ajax({
      ...DEFAULT_AJAX_JSON_SETTINGS,
      method: "GET",
      url,
      headers,
      ...settings,
    }),
  post: (
    url,
    body,
    headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${window.sessionStorage.getItem("token")}`,
    },
    settings = {}
  ) => ajax({ ...DEFAULT_AJAX_JSON_SETTINGS, url, body, headers, ...settings }),
  postFile: (
    url,
    body,
    headers = {
      Authorization: `Bearer ${window.sessionStorage.getItem("token")}`,
    },
    settings = {}
  ) =>
    ajax({
      ...DEFAULT_AJAX_POST_FILE_JSON_SETTINGS,
      url,
      body,
      headers,
      ...settings,
    }),
  put: (
    url,
    body,
    headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${window.sessionStorage.getItem("token")}`,
    },
    settings = {}
  ) =>
    ajax({
      ...DEFAULT_AJAX_JSON_PUT_SETTINGS,
      url,
      body,
      headers,
      ...settings,
    }),
  delete: (
    url,
    headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${window.sessionStorage.getItem("token")}`,
    }
  ) => ajax({ ...DEFAULT_AJAX_JSON_SETTINGS, method: "DELETE", url, headers }),
};

//This is for form URL encoded
export const ampFormAjax = {
  get: (url, headers = DEFAULT_AJAX_FORM_SETTINGS.headers, settings = {}) =>
    ajax({
      ...DEFAULT_AJAX_FORM_SETTINGS,
      method: "GET",
      url,
      headers,
      ...settings,
    }),
  post: (
    url,
    body,
    headers = DEFAULT_AJAX_FORM_SETTINGS.headers,
    settings = {}
  ) => ajax({ ...DEFAULT_AJAX_FORM_SETTINGS, url, body, headers, ...settings }),
  delete: (url, headers = DEFAULT_AJAX_FORM_SETTINGS.headers) =>
    ajax({ ...DEFAULT_AJAX_FORM_SETTINGS, method: "DELETE", url, headers }),
};

//This is for accept OCTET-STREAM
export const ampOctetStreamAjax = {
  get: (
    url,
    headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${window.sessionStorage.getItem("token")}`,
      ...DEFAULT_AJAX_STREAM_SETTINGS.headers,
    }
  ) => ajax({ ...DEFAULT_AJAX_STREAM_SETTINGS, method: "GET", url, headers }),
  post: (
    url,
    body,
    headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${window.sessionStorage.getItem("token")}`,
      ...DEFAULT_AJAX_STREAM_SETTINGS.headers,
    }
  ) => ajax({ ...DEFAULT_AJAX_STREAM_SETTINGS, url, body, headers }),
};

//This is for accept MS-EXCEL
export const ampExcelAjax = {
  get: (url, headers = DEFAULT_AJAX_EXCEL_SETTINGS.headers) =>
    ajax({ ...DEFAULT_AJAX_EXCEL_SETTINGS, method: "GET", url, headers }),
  post: (url, body, headers = DEFAULT_AJAX_EXCEL_SETTINGS.headers) =>
    ajax({ ...DEFAULT_AJAX_EXCEL_SETTINGS, url, body, headers }),
};
