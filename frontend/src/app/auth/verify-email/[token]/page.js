"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import authAPI from "../../../../services/authApi";
import { CheckCircle, XCircle, Copy, ArrowRight } from "lucide-react";

export default function VerifyEmail() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token;

  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(5);

  const verifyEmail = useCallback(async () => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Missing verification token.");
      return;
    }

    try {
      setStatus("loading");

      await authAPI.verifyEmail(token);

      setStatus("success");
      setErrorMessage("");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
          err.response?.data?.error ||
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Verification link is invalid or expired.",
      );
      console.log(err.response?.data);
    }
  }, [token]);

  // Run once on mount
  useEffect(() => {
    verifyEmail();
  }, [verifyEmail]);

  // countdown redirect
  useEffect(() => {
    if (status !== "success") return;

    if (countdown <= 0) {
      router.replace("/auth/login");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [status, countdown, router]);

  const copyToken = () => {
    if (token && navigator?.clipboard) {
      navigator.clipboard.writeText(token);
    }
  };

  const retry = () => {
    setCountdown(5);
    verifyEmail();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(at_center,#22c55e10_0%,transparent_60%)]" />

      <div className="max-w-md w-full">
        <div className=" bg-white/5 border border-white/10 rounded-3xl p-10 text-center backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
          {/* LOADING */}
          {status === "loading" && (
            <>
              <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
              <h1 className="text-2xl font-semibold mt-8">
                Verifying your email
              </h1>
              <p className="text-gray-400 mt-3">
                Please wait while we confirm your account...
              </p>
            </>
          )}

          {/* SUCCESS */}
          {status === "success" && (
            <>
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>

              <h1 className="text-3xl font-bold mt-6 text-green-400">
                Email Verified
              </h1>

              <p className="text-gray-300 mt-3">
                Your email has been verified successfully.
                You can now sign in to Ethera.
              </p>

              <p className="text-gray-500 mt-4 text-sm">
                Redirecting in{" "}
                <span className="text-white font-mono">{countdown}</span>
              </p>

              <button
                onClick={() => router.replace("/auth/login")}
                className="mt-8 w-full py-4 bg-white text-black rounded-2xl font-semibold hover:bg-gray-100 flex items-center justify-center gap-2"
              >
                Go to Login
                <ArrowRight size={18} />
              </button>
            </>
          )}

          {/* ERROR */}
          {status === "error" && (
            <>
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-12 h-12 text-red-400" />
              </div>

              <h1 className="text-3xl font-bold mt-6 text-red-400">
                Verification Failed
              </h1>

              <p className="text-gray-400 mt-4">{errorMessage}</p>

              <div className="mt-10 flex flex-col gap-3">
                <button
                  onClick={retry}
                  disabled={status === "loading"}
                  className="w-full py-4 bg-white text-black rounded-2xl font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                  Try Again
                </button>

                <button
                  onClick={() => router.push("/auth/register")}
                  className="w-full py-4 border border-white/20 rounded-2xl hover:bg-white/5"
                >
                  Back to Register
                </button>
              </div>

              {token && (
                <button
                  onClick={copyToken}
                  className="mt-6 text-xs text-gray-500 mx-auto flex items-center gap-1"
                >
                  <Copy size={14} /> Copy token
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
