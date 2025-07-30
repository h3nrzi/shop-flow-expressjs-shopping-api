"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotAuthorizedError = void 0;
const custom_error_1 = require("./custom-error");
class NotAuthorizedError extends custom_error_1.CustomError {
    constructor(message) {
        super(message);
        this.statusCode = 401;
        this.serializeErrors = () => {
            return [
                {
                    field: null,
                    message: this.message,
                },
            ];
        };
        Object.setPrototypeOf(this, NotAuthorizedError.prototype);
    }
}
exports.NotAuthorizedError = NotAuthorizedError;
