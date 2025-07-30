"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const custom_error_1 = require("../errors/custom-error");
const errorHandler = (err, req, res, next) => {
    var _a;
    if (err.name === "CastError") {
        return res.status(400).send({
            status: "error",
            errors: [
                {
                    field: err.path,
                    message: "شناسه کاربر معتبر نیست",
                },
            ],
        });
    }
    if (err.code === 11000 && ((_a = err.keyPattern) === null || _a === void 0 ? void 0 : _a.email)) {
        return res.status(400).send({
            status: "error",
            errors: [
                {
                    field: err.path,
                    message: "این ایمیل قبلا استفاده شده است",
                },
            ],
        });
    }
    if (err instanceof custom_error_1.CustomError) {
        return res.status(err.statusCode).send({
            status: "error",
            errors: err.serializeErrors(),
        });
    }
    console.error(err);
    return res.status(500).send({
        status: "error",
        errors: [
            {
                field: null,
                message: "یک چیزی خیلی اشتباه پیش رفت",
            },
        ],
    });
};
exports.errorHandler = errorHandler;
