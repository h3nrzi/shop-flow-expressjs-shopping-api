"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestError = void 0;
const custom_error_1 = require("./custom-error");
class BadRequestError extends custom_error_1.CustomError {
    constructor(message) {
        super(message);
        this.message = message;
        this.statusCode = 400;
        this.serializeErrors = () => [
            {
                field: null,
                message: this.message,
            },
        ];
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}
exports.BadRequestError = BadRequestError;
