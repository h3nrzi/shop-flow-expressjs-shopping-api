// @ts-nocheck

export const hideAlert = () => {
  const el = document.querySelector(".alert");
  if (el) el.parentElement.removeChild(el);
};

export const showAlert = (type, message) => {
  hideAlert();
  const markup = `<div dir="rtl" class="alert alert-${type} mt-3">${message}</div>`;
  document.querySelector("form").insertAdjacentHTML("afterend", markup);
  window.setTimeout(hideAlert, 5000);
};