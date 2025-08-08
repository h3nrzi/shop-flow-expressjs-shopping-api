# Middleware System

## Overview

Shop Flow implements a comprehensive middleware system that handles cross-cutting concerns including authentication, authorization, validation, security, file uploads, and request preprocessing. The middleware system follows Express.js patterns and provides reusable, composable functionality across the application.

## Middleware Architecture

### Middleware Categories

1. **Security Middleware** - Data sanitization and protection
2. **Authentication Middleware** - User authentication and authorization
3. **Validation Middleware** - Request data validation
4. **Upload Middleware** - File upload handling
5. **Domain-Specific Middleware** - Business logic preprocessing
6. **Error Handling Middleware** - Global error processing

## Core Middleware Components

### 1. Authentication & Authorization

#### File: [`src/middlewares/auth.ts`](../src/middlewares/auth.ts)

**Purpose**: Handles user authentication and role-based authorization

#### `protect` Middleware

Validates JWT tokens and attaches authenticated user to request:

```typescript
const protect: RequestHandler = async (req, res, next) => {
	// Extract token from headers or cookies
	const { authorization } = req.headers;
	let token: string | undefined = undefined;

	if (authorization && authorization.startsWith("Bearer"))
		token = authorization.split(" ")[1];
	else if (req.cookies.jwt) token = req.cookies.jwt;

	// Validate token presence
	if (!token) {
		throw new NotAuthorizedError(
			"شما وارد نشده اید! لطفا برای دسترسی وارد شوید",
		);
	}

	// Verify token signature and expiration
	const decoded = (await verifyToken(token)) as {
		id: string;
		iat: number;
		exp: number;
	};

	// Validate user existence and status
	const user = await userRepository.findById(decoded.id);
	if (!user) {
		throw new NotAuthorizedError("کاربر متعلق به این توکن دیگر وجود ندارد!");
	}

	if (!user.active) {
		throw new NotAuthorizedError(
			"کاربری که به این ایمیل مرتبط است غیرفعال شده!",
		);
	}

	// Check password change timestamp
	if (user.changePasswordAfter(decoded.iat)) {
		throw new NotAuthorizedError(
			"کاربر اخیرا رمز عبور را تغییر داده است! لطفا دوباره وارد شوید.",
		);
	}

	// Attach user to request
	req.user = user;
	return next();
};
```

**Features**:

- **Multi-source Token Extraction**: Headers (`Authorization: Bearer`) and cookies (`jwt`)
- **JWT Verification**: Signature validation and expiration checking
- **User Validation**: Database lookup and active status verification
- **Password Change Detection**: Invalidates tokens after password changes
- **Request Enhancement**: Attaches user object to request for downstream use

#### `restrictTo` Middleware

Role-based access control for protected resources:

```typescript
const restrictTo = (...roles: string[]): RequestHandler => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			throw new ForbiddenError("شما اجازه انجام این عمل را ندارید!");
		}
		return next();
	};
};
```

**Features**:

- **Flexible Role Checking**: Accepts multiple allowed roles
- **Higher-Order Function**: Returns configured middleware
- **Clear Error Messages**: Persian error messages for users

**Usage Examples**:

```typescript
// Protect route with authentication
router.get("/profile", protect, getUserProfile);

// Admin-only route
router.delete("/users/:id", protect, restrictTo("admin"), deleteUser);

// Multiple roles allowed
router.patch(
	"/orders/:id",
	protect,
	restrictTo("admin", "moderator"),
	updateOrder,
);
```

### 2. Security Middleware

#### File: [`src/middlewares/security.ts`](../src/middlewares/security.ts)

**Purpose**: Protects against XSS attacks through data sanitization

#### `sanitizeXSS` Middleware

Recursively sanitizes request data to prevent XSS attacks:

```typescript
const sanitizeObject = (data: any): any => {
	if (typeof data === "string") return xss(data, { whiteList: {} });

	if (Array.isArray(data)) return data.map((item) => sanitizeObject(item));

	if (typeof data === "object" && data !== null) {
		const sanitizedObj: any = {};
		for (const key in data)
			if (data.hasOwnProperty(key))
				sanitizedObj[key] = sanitizeObject(data[key]);
		return sanitizedObj;
	}

	return data;
};

export const sanitizeXSS: RequestHandler = (req, res, next) => {
	req.params = sanitizeObject(req.params);
	req.query = sanitizeObject(req.query);
	req.body = sanitizeObject(req.body);

	next();
};
```

**Features**:

- **Recursive Sanitization**: Handles nested objects and arrays
- **Comprehensive Coverage**: Sanitizes params, query, and body
- **XSS Protection**: Removes malicious HTML/JavaScript content
- **Type Preservation**: Maintains data types while sanitizing

### 3. Validation Middleware

#### File: [`../src/middlewares/validate-request.ts`](src/middlewares/validate-request.ts)

**Purpose**: Validates request data using express-validator

```typescript
export const validateRequest: RequestHandler = (req, res, next) => {
	// Extract validation errors
	const errors = validationResult(req);

	// Throw custom error if validation fails
	if (!errors.isEmpty()) {
		throw new RequestValidationError(errors.array());
	}

	next();
};
```

**Features**:

- **Express-Validator Integration**: Works with validation chains
- **Custom Error Handling**: Throws structured validation errors
- **Field-Specific Errors**: Maps errors to specific input fields
- **Localized Messages**: Persian error messages for users

**Usage Pattern**:

```typescript
// In route definitions
router.post(
	"/users",
	[
		body("email").isEmail().withMessage("ایمیل معتبر وارد کنید"),
		body("password")
			.isLength({ min: 8 })
			.withMessage("رمز عبور باید حداقل 8 کاراکتر باشد"),
		validateRequest,
	],
	createUser,
);
```

### 4. Upload Middleware

#### File: [`src/middlewares/upload.ts`](src/middlewares/upload.ts)

**Purpose**: Handles file uploads with validation and security

```typescript
const storage: StorageEngine = multer.memoryStorage();

const fileFilter = (
	req: Request,
	file: Express.Multer.File,
	callback: multer.FileFilterCallback,
) => {
	const fileTypes = /jpg|jpeg|png|webp/;
	const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
	const mimetype = fileTypes.test(file.mimetype);

	if (!extname || !mimetype) {
		callback(new BadRequestError("تصویر فقط پشتیبانی میشود!"));
	}

	callback(null, true);
};

const upload = multer({ storage, fileFilter });
```

**Features**:

- **Memory Storage**: Files stored in memory for processing
- **File Type Validation**: Only allows image files (jpg, jpeg, png, webp)
- **MIME Type Checking**: Validates both extension and MIME type
- **Error Handling**: Custom error messages for invalid files
- **Security**: Prevents upload of potentially dangerous files

**Usage Examples**:

```typescript
// Single file upload
router.post("/upload", uploadMiddleware.single("image"), uploadImage);

// Multiple files
router.post("/gallery", uploadMiddleware.array("images", 5), uploadGallery);
```

### 5. Domain-Specific Middleware

#### Order Middleware

**File**: [`src/middlewares/order.ts`](../src/middlewares/order.ts)

**Purpose**: Preprocesses order-related requests

```typescript
const beforeCreate: RequestHandler = (req, res, next) => {
	req.body = {
		user: req.user._id,
		orderItems: req.body.orderItems,
		shippingAddress: req.body.shippingAddress,
		paymentMethod: req.body.paymentMethod,
		itemsPrice: req.body.itemsPrice,
		shippingPrice: req.body.shippingPrice,
		taxPrice: req.body.taxPrice,
		totalPrice: req.body.totalPrice,
	};
	next();
};

const getMyOrders: RequestHandler = (req, res, next) => {
	req.body.initialFilter = { user: req.user._id };
	next();
};
```

**Features**:

- **Data Filtering**: Ensures only allowed fields are processed
- **User Association**: Automatically associates orders with authenticated user
- **Query Filtering**: Adds user-specific filters for data isolation

#### Review Middleware

**File**: [`src/middlewares/review.ts`](src/middlewares/review.ts)

**Purpose**: Preprocesses review-related requests

```typescript
const beforeCreate: RequestHandler = (req, res, next) => {
	req.body = {
		user: req.body.userId || req.user._id,
		product: req.body.productId || req.params.productId,
		rating: req.body.rating,
		comment: req.body.comment,
	};
	next();
};

const beforeGetAll: RequestHandler = (req, res, next) => {
	req.body.initialFilter = req.params.productId
		? { product: req.params.productId }
		: {};
	next();
};
```

**Features**:

- **Flexible Data Sources**: Accepts data from body or params
- **User Association**: Links reviews to authenticated users
- **Product Filtering**: Filters reviews by product when specified
- **Data Normalization**: Standardizes request data structure

### 6. View Middleware

#### File: [`src/middlewares/view.ts`](src/middlewares/view.ts)

**Purpose**: Handles authentication for server-rendered pages

```typescript
const isLoggedIn: RequestHandler = async (req, res, next) => {
	// Extract token (similar to protect middleware)
	let token: string | undefined = undefined;
	if (authorization && authorization.startsWith("Bearer"))
		token = authorization.split(" ")[1];
	else if (req.cookies.jwt) token = req.cookies.jwt;

	if (token) {
		try {
			// Verify token and user
			const decoded = await verifyToken(token);
			const currentUser = await userRepository.findById(decoded.id);

			if (!currentUser || currentUser.changePasswordAfter(decoded.iat)) {
				return res.redirect("/admin/login");
			}

			// Set user in locals for template access
			res.locals.user = currentUser;
			return next();
		} catch (err) {
			return res.redirect("/admin/login");
		}
	}

	return res.redirect("/admin/login");
};
```

**Features**:

- **Template Integration**: Sets user in `res.locals` for template access
- **Redirect Handling**: Redirects to login on authentication failure
- **Error Resilience**: Gracefully handles token verification errors
- **Session Management**: Similar validation to API authentication

## Global Middleware Configuration

### Application-Level Middleware

**File**: [`src/app/config.ts`](src/app/config.ts)

The application configures middleware in a specific order for optimal security and performance:

```typescript
module.exports = (app: Express) => {
	// 1. Template Engine
	app.set("view engine", "pug");

	// 2. Static Files
	app.use(express.static(path.join(path.resolve(), "src", "public")));

	// 3. Development Logging
	if (process.env.NODE_ENV === "development") {
		app.use(morgan("dev"));
	}

	// 4. Security Headers
	app.use(
		helmet({
			contentSecurityPolicy: {
				directives: {
					defaultSrc: ["'self'"],
					scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
					styleSrc: ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
					imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
				},
			},
		}),
	);

	// 5. CORS Configuration
	app.use(
		cors({
			origin: [
				"http://localhost:5173",
				"http://localhost:3000",
				"https://azogeh.onrender.com",
			],
			methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	);

	// 6. Rate Limiting
	const limiter = rateLimit({
		windowMs: ms("15m"),
		limit: 100,
		message:
			"درخواست های IP شما بسیار زیاد است، لطفاً یک ساعت دیگر دوباره امتحان کنید!",
	});
	if (process.env.NODE === "production") app.use("/api", limiter);

	// 7. Body Parsing
	app.use(express.json({ limit: "5mb" }));
	app.use(express.urlencoded({ extended: false }));

	// 8. Cookie Parsing
	app.use(cookieParser());

	// 9. Data Sanitization
	app.use(mongoSanitize()); // NoSQL injection protection
	app.use(securityMiddleware.sanitizeXSS); // XSS protection

	// 10. HTTP Parameter Pollution Protection
	app.use(
		hpp({
			whitelist: [
				"countInStock",
				"brand",
				"category",
				"rating",
				"numReviews",
				"price",
				"discount",
				"discountedPrice",
			],
		}),
	);
};
```

### Middleware Order Importance

1. **Static Files**: Served first for performance
2. **Logging**: Early logging for all requests
3. **Security Headers**: Set before any processing
4. **CORS**: Enable cross-origin requests
5. **Rate Limiting**: Prevent abuse
6. **Body Parsing**: Parse request data
7. **Cookie Parsing**: Extract cookies
8. **Data Sanitization**: Clean input data
9. **Parameter Pollution**: Prevent parameter attacks

## Error Handling Middleware

### Global Error Handler

**File**: [`src/middlewares/error-handler.ts`](src/middlewares/error-handler.ts)

```typescript
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	// Handle specific error types
	if (err.name === "CastError") {
		/* Handle MongoDB CastError */
	}
	if (err.code === 11000) {
		/* Handle duplicate key error */
	}
	if (err instanceof CustomError) {
		/* Handle custom errors */
	}

	// Fallback for unexpected errors
	console.error(err);
	return res.status(500).send({
		status: "error",
		errors: [{ field: null, message: "یک چیزی خیلی اشتباه پیش رفت" }],
	});
};
```

**Features**:

- **Error Type Detection**: Handles different error categories
- **Consistent Response Format**: Standardized error responses
- **Logging**: Logs unexpected errors for debugging
- **Security**: Prevents error information leakage

## Middleware Usage Patterns

### Route-Level Middleware

```typescript
// Single middleware
router.get("/profile", protect, getUserProfile);

// Multiple middleware
router.post(
	"/products",
	protect,
	restrictTo("admin"),
	uploadMiddleware.single("image"),
	validateRequest,
	createProduct,
);

// Domain-specific middleware
router.post(
	"/orders",
	protect,
	orderMiddleware.beforeCreate,
	validateRequest,
	createOrder,
);
```

### Conditional Middleware

```typescript
// Apply rate limiting only in production
if (process.env.NODE_ENV === "production") {
	app.use("/api", rateLimitMiddleware);
}

// Development logging
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}
```

### Middleware Composition

```typescript
// Create reusable middleware combinations
const adminOnly = [protect, restrictTo("admin")];
const userAuth = [protect, restrictTo("user", "admin")];

// Use composed middleware
router.delete("/users/:id", ...adminOnly, deleteUser);
router.get("/orders", ...userAuth, getOrders);
```

## Security Middleware Features

### 1. **Helmet Configuration**

- **Content Security Policy**: Prevents XSS attacks
- **HSTS**: Enforces HTTPS connections
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing

### 2. **CORS Configuration**

- **Origin Whitelist**: Specific allowed origins
- **Credentials Support**: Enables cookie sharing
- **Method Restrictions**: Only allowed HTTP methods
- **Header Control**: Specific allowed headers

### 3. **Rate Limiting**

- **Time Window**: 15-minute windows
- **Request Limit**: 100 requests per window
- **Localized Messages**: Persian error messages
- **Production Only**: Applied only in production

### 4. **Data Sanitization**

- **NoSQL Injection**: MongoDB query sanitization
- **XSS Protection**: HTML/JavaScript removal
- **Parameter Pollution**: Duplicate parameter handling
- **Input Validation**: Express-validator integration

## Performance Considerations

### 1. **Middleware Order**

- Static files served first (no processing overhead)
- Authentication cached where possible
- Heavy processing middleware placed strategically

### 2. **Conditional Application**

- Development-only middleware (logging)
- Production-only middleware (rate limiting)
- Route-specific middleware (not global when unnecessary)

### 3. **Memory Management**

- File uploads use memory storage (temporary)
- Token verification cached in request lifecycle
- Database connections pooled

## Testing Middleware

### Unit Testing

```typescript
describe("Auth Middleware", () => {
	it("should throw error for missing token", async () => {
		const req = mockRequest();
		const res = mockResponse();
		const next = jest.fn();

		await expect(protect(req, res, next)).rejects.toThrow(NotAuthorizedError);
	});

	it("should attach user to request for valid token", async () => {
		const req = mockRequest({
			headers: { authorization: "Bearer valid-token" },
		});
		const res = mockResponse();
		const next = jest.fn();

		await protect(req, res, next);

		expect(req.user).toBeDefined();
		expect(next).toHaveBeenCalled();
	});
});
```

### Integration Testing

```typescript
describe("Protected Routes", () => {
	it("should require authentication", async () => {
		const response = await request(app).get("/api/profile").expect(401);

		expect(response.body.errors[0].message).toContain("وارد نشده اید");
	});

	it("should allow access with valid token", async () => {
		const token = generateValidToken();

		const response = await request(app)
			.get("/api/profile")
			.set("Authorization", `Bearer ${token}`)
			.expect(200);
	});
});
```

## Best Practices

### 1. **Middleware Design**

- **Single Responsibility**: Each middleware has one clear purpose
- **Composability**: Middleware can be combined easily
- **Error Handling**: Proper error propagation
- **Type Safety**: TypeScript interfaces for request enhancement

### 2. **Security**

- **Defense in Depth**: Multiple security layers
- **Input Validation**: Validate all user input
- **Output Sanitization**: Clean data before sending
- **Error Information**: Don't leak sensitive information

### 3. **Performance**

- **Early Returns**: Exit middleware early when possible
- **Caching**: Cache expensive operations
- **Async Handling**: Proper async/await usage
- **Memory Management**: Clean up resources

### 4. **Maintainability**

- **Clear Naming**: Descriptive middleware names
- **Documentation**: Comment complex logic
- **Modularity**: Separate concerns into different files
- **Testing**: Comprehensive test coverage
