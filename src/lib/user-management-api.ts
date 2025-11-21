import { getWithAuth, postWithAuth, putWithAuth, deleteWithAuth } from './fetch-with-auth'
import type {
  UserListItem,
  CreateUserRequest,
  UpdateUserRequest,
  ChangeRoleRequest,
  ResetPasswordRequest
} from '@/models/user-management'

const API_BASE = '/api'

export const UserManagementService = {
  /**
   * Get all users (Admin only)
   */
  async getAllUsers(): Promise<UserListItem[]> {
    const response = await getWithAuth(`${API_BASE}/users`)
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch users: ${errorText || response.statusText}`)
    }
    return response.json()
  },

  /**
   * Get user by ID (Admin only)
   */
  async getUserById(userId: string): Promise<UserListItem> {
    const response = await getWithAuth(`${API_BASE}/users/${userId}`)
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch user: ${errorText || response.statusText}`)
    }
    return response.json()
  },

  /**
   * Create new user (Admin only)
   * Uses the auth register endpoint which requires admin token
   */
  async createUser(data: CreateUserRequest): Promise<void> {
    const response = await postWithAuth(`${API_BASE}/auth/register`, data)
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create user: ${errorText || response.statusText}`)
    }
  },

  /**
   * Update user details (Admin only)
   */
  async updateUser(userId: string, data: UpdateUserRequest): Promise<UserListItem> {
    const response = await putWithAuth(`${API_BASE}/users/${userId}`, data)
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to update user: ${errorText || response.statusText}`)
    }
    return response.json()
  },

  /**
   * Delete user (Admin only)
   */
  async deleteUser(userId: string): Promise<void> {
    const response = await deleteWithAuth(`${API_BASE}/users/${userId}`)
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to delete user: ${errorText || response.statusText}`)
    }
  },

  /**
   * Change user role (Admin only)
   */
  async changeUserRole(userId: string, data: ChangeRoleRequest): Promise<void> {
    const response = await putWithAuth(`${API_BASE}/users/${userId}/role`, data)
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to change role: ${errorText || response.statusText}`)
    }
  },

  /**
   * Reset user password (Admin only)
   */
  async resetUserPassword(userId: string, data: ResetPasswordRequest): Promise<void> {
    const response = await putWithAuth(`${API_BASE}/users/${userId}/password`, data)
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to reset password: ${errorText || response.statusText}`)
    }
  }
}
