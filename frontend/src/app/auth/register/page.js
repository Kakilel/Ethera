"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {registerUser, restoreSession,} from "../../../features/authSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

const inputBase =
  "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 outline-none transition-all duration-200 focus:border-white/30 focus:bg-white/10 focus:ring-2 focus:ring-white/10 hover:border-white/20 shadow-inner shadow-black/20 focus:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed";

const inputError =
  "border-red-500/50 focus:ring-red-500/20 focus:border-red-500/50";
  
export default function RegisterPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const usernameRef = useRef(null);

  const { loading, error, registrationSuccess } = useSelector(
    (state) => state.auth,
  );

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [ui, setUi] = useState({
    showPassword: false,
    showConfirm: false,
    errors: {},
    strength: 0,
    success: "",
    submitting: false,
  });

  // focus username
  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  // HANDLE SUCCESS FLOW
  useEffect(() => {
    if (registrationSuccess) {
      localStorage.setItem("verification_email", form.email)
      setUi((p) => ({
        ...p,
        success: "Account created! Check your email to verify.",
      }));

      // redirect to login after short delay
      const t = setTimeout(() => {

        router.replace("/auth/verify-pending");
      }, 1500);

      return () => clearTimeout(t);
    }
  }, [registrationSuccess, dispatch, router]);

  useEffect(() => {
    if (!error || typeof error !== "object") return;

    setUi((prev) => ({
      ...prev,
      errors: {
        username: error.username?.[0] || "",
        email: error.email?.[0] || "",
        password: error.password?.[0] || "",
        phone: error.phone?.[0] || "",
      },
    }));
  }, [error]);
  
  // password strength
  const getStrength = (pwd) => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((p) => ({ ...p, [name]: value }));

    if (name === "password") {
      setUi((p) => ({ ...p, strength: getStrength(value) }));
    }

    if (ui.errors[name]) {
      setUi((p) => ({
        ...p,
        errors: { ...p.errors, [name]: "" },
      }));
    }
  };

  const validate = () => {
    const e = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.username || form.username.length < 3)
      e.username = "Username must be at least 3 characters";

    if (!emailRegex.test(form.email)) e.email = "Enter a valid email address";

    if (form.password.length < 8) e.password = "Password too short";

    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";

    setUi((p) => ({ ...p, errors: e }));
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();

    if (ui.submitting || loading) return;
    if (!validate()) return;

    setUi((p) => ({
      ...p,
      submitting: true,
      success: "",
    }));

    await dispatch(
      registerUser({
        username: form.username,
        email: form.email,
        password: form.password,
      }),
    );
    
    setUi((p) => ({ ...p, submitting: false }));
  };


  const strengthColor = [
    "bg-gray-700",
    "bg-red-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-green-400",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-6">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-2">Create Account</h1>

        <p className="text-gray-400 text-center mb-8">
          Join the platform in seconds
        </p>

        <form
          onSubmit={submit}
          className="space-y-5 bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur animate-in fade-in zoom-in-95 duration-500"
        >
          {/* SUCCESS */}
          {ui.success && (
            <div className="flex gap-2 text-green-400 text-sm">
              <CheckCircle size={18} />
              {ui.success}
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="flex gap-2 text-red-400 text-sm">
              <AlertCircle size={18} />
              {typeof error === "string" ? error : "Registration failed"}
            </div>
          )}

          {/* USERNAME */}
          <input
            ref={usernameRef}
            name="username"
            autoComplete="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className={`${inputBase} ${ui.errors.username ? inputError : ""}`}
            disabled={ui.submitting || loading}
          />
          {ui.errors.username && (
            <p className="text-red-400 text-xs">{ui.errors.username}</p>
          )}

          {/* EMAIL */}
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className={`${inputBase} ${ui.errors.email ? inputError : ""}`}
            disabled={ui.submitting || loading}
          />
          {ui.errors.email && (
            <p className="text-red-400 text-xs">{ui.errors.email}</p>
          )}

          {/* PASSWORD */}
          <div className="relative">
            <input
              name="password"
              autoComplete="new-password"
              type={ui.showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className={`${inputBase} pr-10 ${ui.errors.password ? inputError : ""}`}
              disabled={ui.submitting || loading}
            />

            <button
              type="button"
              onClick={() =>
                setUi((p) => ({
                  ...p,
                  showPassword: !p.showPassword,
                }))
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {ui.showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="space-y-1 text-xs text-gray-500">
            <p className={form.password.length >= 8 ? "text-green-400" : ""}>
              • At least 8 characters
            </p>

            <p className={/[A-Z]/.test(form.password) ? "text-green-400" : ""}>
              • One uppercase letter
            </p>

            <p className={/[0-9]/.test(form.password) ? "text-green-400" : ""}>
              • One number
            </p>
          </div>

          {/* STRENGTH */}
          <div className="h-1 bg-gray-800 rounded overflow-hidden transition-all duration-300 ease-out">
            <div
              className={`h-full transition-all ${strengthColor[ui.strength]}`}
              style={{ width: `${ui.strength * 25}%` }}
            />
          </div>

          {ui.errors.password && (
            <p className="text-red-400 text-xs">{ui.errors.password}</p>
          )}

          {/* CONFIRM PASSWORD */}
        <div className="relative">
          <input
            name="confirmPassword"
            autoComplete="new-password"
            type={ui.showConfirm ? "text" : "password"}
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={handleChange}
            className={`${inputBase} pr-10 ${ui.errors.confirmPassword ? inputError : ""}`}
            disabled={ui.submitting || loading}
          />

          <button
            type="button"
            onClick={() =>
              setUi((p) => ({
                ...p,
                showConfirm: !p.showConfirm,
              }))
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {ui.showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>  

        <button
            disabled={ui.submitting || loading}
            className="w-full py-3 rounded-xl font-semibold 
              bg-white text-black 
              hover:bg-gray-200 
              active:scale-[0.98]
              transition-all duration-200 
              flex items-center justify-center gap-2
              shadow-lg shadow-black/30
              disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {(ui.submitting || loading) && (
              <Loader2 className="animate-spin" size={18} />
            )}
            {(ui.submitting || loading) ? "Processing..." : "Create Account"}
          </button>

          {/* LOGIN LINK */}
          <p className="text-center text-gray-400 text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-white hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
