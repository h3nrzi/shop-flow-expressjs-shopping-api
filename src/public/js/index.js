// @ts-nocheck

import { form, deleteButtons, elements,loginForm } from "./domElements.js";
// import { createProduct, deleteProduct } from "./api.js";

// const handleSubmit = (e) => {
//   e.preventDefault();
//
//   const data = {
//     name: elements.name.value,
//     description: elements.description.value,
//     image: elements.image.value,
//     images: elements.images.value.split(","),
//     countInStock: parseInt(elements.countInStock.value),
//     isAvailable: elements.isAvailable.value === "on",
//     category: elements.category.value,
//     brand: elements.brand.value,
//     price: parseFloat(elements.price.value),
//     discount: parseFloat(elements.discount.value),
//   };
//
//   createProduct(data);
// };
//
// const handleDelete = (e) => {
//   const productId = e.target.getAttribute("data-id");
//   deleteProduct(productId);
// };

const handleLogin = async (event) => {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  console.log(data);

  try {
    const response = await axios.post("/api/users/login", data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200)
      window.location.href = '/admin';

  } catch (error) {
    window.alert('Error: ' + error.message);
  }
}

////////////////

// if(form){
//   form.addEventListener("submit", handleSubmit);
// }
//
// if(deleteButtons){
//   deleteButtons.forEach((button) => {
//     button.addEventListener("click", handleDelete);
//   });
// }

if(loginForm) {
  loginForm.addEventListener('submit', handleLogin);
}