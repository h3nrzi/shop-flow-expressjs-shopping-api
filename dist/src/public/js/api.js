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
exports.uploadImage = exports.logout = exports.login = exports.editProduct = exports.createProduct = exports.deleteProduct = void 0;
const deleteProduct = (id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const res = yield axios.delete(`/api/products/${id}`);
        if (res.status === 204)
            window.location.reload();
    }
    catch (err) {
        alert((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.errors[0].message);
    }
});
exports.deleteProduct = deleteProduct;
const createProduct = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const res = yield axios.post("/api/products", data, {
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (res.data.status === "success")
            window.location.href = "/admin";
    }
    catch (err) {
        alert((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.errors[0].message);
    }
});
exports.createProduct = createProduct;
const editProduct = (data, productId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const res = yield axios.patch(`/api/products/${productId}`, data, {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
        });
        if (res.data.status === "success")
            window.location.href = "/admin";
    }
    catch (err) {
        alert(((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || err.message || "An error occurred");
    }
});
exports.editProduct = editProduct;
const login = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const res = yield axios.post("/api/users/login", data, {
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: true,
        });
        if (res.data.status === "success")
            window.location.href = "/admin";
    }
    catch (err) {
        alert((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.errors[0].message);
    }
});
exports.login = login;
const logout = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const res = yield axios.post("/api/users/logout", {}, { withCredentials: true });
        if (res.status === 204)
            window.location.reload();
    }
    catch (err) {
        alert((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.errors[0].message);
    }
});
exports.logout = logout;
const uploadImage = (formData) => {
    return axios.post("/api/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
    });
};
exports.uploadImage = uploadImage;
