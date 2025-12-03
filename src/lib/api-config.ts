// API base URL configuration
// In development: empty string (uses Vite proxy to localhost:5049)
// In production: full URL to Render API
export const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export const getApiUrl = (path: string): string => {
  return `${API_BASE_URL}${path}`
}
