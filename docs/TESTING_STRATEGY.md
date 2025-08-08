# Testing Strategy

## Overview

Shop Flow implements a comprehensive testing strategy focused on **integration testing** with **Jest** and **Supertest**. The testing approach emphasizes real-world scenarios, API endpoint testing, and database interactions using an in-memory MongoDB instance for isolation and speed.

## Testing Architecture

### Test Framework Stack

- **Jest**: Primary testing framework with TypeScript support
- **Supertest**: HTTP assertion library for API endpoint testing
- **MongoDB Memory Server**: In-memory MongoDB for isolated testing
- **ts-jest**: TypeScript transformer for Jest
- **Mongoose**: Database ODM with test-specific configurations

### Configuration

**File**: [`jest.config.js`](jest.config.js)

```javascript
module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	roots: ["<rootDir>/src"],
	testMatch: ["**/__tests__/**/*.spec.ts"],
	transform: {
		"^.+\\.tsx?$": "ts-jest",
	},
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
	setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
	testTimeout: 30000,
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
	},
};
```

**Key Features**:

- **TypeScript Support**: Full TypeScript compilation and type checking
- **Path Mapping**: Absolute imports using `@/` prefix
- **Test Discovery**: Automatic discovery of `*.spec.ts` files
- **Extended Timeout**: 30-second timeout for database operations
- **Setup Integration**: Automatic test environment setup

## Test Environment Setup

**File**: [`src/__tests__/setup.ts`](src/__tests__/setup.ts)

### Database Setup

```typescript
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongo: MongoMemoryServer;

beforeAll(async () => {
	// Set test environment variables
	process.env.JWT_SECRET = "asdf";
	process.env.JWT_EXPIRES_IN = "1h";
	process.env.NODE_ENV = "test";

	// Close existing connections
	if (mongoose.connection.readyState !== 0) {
		await mongoose.connection.close();
	}

	// Initialize in-memory MongoDB
	mongo = await MongoMemoryServer.create();
	const mongoUri = mongo.getUri();
	await mongoose.connect(mongoUri);

	// Ensure connection is ready
	await mongoose.connection.asPromise();
});

beforeEach(async () => {
	// Clean database between tests
	const collections = await mongoose.connection.db.collections();
	for (let collection of collections) await collection.deleteMany({});
});

afterAll(async () => {
	// Cleanup after all tests
	await mongoose.connection.close();
	await mongo.stop();
});
```

**Features**:

- **Isolated Database**: Each test run gets a fresh MongoDB instance
- **Clean State**: Database cleared between each test
- **Environment Variables**: Test-specific configuration
- **Connection Management**: Proper setup and teardown

### Mock Configuration

```typescript
// Mock external dependencies
jest.mock("@/utils/email", () => {
	return {
		sendEmail: jest.fn().mockResolvedValue(undefined),
	};
});
```

**Benefits**:

- **External Service Isolation**: Email service mocked for testing
- **Predictable Behavior**: Consistent mock responses
- **Fast Execution**: No external API calls during tests

## Test Structure

### Directory Organization

```
src/__tests__/
├── setup.ts              # Global test configuration
├── helpers/               # Test utility functions
│   ├── auth.helper.ts    # Authentication test helpers
│   ├── products.helper.ts # Product test helpers
│   ├── orders.helper.ts  # Order test helpers
│   ├── reviews.helper.ts # Review test helpers
│   └── users.helper.ts   # User test helpers
└── integration/          # Integration tests
    ├── auth/             # Authentication tests
    ├── users/            # User management tests
    ├── products/         # Product tests
    ├── orders/           # Order tests
    ├── reviews/          # Review tests
    ├── uploads/          # File upload tests
    └── admin/            # Admin functionality tests
```

### Test Naming Convention

- **Files**: `*.spec.ts` for test files
- **Describe Blocks**: HTTP method and endpoint (`GET /api/products`)
- **Test Cases**: Descriptive scenario names
- **Helper Functions**: Domain-specific helper files

## Test Helpers

### Authentication Helper

**File**: [`src/__tests__/helpers/auth.helper.ts`](src/__tests__/helpers/auth.helper.ts)

```typescript
// Request helpers
export const signupRequest = async (body: ISignupDto): Promise<Response> => {
	return await request(app).post("/api/users/signup").send(body);
};

export const loginRequest = async (body: ILoginDto): Promise<Response> => {
	return await request(app).post("/api/users/login").send(body);
};

export const logoutRequest = async (cookie: string): Promise<Response> => {
	return await request(app).post("/api/users/logout").set("Cookie", cookie);
};

// Utility functions
export const getUniqueUser = (suffix: string): IValidUser => ({
	name: "test",
	email: `test${suffix}@test.com`,
	password: "test123456",
	passwordConfirmation: "test123456",
});

export const getInvalidToken = (): string => {
	const id = new mongoose.Types.ObjectId().toString();
	return jwt.sign({ id }, process.env.JWT_SECRET!, {
		expiresIn: process.env.JWT_EXPIRES_IN!,
	});
};
```

**Features**:

- **Request Abstractions**: Simplified API request functions
- **Data Generators**: Unique test data creation
- **Token Management**: Valid and invalid token generation
- **Complex Flows**: Multi-step authentication scenarios

### Product Helper

Similar helpers exist for other domains:

```typescript
// Product test helpers
export const getAllProductsRequest = async (query: any): Promise<Response> => {
	return await request(app).get("/api/products").query(query);
};

export const createProductRequest = async (
	body: CreateProductDto,
	token: string,
): Promise<Response> => {
	return await request(app)
		.post("/api/products")
		.set("Authorization", `Bearer ${token}`)
		.send(body);
};
```

## Integration Testing Approach

### Test Categories

#### 1. **Authentication Tests**

**File**: [`src/__tests__/integration/auth/login.spec.ts`](src/__tests__/integration/auth/login.spec.ts)

```typescript
describe("POST /api/users/signin", () => {
	describe("should return 400, if", () => {
		validationCases.forEach(({ testCaseName, body, error }) => {
			it(testCaseName, async () => {
				const res = await loginRequest(body);
				expect(res.status).toBe(400);
				expect(res.body.errors[0].message).toBe(error);
			});
		});
	});

	describe("should return 401, if", () => {
		it("User is not active", async () => {
			const user = getUniqueUser("user");
			await signupRequest(user);
			const userDoc = await userRepository.findByEmail(user.email);
			userDoc!.active = false;
			await userDoc!.save({ validateBeforeSave: false });

			const res = await loginRequest(user);
			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"کاربری که به این ایمیل مرتبط است مسدود شده است! لطفا با پشتیبانی تماس بگیرید.",
			);
		});
	});

	describe("should return 200, if", () => {
		it("Email is found, user is active and password is correct", async () => {
			const user = getUniqueUser("user");
			await signupRequest(user);
			const res = await loginRequest(user);
			expect(res.status).toBe(200);
			expect(res.headers["set-cookie"]).toBeDefined();
		});
	});
});
```

**Testing Patterns**:

- **Validation Testing**: Input validation error scenarios
- **Business Logic Testing**: Authentication rules and constraints
- **Success Path Testing**: Valid authentication flows
- **Database State Testing**: User status and data persistence

#### 2. **Product Tests**

**File**: [`src/__tests__/integration/products/get-all-products.spec.ts`](src/__tests__/integration/products/get-all-products.spec.ts)

```typescript
describe("GET /api/products", () => {
	describe("200", () => {
		it("if pagination works", async () => {
			// Create 10 test products
			for (let i = 0; i < 10; i++) {
				await productRepository.createOne({
					name: `Product ${i}`,
					price: i * 1000,
					countInStock: 10,
					// ... other fields
				});
			}

			// Test pagination
			const res = await getAllProductsRequest({
				page: 2,
				limit: 5,
			});

			expect(res.status).toBe(200);
			expect(res.body.pagination.page).toBe(2);
			expect(res.body.pagination.limit).toBe(5);
		});

		it("if filter by brand", async () => {
			await productRepository.createOne({
				name: "Samsung Phone",
				brand: "Samsung",
				// ... other fields
			});

			const res = await getAllProductsRequest({
				brand: "Samsung",
			});

			expect(res.status).toBe(200);
			expect(res.body.data).toBeDefined();
		});
	});
});
```

**Testing Patterns**:

- **Pagination Testing**: Page and limit functionality
- **Filtering Testing**: Query parameter filtering
- **Search Testing**: Full-text search capabilities
- **Sorting Testing**: Data ordering functionality
- **Data Structure Testing**: Response format validation

## Test Data Management

### Data Generation Strategies

#### 1. **Unique Data Generation**

```typescript
export const getUniqueUser = (suffix: string): IValidUser => ({
	name: "test",
	email: `test${suffix}@test.com`,
	password: "test123456",
	passwordConfirmation: "test123456",
});

// Usage in tests
const user1 = getUniqueUser("1");
const user2 = getUniqueUser("2");
```

#### 2. **Factory Functions**

```typescript
const createTestProduct = (overrides: Partial<CreateProductDto> = {}) => ({
	name: "Test Product",
	price: 10000,
	countInStock: 10,
	brand: "Test Brand",
	category: "Test Category",
	description: "Test Description",
	image: "test.jpg",
	...overrides,
});

// Usage
const product = createTestProduct({
	price: 20000,
	brand: "Samsung",
});
```

#### 3. **Database Seeding**

```typescript
const seedProducts = async (count: number) => {
	for (let i = 0; i < count; i++) {
		await productRepository.createOne({
			name: `Product ${i}`,
			price: i * 1000,
			countInStock: 10,
			discount: 10,
			isAvailable: true,
			brand: `Brand ${i % 10}`,
			category: `Category ${i % 10}`,
			rating: i,
			numReviews: i,
			description: `Description ${i}`,
			image: `Image ${i}`,
		});
	}
};
```

## Testing Patterns

### 1. **Validation Testing Pattern**

```typescript
const validationCases = [
	{
		testCaseName: "Email is not provided",
		body: { email: "", password: "password" },
		error: "ایمیل کاربر الزامی است",
	},
	{
		testCaseName: "Email is not valid",
		body: { email: "user@test", password: "password" },
		error: "فرمت ایمیل وارد شده معتبر نیست",
	},
];

describe("should return 400, if", () => {
	validationCases.forEach(({ testCaseName, body, error }) => {
		it(testCaseName, async () => {
			const res = await loginRequest(body);
			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe(error);
		});
	});
});
```

### 2. **Authentication Testing Pattern**

```typescript
describe("Protected Routes", () => {
	it("should require authentication", async () => {
		const res = await request(app).get("/api/protected-route");
		expect(res.status).toBe(401);
	});

	it("should allow access with valid token", async () => {
		const user = await createTestUser();
		const token = user.signToken();

		const res = await request(app)
			.get("/api/protected-route")
			.set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(200);
	});
});
```

### 3. **Database State Testing Pattern**

```typescript
it("should update user in database", async () => {
	const user = getUniqueUser("test");
	await signupRequest(user);

	const updateData = { name: "Updated Name" };
	const res = await updateUserRequest(updateData, token);

	expect(res.status).toBe(200);

	// Verify database state
	const updatedUser = await userRepository.findByEmail(user.email);
	expect(updatedUser!.name).toBe("Updated Name");
});
```

### 4. **Error Handling Testing Pattern**

```typescript
describe("Error Handling", () => {
	it("should handle database errors gracefully", async () => {
		// Force database error
		jest
			.spyOn(userRepository, "findById")
			.mockRejectedValue(new Error("Database error"));

		const res = await getUserRequest(userId, token);

		expect(res.status).toBe(500);
		expect(res.body.errors[0].message).toBe("یک چیزی خیلی اشتباه پیش رفت");
	});
});
```

## Test Coverage Areas

### 1. **API Endpoints**

- **Authentication**: Signup, login, logout, password reset, token refresh
- **User Management**: CRUD operations, profile updates, user roles
- **Product Management**: Product CRUD, filtering, searching, pagination
- **Order Management**: Order creation, updates, status changes
- **Review System**: Review CRUD, rating calculations
- **File Uploads**: Image upload, validation, storage
- **Admin Functions**: User management, order management, analytics

### 2. **Business Logic**

- **Authentication Rules**: Password validation, token expiration, user status
- **Authorization Rules**: Role-based access control, resource ownership
- **Data Validation**: Input validation, business rule enforcement
- **Calculations**: Price calculations, rating averages, order totals
- **State Transitions**: Order status changes, user activation/deactivation

### 3. **Error Scenarios**

- **Validation Errors**: Invalid input data, missing required fields
- **Authentication Errors**: Invalid credentials, expired tokens
- **Authorization Errors**: Insufficient permissions, role restrictions
- **Not Found Errors**: Non-existent resources, invalid IDs
- **Conflict Errors**: Duplicate data, business rule violations
- **Server Errors**: Database failures, external service errors

## Mock Strategies

### 1. **External Service Mocking**

```typescript
// Email service mock
jest.mock("@/utils/email", () => ({
	sendEmail: jest.fn().mockResolvedValue(undefined),
}));

// Usage in tests
const mockSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;
expect(mockSendEmail).toHaveBeenCalledWith(
	user.email,
	expect.stringContaining("reset-token"),
);
```

### 2. **Database Operation Mocking**

```typescript
// Mock specific repository methods
jest.spyOn(userRepository, "findById").mockResolvedValue(mockUser);
jest
	.spyOn(productRepository, "createOne")
	.mockRejectedValue(new Error("Database error"));
```

### 3. **Time-Sensitive Mocking**

```typescript
// Mock Date for consistent testing
const mockDate = new Date("2023-01-01T00:00:00.000Z");
jest.spyOn(global, "Date").mockImplementation(() => mockDate);
```

## Performance Testing

### 1. **Load Testing Considerations**

```typescript
describe("Performance Tests", () => {
	it("should handle multiple concurrent requests", async () => {
		const requests = Array(10)
			.fill(null)
			.map(() => getAllProductsRequest({}));

		const responses = await Promise.all(requests);

		responses.forEach((res) => {
			expect(res.status).toBe(200);
		});
	});
});
```

### 2. **Database Query Optimization**

```typescript
it("should efficiently query large datasets", async () => {
	// Seed large dataset
	await seedProducts(1000);

	const startTime = Date.now();
	const res = await getAllProductsRequest({
		page: 1,
		limit: 10,
	});
	const endTime = Date.now();

	expect(res.status).toBe(200);
	expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
});
```

## Test Execution

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth/login.spec.ts

# Run tests matching pattern
npm test -- --testNamePattern="should return 200"
```

### Test Scripts

**Package.json**:

```json
{
	"scripts": {
		"test": "jest --no-cache --detectOpenHandles --forceExit",
		"test:watch": "jest --watchAll --no-cache --detectOpenHandles --forceExit",
		"test:coverage": "jest --coverage --no-cache --detectOpenHandles --forceExit"
	}
}
```

**Features**:

- **No Cache**: Ensures fresh test runs
- **Detect Open Handles**: Identifies hanging processes
- **Force Exit**: Ensures clean test termination
- **Coverage Reports**: Detailed coverage analysis

## Continuous Integration

### GitHub Actions Integration

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

### Pre-commit Hooks

```json
{
	"husky": {
		"hooks": {
			"pre-commit": "npm test",
			"pre-push": "npm run test:coverage"
		}
	}
}
```

## Best Practices

### 1. **Test Organization**

- **Descriptive Names**: Clear, specific test descriptions
- **Logical Grouping**: Related tests grouped in describe blocks
- **Consistent Structure**: Standardized test file organization
- **Helper Abstraction**: Reusable test utilities

### 2. **Test Data Management**

- **Isolation**: Each test creates its own data
- **Cleanup**: Database cleared between tests
- **Realistic Data**: Test data resembles production data
- **Edge Cases**: Test boundary conditions and edge cases

### 3. **Assertion Strategies**

- **Specific Assertions**: Test exact expected values
- **Status Code Verification**: Always verify HTTP status codes
- **Response Structure**: Validate response format and structure
- **Database State**: Verify data persistence when applicable

### 4. **Error Testing**

- **Comprehensive Coverage**: Test all error scenarios
- **Error Message Validation**: Verify exact error messages
- **Status Code Accuracy**: Ensure correct HTTP status codes
- **Error Recovery**: Test system behavior after errors

### 5. **Performance Considerations**

- **Fast Execution**: Tests should run quickly
- **Parallel Execution**: Tests designed for parallel running
- **Resource Cleanup**: Proper cleanup to prevent memory leaks
- **Timeout Management**: Appropriate timeouts for async operations
