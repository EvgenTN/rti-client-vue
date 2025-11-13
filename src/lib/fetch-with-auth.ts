import { useAuthStore } from '@/stores/auth'

interface FetchWithAuthOptions extends RequestInit {
  skipAuth?: boolean
}

/**
 * Wrapper around fetch that automatically injects the auth token
 * and handles 401 responses by attempting token refresh
 */
export async function fetchWithAuth(
  url: string,
  options: FetchWithAuthOptions = {}
): Promise<Response> {
  const authStore = useAuthStore()
  const { skipAuth, ...fetchOptions } = options

  // Inject auth token if available and not explicitly skipped
  if (!skipAuth && authStore.accessToken) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      Authorization: `Bearer ${authStore.accessToken}`,
    }
  }

  // Make the request
  let response = await fetch(url, fetchOptions)

  // If we get a 401 and we have a refresh token, try to refresh
  if (response.status === 401 && authStore.refreshToken && !skipAuth) {
    try {
      // Attempt to refresh the access token
      await authStore.refreshAccessToken()

      // Retry the request with the new token
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${authStore.accessToken}`,
      }
      response = await fetch(url, fetchOptions)
    } catch (error) {
      // If refresh fails, clear auth and throw
      authStore.clearAuth()
      throw new Error('Session expired. Please log in again.')
    }
  }

  return response
}

/**
 * Helper for making authenticated GET requests
 */
export async function getWithAuth(url: string): Promise<Response> {
  return fetchWithAuth(url, { method: 'GET' })
}

/**
 * Helper for making authenticated POST requests
 */
export async function postWithAuth(
  url: string,
  data?: any
): Promise<Response> {
  return fetchWithAuth(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * Helper for making authenticated PUT requests
 */
export async function putWithAuth(url: string, data: any): Promise<Response> {
  return fetchWithAuth(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

/**
 * Helper for making authenticated DELETE requests
 */
export async function deleteWithAuth(url: string): Promise<Response> {
  return fetchWithAuth(url, { method: 'DELETE' })
}
