import type { LoginRequest, RegisterRequest, TokenResponse, RefreshTokenRequest, User } from '@/models/auth'
import { API_BASE_URL } from './api-config'

const API_BASE = `${API_BASE_URL}/api`

export const authApi = {
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid email or password')
      }
      const error = await response.json().catch(() => ({ error: 'Login failed' }))
      throw new Error(error.error || 'Login failed')
    }

    return response.json()
  },

  async register(data: RegisterRequest): Promise<TokenResponse> {
    const token = localStorage.getItem('accessToken')
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Registration failed' }))
      throw new Error(error.error || 'Registration failed')
    }

    return response.json()
  },

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken } as RefreshTokenRequest),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }

    return response.json()
  },

  async revokeToken(email: string): Promise<void> {
    const token = localStorage.getItem('accessToken')
    const response = await fetch(`${API_BASE}/auth/revoke-token?email=${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    if (!response.ok) {
      throw new Error('Failed to revoke token')
    }
  },

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      throw new Error('No access token')
    }

    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized')
      }
      throw new Error('Failed to get current user')
    }

    return response.json()
  },

  async logout(): Promise<void> {
    const token = localStorage.getItem('accessToken')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    
    if (token && user.email) {
      try {
        await this.revokeToken(user.email)
      } catch (error) {
        console.error('Failed to revoke token on server:', error)
      }
    }

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  },
}
