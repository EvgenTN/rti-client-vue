<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
        <p class="mt-1 text-sm text-gray-500">Manage system users and their roles</p>
      </div>
      <button
        @click="showCreateDialog = true"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create User
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="flex gap-4">
      <div class="flex-1">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by email or name..."
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <select
        v-model="roleFilter"
        class="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      >
        <option value="">All Roles</option>
        <option v-for="role in USER_ROLES" :key="role" :value="role">{{ role }}</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <p class="mt-2 text-sm text-gray-500">Loading users...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-md bg-red-50 p-4">
      <div class="flex">
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error loading users</h3>
          <p class="mt-2 text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div v-else-if="filteredUsers.length > 0" class="bg-white shadow overflow-hidden sm:rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.email }}
                  </div>
                  <div class="text-sm text-gray-500">{{ user.email }}</div>
                  <div v-if="user.userName" class="text-xs text-gray-400">@{{ user.userName }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="getRoleBadgeClass(user.role)"
                class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
              >
                {{ user.role }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex flex-col gap-1">
                <span
                  v-if="user.lockoutEnd && new Date(user.lockoutEnd) > new Date()"
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800"
                >
                  Locked
                </span>
                <span
                  v-else-if="!user.emailConfirmed"
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800"
                >
                  Unconfirmed
                </span>
                <span
                  v-else
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                >
                  Active
                </span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(user.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="editUser(user)"
                class="text-indigo-600 hover:text-indigo-900 mr-3"
                title="Edit user"
              >
                Edit
              </button>
              <button
                @click="openChangeRoleDialog(user)"
                class="text-blue-600 hover:text-blue-900 mr-3"
                title="Change role"
              >
                Role
              </button>
              <button
                @click="openResetPasswordDialog(user)"
                class="text-green-600 hover:text-green-900 mr-3"
                title="Reset password"
              >
                Password
              </button>
              <button
                @click="openDeleteDialog(user)"
                class="text-red-600 hover:text-red-900"
                title="Delete user"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 bg-white rounded-lg shadow">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No users found</h3>
      <p class="mt-1 text-sm text-gray-500">{{ searchQuery || roleFilter ? 'Try adjusting your filters' : 'Get started by creating a new user' }}</p>
    </div>

    <!-- Dialogs -->
    <CreateUserDialog v-model="showCreateDialog" @created="loadUsers" />
    <EditUserDialog v-model="showEditDialog" :user="selectedUser" @updated="loadUsers" />
    <ChangeRoleDialog v-model="showChangeRoleDialog" :user="selectedUser" @changed="loadUsers" />
    <ResetPasswordDialog v-model="showResetPasswordDialog" :user="selectedUser" @reset="loadUsers" />
    <DeleteUserDialog v-model="showDeleteDialog" :user="selectedUser" @deleted="loadUsers" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { UserManagementService } from '@/lib/user-management-api'
import { USER_ROLES, ROLE_INFO, type UserListItem } from '@/models/user-management'
import { useToast } from '@/lib/toast'
import CreateUserDialog from '@/components/admin/CreateUserDialog.vue'
import EditUserDialog from '@/components/admin/EditUserDialog.vue'
import ChangeRoleDialog from '@/components/admin/ChangeRoleDialog.vue'
import ResetPasswordDialog from '@/components/admin/ResetPasswordDialog.vue'
import DeleteUserDialog from '@/components/admin/DeleteUserDialog.vue'

const { show: showToast } = useToast()

const users = ref<UserListItem[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const roleFilter = ref('')

const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showChangeRoleDialog = ref(false)
const showResetPasswordDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedUser = ref<UserListItem | null>(null)

const filteredUsers = computed(() => {
  let result = users.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(user =>
      user.email.toLowerCase().includes(query) ||
      user.firstName?.toLowerCase().includes(query) ||
      user.lastName?.toLowerCase().includes(query) ||
      user.userName?.toLowerCase().includes(query)
    )
  }

  if (roleFilter.value) {
    result = result.filter(user => user.role === roleFilter.value)
  }

  return result
})

async function loadUsers() {
  isLoading.value = true
  error.value = null
  try {
    users.value = await UserManagementService.getAllUsers()
  } catch (err: any) {
    const errorMessage = err.message || 'Failed to load users'
    error.value = errorMessage
    showToast(errorMessage, 'error')
  } finally {
    isLoading.value = false
  }
}

function editUser(user: UserListItem) {
  selectedUser.value = user
  showEditDialog.value = true
}

function openChangeRoleDialog(user: UserListItem) {
  selectedUser.value = user
  showChangeRoleDialog.value = true
}

function openResetPasswordDialog(user: UserListItem) {
  selectedUser.value = user
  showResetPasswordDialog.value = true
}

function openDeleteDialog(user: UserListItem) {
  selectedUser.value = user
  showDeleteDialog.value = true
}

function getRoleBadgeClass(role: string): string {
  const roleInfo = ROLE_INFO[role as keyof typeof ROLE_INFO]
  if (!roleInfo) return 'bg-gray-100 text-gray-800'
  
  const colorMap: Record<string, string> = {
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    gray: 'bg-gray-100 text-gray-800'
  }
  
  return colorMap[roleInfo.color] || 'bg-gray-100 text-gray-800'
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  loadUsers()
})
</script>
