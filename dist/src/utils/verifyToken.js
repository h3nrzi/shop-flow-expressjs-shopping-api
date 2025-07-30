"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const not_authorized_error_1 = require("../errors/not-authorized-error");
const verifyToken = (token) => {
    return new Promise(resolve => {
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err)
                throw new not_authorized_error_1.NotAuthorizedError("توکن معتبر نیست");
            resolve(decoded);
        });
    });
};
exports.default = verifyToken;
