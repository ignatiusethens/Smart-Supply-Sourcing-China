# Authentication System Documentation

## Overview

The Smart Supply Sourcing platform implements a complete authentication system with:
- **Password Hashing**: Secure password storage using bcryptjs
- **JWT Tokens**: Token-based authentication for API routes
- **Session Management**: 30-minute session timeout with warning at 28 minutes
- **Role-Based Access Control**: Separate buyer and admin roles
- **Password Reset**: Complete password recovery flow with email verification

## Architecture

### Components

1. **Password Hashing** (`src/lib/auth/password.ts`)
   - Uses bcryptjs with 10 salt rounds
   - Password validation (min 8 chars, uppercase, lowercase, number)
   - Secure password comparison

2. **JWT Tokens** (`src/lib/auth/jwt.ts`)
   - Token generation with 7-day expiration
   - Token verification and decoding
   - Authorization header extraction

3. **Authentication Middleware** (`src/lib/auth/middleware.ts`)
   - `requireAuth()`: Require any authenticated user
   - `requireAdmin()`: Require admin role
   - `requireBuyer()`: Require buyer role

4. **Password Reset** (`src/lib/auth/password-reset.ts`)
   - Secure token generation
   - Token expiration (1 hour)
   - Token verification and usage tracking

5. **Auth Store** (`src/lib/stores/authStore.ts`)
   - Zustand store for client-side auth state
   - Session timeout management
   - localStorage persistence

6. **Auth Client** (`src/lib/api/auth-client.ts`)
   - Client-side API helpers
   - Token storage in localStorage
   - Authenticated request headers

## API Endpoints

### POST /api/auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "phone": "+254712345678",
  "companyName": "Acme Corp",
  "role": "buyer"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "buyer",
    ...
  },
  "token": "jwt-token-here"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### POST /api/auth/login
Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "user": { ... },
  "token": "jwt-token-here"
}
```

### POST /api/auth/logout
Logout user (client clears token).

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /api/auth/me
Get current authenticated user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "user": { ... }
}
```

### POST /api/auth/password-reset
Request password reset link.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset link has been sent to your email"
}
```

### PUT /api/auth/password-reset
Confirm password reset with token.

**Request:**
```json
{
  "token": "reset-token-here",
  "newPassword": "NewSecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

## Usage Examples

### Client-Side Registration

```typescript
import { registerUser } from '@/lib/api/auth-client';
import { useAuthStore } from '@/lib/stores/authStore';

const { login } = useAuthStore();

const handleRegister = async () => {
  const result = await registerUser({
    email: 'user@example.com',
    password: 'SecurePass123',
    name: 'John Doe',
    role: 'buyer'
  });

  if (result.success && result.user && result.token) {
    login(result.user, result.token);
    // User is now authenticated
  }
};
```

### Client-Side Login

```typescript
import { loginUser } from '@/lib/api/auth-client';
import { useAuthStore } from '@/lib/stores/authStore';

const { login } = useAuthStore();

const handleLogin = async () => {
  const result = await loginUser({
    email: 'user@example.com',
    password: 'SecurePass123'
  });

  if (result.success && result.user && result.token) {
    login(result.user, result.token);
  }
};
```

### Protected API Route

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  // Require authentication
  const auth = await requireAuth(request);
  if (!auth.success) {
    return auth.response; // Returns 401 Unauthorized
  }

  // Access authenticated user
  const user = auth.user;

  // Your protected logic here
  return NextResponse.json({ data: 'protected data' });
}

export async function POST(request: NextRequest) {
  // Require admin role
  const auth = await requireAdmin(request);
  if (!auth.success) {
    return auth.response; // Returns 401 or 403
  }

  // Admin-only logic here
  return NextResponse.json({ data: 'admin data' });
}
```

### Making Authenticated Requests

```typescript
import { createAuthHeaders } from '@/lib/api/auth-client';

const response = await fetch('/api/protected-endpoint', {
  method: 'GET',
  headers: createAuthHeaders(),
});
```

## Session Management

### Session Timeout
- Sessions expire after **30 minutes** of inactivity
- Warning modal appears at **28 minutes**
- Cart contents are preserved across sessions (localStorage)
- Authentication state cleared on session expiration

### Session Activity Tracking

```typescript
import { useAuthStore } from '@/lib/stores/authStore';

const { updateLastActivity } = useAuthStore();

// Update activity on user interaction
const handleUserAction = () => {
  updateLastActivity();
  // Your action logic
};
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  company_name VARCHAR(255),
  role VARCHAR(20) NOT NULL CHECK (role IN ('buyer', 'admin')),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Password Reset Tokens Table
```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Security Considerations

1. **Password Storage**: Passwords are hashed using bcryptjs with 10 salt rounds
2. **JWT Secret**: Store in environment variable `JWT_SECRET` (not hardcoded)
3. **Token Expiration**: JWT tokens expire after 7 days
4. **Reset Token Expiration**: Password reset tokens expire after 1 hour
5. **HTTPS**: Always use HTTPS in production
6. **CORS**: Configure appropriate CORS policies
7. **Rate Limiting**: Consider adding rate limiting for auth endpoints

## Environment Variables

```env
# JWT Secret (required in production)
JWT_SECRET=your-secure-secret-key-here

# Application URL (for password reset links)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Database connection
DATABASE_URL=postgresql://user:password@host:port/database
```

## Testing

Run authentication tests:
```bash
npm test -- auth
```

## Future Enhancements

1. **Email Service Integration**: Integrate SendGrid/AWS SES for password reset emails
2. **Two-Factor Authentication**: Add 2FA support
3. **OAuth Integration**: Add Google/Microsoft OAuth
4. **Refresh Tokens**: Implement refresh token rotation
5. **Account Lockout**: Add brute force protection
6. **Audit Logging**: Log authentication events
