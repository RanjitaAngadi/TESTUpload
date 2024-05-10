export const RESPONSE_TYPES = {
  string: { responseType: "string" },
  blob: { responseType: "blob" },
  json: { responseType: "json" },
};

// Need to replace with `Bearer ${sessionStorage.token}`;

const Authorization = "";

export const AJAX_HEADER_AMP_REACT = {
  "amp-react": "true",
};

export const AJAX_HEADER_FORM_URLENCODED = {
  "Content-Type": "application/x-www-form-urlencoded",
};

export const AJAX_HEADER_JSON = {
  "Content-Type": "application/json",
  // Authorization: `Bearer ${window.sessionStorage.getItem("token")}`,
};

export const AJAX_HEADER_STREAM = {
  Accept: "application/octet-stream",
};

export const AJAX_HEADER_EXCEL = {
  Accept: "application/vnd.ms-excel",
};

export const AJAX_HEADER_APP_DEFAULT = {
  ...AJAX_HEADER_AMP_REACT,
  ...AJAX_HEADER_FORM_URLENCODED,
};

export const AJAX_HEADER_APP_JSON_DEFAULT = {
  ...AJAX_HEADER_AMP_REACT,
  ...AJAX_HEADER_JSON,
};

export const AJAX_HEADER_APP_STREAM_DEFAULT = {
  ...AJAX_HEADER_JSON,
  ...AJAX_HEADER_STREAM,
};

export const AJAX_HEADER_APP_EXCEL_DEFAULT = {
  ...AJAX_HEADER_JSON,
  ...AJAX_HEADER_EXCEL,
};
export const AJAX_HEADER_POST_FILE_DEFAULT = {
  Authorization: Authorization,
};

export const DEFAULT_AJAX_POST_FILE_JSON_SETTINGS = {
  headers: AJAX_HEADER_POST_FILE_DEFAULT,
  method: "POST",
};
export const DEFAULT_AJAX_JSON_SETTINGS = {
  timeout: 1200000,
  headers: AJAX_HEADER_APP_JSON_DEFAULT,
  method: "POST",
};

export const DEFAULT_AJAX_JSON_PUT_SETTINGS = {
  timeout: 1200000,
  headers: AJAX_HEADER_APP_JSON_DEFAULT,
  method: "PUT",
};

export const DEFAULT_AJAX_FORM_SETTINGS = {
  timeout: 1200000,
  headers: AJAX_HEADER_APP_DEFAULT,
  method: "POST",
};

export const DEFAULT_AJAX_STREAM_SETTINGS = {
  timeout: 1200000,
  headers: AJAX_HEADER_APP_STREAM_DEFAULT,
  method: "POST",
  ...RESPONSE_TYPES.blob,
};

export const DEFAULT_AJAX_EXCEL_SETTINGS = {
  timeout: 1200000,
  headers: AJAX_HEADER_APP_EXCEL_DEFAULT,
  method: "POST",
  ...RESPONSE_TYPES.blob,
};
