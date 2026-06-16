"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const router = useRouter();

  const { user, isAuthenticated, loading } = useSelector(
    (state) => state.auth
  );

  const [checked, setChecked] = useState(false);

  // ===============================
  // 🚪 Auth decision gate
  // ===============================
  useEffect(() => {
    if (loading) return;

    setChecked(true);

    if (!isAuthenticated || !user) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, user, loading, router]);

  // ===============================
  // ⏳ Loading / boot state
  // ===============================
  if (loading || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // ===============================
  // 🔒 Hard block
  // ===============================
  if (!isAuthenticated || !user) {
    return null;
  }

  return <>{children}</>;
}