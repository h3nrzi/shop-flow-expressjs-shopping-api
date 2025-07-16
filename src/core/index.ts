import { OrderController } from "./orders/order.controller";
import { OrderRepository } from "./orders/order.repository";
import { OrderService } from "./orders/order.service";
import Order from "./orders/order.entity";
import Product from "./products/entities/product.entity";
import ProductRepository from "./products/product.repository";
import { UserRepository } from "./users/user.repository";
import User from "./users/user.entity";
import { ProductService } from "./products/product.service";
import { ProductController } from "./products/product.controller";
import { ReviewService } from "./reviews/review.service";
import { ReviewRepository } from "./reviews/review.repository";
import { ReviewController } from "./reviews/review.controller";
import Review from "./reviews/entities/review.model";
import { UserService } from "./users/services/user.service";
import { UserController } from "./users/controllers/user.controller";
import { AuthService } from "./users/services/auth.service";
import { AuthController } from "./users/controllers/auth.controller";

// Repositories Injection
export const orderRepository = new OrderRepository(Order);
export const productRepository = new ProductRepository(Product);
export const userRepository = new UserRepository(User);
export const reviewRepository = new ReviewRepository(Review);

// Services Injection
export const orderService = new OrderService(
	orderRepository,
	productRepository
);
export const productService = new ProductService(productRepository);
export const reviewService = new ReviewService(reviewRepository);
export const userService = new UserService(userRepository);
export const authService = new AuthService(userRepository);

// Controllers Injection
export const orderController = new OrderController(orderService);
export const productController = new ProductController(productService);
export const reviewController = new ReviewController(reviewService);
export const userController = new UserController(userService);
export const authController = new AuthController(authService);
