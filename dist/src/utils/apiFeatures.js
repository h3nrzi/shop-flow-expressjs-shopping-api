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
class APIFeatures {
    constructor(Model, reqQuery, initialFilter, populate) {
        this.Model = Model;
        this.queryRequest = reqQuery;
        this.dbQuery = this.Model.find(initialFilter).populate(populate || "");
    }
    filter() {
        const queryObject = Object.assign({}, this.queryRequest);
        const excludedFields = ["sort", "fields", "search", "page", "limit"];
        excludedFields.forEach((field) => delete queryObject[field]);
        const queryString = JSON.stringify(queryObject).replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        this.dbQuery = this.dbQuery.find(JSON.parse(queryString));
        return this;
    }
    search() {
        if (this.queryRequest.search) {
            const searchCriteria = {
                name: {
                    $regex: this.queryRequest.search,
                    $options: "i",
                },
            };
            this.dbQuery = this.dbQuery.find(searchCriteria);
        }
        return this;
    }
    sort() {
        if (this.queryRequest.sort) {
            const sortBy = this.queryRequest.sort.split(",").join(" ");
            this.dbQuery = this.dbQuery.sort(sortBy);
        }
        else {
            this.dbQuery = this.dbQuery.sort("-createdAt");
        }
        return this;
    }
    limitFields() {
        if (this.queryRequest.fields) {
            const fields = this.queryRequest.fields.split(",").join(" ");
            this.dbQuery = this.dbQuery.select(fields);
        }
        else {
            this.dbQuery = this.dbQuery.select("-__v");
        }
        return this;
    }
    pagination() {
        return __awaiter(this, void 0, void 0, function* () {
            const total = yield this.Model.find(this.dbQuery.getFilter()).countDocuments();
            const limit = parseInt(this.queryRequest.limit) || 8;
            const pages = Math.ceil(total / limit);
            const page = parseInt(this.queryRequest.page) || 1;
            const skip = (page - 1) * limit;
            if (this.queryRequest.page)
                this.dbQuery = this.dbQuery.skip(skip).limit(limit);
            const pagination = this.queryRequest.page
                ? { total, limit, pages, page, skip }
                : null;
            return { pagination, total, skip };
        });
    }
}
exports.default = APIFeatures;
