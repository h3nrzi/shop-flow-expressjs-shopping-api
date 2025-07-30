"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = void 0;
const custom_error_1 = require("./custom-error");
class InternalServerError extends custom_error_1.CustomError {
    constructor(message) {
        super(message);
        this.statusCode = 500;
        this.serializeErrors = () => {
            return [
                {
                    field: null,
                    message: this.message,
                },
            ];
        };
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
}
exports.InternalServerError = InternalServerError;
