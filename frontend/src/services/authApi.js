// src/api/auth.api.js
import { api } from "./axios";

export const authAPI = {
  login: (data) => api.post("/auth/login/", data),

  register: (data) => api.post("/auth/register/", data),

  logout: (refresh) => {
    return api.post("/auth/logout/",{
      refresh,
    });
    },

  // OPTIONAL (only use manually if debugging auth flow)
  refreshToken: (refresh) =>
    api.post("/auth/token/refresh/", { refresh }),

  verifyEmail: (token) =>
    api.get(`/auth/verify-email/${token}/`),

  resendVerificationEmail:(email) => 
    api.post("/auth/resend-verification/",{email}),

  getCurrentUser: () => api.get("/auth/me/"),
};

export default authAPI;