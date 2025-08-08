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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expectOrderStatusUpdate = exports.expectValidOrderResponse = exports.getInvalidId = exports.getInvalidObjectId = exports.createMultipleTestOrders = exports.createTestOrder = exports.createTestProduct = exports.createTestUserAndGetCookie = exports.getInvalidOrderData = exports.getValidOrderData = exports.validOrderData = exports.updateOrderToDeliverRequest = exports.deleteOrderRequest = exports.updateOrderRequest = exports.getAllOrdersRequest = exports.getTopSellingProductsRequest = exports.updateOrderToPaidRequest = exports.getOrderByIdRequest = exports.getCurrentUserOrdersRequest = exports.createOrderRequest = void 0;
const app_1 = __importDefault(require("@/app"));
const supertest_1 = __importDefault(require("supertest"));
const auth_helper_1 = require("./auth.helper");
const core_1 = require("@/core");
const products_helper_1 = require("./products.helper");
const mongoose_1 = __importDefault(require("mongoose"));
const createOrderRequest = (body, cookie) => {
    const req = (0, supertest_1.default)(app_1.default).post("/api/orders").send(body);
    if (cookie) {
        req.set("Cookie", cookie);
    }
    return req;
};
exports.createOrderRequest = createOrderRequest;
const getCurrentUserOrdersRequest = (cookie) => {
    const req = (0, supertest_1.default)(app_1.default).get("/api/orders/get-myorders");
    if (cookie) {
        req.set("Cookie", cookie);
    }
    return req;
};
exports.getCurrentUserOrdersRequest = getCurrentUserOrdersRequest;
const getOrderByIdRequest = (orderId, cookie) => {
    const req = (0, supertest_1.default)(app_1.default).get(`/api/orders/${orderId}`);
    if (cookie) {
        req.set("Cookie", cookie);
    }
    return req;
};
exports.getOrderByIdRequest = getOrderByIdRequest;
const updateOrderToPaidRequest = (orderId, cookie) => {
    const req = (0, supertest_1.default)(app_1.default).patch(`/api/orders/${orderId}/pay`);
    if (cookie) {
        req.set("Cookie", cookie);
    }
    return req;
};
exports.updateOrderToPaidRequest = updateOrderToPaidRequest;
const getTopSellingProductsRequest = (cookie) => {
    const req = (0, supertest_1.default)(app_1.default).get("/api/orders/top-selling-products");
    if (cookie) {
        req.set("Cookie", cookie);
    }
    return req;
};
exports.getTopSellingProductsRequest = getTopSellingProductsRequest;
const getAllOrdersRequest = (cookie) => {
    const req = (0, supertest_1.default)(app_1.default).get("/api/orders");
    if (cookie) {
        req.set("Cookie", cookie);
    }
    return req;
};
exports.getAllOrdersRequest = getAllOrdersRequest;
const updateOrderRequest = (orderId, body, cookie) => {
    const req = (0, supertest_1.default)(app_1.default).patch(`/api/orders/${orderId}`).send(body);
    if (cookie) {
        req.set("Cookie", cookie);
    }
    return req;
};
exports.updateOrderRequest = updateOrderRequest;
const deleteOrderRequest = (orderId, cookie) => {
    const req = (0, supertest_1.default)(app_1.default).delete(`/api/orders/${orderId}`);
    if (cookie) {
        req.set("Cookie", cookie);
    }
    return req;
};
exports.deleteOrderRequest = deleteOrderRequest;
const updateOrderToDeliverRequest = (orderId, cookie) => {
    const req = (0, supertest_1.default)(app_1.default).patch(`/api/orders/${orderId}/deliver`);
    if (cookie) {
        req.set("Cookie", cookie);
    }
    return req;
};
exports.updateOrderToDeliverRequest = updateOrderToDeliverRequest;
exports.validOrderData = {
    orderItems: [
        {
            productId: new mongoose_1.default.Types.ObjectId().toString(),
            qty: 2,
        },
    ],
    shippingAddress: {
        province: "Tehran",
        city: "Tehran",
        street: "Valiasr Street, No. 123",
    },
    paymentMethod: "Credit Card",
    itemsPrice: 20000,
    shippingPrice: 5000,
    taxPrice: 2000,
    totalPrice: 27000,
};
const getValidOrderData = (productId, qty = 2) => ({
    orderItems: [
        {
            productId: productId || new mongoose_1.default.Types.ObjectId().toString(),
            qty,
        },
    ],
    shippingAddress: {
        province: "Tehran",
        city: "Tehran",
        street: "Valiasr Street, No. 123",
    },
    paymentMethod: "Credit Card",
    itemsPrice: 20000 * qty,
    shippingPrice: 5000,
    taxPrice: 2000 * qty,
    totalPrice: 27000 * qty,
});
exports.getValidOrderData = getValidOrderData;
const getInvalidOrderData = () => [
    {
        testCase: "orderItems is missing",
        data: {
            shippingAddress: {
                province: "Tehran",
                city: "Tehran",
                street: "Valiasr Street, No. 123",
            },
            paymentMethod: "Credit Card",
            itemsPrice: 20000,
            shippingPrice: 5000,
            taxPrice: 2000,
            totalPrice: 27000,
        },
        expectedError: "شناسه محصول معتبر نیست",
    },
    {
        testCase: "orderItems[0].productId is invalid",
        data: {
            orderItems: [
                {
                    productId: "invalid-id",
                    qty: 2,
                },
            ],
            shippingAddress: {
                province: "Tehran",
                city: "Tehran",
                street: "Valiasr Street, No. 123",
            },
            paymentMethod: "Credit Card",
            itemsPrice: 20000,
            shippingPrice: 5000,
            taxPrice: 2000,
            totalPrice: 27000,
        },
        expectedError: "شناسه محصول معتبر نیست",
    },
    {
        testCase: "orderItems[0].qty is missing",
        data: {
            orderItems: [
                {
                    productId: new mongoose_1.default.Types.ObjectId().toString(),
                },
            ],
            shippingAddress: {
                province: "Tehran",
                city: "Tehran",
                street: "Valiasr Street, No. 123",
            },
            paymentMethod: "Credit Card",
            itemsPrice: 20000,
            shippingPrice: 5000,
            taxPrice: 2000,
            totalPrice: 27000,
        },
        expectedError: "تعداد محصولات الزامی است",
    },
    {
        testCase: "orderItems[0].qty is less than 1",
        data: {
            orderItems: [
                {
                    productId: new mongoose_1.default.Types.ObjectId().toString(),
                    qty: 0,
                },
            ],
            shippingAddress: {
                province: "Tehran",
                city: "Tehran",
                street: "Valiasr Street, No. 123",
            },
            paymentMethod: "Credit Card",
            itemsPrice: 20000,
            shippingPrice: 5000,
            taxPrice: 2000,
            totalPrice: 27000,
        },
        expectedError: "تعداد محصولات الزامی است",
    },
    {
        testCase: "shippingAddress.province is missing",
        data: {
            orderItems: [
                {
                    productId: new mongoose_1.default.Types.ObjectId().toString(),
                    qty: 2,
                },
            ],
            shippingAddress: {
                city: "Tehran",
                street: "Valiasr Street, No. 123",
            },
            paymentMethod: "Credit Card",
            itemsPrice: 20000,
            shippingPrice: 5000,
            taxPrice: 2000,
            totalPrice: 27000,
        },
        expectedError: "استان الزامی است",
    },
    {
        testCase: "shippingAddress.city is missing",
        data: {
            orderItems: [
                {
                    productId: new mongoose_1.default.Types.ObjectId().toString(),
                    qty: 2,
                },
            ],
            shippingAddress: {
                province: "Tehran",
                street: "Valiasr Street, No. 123",
            },
            paymentMethod: "Credit Card",
            itemsPrice: 20000,
            shippingPrice: 5000,
            taxPrice: 2000,
            totalPrice: 27000,
        },
        expectedError: "شهر الزامی است",
    },
    {
        testCase: "shippingAddress.street is missing",
        data: {
            orderItems: [
                {
                    productId: new mongoose_1.default.Types.ObjectId().toString(),
                    qty: 2,
                },
            ],
            shippingAddress: {
                province: "Tehran",
                city: "Tehran",
            },
            paymentMethod: "Credit Card",
            itemsPrice: 20000,
            shippingPrice: 5000,
            taxPrice: 2000,
            totalPrice: 27000,
        },
        expectedError: "خیابان الزامی است",
    },
    {
        testCase: "paymentMethod is missing",
        data: {
            orderItems: [
                {
                    productId: new mongoose_1.default.Types.ObjectId().toString(),
                    qty: 2,
                },
            ],
            shippingAddress: {
                province: "Tehran",
                city: "Tehran",
                street: "Valiasr Street, No. 123",
            },
            itemsPrice: 20000,
            shippingPrice: 5000,
            taxPrice: 2000,
            totalPrice: 27000,
        },
        expectedError: "روش پرداخت الزامی است",
    },
    {
        testCase: "itemsPrice is missing",
        data: {
            orderItems: [
                {
                    productId: new mongoose_1.default.Types.ObjectId().toString(),
                    qty: 2,
                },
            ],
            shippingAddress: {
                province: "Tehran",
                city: "Tehran",
                street: "Valiasr Street, No. 123",
            },
            paymentMethod: "Credit Card",
            shippingPrice: 5000,
            taxPrice: 2000,
            totalPrice: 27000,
        },
        expectedError: "قیمت محصولات الزامی است",
    },
    {
        testCase: "shippingPrice is missing",
        data: {
            orderItems: [
                {
                    productId: new mongoose_1.default.Types.ObjectId().toString(),
                    qty: 2,
                },
            ],
            shippingAddress: {
                province: "Tehran",
                city: "Tehran",
                street: "Valiasr Street, No. 123",
            },
            paymentMethod: "Credit Card",
            itemsPrice: 20000,
            taxPrice: 2000,
            totalPrice: 27000,
        },
        expectedError: "قیمت حمل و نقل الزامی است",
    },
    {
        testCase: "taxPrice is missing",
        data: {
            orderItems: [
                {
                    productId: new mongoose_1.default.Types.ObjectId().toString(),
                    qty: 2,
                },
            ],
            shippingAddress: {
                province: "Tehran",
                city: "Tehran",
                street: "Valiasr Street, No. 123",
            },
            paymentMethod: "Credit Card",
            itemsPrice: 20000,
            shippingPrice: 5000,
            totalPrice: 27000,
        },
        expectedError: "مالیات الزامی است",
    },
    {
        testCase: "totalPrice is missing",
        data: {
            orderItems: [
                {
                    productId: new mongoose_1.default.Types.ObjectId().toString(),
                    qty: 2,
                },
            ],
            shippingAddress: {
                province: "Tehran",
                city: "Tehran",
                street: "Valiasr Street, No. 123",
            },
            paymentMethod: "Credit Card",
            itemsPrice: 20000,
            shippingPrice: 5000,
            taxPrice: 2000,
        },
        expectedError: "قیمت کل الزامی است",
    },
];
exports.getInvalidOrderData = getInvalidOrderData;
const createTestUserAndGetCookie = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (suffix = "orderuser", role = "user") {
    const user = (0, auth_helper_1.getUniqueUser)(suffix);
    const signupResponse = yield (0, auth_helper_1.signupRequest)(user);
    const cookie = signupResponse.headers["set-cookie"][0];
    const userDoc = yield core_1.userRepository.findByEmail(user.email);
    if (!userDoc || !userDoc._id) {
        throw new Error("Failed to create test user");
    }
    if (role === "admin") {
        yield core_1.userRepository.update(userDoc._id.toString(), {
            role: "admin",
        });
    }
    const plainUser = userDoc.toObject ? userDoc.toObject() : userDoc;
    return { user: plainUser, cookie, userData: user };
});
exports.createTestUserAndGetCookie = createTestUserAndGetCookie;
const createTestProduct = () => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield core_1.productRepository.createOne(products_helper_1.validProduct);
    if (!product) {
        throw new Error("Failed to create test product - product is null");
    }
    if (!product._id) {
        throw new Error("Failed to create test product - _id is missing");
    }
    const result = product.toObject ? product.toObject() : product;
    if (!result._id) {
        throw new Error("Failed to create test product - _id lost after conversion");
    }
    return result;
});
exports.createTestProduct = createTestProduct;
const createTestOrder = (userId, productId, orderData) => __awaiter(void 0, void 0, void 0, function* () {
    const defaultOrderData = (0, exports.getValidOrderData)(productId);
    const finalOrderData = Object.assign(Object.assign({}, defaultOrderData), orderData);
    const order = yield core_1.orderRepository.create(finalOrderData, userId);
    if (!order || !order._id) {
        throw new Error("Failed to create test order");
    }
    return order.toObject ? order.toObject() : order;
});
exports.createTestOrder = createTestOrder;
const createMultipleTestOrders = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, count = 3) {
    const orders = [];
    for (let i = 0; i < count; i++) {
        const product = yield (0, exports.createTestProduct)();
        const order = yield (0, exports.createTestOrder)(userId, product._id.toString(), {
            itemsPrice: (i + 1) * 10000,
            totalPrice: (i + 1) * 15000,
        });
        orders.push(order);
    }
    return orders;
});
exports.createMultipleTestOrders = createMultipleTestOrders;
const getInvalidObjectId = () => new mongoose_1.default.Types.ObjectId().toString();
exports.getInvalidObjectId = getInvalidObjectId;
const getInvalidId = () => "invalid-id";
exports.getInvalidId = getInvalidId;
const expectValidOrderResponse = (order, expectedData) => {
    expect(order).toHaveProperty("id");
    expect(order).toHaveProperty("user");
    expect(order).toHaveProperty("orderItems");
    expect(order).toHaveProperty("shippingAddress");
    expect(order).toHaveProperty("paymentMethod");
    expect(order).toHaveProperty("itemsPrice");
    expect(order).toHaveProperty("shippingPrice");
    expect(order).toHaveProperty("taxPrice");
    expect(order).toHaveProperty("totalPrice");
    expect(order).toHaveProperty("isPaid");
    expect(order).toHaveProperty("isDelivered");
    expect(order).toHaveProperty("createdAt");
    expect(order).toHaveProperty("updatedAt");
    expect(Array.isArray(order.orderItems)).toBe(true);
    if (order.orderItems.length > 0) {
        expect(order.orderItems[0]).toHaveProperty("product");
        expect(order.orderItems[0]).toHaveProperty("qty");
    }
    expect(order.shippingAddress).toHaveProperty("province");
    expect(order.shippingAddress).toHaveProperty("city");
    expect(order.shippingAddress).toHaveProperty("street");
    if (expectedData) {
        expect(order.paymentMethod).toBe(expectedData.paymentMethod);
        expect(order.itemsPrice).toBe(expectedData.itemsPrice);
        expect(order.totalPrice).toBe(expectedData.totalPrice);
    }
};
exports.expectValidOrderResponse = expectValidOrderResponse;
const expectOrderStatusUpdate = (order, isPaid, isDelivered) => {
    if (isPaid !== undefined) {
        expect(order.isPaid).toBe(isPaid);
        if (isPaid) {
            expect(order.paidAt).toBeDefined();
        }
    }
    if (isDelivered !== undefined) {
        expect(order.isDelivered).toBe(isDelivered);
        if (isDelivered) {
            expect(order.deliveredAt).toBeDefined();
        }
    }
};
exports.expectOrderStatusUpdate = expectOrderStatusUpdate;
