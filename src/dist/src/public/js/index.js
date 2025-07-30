"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const domElements_js_1 = require("./domElements.js");
const api_js_1 = require("./api.js");
if (domElements_js_1.createProductForm) {
    domElements_js_1.createProductForm.addEventListener("submit", (e) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield (0, api_js_1.createProduct)(data);
    }));
}
if (domElements_js_1.editProductForm) {
    domElements_js_1.editProductForm.addEventListener("submit", (e) => __awaiter(void 0, void 0, void 0, function* () {
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
        const url = new URL(window.location.href);
        const productId = url.pathname.split("/").pop();
        yield (0, api_js_1.editProduct)(data, productId);
    }));
}
if (domElements_js_1.deleteProductButtons) {
    domElements_js_1.deleteProductButtons.forEach(button => {
        button.addEventListener("click", (e) => __awaiter(void 0, void 0, void 0, function* () {
            const productId = e.target.getAttribute("data-id");
            yield (0, api_js_1.deleteProduct)(productId);
        }));
    });
}
if (domElements_js_1.loginForm) {
    domElements_js_1.loginForm.addEventListener("submit", (event) => __awaiter(void 0, void 0, void 0, function* () {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        yield (0, api_js_1.login)(data);
    }));
}
if (domElements_js_1.logoutButton) {
    domElements_js_1.logoutButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () { return yield (0, api_js_1.logout)(); }));
}
if (domElements_js_1.imageUploader)
    domElements_js_1.imageUploader.addEventListener("change", function (event) {
        return __awaiter(this, void 0, void 0, function* () {
            const previewContainer = document.getElementById("imagePreviewContainer1");
            previewContainer.innerHTML = "";
            const file = event.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append("image", file);
                try {
                    const res = yield (0, api_js_1.uploadImage)(formData);
                    const img = document.createElement("img");
                    img.src = res.data.data.image;
                    img.style.maxWidth = "60px";
                    img.style.margin = "10px";
                    domElements_js_1.imageInput.value = res.data.data.image;
                    previewContainer.appendChild(img);
                    alert("تصویر با موفقیت آپلود شد!");
                }
                catch (err) {
                    console.log(err);
                    alert(err.response.data.message);
                }
            }
        });
    });
if (domElements_js_1.imagesUploader)
    domElements_js_1.imagesUploader.addEventListener("change", function (event) {
        return __awaiter(this, void 0, void 0, function* () {
            const previewContainer = document.getElementById("imagePreviewContainer2");
            previewContainer.innerHTML = "";
            const files = Array.from(event.target.files);
            try {
                for (const file of files) {
                    const formData = new FormData();
                    formData.append("image", file);
                    const res = yield (0, api_js_1.uploadImage)(formData);
                    const img = document.createElement("img");
                    img.src = res.data.data.image;
                    img.style.maxWidth = "60px";
                    img.style.margin = "10px";
                    domElements_js_1.imagesInput.value += res.data.data.image + ",";
                    previewContainer.appendChild(img);
                }
                alert("تصاویر با موفقیت آپلود شد!");
            }
            catch (err) {
                alert(err.response.data.message);
            }
        });
    });
