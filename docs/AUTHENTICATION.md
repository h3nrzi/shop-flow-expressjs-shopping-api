# Authentication & Authorization

## Overview

Shop Flow implements JWT-based authentication with refresh tokens for enhanced security. The system uses role-based access control (RBAC) for authorization.

## How It Works

### Complete Authentication Flow

1. **User Registration/Login**

   - User submits credentials to `/auth/signup` or `/auth/login`
   - `AuthController` receives request and delegates to `AuthService`
   - `AuthService` validates credentials using `UserRepository`
   - For login: bcrypt compares password with stored hash
   - If valid, user document is returned to controller

2. **Token Generation**

   - `createSendTokenAndResponse()` utility is called with user data
   - Two JWT tokens are generated:
     - **Access Token**: Contains user ID, expires in 15 minutes
     - **Refresh Token**: Contains user ID, expires in 7 days
   - Both tokens are signed with different secrets

3. **Token Storage**

   - Access token stored in:
     - `jwt` cookie (httpOnly, secure)
     - `x-auth-token` response header
   - Refresh token stored in:
     - `refreshToken` cookie (httpOnly, secure)
     - User document in database with expiration timestamp

4. **Request Authentication**

   - Client sends requests with access token in header or cookie
   - `protect` middleware intercepts all protected routes
   - Token extracted from `Authorization: Bearer TOKEN` or `jwt` cookie
   - `verifyToken()` validates signature and expiration
   - User fetched from database using token's user ID
   - Additional validations:
     - User exists and is active
     - Password wasn't changed after token issuance
   - User object attached to `req.user` for downstream use

5. **Authorization Check**

   - `restrictTo()` middleware checks user role against allowed roles
   - Throws `ForbiddenError` if user lacks required permissions
   - Request proceeds to route handler if authorized

6. **Token Refresh Cycle**

   - When access token expires (15 min), client receives 401 error
   - Client automatically calls `/auth/refresh-token` with refresh token
   - `AuthService.refreshToken()` validates refresh token:
     - Verifies signature with refresh secret
     - Checks database storage and expiration
     - Ensures user is still active
   - New access token generated and returned
   - Process repeats until refresh token expires (7 days)

7. **Logout Process**
   - Client calls `/auth/logout`
   - Refresh token removed from database
   - Both cookies cleared with past expiration dates
   - User must re-authenticate for future requests

### Security Mechanisms

**Multi-Layer Token Validation**

- JWT signature verification prevents tampering
- Database lookup ensures user still exists
- Active status check prevents disabled account access
- Password change timestamp invalidates old tokens
- Refresh token database storage enables revocation

**Token Separation Strategy**

- Short-lived access tokens limit exposure window
- Long-lived refresh tokens reduce login frequency
- Different secrets prevent cross-token attacks
- Refresh tokens are single-use and database-validated

**Password Security**

- bcrypt with salt rounds prevents rainbow table attacks
- Password reset uses cryptographic tokens (SHA256)
- Reset tokens expire in 10 minutes
- Failed email sends trigger token cleanup

**Request Protection**

- httpOnly cookies prevent XSS token theft
- Secure flag ensures HTTPS-only transmission
- sameSite prevents CSRF attacks
- Multiple token sources provide client flexibility

## Authentication Flow

### Token Types

- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), used to generate new access tokens

### Endpoints

#### POST `/auth/signup`

```json
{
	"name": "string",
	"email": "string",
	"password": "string",
	"passwordConfirmation": "string"
}
```

#### POST `/auth/login`

```json
{
	"email": "string",
	"password": "string"
}
```

#### POST `/auth/logout`

Clears tokens from cookies and database.

#### POST `/auth/forgot-password`

```json
{
	"email": "string"
}
```

#### PATCH `/auth/reset-password?resetToken=TOKEN`

```json
{
	"password": "string",
	"passwordConfirmation": "string"
}
```

#### POST `/auth/refresh-token`

Uses refresh token from cookies to generate new access token.

## Token Storage

### Cookies

- `jwt`: Access token (httpOnly, secure, sameSite: strict)
- `refreshToken`: Refresh token (httpOnly, secure, sameSite: strict)

### Headers

- `x-auth-token`: Access token
- `Authorization: Bearer TOKEN`: Access token

### Database

- `refreshToken`: Hashed refresh token
- `refreshTokenExpires`: Expiration timestamp

## Authorization

### Middleware

#### `protect`

Validates access token and attaches user to request:

- Checks token from headers or cookies
- Verifies token signature
- Validates user existence and active status
- Checks password change timestamp

#### `restrictTo(...roles)`

Restricts access based on user roles:

```javascript
restrictTo("admin", "moderator");
```

### User Roles

- `user`: Default role
- `admin`: Administrative access

## Security Features

### Password Security

- bcrypt hashing with salt rounds
- Password change timestamp validation
- Secure password reset with crypto tokens

### Token Security

- Separate secrets for access/refresh tokens
- Token expiration validation
- Automatic token cleanup on logout
- Database storage for refresh token validation

### Account Security

- Active/inactive user status
- Account lockout for inactive users
- Email-based password recovery

## Environment Variables

```env
JWT_SECRET=your_access_token_secret
JWT_EXPIRES_IN=15m
JWT_COOKIE_EXPIRES_IN="15 minutes"

JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=7d
JWT_REFRESH_COOKIE_EXPIRES_IN="7 days"

PASSWORD_RESET_EXPIRES_IN="10m"
```

## Usage Examples

### Protected Route

```javascript
router.get("/profile", protect, getUserProfile);
```

### Admin Only Route

```javascript
router.delete("/users/:id", protect, restrictTo("admin"), deleteUser);
```

### Client Token Refresh

```javascript
// When access token expires (401), call refresh endpoint
fetch("/auth/refresh-token", {
	method: "POST",
	credentials: "include",
});
```

## Error Handling

- `NotAuthorizedError`: Invalid credentials, expired tokens
- `ForbiddenError`: Insufficient permissions
- `NotFoundError`: User not found
- `InternalServerError`: Email sending failures

## Best Practices

1. **Token Rotation**: Refresh tokens are single-use
2. **Secure Storage**: Tokens stored in httpOnly cookies
3. **Short Lifespan**: Access tokens expire quickly
4. **Database Validation**: Refresh tokens validated against database
5. **Cleanup**: Tokens cleared on logout
