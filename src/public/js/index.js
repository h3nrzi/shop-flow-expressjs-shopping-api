// @ts-nocheck

import { createProductForm, loginForm, logoutButton } from "./domElements.js";
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

////////////////

if (createProductForm) {
	createProductForm.addEventListener("submit", async e => {
		e.preventDefault();

		const form = e.target;
		const formData = new FormData(form);
		const data = Object.fromEntries(formData.entries());

		data.countInStock = parseInt(data.countInStock);
		data.rating = parseFloat(data.rating);
		data.numReviews = parseInt(data.numReviews);
		data.price = parseFloat(data.price);
		data.discount = parseFloat(data.discount);
		data.isAvailable = data.isAvailable === "on";

		try {
			const res = await axios.post("/api/products", data, {
				withCredentials: true,
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (res.data.status === "success") window.location.href = "/admin";
		} catch (err) {
			console.log(err);
			window.alert(err.response.data.message);
		}
	});
}

// if (deleteButtons) {
// 	deleteButtons.forEach(button => {
// 		button.addEventListener("click", handleDelete);
// 	});
// }

if (loginForm) {
	loginForm.addEventListener("submit", async event => {
		event.preventDefault();

		const form = event.target;
		const formData = new FormData(form);
		const data = Object.fromEntries(formData.entries());

		try {
			const response = await axios.post("/api/users/login", data, {
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (response.status === 200) window.location.href = "/admin";
		} catch (error) {
			window.alert(error.message);
		}
	});
}

if (logoutButton) {
	logoutButton.addEventListener("click", async () => {
		try {
			const res = await axios.post("/api/users/logout");
			if (res.status === 204) window.location.reload();
		} catch (error) {
			window.alert(error.message);
		}
	});
}
