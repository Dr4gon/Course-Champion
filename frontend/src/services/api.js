import axios from "axios";

// Create an Axios instance with default config
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API service methods
export default {
  // Auth endpoints
  auth: {
    login: (credentials) => api.post("/auth/login", credentials),
    register: (userData) => api.post("/auth/register", userData),
    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },

  // Courses endpoints
  courses: {
    getAll: () => api.get("/courses"),
    getById: (id) => api.get(`/courses/${id}`),
    create: (courseData) => api.post("/courses", courseData),
    update: (id, courseData) => api.put(`/courses/${id}`, courseData),
    delete: (id) => api.delete(`/courses/${id}`),
  },

  // User endpoints
  users: {
    getCurrent: () => api.get("/users/me"),
    update: (userData) => api.put("/users/me", userData),
  },

  // Helper methods
  setAuthToken: (token) => {
    localStorage.setItem("token", token);
  },

  getAuthToken: () => {
    return localStorage.getItem("token");
  },

  clearAuthToken: () => {
    localStorage.removeItem("token");
  },
};
