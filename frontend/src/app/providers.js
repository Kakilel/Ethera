"use client";

import { use, useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "../store/store";
import { fetchUser, hydrateAuth } from "../features/authSlice";
import useAuthBootstrap from "../hooks/useAuthBootstrap";

// ===============================
// 🧠 AUTH BOOTSTRAP WRAPPER
// ===============================
function AuthBootstrap({ children }) {
  useAuthBootstrap();
  return children;
}


// ===============================
// 🌍 ROOT PROVIDERS
// ===============================
export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <AuthBootstrap>
        {children}
      </AuthBootstrap>
    </Provider>
  );
}