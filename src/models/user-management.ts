export interface UserListItem {
  id: string
  email: string
  firstName?: string
  lastName?: string
  userName: string
  role: string
  emailConfirmed: boolean
  lockoutEnabled: boolean
  lockoutEnd?: string
  createdAt: string
  updatedAt?: string
}

export interface CreateUserRequest {
  email: string
  password: string
  confirmPassword: string
  firstName?: string
  lastName?: string
  userName?: string
  role: string
}

export interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  phoneNumber?: string
}

export interface ChangeRoleRequest {
  role: string
}

export interface ResetPasswordRequest {
  newPassword: string
}

export const USER_ROLES = ['Admin', 'Manager', 'Operator', 'Viewer'] as const
export type UserRole = typeof USER_ROLES[number]

export interface RoleInfo {
  name: UserRole
  displayName: string
  description: string
  color: string
  level: number
}

export const ROLE_INFO: Record<UserRole, RoleInfo> = {
  Admin: {
    name: 'Admin',
    displayName: 'Administrator',
    description: 'Full system access including user management',
    color: 'red',
    level: 4
  },
  Manager: {
    name: 'Manager',
    displayName: 'Manager',
    description: 'Manage inventory and generate reports',
    color: 'blue',
    level: 3
  },
  Operator: {
    name: 'Operator',
    displayName: 'Operator',
    description: 'Create, edit, and move materials',
    color: 'green',
    level: 2
  },
  Viewer: {
    name: 'Viewer',
    displayName: 'Viewer',
    description: 'View-only access to inventory',
    color: 'gray',
    level: 1
  }
}
