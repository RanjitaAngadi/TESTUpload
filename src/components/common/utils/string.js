export const substitute = (template, obj) =>
  template.replace(/\${([a-z0-9_]+)}/gi, (match, capture) => obj[capture]);

export const sanatizeHtml = s => {
  const div = document.createElement("div");
  div.innerHTML = s;
  const scripts = div.getElementsByTagName("script");
  let i = scripts.length;
  while (i--) {
    scripts[i].parentNode.removeChild(scripts[i]);
  }
  return div.innerHTML;
};

export const textTruncate = (str, num) => {
  let ending = "...";
  let val = undefined;
  str
    ? str.length > num
      ? (val = str.substring(0, num - ending.length) + ending)
      : (val = str)
    : (val = null);
  if (val) val = val.split(",").join(", ");
  return val;
};

export const exhortHTML = (text) => {
  const span = document.createElement('span');

  return text
  .replace(/&[#A-Za-z0-9]+;/gi, (entity,position,text)=> {
      span.innerHTML = entity;
      return span.innerText;
  });
}