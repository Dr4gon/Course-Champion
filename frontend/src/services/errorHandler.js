/**
 * Centralized error handler for API calls
 */

/**
 * Process an error from an API call and return a user-friendly message
 * @param {Error} error - The error object from axios
 * @param {Object} options - Additional options for error handling
 * @returns {String} - A user-friendly error message
 */
export const handleApiError = (error, options = {}) => {
  const { defaultMessage = 'An unexpected error occurred. Please try again.' } = options

  // Network or request cancelled error
  if (!error.response) {
    return 'Unable to connect to the server. Please check your internet connection.'
  }

  // Get the status code
  const status = error.response.status

  // If the server returned an error message, use it
  if (error.response.data && error.response.data.error) {
    return error.response.data.error
  }

  // Handle common HTTP status codes
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input and try again.'
    case 401:
      // For authentication errors, we might want to redirect to login
      return 'Your session has expired. Please log in again.'
    case 403:
      return 'You do not have permission to perform this action.'
    case 404:
      return 'The requested resource was not found.'
    case 422:
      return 'Validation error. Please check your input.'
    case 429:
      return 'Too many requests. Please try again later.'
    case 500:
    case 502:
    case 503:
    case 504:
      return 'The server encountered an error. Please try again later.'
    default:
      return defaultMessage
  }
}

/**
 * Log error details to console in development mode
 * @param {Error} error - The error object
 * @param {String} source - Source of the error (component name or feature)
 */
export const logError = (error, source = 'API') => {
  if (process.env.NODE_ENV !== 'production') {
    console.group(`Error in ${source}`)
    if (error.response) {
      // The request was made and the server responded with an error
      console.error('Response:', error.response.data)
      console.error('Status:', error.response.status)
      console.error('Headers:', error.response.headers)
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request:', error.request)
    } else {
      // Something happened in setting up the request
      console.error('Error:', error.message)
    }
    console.error('Config:', error.config)
    console.groupEnd()
  }
}

export default {
  handleApiError,
  logError,
}
