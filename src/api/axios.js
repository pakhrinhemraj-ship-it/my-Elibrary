import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: log or attach token if present
api.interceptors.request.use(
  (config) => {
    // We can log requests in development to assist debugging
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: return response.data directly, and normalize errors
api.interceptors.response.use(
  (response) => {
    // If the backend returns standard { success: true, data: ... }
    // we can return it directly or just return response.data as per rules.
    // Rule: "Response interceptor: return response.data directly"
    return response.data;
  },
  (error) => {
    // Error interceptor: throw normalized error with message = error.response?.data?.message || error.message
    const message = error.response?.data?.message || error.message || "An unexpected error occurred";
    
    if (import.meta.env.DEV) {
      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, message);
    }
    
    // Construct local standardized error object and rethrow
    const normalizedError = new Error(message);
    normalizedError.status = error.response?.status;
    normalizedError.originalError = error;
    
    return Promise.reject(normalizedError);
  }
);

export default api;
