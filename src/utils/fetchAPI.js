const version = "03";
const domainURL = `http://fw-ampqa-${version}/pumpapi/`;
// for get url request
const getFetch = (url) =>
  fetch(`${domainURL}${url}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((response) => response)
    .catch((err) => console.log(err));

const postFetch = (url, body) =>
  fetch(`${domainURL}${url}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((response) => response)
    .catch((err) => console.log(err));

const getFetch1 = (url) =>
  fetch(`${domainURL}${url}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Unauthorized Api Call");
      } else if (response.status === 403) {
        throw new Error("Forbidden Api Call");
      } else {
        return response.json();
      }
    })
    .then((response) => response)
    .catch((err) => console.log(err));

export { getFetch, postFetch, getFetch1 };
