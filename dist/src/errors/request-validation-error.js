"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestValidationError = void 0;
const custom_error_1 = require("./custom-error");
class RequestValidationError extends custom_error_1.CustomError {
    constructor(errors) {
        super("پارامترهای درخواست نامعتبر هستند!");
        this.errors = errors;
        this.statusCode = 400;
        this.serializeErrors = () => {
            return this.errors.map((error) => {
                return {
                    field: error.type === "field" ? error.path : null,
                    message: error.msg,
                };
            });
        };
        this.errors = errors;
        Object.setPrototypeOf(this, RequestValidationError.prototype);
    }
}
exports.RequestValidationError = RequestValidationError;
