"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../../features/authSlice";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const emailRef = useRef(null);

  const { user, loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Autofocus email
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  // Load remembered email
  useEffect(() => {
    const saved = localStorage.getItem("rememberedEmail");
    if (saved) {
      setForm((prev) => ({
        ...prev,
        email: saved,
        rememberMe: true,
      }));
    }
  }, []);

  // Validation
  const validate = () => {
    const errors = {};

    if (!form.email.trim()){ 
      errors.email = "Email or username is required";
    }
    
    if (!form.password) {
      errors.password = "Password is required";
    }else if (form.password.length < 6){
      errors.password = "Password must be at least 6 characters";
    }  
    setFormErrors(errors);
    
    return Object.keys(errors).length === 0;
  };

  // Input handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting || loading) return;
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // remember email
      if (form.rememberMe) {
        localStorage.setItem("rememberedEmail", form.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      const result = await dispatch(loginUser(form));

      if (result.meta.requestStatus === "fulfilled") {
        router.replace("/dashboard");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(at_center,#4f46e510_0%,transparent_70%)]" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold">Welcome Back</h1>
          <p className="text-gray-400 mt-2">Sign in to continue</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl"
        >
          {/* ERROR */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-sm">
              <AlertCircle size={18} />
              {typeof error === "string"
                ? error
                : "Login failed. Please try again."}
            </div>
          )}

          {/* EMAIL */}
          <div>
            <label className="text-sm text-gray-400">Email or Username</label>
            <input
              ref={emailRef}
              type="text"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email or username"
              autoComplete="username"
              className="w-full mt-1 px-4 py-3 bg-black/60 border border-white/10 rounded-xl focus:border-purple-500 outline-none"
            />
            {formErrors.email && (
              <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm text-gray-400">Password</label>

            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl focus:border-purple-500 outline-none pr-12"
              />

              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-3 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {formErrors.password && (
              <p className="text-red-400 text-xs mt-1">{formErrors.password}</p>
            )}
          </div>

          {/* REMEMBER */}
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              name="rememberMe"
              checked={form.rememberMe}
              onChange={handleChange}
            />
            Remember me
          </label>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading || isSubmitting}
            className="w-full py-3 bg-white text-black rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            {(loading || isSubmitting) && (
              <Loader2 className="animate-spin" size={18} />
            )}
            {loading || isSubmitting ? "Signing in..." : "Sign In"}
          </button>

          {/* REGISTER */}
          <p className="text-center text-sm text-gray-400">
            No account?{" "}
            <a href="/auth/register" className="text-white">
              Create one
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
