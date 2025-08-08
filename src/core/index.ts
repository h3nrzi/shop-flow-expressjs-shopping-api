import { NotificationController } from "./notifications/presentation/notification.controller";
import { Notification } from "./notifications/infrastructure/notification.entity";
import { NotificationRepository } from "./notifications/infrastructure/notification.repository";
import { NotificationService } from "./notifications/application/notification.service";
import { OrderController } from "./orders/order.controller";
import { Order } from "./orders/order.entity";
import { OrderRepository } from "./orders/order.repository";
import { OrderService } from "./orders/order.service";
import { ProductController } from "./products/product.controller";
import { Product } from "./products/product.entity";
import ProductRepository from "./products/product.repository";
import { ProductService } from "./products/product.service";
import { ReviewController } from "./reviews/review.controller";
import { Review } from "./reviews/review.entity";
import { ReviewRepository } from "./reviews/review.repository";
import { ReviewService } from "./reviews/review.service";
import { UploadController } from "./uploads/upload.controller";
import { UploadService } from "./uploads/upload.service";
import { AuthController } from "./users/controllers/auth.controller";
import { UserController } from "./users/controllers/user.controller";
import { AuthService } from "./users/services/auth.service";
import { UserService } from "./users/services/user.service";
import { User } from "./users/user.entity";
import { UserRepository } from "./users/user.repository";
import { ViewController } from "./views/view.controller";
import { ViewService } from "./views/view.service";

// Entities
export { Notification, Order, Product, Review, User };

// Repositories Injection
export const notificationRepository = new NotificationRepository(Notification);
export const orderRepository = new OrderRepository(Order);
export const productRepository = new ProductRepository(Product);
export const userRepository = new UserRepository(User);
export const reviewRepository = new ReviewRepository(Review);

// Services Injection
export const notificationService = new NotificationService(
	notificationRepository,
);
export const orderService = new OrderService(
	orderRepository,
	productRepository,
);
export const productService = new ProductService(productRepository);
export const reviewService = new ReviewService(
	reviewRepository,
	productRepository,
);
export const userService = new UserService(userRepository);
export const authService = new AuthService(userRepository);
export const uploadService = new UploadService();
export const viewService = new ViewService(Product);

// Controllers Injection
export const notificationController = new NotificationController(
	notificationService,
);
export const orderController = new OrderController(
	orderService,
	notificationService,
);
export const productController = new ProductController(productService);
export const reviewController = new ReviewController(reviewService);
export const userController = new UserController(userService);
export const authController = new AuthController(authService);
export const uploadController = new UploadController(uploadService);
export const viewController = new ViewController(viewService);
