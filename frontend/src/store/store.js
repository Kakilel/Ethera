import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // fitness: fitnessReducer, // (added when slice is created)
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck:{
      ignoredActions: ["persist/PERSIST"]
      }
    }),

  devTools: process.env.NODE_ENV !== "production",
});

export default store;