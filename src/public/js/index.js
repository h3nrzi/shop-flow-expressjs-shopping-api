// @ts-nocheck

import { form, deleteButtons, elements } from "./domElements.js";
import { createProduct, deleteProduct } from "./api.js";

const handleSubmit = (e) => {
  e.preventDefault();

  const data = {
    name: elements.name.value,
    description: elements.description.value,
    image: elements.image.value,
    images: elements.images.value.split(","),
    countInStock: parseInt(elements.countInStock.value),
    isAvailable: elements.isAvailable.value === "on",
    category: elements.category.value,
    brand: elements.brand.value,
    price: parseFloat(elements.price.value),
    discount: parseFloat(elements.discount.value),
  };

  createProduct(data);
};

const handleDelete = (e) => {
  const productId = e.target.getAttribute("data-id");
  deleteProduct(productId);
};

form.addEventListener("submit", handleSubmit);

deleteButtons.forEach((button) => {
  button.addEventListener("click", handleDelete);
});