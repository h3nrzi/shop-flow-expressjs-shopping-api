# API Documentation Guide

## Overview

Shop Flow provides comprehensive API documentation using **Swagger/OpenAPI 3.0** specification. The documentation is interactive, automatically generated, and includes detailed schemas, examples, and authentication information. The API follows RESTful principles with consistent response formats and proper HTTP status codes.

## Documentation Architecture

### Swagger Configuration

**File**: [`src/swagger/config.ts`](src/swagger/config.ts)

The Swagger configuration uses `swagger-jsdoc` to combine base specifications with YAML endpoint definitions:

```typescript
import swaggerJSDoc from "swagger-jsdoc";

const basePath = path.resolve(__dirname, "./base.json");
const baseFile = fs.readFileSync(basePath, "utf8");
const swaggerDefinition = JSON.parse(baseFile);

const options: swaggerJSDoc.Options = {
	definition: swaggerDefinition,
	apis: ["./src/swagger/apis/*.yaml"],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
```

### Documentation Structure

```
src/swagger/
├── config.ts          # Swagger configuration
├── base.json          # Base OpenAPI specification
└── apis/              # Endpoint documentation
    ├── admin.yaml     # Admin endpoints
    ├── auth.yaml      # Authentication endpoints
    └── products.yaml  # Product endpoints
```

## Base Specification

**File**: [`src/swagger/base.json`](src/swagger/base.json)

### API Information

```json
{
	"openapi": "3.0.0",
	"info": {
		"title": "API Documentation",
		"description": "API for managing products, users, orders, and reviews",
		"version": "1.0.0",
		"contact": {
			"name": "Hossein Rezaei",
			"email": "rezaeig22@gmail.com"
		}
	}
}
```

### Server Configuration

```json
{
	"servers": [
		{
			"url": "http://localhost:3000",
			"description": "Local development server"
		},
		{
			"url": "https://shop-flow.render.com",
			"description": "Production server"
		}
	]
}
```

### API Tags

The API is organized into logical groups:

- **Auth**: Authentication related endpoints
- **Users**: User management endpoints
- **Products**: Product catalog endpoints
- **Reviews**: Product review endpoints
- **Orders**: Order management endpoints
- **Uploads**: File upload endpoints
- **Admin**: Administrative endpoints

## Authentication Documentation

### Security Schemes

The API supports two authentication methods:

```json
{
	"securitySchemes": {
		"bearerAuth": {
			"type": "http",
			"scheme": "bearer",
			"bearerFormat": "JWT"
		},
		"cookieAuth": {
			"type": "apiKey",
			"in": "cookie",
			"name": "jwt"
		}
	}
}
```

**Usage Examples**:

1. **Bearer Token Authentication**:

   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Cookie Authentication**:
   ```
   Cookie: jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Data Schemas

### User Schema

```json
{
	"User": {
		"type": "object",
		"properties": {
			"id": {
				"type": "string",
				"example": "60d21b4667d0d8992e610c85"
			},
			"name": {
				"type": "string",
				"example": "حسین رضایی"
			},
			"email": {
				"type": "string",
				"example": "hossein@example.com"
			},
			"role": {
				"type": "string",
				"enum": ["user", "admin"],
				"example": "user"
			},
			"active": {
				"type": "boolean",
				"example": true
			}
		}
	}
}
```

### Product Schema

```json
{
	"Product": {
		"type": "object",
		"properties": {
			"_id": {
				"type": "string",
				"example": "60d21b4667d0d8992e610c85"
			},
			"name": {
				"type": "string",
				"example": "لپ تاپ Asus VivoBook"
			},
			"description": {
				"type": "string",
				"example": "لپ تاپ قدرتمند با پردازنده Intel Core i5"
			},
			"price": {
				"type": "number",
				"example": 15000000
			},
			"discount": {
				"type": "number",
				"example": 5
			},
			"discountedPrice": {
				"type": "number",
				"nullable": true,
				"example": 14250000
			},
			"countInStock": {
				"type": "integer",
				"example": 25
			},
			"brand": {
				"type": "string",
				"example": "Asus"
			},
			"category": {
				"type": "string",
				"example": "لپ تاپ"
			},
			"rating": {
				"type": "number",
				"example": 4.5
			},
			"numReviews": {
				"type": "integer",
				"example": 10
			}
		}
	}
}
```

### Order Schema

```json
{
	"Order": {
		"type": "object",
		"properties": {
			"id": {
				"type": "string",
				"example": "60d21b4667d0d8992e610c85"
			},
			"user": {
				"type": "string",
				"example": "60d21b4667d0d8992e610c86"
			},
			"orderItems": {
				"type": "array",
				"items": {
					"$ref": "#/components/schemas/OrderItem"
				}
			},
			"shippingAddress": {
				"$ref": "#/components/schemas/ShippingAddress"
			},
			"paymentMethod": {
				"type": "string",
				"example": "Credit Card"
			},
			"totalPrice": {
				"type": "number",
				"example": 230000
			},
			"isPaid": {
				"type": "boolean",
				"example": false
			},
			"isDelivered": {
				"type": "boolean",
				"example": false
			}
		}
	}
}
```

## Data Transfer Objects (DTOs)

### CreateUserDto

```json
{
	"CreateUserDto": {
		"type": "object",
		"required": [
			"name",
			"email",
			"password",
			"passwordConfirmation"
		],
		"properties": {
			"name": {
				"type": "string",
				"example": "John Doe"
			},
			"email": {
				"type": "string",
				"example": "john@example.com"
			},
			"password": {
				"type": "string",
				"format": "password",
				"example": "StrongPass123!"
			},
			"passwordConfirmation": {
				"type": "string",
				"format": "password",
				"example": "StrongPass123!"
			},
			"active": {
				"type": "boolean",
				"example": true
			}
		}
	}
}
```

### CreateProductDto

```json
{
	"CreateProductDto": {
		"type": "object",
		"required": [
			"name",
			"description",
			"image",
			"price",
			"countInStock",
			"brand",
			"category"
		],
		"properties": {
			"name": {
				"type": "string",
				"example": "لپ تاپ Asus VivoBook"
			},
			"description": {
				"type": "string",
				"example": "لپ تاپ قدرتمند با پردازنده Intel Core i5"
			},
			"image": {
				"type": "string",
				"example": "https://example.com/laptop.jpg"
			},
			"price": {
				"type": "number",
				"example": 15000000
			},
			"countInStock": {
				"type": "integer",
				"example": 25
			},
			"brand": {
				"type": "string",
				"example": "Asus"
			},
			"category": {
				"type": "string",
				"example": "لپ تاپ"
			}
		}
	}
}
```

## Endpoint Documentation

### Admin Endpoints

**File**: [`src/swagger/apis/admin.yaml`](src/swagger/apis/admin.yaml)

#### Get All Users

```yaml
/api/users:
  get:
    tags:
      - Admin
    summary: Get all users
    description: Returns a list of all users. Only accessible by admin users.
    security:
      - cookieAuth: []
      - bearerAuth: []
    parameters:
      - in: query
        name: page
        schema:
          type: integer
          minimum: 1
          example: 1
        description: شماره صفحه برای صفحه‌بندی نتایج
      - in: query
        name: limit
        schema:
          type: integer
          minimum: 1
          maximum: 100
          example: 10
        description: تعداد نتایج در هر صفحه
      - in: query
        name: search
        schema:
          type: string
          example: "john"
        description: جستجو در نام و ایمیل کاربران
    responses:
      "200":
        description: List of users
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: success
                results:
                  type: integer
                  example: 10
                pagination:
                  $ref: "#/components/schemas/Pagination"
                data:
                  type: object
                  properties:
                    users:
                      type: array
                      items:
                        $ref: "#/components/schemas/User"
```

#### Create Product

```yaml
/api/products:
  post:
    tags:
      - Admin
    summary: Create a new product
    description: Creates a new product. Only accessible by admin users.
    security:
      - cookieAuth: []
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: "#/components/Dtos/CreateProductDto"
    responses:
      "201":
        description: Product created successfully
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: success
                data:
                  type: object
                  properties:
                    product:
                      $ref: "#/components/schemas/Product"
```

## Response Formats

### Success Response

All successful API responses follow this format:

```json
{
    "status": "success",
    "results": 10,
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 100,
        "pages": 10,
        "skip": 0
    },
    "data": {
        "users": [...]
    }
}
```

### Error Response

All error responses follow this format:

```json
{
	"status": "error",
	"errors": [
		{
			"field": "email",
			"message": "ایمیل وارد شده معتبر نیست"
		}
	]
}
```

## Query Parameters

### Pagination Parameters

- **page**: Page number (default: 1)
- **limit**: Items per page (default: 10, max: 100)

### Sorting Parameters

- **sort**: Sort field with direction prefix
  - Ascending: `name`, `price`, `createdAt`
  - Descending: `-name`, `-price`, `-createdAt`

### Filtering Parameters

#### Range Filters

Support for comparison operators:

- `field[gt]`: Greater than
- `field[gte]`: Greater than or equal
- `field[lt]`: Less than
- `field[lte]`: Less than or equal

**Examples**:

- `price[gte]=100000&price[lte]=500000`
- `createdAt[gte]=2023-01-01T00:00:00.000Z`

#### Search Parameters

- **search**: Full-text search across relevant fields
- **field-specific**: Direct field matching

## Authentication Flow Documentation

### Login Process

```yaml
/auth/login:
  post:
    tags:
      - Auth
    summary: User login
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required:
              - email
              - password
            properties:
              email:
                type: string
                example: "user@example.com"
              password:
                type: string
                example: "password123"
    responses:
      "200":
        description: Login successful
        headers:
          Set-Cookie:
            description: JWT tokens set as httpOnly cookies
            schema:
              type: string
              example: "jwt=token; refreshToken=refresh_token"
          x-auth-token:
            description: Access token in header
            schema:
              type: string
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Token Refresh

```yaml
/auth/refresh-token:
  post:
    tags:
      - Auth
    summary: Refresh access token
    description: Uses refresh token from cookies to generate new access token
    responses:
      "200":
        description: Token refreshed successfully
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: success
                token:
                  type: string
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Error Documentation

### Standard Error Responses

#### 400 - Bad Request

```json
{
	"status": "error",
	"errors": [
		{
			"field": "email",
			"message": "فرمت ایمیل نامعتبر است"
		}
	]
}
```

#### 401 - Unauthorized

```json
{
	"status": "error",
	"errors": [
		{
			"field": null,
			"message": "شما وارد نشده اید! لطفا برای دسترسی وارد شوید"
		}
	]
}
```

#### 403 - Forbidden

```json
{
	"status": "error",
	"errors": [
		{
			"field": null,
			"message": "شما اجازه انجام این عمل را ندارید!"
		}
	]
}
```

#### 404 - Not Found

```json
{
	"status": "error",
	"errors": [
		{
			"field": null,
			"message": "هیچ محصولی با این شناسه یافت نشد"
		}
	]
}
```

## Route Documentation Integration

### User Routes

**File**: [`src/core/users/user.routes.ts`](src/core/users/user.routes.ts)

Routes are documented with validation rules that automatically generate OpenAPI schemas:

```typescript
router.post("/signup", [
	body("name")
		.notEmpty()
		.withMessage("نام کاربر الزامی است")
		.isString()
		.withMessage("فرمت نام کاربر باید string باشد"),
	body("email")
		.notEmpty()
		.withMessage("ایمیل کاربر الزامی است")
		.isEmail()
		.withMessage("ایمیل وارد شده معتبر نیست"),
	body("password")
		.notEmpty()
		.withMessage("رمز عبور کاربر الزامی است")
		.isLength({ min: 8 })
		.withMessage("رمز عبور کاربر باید حداقل 8 کاراکتر باشد"),
	validateRequest,
	authController.signup.bind(authController),
]);
```

### Product Routes

**File**: [`src/core/products/product.routes.ts`](src/core/products/product.routes.ts)

```typescript
router.post("/", [
	body("name")
		.exists({ checkFalsy: true })
		.isString()
		.withMessage("نام محصول الزامی است"),
	body("price")
		.exists({ checkFalsy: true })
		.isNumeric()
		.withMessage("قیمت محصول الزامی است"),
	body("countInStock")
		.optional()
		.isInt({ min: 0 })
		.withMessage("تعداد محصولات باید عدد صحیح و مثبت باشد"),
	validateRequest,
	productController.createProduct.bind(productController),
]);
```

## Interactive Documentation

### Swagger UI Integration

**File**: [`src/app/routes.ts`](src/app/routes.ts)

```typescript
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "../swagger/config";

module.exports = (app: Express) => {
	// Swagger UI route
	app.use(
		"/api-docs",
		swaggerUi.serve,
		swaggerUi.setup(swaggerSpec)
	);
};
```

### Accessing Documentation

- **Local Development**: `http://localhost:3000/api-docs`
- **Production**: `https://shop-flow.render.com/api-docs`

### Features

1. **Interactive Testing**: Test endpoints directly from documentation
2. **Authentication**: Built-in authentication testing
3. **Schema Validation**: Real-time request/response validation
4. **Code Generation**: Generate client code in multiple languages
5. **Export Options**: Download OpenAPI specification

## Validation Documentation

### Express-Validator Integration

Validation rules are automatically documented through express-validator:

```typescript
// Validation rules become OpenAPI schema
body("email")
    .isEmail()
    .withMessage("ایمیل وارد شده معتبر نیست")

// Translates to:
{
    "email": {
        "type": "string",
        "format": "email",
        "description": "ایمیل وارد شده معتبر نیست"
    }
}
```

### Custom Validation

```typescript
body("passwordConfirmation")
	.custom((value, { req }) => {
		if (value !== req.body.password) return false;
		return true;
	})
	.withMessage("رمز عبور و تایید رمز عبور باید یکسان باشد");
```

## Localization in Documentation

### Persian Error Messages

All user-facing messages are in Persian:

```json
{
	"validation_errors": {
		"required_field": "این فیلد الزامی است",
		"invalid_email": "فرمت ایمیل نامعتبر است",
		"password_length": "رمز عبور باید حداقل 8 کاراکتر باشد",
		"unauthorized": "شما وارد نشده اید! لطفا برای دسترسی وارد شوید",
		"forbidden": "شما اجازه انجام این عمل را ندارید!",
		"not_found": "هیچ موردی با این شناسه یافت نشد"
	}
}
```

### Technical Documentation

Internal documentation and schemas remain in English for developer clarity.

## API Versioning

### Current Version

- **Version**: 1.0.0
- **Base Path**: `/api`
- **Versioning Strategy**: URL path versioning (future: `/api/v1`, `/api/v2`)

### Backward Compatibility

- Additive changes only
- Deprecated fields marked clearly
- Migration guides for breaking changes

## Rate Limiting Documentation

### Rate Limits

```yaml
components:
  headers:
    X-RateLimit-Limit:
      description: Request limit per time window
      schema:
        type: integer
        example: 100
    X-RateLimit-Remaining:
      description: Remaining requests in current window
      schema:
        type: integer
        example: 95
    X-RateLimit-Reset:
      description: Time when rate limit resets
      schema:
        type: integer
        example: 1640995200
```

### Rate Limit Response

```json
{
	"status": "error",
	"errors": [
		{
			"field": null,
			"message": "درخواست های IP شما بسیار زیاد است، لطفاً یک ساعت دیگر دوباره امتحان کنید!"
		}
	]
}
```

## File Upload Documentation

### Upload Endpoints

```yaml
/api/uploads:
  post:
    tags:
      - Uploads
    summary: Upload image file
    requestBody:
      required: true
      content:
        multipart/form-data:
          schema:
            type: object
            properties:
              image:
                type: string
                format: binary
                description: Image file (jpg, jpeg, png, webp)
    responses:
      "200":
        description: File uploaded successfully
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: success
                data:
                  type: object
                  properties:
                    url:
                      type: string
                      example: "https://res.cloudinary.com/example/image.jpg"
```

## Testing Documentation

### Example Requests

#### Create User (Admin)

```bash
curl -X POST "http://localhost:3000/api/users" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "StrongPass123!",
    "passwordConfirmation": "StrongPass123!"
  }'
```

#### Get Products with Filters

```bash
curl -X GET "http://localhost:3000/api/products?page=1&limit=10&sort=-createdAt&brand=Asus&price[gte]=100000&price[lte]=500000"
```

#### Login

```bash
curl -X POST "http://localhost:3000/api/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

## Documentation Maintenance

### Updating Documentation

1. **Schema Changes**: Update [`base.json`](src/swagger/base.json) for schema modifications
2. **New Endpoints**: Add YAML files in [`src/swagger/apis/`](src/swagger/apis/)
3. **Validation Changes**: Update route validation rules
4. **Examples**: Keep examples current with actual API behavior

### Best Practices

1. **Consistency**: Maintain consistent naming and structure
2. **Examples**: Provide realistic, working examples
3. **Descriptions**: Clear, concise descriptions in appropriate language
4. **Validation**: Keep validation rules in sync with documentation
5. **Testing**: Test documented examples regularly

### Automated Documentation

The documentation is automatically generated from:

- Route definitions
- Validation rules
- Schema definitions
- Controller implementations

This ensures documentation stays in sync with actual API behavior.
