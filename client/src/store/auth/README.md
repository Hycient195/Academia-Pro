# Cookie-Based Authentication System

A comprehensive, secure authentication system that uses HTTP-only cookies for token management, with built-in CSRF protection and XSS prevention.

## 🚀 Features

- **Cookie-Based Authentication**: Secure HTTP-only cookies for access and refresh tokens
- **Automatic Token Refresh**: Silent refresh mechanism with configurable intervals
- **CSRF Protection**: Double-submit cookie pattern with CSRF tokens
- **XSS Prevention**: Comprehensive security headers and input sanitization
- **React Integration**: Context-based authentication state management
- **Type-Safe**: Full TypeScript support with proper interfaces
- **Route Protection**: Authentication guards and role-based access control

## 📁 Architecture

### Backend Components

```
server/src/auth/
├── middleware/
│   ├── cookie-auth.middleware.ts    # Cookie-based authentication
│   ├── csrf.middleware.ts           # CSRF protection
│   └── security.middleware.ts       # XSS prevention headers
├── auth.controller.ts               # Authentication endpoints
├── auth.service.ts                  # Authentication business logic
└── auth.module.ts                   # Module configuration
```

### Frontend Components

```
client/src/
├── store/auth/
│   └── authContext.tsx              # Authentication context & provider
├── components/auth/
│   ├── AuthGuard.tsx                # Route protection components
│   └── LoginForm.tsx                # Login form example
└── lib/
    └── apiClient.ts                 # Cookie-aware API client
```

## 🔧 Backend Setup

### 1. Middleware Configuration

The authentication middleware is automatically configured in `app.module.ts`:

```typescript
configure(consumer: MiddlewareConsumer) {
  // Security headers for all routes
  consumer
    .apply(SecurityMiddleware)
    .forRoutes({ path: '*', method: RequestMethod.ALL });

  // Cookie authentication for protected routes
  consumer
    .apply(CookieAuthMiddleware)
    .exclude([
      { path: 'api/v1/auth/login', method: RequestMethod.POST },
      { path: 'api/v1/auth/register', method: RequestMethod.POST },
      // ... other public routes
    ])
    .forRoutes({ path: '*', method: RequestMethod.ALL });

  // CSRF protection for state-changing operations
  consumer
    .apply(CSRFMiddleware)
    .exclude([
      { path: 'api/v1/auth/login', method: RequestMethod.POST },
      { path: 'api/v1/auth/csrf-token', method: RequestMethod.GET },
      // ... other safe routes
    ])
    .forRoutes({ path: '*', method: RequestMethod.POST });
}
```

### 2. Authentication Endpoints

#### Login
```typescript
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**: Sets authentication cookies automatically
```typescript
// Cookies set:
// - accessToken (HTTP-only, 24 hours)
// - refreshToken (HTTP-only, 7 days)
// - csrfToken (HTTP-only, 1 hour)
```

#### Logout
```typescript
POST /api/v1/auth/logout
Authorization: Bearer <token> OR cookies
```

**Response**: Clears all authentication cookies

#### CSRF Token
```typescript
GET /api/v1/auth/csrf-token
```

**Response**:
```json
{
  "csrfToken": "random-csrf-token-string"
}
```

## 🎯 Frontend Usage

### 1. Setup AuthProvider

Wrap your app with the AuthProvider:

```tsx
// app/layout.tsx or _app.tsx
import { AuthProvider } from '@/store/auth/authContext'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### 2. Use Authentication Hook

```tsx
import { useAuth } from '@/store/auth/authContext'

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()

  const handleLogin = async () => {
    const result = await login('user@example.com', 'password')
    if (result.success) {
      // Redirect to dashboard
    } else {
      console.error(result.error)
    }
  }

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.firstName}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  )
}
```

### 3. Protect Routes

```tsx
import { AuthGuard, RoleGuard } from '@/components/auth/AuthGuard'

// Protect authenticated routes
<AuthGuard requireAuth={true}>
  <Dashboard />
</AuthGuard>

// Protect admin routes
<RoleGuard allowedRoles={['admin', 'super_admin']}>
  <AdminPanel />
</RoleGuard>

// Higher-order component
const ProtectedDashboard = withAuth(Dashboard, {
  requireAuth: true,
  allowedRoles: ['user']
})
```

### 4. API Calls with CSRF Protection

```tsx
import { apiClient } from '@/lib/apiClient'

// Automatic CSRF token handling
const response = await apiClient.post('/api/v1/users', {
  name: 'John Doe',
  email: 'john@example.com'
})

// CSRF token is automatically included in headers
```

## 🔒 Security Features

### Cookie Security
- **HTTP-only**: Prevents JavaScript access to tokens
- **Secure**: HTTPS-only in production
- **SameSite**: Strict same-site policy
- **Expiration**: Appropriate token lifetimes

### CSRF Protection
- **Double-submit cookie**: CSRF token in both cookie and header
- **Automatic refresh**: Tokens refreshed on expiration
- **Per-session tokens**: Unique tokens for each session

### XSS Prevention
- **Content Security Policy**: Restricts resource loading
- **XSS Protection Headers**: Browser-based XSS prevention
- **Input Sanitization**: Automatic input cleaning
- **Secure Headers**: HSTS, frame options, etc.

## 🔄 Token Refresh Flow

1. **Access Token Expires**: Frontend detects expired token
2. **Silent Refresh**: Automatic refresh using refresh token cookie
3. **New Tokens**: Server issues new access and refresh tokens
4. **Cookie Update**: New tokens stored in HTTP-only cookies
5. **Seamless**: User experience uninterrupted

## 📝 API Reference

### AuthContext Methods

```typescript
interface AuthContextType {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  csrfToken: string | null

  // Methods
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  getCSRFToken: () => Promise<string | null>
}
```

### API Client Methods

```typescript
interface ApiClient {
  get<T>(endpoint: string): Promise<ApiResponse<T>>
  post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>>
  put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>>
  patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>>
  delete<T>(endpoint: string): Promise<ApiResponse<T>>
}
```

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   ```env
   NODE_ENV=production
   JWT_SECRET=your-secret-key
   CORS_ORIGIN=https://yourdomain.com
   ```

3. **Start Application**:
   ```bash
   npm run start:prod
   ```

## 🧪 Testing

### Manual Testing

1. **Login Flow**:
   ```bash
   curl -X POST http://localhost:3001/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password"}' \
     -i
   ```

2. **Check Cookies**: Verify HTTP-only cookies are set

3. **Protected Route**:
   ```bash
   curl http://localhost:3001/api/v1/auth/me \
     -H "Cookie: accessToken=your-token"
   ```

### Automated Testing

```typescript
// Example test
describe('Authentication', () => {
  it('should login and set cookies', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(200)

    expect(response.headers['set-cookie']).toBeDefined()
  })
})
```

## 🔧 Configuration

### Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com

# Security Headers
NODE_ENV=production
```

### Cookie Options

```typescript
const cookieOptions = {
  httpOnly: true,           // Prevent JavaScript access
  secure: isProduction,     // HTTPS only in production
  sameSite: 'strict',       // Strict same-site policy
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure CORS_ORIGIN is correctly set
2. **Cookie Not Set**: Check if HTTPS is required in production
3. **CSRF Token Missing**: Ensure CSRF token is included in requests
4. **Token Expired**: Implement proper refresh logic

### Debug Mode

Enable debug logging:

```typescript
// In auth.middleware.ts
console.log('Auth cookies:', req.cookies)
console.log('CSRF token:', req.headers['x-csrf-token'])
```

## 📚 Additional Resources

- [OWASP Authentication Cheat Sheet](https://owasp.org/www-project-cheat-sheets/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Cookie Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [CSRF Prevention](https://owasp.org/www-community/attacks/csrf)

---

This authentication system provides enterprise-grade security with a developer-friendly API. The cookie-based approach eliminates token management complexity while maintaining robust security through multiple layers of protection.