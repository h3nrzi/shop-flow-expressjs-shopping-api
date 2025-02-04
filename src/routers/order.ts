import express from "express";
import orderController from "../controllers/order";
import authMiddleware from "../middlewares/auth";
import orderMiddleware from "../middlewares/order";
const orderRouter = express.Router();

//////////// @access PUBLIC ////////////

//////////// @access USERS ////////////
orderRouter.use(authMiddleware.protect);

orderRouter.route("/").post(orderMiddleware.beforeCreate, orderController.createOne);
orderRouter.route("/get-myorders").get(orderMiddleware.getMyOrders, orderController.getAll);
orderRouter.route("/top-selling-products").get(orderController.getAllTops);
orderRouter.route("/:id/pay").patch(orderController.updateOrderToPaid);
orderRouter
	.route("/:id")
	.get(orderController.getOne)
	.patch(orderMiddleware.beforeUpdate, orderController.updateOne)
	.delete(orderController.deleteOne);

//////////// @access ADMIN ////////////
orderRouter.use(authMiddleware.restrictTo("admin"));

orderRouter.route("/").get(orderController.getAll);
orderRouter.route("/:id/deliver").patch(orderController.updateOrderToDeliver);

export default orderRouter;
