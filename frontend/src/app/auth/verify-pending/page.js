"use client";

import { useState, useEffect } from "react";
import { Mail, RefreshCw } from "lucide-react";
import authAPI from "../../../services/authApi";

export default function VerifyPendingPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const storedEmail = localStorage.getItem("verification_email");

    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  // cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(() => {
      setCooldown((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  const resendEmail = async () => {
    if (!email || cooldown > 0) return;

    try {
      setLoading(true);

      const res = await authAPI.resendVerificationEmail(email);

      setMessage(res.data.message);

      setCooldown(30);
    } catch (err) {
      setMessage(
        err.response?.data?.error ||
        "Failed to resend verification email"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-10 text-center backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">

        <div className="w-20 h-20 mx-auto rounded-full bg-white/5 flex items-center justify-center border border-white/10">
          <Mail className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-3xl font-bold mt-6">
          Check your inbox
        </h1>

        <p className="text-gray-400 mt-4">
          We sent a verification link to:
        </p>

        <p className="text-green-400 mt-2 font-medium break-all">
          {email || "No email found"}
        </p>

        <button
          onClick={() => window.open("https://mail.google.com")}
          className="mt-8 w-full py-4 bg-white text-black rounded-2xl font-semibold hover:bg-gray-100 transition"
        >
          Open Gmail
        </button>

        <button
          onClick={resendEmail}
          disabled={loading || cooldown > 0}
          className="mt-4 w-full py-4 border border-white/10 rounded-2xl hover:bg-white/5 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <RefreshCw
            size={18}
            className={loading ? "animate-spin" : ""}
          />

          {cooldown > 0
            ? `Resend in ${cooldown}s`
            : "Resend Verification Email"}
        </button>

        {message && (
          <p className="mt-5 text-sm text-gray-400">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}