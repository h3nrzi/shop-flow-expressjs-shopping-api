// @ts-nocheck

import {
	createProductForm,
	deleteProductButtons,
	editProductForm,
	imageInput,
	imagesInput,
	imagesUploader,
	imageUploader,
	loginForm,
	logoutButton,
} from "./domElements.js";
import { createProduct, deleteProduct, editProduct, login, logout, uploadImage } from "./api.js";

if (createProductForm) {
	createProductForm.addEventListener("submit", async e => {
		e.preventDefault();

		// Extract data form formData
		const form = e.target;
		const formData = new FormData(form);
		const data = Object.fromEntries(formData.entries());

		// Parse string values into integer
		data.countInStock = parseInt(data.countInStock);
		data.rating = parseFloat(data.rating);
		data.numReviews = parseInt(data.numReviews);
		data.price = parseFloat(data.price);
		data.discount = parseFloat(data.discount);
		data.isAvailable = data.isAvailable === "on";

		// Mutation
		await createProduct(data);
	});
}

if (editProductForm) {
	editProductForm.addEventListener("submit", async e => {
		e.preventDefault();

		// Extract data form formData
		const form = e.target;
		const formData = new FormData(form);
		const data = Object.fromEntries(formData.entries());

		// Parse string values into integer
		data.countInStock = parseInt(data.countInStock);
		data.rating = parseFloat(data.rating);
		data.numReviews = parseInt(data.numReviews);
		data.price = parseFloat(data.price);
		data.discount = parseFloat(data.discount);
		data.isAvailable = data.isAvailable === "on";

		// Extract url params
		const url = new URL(window.location.href);
		const productId = url.pathname.split("/").pop();

		// Mutation
		await editProduct(data, productId);
	});
}

if (deleteProductButtons) {
	deleteProductButtons.forEach(button => {
		button.addEventListener("click", async e => {
			const productId = e.target.getAttribute("data-id");
			await deleteProduct(productId);
		});
	});
}

if (loginForm) {
	loginForm.addEventListener("submit", async event => {
		event.preventDefault();

		// Extract data form formData
		const form = event.target;
		const formData = new FormData(form);
		const data = Object.fromEntries(formData.entries());

		// Mutation
		await login(data);
	});
}

if (logoutButton) {
	logoutButton.addEventListener("click", async () => await logout());
}

if (imageUploader)
	imageUploader.addEventListener("change", async function (event) {
		const previewContainer = document.getElementById("imagePreviewContainer1");
		previewContainer.innerHTML = "";
		const file = event.target.files[0];

		if (file) {
			const formData = new FormData();
			formData.append("image", file);

			try {
				// Mutation
				const res = await uploadImage(formData);

				// Show uploaded image and set the value of require input
				const img = document.createElement("img");
				img.src = res.data.data.image;
				img.style.maxWidth = "60px";
				img.style.margin = "10px";
				imageInput.value = res.data.data.image;
				previewContainer.appendChild(img);

				alert("تصویر با موفقیت آپلود شد!");
			} catch (err) {
				console.log(err);
				alert(err.response.data.message);
			}
		}
	});

if (imagesUploader)
	imagesUploader.addEventListener("change", async function (event) {
		const previewContainer = document.getElementById("imagePreviewContainer2");
		previewContainer.innerHTML = "";
		const files = Array.from(event.target.files);

		try {
			for (const file of files) {
				const formData = new FormData();
				formData.append("image", file);

				// Mutation
				const res = await uploadImage(formData);

				// Show uploaded image and set the value of require input
				const img = document.createElement("img");
				img.src = res.data.data.image;
				img.style.maxWidth = "60px";
				img.style.margin = "10px";
				imagesInput.value += res.data.data.image + ",";
				previewContainer.appendChild(img);
			}

			alert("تصاویر با موفقیت آپلود شد!");
		} catch (err) {
			alert(err.response.data.message);
		}
	});
