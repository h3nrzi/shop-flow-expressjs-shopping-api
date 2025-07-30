# Error Handling System

## Overview

Shop Flow implements a comprehensive error handling system based on custom error classes that extend a base [`CustomError`](../src/errors/custom-error.ts) class. The system provides consistent error responses, proper HTTP status codes, and localized error messages in Persian.

## Architecture

### Base Error Class

The [`CustomError`](src/errors/custom-error.ts) abstract class serves as the foundation for all custom errors:

```typescript
export abstract class CustomError extends Error {
	constructor(message: string) {
		super(message);
		Object.setPrototypeOf(this, CustomError.prototype);
	}

	abstract statusCode: number;
	abstract serializeErrors: () => {
		field: string | null;
		message: string;
	}[];
}
```

**Key Features**:

- **Abstract Base**: Ensures consistent interface across all error types
- **Prototype Fix**: Handles TypeScript inheritance issues with built-in classes
- **Serialization**: Standardized error response format
- **Status Codes**: HTTP status code enforcement

### Error Response Format

All errors follow a consistent JSON response structure:

```json
{
    "status": "error",
    "errors": [
        {
            "field": "email" | null,
            "message": "Error message in Persian"
        }
    ]
}
```

## Error Types

### 1. BadRequestError (400)

**File**: [`src/errors/bad-request-error.ts`](../src/errors/bad-request-error.ts)

**Purpose**: General client-side errors, invalid requests

```typescript
export class BadRequestError extends CustomError {
	statusCode = 400;

	constructor(public override message: string) {
		super(message);
		Object.setPrototypeOf(this, BadRequestError.prototype);
	}
}
```

**Usage Examples**:

- Invalid input data
- Missing required parameters
- Business rule violations

### 2. NotAuthorizedError (401)

**File**: [`src/errors/not-authorized-error.ts`](../src/errors/not-authorized-error.ts)

**Purpose**: Authentication failures

```typescript
export class NotAuthorizedError extends CustomError {
	statusCode = 401;

	constructor(message: string) {
		super(message);
		Object.setPrototypeOf(this, NotAuthorizedError.prototype);
	}
}
```

**Usage Examples**:

- Invalid credentials
- Expired tokens
- Missing authentication
- User account disabled

**Common Messages**:

- `"شما وارد نشده اید! لطفا برای دسترسی وارد شوید"` - Not logged in
- `"کاربر متعلق به این توکن دیگر وجود ندارد!"` - User no longer exists
- `"کاربری که به این ایمیل مرتبط است غیرفعال شده!"` - Account disabled

### 3. ForbiddenError (403)

**File**: [`src/errors/forbidden-error.ts`](../src/errors/forbidden-error.ts)

**Purpose**: Authorization failures (authenticated but insufficient permissions)

```typescript
export class ForbiddenError extends CustomError {
	statusCode = 403;

	constructor(message: string) {
		super(message);
		Object.setPrototypeOf(this, ForbiddenError.prototype);
	}
}
```

**Usage Examples**:

- Role-based access control violations
- Resource ownership restrictions
- Admin-only operations

**Common Messages**:

- `"شما اجازه انجام این عمل را ندارید!"` - Insufficient permissions

### 4. NotFoundError (404)

**File**: [`src/errors/not-found-error.ts`](../src/errors/not-found-error.ts)

**Purpose**: Resource not found errors

```typescript
export class NotFoundError extends CustomError {
	statusCode = 404;

	constructor(message: string) {
		super(message);
		Object.setPrototypeOf(this, NotFoundError.prototype);
	}
}
```

**Usage Examples**:

- Non-existent resources
- Invalid IDs
- Deleted resources
- Route not found

**Common Messages**:

- `"هیچ محصولی با این شناسه یافت نشد"` - Product not found
- `"صفحه مورد نظر یافت نشد"` - Page not found
- `"این صفحه وجود ندارد"` - Pagination page doesn't exist

### 5. UnprocessableEntityError (422)

**File**: [`src/errors/unprocessable-entity-error.ts`](../src/errors/unprocessable-entity-error.ts)

**Purpose**: Semantic errors in well-formed requests

```typescript
export class UnprocessableEntityError extends CustomError {
	statusCode = 422;

	constructor(public override message: string) {
		super(message);
		Object.setPrototypeOf(
			this,
			UnprocessableEntityError.prototype
		);
	}
}
```

**Usage Examples**:

- Business logic violations
- Data consistency errors
- Complex validation failures

### 6. RequestValidationError (400)

**File**: [`src/errors/request-validation-error.ts`](../src/errors/request-validation-error.ts)

**Purpose**: Input validation errors from express-validator

```typescript
export class RequestValidationError extends CustomError {
	statusCode = 400;

	constructor(public errors: ValidationError[]) {
		super("پارامترهای درخواست نامعتبر هستند!");
		this.errors = errors;
	}

	serializeErrors = () => {
		return this.errors.map(error => ({
			field: error.type === "field" ? error.path : null,
			message: error.msg,
		}));
	};
}
```

**Special Features**:

- **Multiple Errors**: Can contain multiple validation errors
- **Field Mapping**: Maps errors to specific input fields
- **Express-Validator Integration**: Works with validation middleware

### 7. InternalServerError (500)

**File**: [`src/errors/internal-server-error.ts`](../src/errors/internal-server-error.ts)

**Purpose**: Server-side errors and unexpected failures

```typescript
export class InternalServerError extends CustomError {
	statusCode = 500;

	constructor(message: string) {
		super(message);
		Object.setPrototypeOf(this, InternalServerError.prototype);
	}
}
```

**Usage Examples**:

- Database connection failures
- External service errors
- Email sending failures
- Unexpected system errors

## Global Error Handler

The [`errorHandler`](../src/middlewares/error-handler.ts) middleware provides centralized error processing:

```typescript
export const errorHandler: ErrorRequestHandler = (
	err,
	req,
	res,
	next
) => {
	// Handle Mongoose CastError
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

	// Handle MongoDB duplicate key error
	if (err.code === 11000 && err.keyPattern?.email) {
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

	// Handle custom errors
	if (err instanceof CustomError) {
		return res.status(err.statusCode).send({
			status: "error",
			errors: err.serializeErrors(),
		});
	}

	// Handle unexpected errors
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
```

### Error Handler Features

1. **Mongoose Error Handling**:

   - **CastError**: Invalid ObjectId format
   - **Duplicate Key**: Unique constraint violations

2. **Custom Error Processing**:

   - Automatic status code mapping
   - Consistent error serialization
   - Localized error messages

3. **Fallback Handling**:

   - Catches unexpected errors
   - Logs errors for debugging
   - Returns generic error message

4. **Security**:
   - Prevents error information leakage
   - Sanitizes error responses
   - Logs sensitive errors server-side

## Error Usage Patterns

### Service Layer Error Throwing

```typescript
// In ProductService
async getProductById(id: string): Promise<IProductDoc> {
    const product = await this.productRepository.getOne(id);
    if (!product) {
        throw new NotFoundError("هیچ محصولی با این شناسه یافت نشد");
    }
    return product;
}
```

### Authentication Middleware

```typescript
// In auth middleware
const protect: RequestHandler = async (req, res, next) => {
	if (!token) {
		throw new NotAuthorizedError(
			"شما وارد نشده اید! لطفا برای دسترسی وارد شوید"
		);
	}

	const user = await userRepository.findById(decoded.id);
	if (!user) {
		throw new NotAuthorizedError(
			"کاربر متعلق به این توکن دیگر وجود ندارد!"
		);
	}

	if (!user.active) {
		throw new NotAuthorizedError(
			"کاربری که به این ایمیل مرتبط است غیرفعال شده!"
		);
	}
};
```

### Authorization Middleware

```typescript
// In restrictTo middleware
const restrictTo = (...roles: string[]): RequestHandler => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			throw new ForbiddenError(
				"شما اجازه انجام این عمل را ندارید!"
			);
		}
		return next();
	};
};
```

### Validation Middleware

```typescript
// In validateRequest middleware
export const validateRequest: RequestHandler = (
	req,
	res,
	next
) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		throw new RequestValidationError(errors.array());
	}

	next();
};
```

## Error Handling Best Practices

### 1. **Consistent Error Messages**

- All error messages are in Persian for user-facing errors
- Technical errors are logged in English for developers
- Error messages are descriptive but not revealing sensitive information

### 2. **Proper Status Codes**

- **400**: Client errors (bad request, validation)
- **401**: Authentication required
- **403**: Forbidden (insufficient permissions)
- **404**: Resource not found
- **422**: Unprocessable entity (business logic errors)
- **500**: Server errors

### 3. **Error Logging**

- Unexpected errors are logged to console
- Sensitive information is not exposed in responses
- Error context is preserved for debugging

### 4. **Async Error Handling**

The project uses [`express-async-errors`](../package.json) to automatically catch async errors:

```typescript
// No need for try-catch blocks in route handlers
app.get("/users/:id", async (req, res) => {
	const user = await userService.getUserById(req.params.id);
	// If getUserById throws an error, it's automatically caught
	res.json(user);
});
```

### 5. **Error Boundaries**

- Errors are caught at the appropriate layer
- Business logic errors in service layer
- Validation errors in middleware
- Authentication/authorization errors in middleware

## Integration with Express

### Route-Level Error Handling

```typescript
// Routes automatically handle thrown errors
router.get("/products/:id", async (req, res) => {
	// This will automatically be caught by error handler
	const product = await productService.getProductById(
		req.params.id
	);
	res.json({ status: "success", data: product });
});
```

### Middleware Chain

```typescript
// Error handling middleware is registered last
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);

// 404 handler for unmatched routes
app.all("*", () => {
	throw new NotFoundError("صفحه مورد نظر یافت نشد");
});

// Global error handler (must be last)
app.use(errorHandler);
```

## Testing Error Handling

### Error Testing Patterns

```typescript
// Testing error responses
describe("Product API", () => {
	it("should return 404 for non-existent product", async () => {
		const response = await request(app)
			.get("/api/products/invalid-id")
			.expect(404);

		expect(response.body).toEqual({
			status: "error",
			errors: [
				{
					field: null,
					message: "هیچ محصولی با این شناسه یافت نشد",
				},
			],
		});
	});
});
```

## Error Monitoring

### Production Considerations

1. **Error Logging**: Implement proper logging service (Winston, etc.)
2. **Error Tracking**: Use services like Sentry for error monitoring
3. **Metrics**: Track error rates and types
4. **Alerting**: Set up alerts for critical errors

### Development Features

1. **Stack Traces**: Full stack traces in development mode
2. **Error Details**: Detailed error information for debugging
3. **Console Logging**: Errors logged to console for immediate feedback

## Localization

### Persian Error Messages

All user-facing error messages are in Persian:

- Authentication: `"شما وارد نشده اید! لطفا برای دسترسی وارد شوید"`
- Authorization: `"شما اجازه انجام این عمل را ندارید!"`
- Not Found: `"هیچ محصولی با این شناسه یافت نشد"`
- Validation: `"پارامترهای درخواست نامعتبر هستند!"`
- Server Error: `"یک چیزی خیلی اشتباه پیش رفت"`

### Technical Messages

Internal error messages and logs remain in English for developer clarity.
