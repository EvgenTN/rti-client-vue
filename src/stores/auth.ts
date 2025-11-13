import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/lib/auth-api'
import type { LoginRequest, RegisterRequest, User, AuthState } from '@/models/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  
  const isAdmin = computed(() => user.value?.role === 'Admin')
  const isManager = computed(() => user.value?.role === 'Manager' || isAdmin.value)
  const isOperator = computed(() => 
    user.value?.role === 'Operator' || isManager.value
  )

  // Load auth state from localStorage on initialization
  function loadFromStorage() {
    const storedToken = localStorage.getItem('accessToken')
    const storedRefreshToken = localStorage.getItem('refreshToken')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      accessToken.value = storedToken
      refreshToken.value = storedRefreshToken
      try {
        user.value = JSON.parse(storedUser)
      } catch (e) {
        console.error('Failed to parse stored user:', e)
        clearAuth()
      }
    }
  }

  function saveToStorage() {
    if (accessToken.value && user.value) {
      localStorage.setItem('accessToken', accessToken.value)
      if (refreshToken.value) {
        localStorage.setItem('refreshToken', refreshToken.value)
      }
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  function clearAuth() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  async function login(credentials: LoginRequest) {
    isLoading.value = true
    try {
      const response = await authApi.login(credentials)
      
      user.value = response.user
      accessToken.value = response.accessToken
      refreshToken.value = response.refreshToken
      
      saveToStorage()
      
      return response
    } catch (error) {
      clearAuth()
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function register(data: RegisterRequest) {
    isLoading.value = true
    try {
      const response = await authApi.register(data)
      
      // Registration doesn't automatically log in the admin who created the user
      // Just return the response
      return response
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    isLoading.value = true
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuth()
      isLoading.value = false
    }
  }

  async function refreshAccessToken() {
    if (!refreshToken.value) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await authApi.refreshToken(refreshToken.value)
      
      user.value = response.user
      accessToken.value = response.accessToken
      refreshToken.value = response.refreshToken
      
      saveToStorage()
      
      return response
    } catch (error) {
      clearAuth()
      throw error
    }
  }

  async function fetchCurrentUser() {
    if (!accessToken.value) {
      return null
    }

    isLoading.value = true
    try {
      const currentUser = await authApi.getCurrentUser()
      user.value = currentUser
      saveToStorage()
      return currentUser
    } catch (error) {
      console.error('Failed to fetch current user:', error)
      clearAuth()
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Initialize auth state from storage
  loadFromStorage()

  return {
    user,
    accessToken,
    refreshToken,
    isLoading,
    isAuthenticated,
    isAdmin,
    isManager,
    isOperator,
    login,
    register,
    logout,
    refreshAccessToken,
    fetchCurrentUser,
    clearAuth,
  }
})
