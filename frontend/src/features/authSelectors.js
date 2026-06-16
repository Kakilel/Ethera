// src/features/auth/authSelectors.js

export const selectAuth = (state) => state.auth;

export const selectUser = (state) => state.auth.user;

export const selectIsAuthenticated = (state) =>
  state.auth.isAuthenticated;

export const selectAuthLoading = (state) => state.auth.loading;

export const selectAuthError = (state) => state.auth.error;

// 🧠 derived state (VERY useful later)
export const selectIsVerified = (state) =>
  state.auth.user?.is_verified ?? false;

export const selectUserEmail = (state) =>
  state.auth.user?.email;

export const selectUsername = (state) =>
  state.auth.user?.username;