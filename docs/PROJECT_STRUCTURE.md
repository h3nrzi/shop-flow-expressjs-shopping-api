# Project Structure & Architecture Patterns

## Overview

Shop Flow follows a **Clean Architecture** pattern with **Domain-Driven Design (DDD)** principles, implementing a modular monolithic structure. The project uses **TypeScript**, **Express.js**, and **MongoDB** with **Mongoose** as the ODM.

## Architecture Patterns

### 1. Clean Architecture (Layered Architecture)

The project is organized into distinct layers with clear separation of concerns:

```
src/
├── app/           # Application Layer (Configuration & Setup)
├── core/          # Domain Layer (Business Logic)
├── middlewares/   # Infrastructure Layer (Cross-cutting concerns)
├── errors/        # Domain Layer (Custom Error Classes)
├── utils/         # Infrastructure Layer (Utilities)
└── __tests__/     # Test Layer
```

### 2. Domain-Driven Design (DDD)

Each business domain is encapsulated in its own module with complete separation:

```
src/core/
├── users/         # User Domain
├── products/      # Product Domain
├── orders/        # Order Domain
├── reviews/       # Review Domain
├── uploads/       # Upload Domain
└── views/         # View Domain
```

### 3. Repository Pattern

Each domain implements the Repository pattern for data access abstraction:

```typescript
// Example: UserRepository
export class UserRepository {
	constructor(private readonly userModel: IUserModel) {}

	async findById(userId: string): Promise<IUserDoc | null> {
		return this.userModel.findById(userId);
	}

	async create(createUserDto: ICreateUserDto): Promise<IUserDoc> {
		return this.userModel.create(createUserDto);
	}
}
```

### 4. Dependency Injection

The project uses manual dependency injection through a central [`index.ts`](../src/core/index.ts) file:

```typescript
// Repositories Injection
export const userRepository = new UserRepository(User);
export const productRepository = new ProductRepository(Product);

// Services Injection
export const userService = new UserService(userRepository);
export const authService = new AuthService(userRepository);

// Controllers Injection
export const userController = new UserController(userService);
export const authController = new AuthController(authService);
```

## Project Structure

### Application Layer (`src/app/`)

**Purpose**: Application configuration, setup, and bootstrapping

- [`index.ts`](../src/app/index.ts) - Main application entry point
- [`config.ts`](../src/app/config.ts) - Express middleware configuration
- [`routes.ts`](../src/app/routes.ts) - Route registration
- [`db.ts`](../src/app/db.ts) - Database connection setup

**Key Features**:

- Global error handling setup
- Security middleware configuration (Helmet, CORS, Rate Limiting)
- Database connection management
- Route registration and API documentation

### Domain Layer (`src/core/`)

**Purpose**: Business logic and domain entities

Each domain module follows the same structure:

```
domain/
├── domain.entity.ts      # Mongoose schema and model
├── domain.interface.ts   # TypeScript interfaces
├── domain.repository.ts  # Data access layer
├── domain.service.ts     # Business logic layer
├── domain.controller.ts  # HTTP request handling
├── domain.routes.ts      # Route definitions
└── dtos/                 # Data Transfer Objects
    ├── create-domain.dto.ts
    └── update-domain.dto.ts
```

#### Entity Layer

- **Mongoose Schemas**: Define data structure and validation
- **Instance Methods**: Business logic methods attached to documents
- **Middleware**: Pre/post hooks for data processing

```typescript
// Example: User entity with business methods
userSchema.methods.signToken = function (): string {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET!);
};

userSchema.methods.correctPassword = async function (
	candidatePassword: string,
) {
	return await bcrypt.compare(candidatePassword, this.password);
};
```

#### Repository Layer

- **CRUD Operations**: Create, Read, Update, Delete
- **Query Building**: Complex database queries
- **Data Aggregation**: Statistical and analytical queries

#### Service Layer

- **Business Logic**: Core application logic
- **Validation**: Business rule validation
- **Error Handling**: Domain-specific error management

#### Controller Layer

- **HTTP Handling**: Request/response processing
- **Input Validation**: Request data validation
- **Response Formatting**: Consistent API responses

### Infrastructure Layer

#### Middleware (`src/middlewares/`)

Cross-cutting concerns implemented as Express middleware:

- [`auth.ts`](../src/middlewares/auth.ts) - Authentication and authorization
- [`error-handler.ts`](../src/middlewares/error-handler.ts) - Global error handling
- [`validate-request.ts`](../src/middlewares/validate-request.ts) - Request validation
- [`security.ts`](../src/middlewares/security.ts) - Security utilities
- [`upload.ts`](../src/middlewares/upload.ts) - File upload handling

#### Error Handling (`src/errors/`)

Custom error classes extending a base [`CustomError`](../src/errors/custom-error.ts):

- [`NotFoundError`](../src/errors/not-found-error.ts) - 404 errors
- [`BadRequestError`](../src/errors/bad-request-error.ts) - 400 errors
- [`NotAuthorizedError`](../src/errors/not-authorized-error.ts) - 401 errors
- [`ForbiddenError`](../src/errors/forbidden-error.ts) - 403 errors

## Design Patterns Used

### 1. **Factory Pattern**

Used in the dependency injection setup in [`src/core/index.ts`](../src/core/index.ts)

### 2. **Strategy Pattern**

Implemented in API features utility for different query operations

### 3. **Middleware Pattern**

Express.js middleware chain for request processing

### 4. **Observer Pattern**

Mongoose middleware hooks for document lifecycle events

### 5. **Template Method Pattern**

Base repository and service classes with common operations

## Key Architectural Decisions

### 1. **Modular Monolith**

- Each domain is self-contained
- Clear boundaries between modules
- Easy to extract into microservices if needed

### 2. **Interface Segregation**

- Separate interfaces for different concerns
- DTOs for data transfer
- Clear contracts between layers

### 3. **Single Responsibility**

- Each class has one reason to change
- Separation of concerns across layers
- Focused, cohesive modules

### 4. **Dependency Inversion**

- High-level modules don't depend on low-level modules
- Both depend on abstractions (interfaces)
- Dependency injection for loose coupling

## File Naming Conventions

### Domain Files

- `domain.entity.ts` - Mongoose model and schema
- `domain.interface.ts` - TypeScript interfaces
- `domain.repository.ts` - Data access layer
- `domain.service.ts` - Business logic layer
- `domain.controller.ts` - HTTP handlers
- `domain.routes.ts` - Route definitions

### DTOs (Data Transfer Objects)

- `create-domain.dto.ts` - Creation payload
- `update-domain.dto.ts` - Update payload
- `domain-specific.dto.ts` - Specialized DTOs

### Tests

- `domain.spec.ts` - Unit tests
- `domain-integration.spec.ts` - Integration tests

## Configuration Management

### Environment Variables

Centralized configuration through environment variables:

```env
# Database
MONGO_URI=mongodb://localhost:27017/shop-flow

# JWT Configuration
JWT_SECRET=your_access_token_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=7d

# Security
NODE_ENV=development
```

### Application Configuration

Configuration is centralized in [`src/app/config.ts`](../src/app/config.ts):

- Security headers (Helmet)
- CORS configuration
- Rate limiting
- Body parsing
- Cookie parsing
- Data sanitization

## Database Design

### Schema Design Principles

1. **Normalization**: Related data in separate collections
2. **Embedding**: Small, frequently accessed data embedded
3. **Indexing**: Strategic indexes for query performance
4. **Validation**: Schema-level and application-level validation

### Relationships

- **Users ↔ Orders**: One-to-Many
- **Products ↔ Reviews**: One-to-Many
- **Orders ↔ Products**: Many-to-Many (through order items)
- **Users ↔ Reviews**: One-to-Many

### Authentication Flow

- JWT-based authentication
- Refresh token rotation
- Secure cookie storage
- Multi-layer token validation

### Authorization

- Role-based access control (RBAC)
- Route-level permissions
- Resource-level permissions

### Data Protection

- Input sanitization
- XSS protection
- NoSQL injection prevention
- Rate limiting
- HTTPS enforcement

## Testing Strategy

### Test Structure

```
src/__tests__/
├── helpers/           # Test utilities
├── integration/       # Integration tests
│   ├── auth/         # Authentication tests
│   ├── users/        # User domain tests
│   ├── products/     # Product domain tests
│   └── orders/       # Order domain tests
└── setup.ts          # Test configuration
```

### Testing Patterns

- **Integration Tests**: End-to-end API testing
- **Test Helpers**: Reusable test utilities
- **Database Isolation**: In-memory MongoDB for tests
- **Authentication Helpers**: Token generation utilities

## API Documentation

### Swagger Integration

- OpenAPI 3.0 specification
- Interactive API documentation
- Automatic schema generation
- Request/response examples

### Documentation Structure

```
src/swagger/
├── config.ts         # Swagger configuration
├── base.json         # Base OpenAPI specification
└── apis/             # API endpoint documentation
    ├── admin.yaml
    ├── auth.yaml
    └── products.yaml
```

## Performance Optimizations

### Database Optimizations

- Strategic indexing
- Query optimization
- Connection pooling
- Aggregation pipelines

### Application Optimizations

- Async/await patterns
- Error handling with express-async-errors
- Efficient middleware ordering
- Memory management

## Development Workflow

### Code Organization

1. **Domain-First**: Start with domain entities
2. **Repository Layer**: Implement data access
3. **Service Layer**: Add business logic
4. **Controller Layer**: Handle HTTP requests
5. **Route Registration**: Wire up endpoints

### Best Practices

- **TypeScript**: Strong typing throughout
- **Error Handling**: Consistent error responses
- **Validation**: Input validation at multiple layers
- **Documentation**: Comprehensive API documentation
- **Testing**: Test-driven development approach
