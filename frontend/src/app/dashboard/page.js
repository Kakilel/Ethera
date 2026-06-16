"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../features/authSlice";
import { useRouter } from "next/navigation";
import { LogOut, Copy, User, Calendar, Shield } from "lucide-react";

export default function Dashboard() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, loading, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await dispatch(logoutUser());
    setIsLoggingOut(false);
    router.replace("/auth/login");
  };

  const copyUserInfo = () => {
    if (user) {
      navigator.clipboard.writeText(JSON.stringify(user, null, 2));
      alert("User information copied to clipboard!");
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-6">
          <div className="h-8 bg-white/5 rounded-2xl animate-pulse" />
          <div className="h-64 bg-white/5 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-12">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back</p>
            </div>
          </div>

          <button
            onClick={() => setShowConfirmLogout(true)}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-2xl transition border border-red-500/20"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-10">
        <div className="mb-10">
          <h2 className="text-5xl font-bold tracking-tight">
            Good to see you, {user?.username || user?.email?.split("@")[0]} 👋
          </h2>
          <p className="text-gray-400 mt-2 text-lg">
            Here's what's happening with your account
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  Account Information{" "}
                  <Shield className="w-5 h-5 text-green-400" />
                </h3>
                <p className="text-gray-500 text-sm">Your profile details</p>
              </div>
              <button
                onClick={copyUserInfo}
                className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-xl transition"
              >
                <Copy size={20} />
              </button>
            </div>

            <div className="bg-black/40 rounded-2xl p-6 font-mono text-sm text-gray-300 overflow-auto max-h-80">
              {JSON.stringify(user, null, 2)}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-3 text-green-400">
                <Calendar className="w-6 h-6" />
                <div>
                  <p className="text-sm text-gray-400">Member Since</p>
                  <p className="font-medium">April 2026</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <p className="text-sm text-gray-400 mb-1">Account Status</p>
              <div className="flex items-center gap-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="font-medium">Active &amp; Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        {showConfirmLogout && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full mx-4">
              <h3 className="text-2xl font-bold">Logout?</h3>
              <p className="text-gray-400 mt-2">
                Are you sure you want to sign out?
              </p>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowConfirmLogout(false)}
                  className="flex-1 py-3.5 border border-white/20 rounded-2xl hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex-1 py-3.5 bg-red-600 rounded-2xl font-medium hover:bg-red-500 transition"
                >
                  {isLoggingOut ? "Logging out..." : "Yes, Logout"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
