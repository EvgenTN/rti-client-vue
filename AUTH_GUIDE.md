# Vue Client Authentication Guide

This guide explains the authentication system implemented in the Vue client for the Real-Time Inventory application.

## Overview

The authentication system uses JWT tokens with the following features:
- Login/logout functionality
- Token-based authentication with automatic refresh
- Role-based access control (Admin, Manager, Operator, Viewer)
- Protected routes with navigation guards
- Automatic token injection in API calls
- Persistent authentication state

## Architecture

### Core Components

1. **Auth Models** (`src/models/auth.ts`)
   - TypeScript interfaces for auth data structures
   - `LoginRequest`, `RegisterRequest`, `User`, `TokenResponse`, etc.

2. **Auth API** (`src/lib/auth-api.ts`)
   - HTTP client for auth endpoints
   - Methods: `login()`, `register()`, `refreshToken()`, `getCurrentUser()`, `logout()`

3. **Auth Store** (`src/stores/auth.ts`)
   - Pinia store managing authentication state
   - Reactive state: `user`, `accessToken`, `refreshToken`, `isLoading`
   - Computed properties: `isAuthenticated`, `isAdmin`, `isManager`, `isOperator`
   - Persists to `localStorage`

4. **Authenticated Fetch** (`src/lib/fetch-with-auth.ts`)
   - Wrapper around native `fetch` API
   - Automatically injects Bearer token
   - Handles 401 responses by attempting token refresh
   - Helper functions: `getWithAuth()`, `postWithAuth()`, `putWithAuth()`, `deleteWithAuth()`

5. **Router Guards** (`src/router/index.ts`)
   - `requiresAuth` meta: Redirects to login if not authenticated
   - `requiresGuest` meta: Redirects to home if already authenticated
   - `requiresRole` meta: Enforces role hierarchy (Admin > Manager > Operator > Viewer)

## Usage

### Login Flow

```typescript
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Login
await authStore.login({
  email: 'user@example.com',
  password: 'password123'
})

// Check authentication status
if (authStore.isAuthenticated) {
  console.log('User:', authStore.user)
  console.log('Role:', authStore.user?.role)
}

// Logout
await authStore.logout()
```

### Making Authenticated API Calls

All existing API services have been updated to use authenticated fetch:

```typescript
import { getWithAuth, postWithAuth } from '@/lib/fetch-with-auth'

// GET request
const response = await getWithAuth('/api/containers')

// POST request
const response = await postWithAuth('/api/containers', {
  name: 'Container1',
  properties: []
})
```

The `fetchWithAuth` wrapper automatically:
- Injects the `Authorization: Bearer <token>` header
- Handles 401 responses by refreshing the token
- Retries the request with the new token
- Logs out the user if refresh fails

### Protected Routes

Routes are protected using meta fields:

```typescript
{
  path: '/lots',
  name: 'lots',
  component: () => import('../views/LotsMain.vue'),
  meta: { requiresAuth: true }
}

{
  path: '/lots/create',
  name: 'lot-create',
  component: () => import('../views/LotCreate.vue'),
  meta: { requiresAuth: true, requiresRole: 'Operator' }
}
```

### Role-Based Access

Check user roles in components:

```vue
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <button v-if="authStore.isAdmin">Admin Only Action</button>
  <button v-if="authStore.isOperator">Operator+ Action</button>
</template>
```

Role hierarchy:
- `isAdmin`: Admin only
- `isManager`: Manager or Admin
- `isOperator`: Operator, Manager, or Admin
- All roles can view (Viewer is the base role)

## API Endpoints

The client communicates with these backend endpoints:

- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new user (Admin only)
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/revoke-token` - Revoke refresh token
- `GET /api/auth/me` - Get current user info

## Token Management

### Access Token
- Valid for 60 minutes
- Stored in `localStorage` as `accessToken`
- Automatically injected in API requests

### Refresh Token
- Valid for 30 days
- Stored in `localStorage` as `refreshToken`
- Used to obtain new access tokens

### Auto-Refresh
When an API call receives a 401 response:
1. The `fetchWithAuth` interceptor catches it
2. Calls `/api/auth/refresh-token` with the refresh token
3. Updates the access token in the store
4. Retries the original request
5. If refresh fails, logs out the user

## Security Considerations

1. **Token Storage**: Tokens are stored in `localStorage`. For higher security applications, consider using `httpOnly` cookies.

2. **HTTPS**: Always use HTTPS in production to prevent token interception.

3. **Token Expiration**: Access tokens expire in 60 minutes. The auto-refresh mechanism handles this transparently.

4. **Logout**: Always call `authStore.logout()` to properly clear tokens and revoke refresh token on the server.

## Testing

To test authentication:

1. Start the backend server
2. Run the Vue dev server: `npm run dev`
3. Navigate to `/login`
4. Use test credentials (from seed data):
   - Admin: `admin@example.com` / `Admin123!`
   - Manager: `manager@example.com` / `Manager123!`
   - Operator: `operator@example.com` / `Operator123!`
   - Viewer: `viewer@example.com` / `Viewer123!`

## Troubleshooting

### "Session expired" errors
- Clear `localStorage` and try logging in again
- Check if the backend auth service is running
- Verify backend JWT configuration

### 401 Unauthorized
- Ensure you're logged in
- Check if your role has permission for the action
- Verify token hasn't expired

### API calls not including token
- Ensure you're using the `fetchWithAuth` helpers
- Check that the auth store has a valid `accessToken`
