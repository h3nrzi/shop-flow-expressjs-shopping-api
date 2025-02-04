// @ts-nocheck

import { showAlert } from "./alerts.js";

export const createProduct = async data => {
	try {
		const res = await axios.post("http://localhost:3000/api/products", data);

		if (res.data.status === "success") {
			showAlert("success", "محصول با موفقیت ایجاد شد. صفحه را رفرش کنید!");
		}
	} catch (err) {
		alert(err);
	}
};

export const deleteProduct = async id => {
	const confirmDelete = confirm("آیا مطمئن هستید که می خواهید این محصول را حذف کنید؟");

	if (confirmDelete) {
		try {
			const res = await axios.delete(`http://localhost:3000/api/products/${id}`);
			if (res.status === 204) window.location.reload();
		} catch (err) {
			alert(err.response.data.message);
		}
	}
};
