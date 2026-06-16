import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  timeout: 12000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});


// ===============================
// 🔐 REFRESH LOCK (prevents spam refresh calls)
// ===============================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};


// ===============================
// 🧠 REQUEST INTERCEPTOR
// ===============================
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined"){
      const token = localStorage.getItem("access");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }  
      return config;
});

// ===============================
// 🔁 RESPONSE INTERCEPTOR
// ===============================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If no response → network error
    if (!error.response) {
      return Promise.reject(error);
    }

    // Only handle 401 once
    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;


    const refreshToken = 
    typeof window !== "undefined" 
      ? localStorage.getItem("refresh")
      :null;

    if (!refreshToken) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/auth/login";
      return Promise.reject(error);
    }

    // Queue requests while refreshing
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve,
          reject,
        });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      const res = await axios.post(
        `${API_URL}/auth/token/refresh/`,
        { refresh: refreshToken }
      );

      const newToken = res.data.access;

      localStorage.setItem("access", newToken);

      processQueue(null, newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return api(originalRequest);
    } catch (err) {
      processQueue(err, null);

      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      window.location.href = "/auth/login";

      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;