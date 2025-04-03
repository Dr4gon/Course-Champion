import axios from 'axios'
import { logError } from './errorHandler'

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You could add authorization headers here
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config
  },
  (error) => {
    logError(error, 'Request Interceptor')
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Only return data if the response has a success flag that's true
    // This assumes the backend follows the pattern: { success: true, data: {...} }
    if (response.data && typeof response.data === 'object') {
      if (response.data.success === true && response.data.data) {
        return response.data.data
      }
      return response.data
    }
    return response.data
  },
  (error) => {
    // Use our centralized error logger
    logError(error, 'API Response')

    // Auth error handling - redirect to login if unauthorized
    if (error.response && error.response.status === 401) {
      // Clear any stored authentication
      // localStorage.removeItem('token');
      // localStorage.removeItem('user');
      // Optional: Redirect to login
      // if (window.location.pathname !== '/') {
      //   window.location.href = '/';
      // }
    }

    return Promise.reject(error)
  }
)

export default api
