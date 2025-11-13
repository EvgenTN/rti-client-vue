export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  confirmPassword: string
  firstName?: string
  lastName?: string
  userName?: string
  role: string
}

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  userName?: string
  role: string
  fullName: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: User
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export type UserRole = 'Admin' | 'Manager' | 'Operator' | 'Viewer'

export const ROLES: UserRole[] = ['Admin', 'Manager', 'Operator', 'Viewer']

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
