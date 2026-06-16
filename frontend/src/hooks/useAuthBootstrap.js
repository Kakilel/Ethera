// src/hooks/useAuthBootstrap.js
"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUser } from "../features/authSlice";

export default function useAuthBootstrap() {
  const dispatch = useDispatch();

  useEffect(() => {
    const access = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");

    if (!access || !refresh) return;

    // Attach token immediately for all requests
    api.defaults.headers.common.Authorization = `Bearer ${access}`;


    // verify token by fetching user
    dispatch(fetchUser());
  }, [dispatch]);
}