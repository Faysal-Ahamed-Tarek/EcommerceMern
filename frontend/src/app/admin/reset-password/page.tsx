"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Loader2, KeyRound, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[!@#$%^&*()\-_=+{};:,<.>/?])(.{8,})$/;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<"newPassword" | "confirmPassword", string>>>({});
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (!token) setServerError("Invalid or missing reset token. Please request a new link.");
  }, [token]);

  const validate = () => {
    const e: typeof errors = {};
    if (!form.newPassword) e.newPassword = "Password is required";
    else if (!PASSWORD_REGEX.test(form.newPassword))
      e.newPassword = "Must be 8+ characters with a number and a special character";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (form.newPassword !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setServerError("");
    setLoading(true);
    try {
      await api.post("/admin/reset-password", {
        token,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      setDone(true);
      setTimeout(() => router.push("/admin/login"), 2500);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Reset failed. The link may have expired.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle size={48} className="text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Password Reset!</h2>
        <p className="text-sm text-gray-500">Your password has been updated. Redirecting to login…</p>
        <Link href="/admin/login" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline font-medium">
          <ArrowLeft size={14} /> Go to Login
        </Link>
      </div>
    );
  }

  if (serverError && !token) {
    return (
      <div className="text-center space-y-4">
        <AlertCircle size={40} className="text-red-400 mx-auto" />
        <p className="text-sm text-gray-700 font-medium">{serverError}</p>
        <Link href="/admin/forgot-password" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline font-medium">
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center space-y-1 mb-5">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <KeyRound size={22} className="text-indigo-600" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Set New Password</h1>
        <p className="text-sm text-gray-500">Enter and confirm your new admin password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {(["newPassword", "confirmPassword"] as const).map((key) => {
          const showKey = key === "newPassword" ? "new" : "confirm";
          const label = key === "newPassword" ? "New Password" : "Confirm Password";
          return (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <div className="relative">
                <input
                  type={show[showKey] ? "text" : "password"}
                  value={form[key]}
                  onChange={(e) => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: "" })); }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  type="button"
                  onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {show[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
            </div>
          );
        })}

        {serverError && (
          <p className="text-red-500 text-sm text-center bg-red-50 py-2 px-3 rounded-lg">{serverError}</p>
        )}

        <p className="text-xs text-gray-400">
          Must be 8+ characters with at least one number and one special character.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          {loading ? "Saving…" : "Reset Password"}
        </button>
      </form>

      <div className="text-center mt-4">
        <Link href="/admin/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={14} /> Back to Login
        </Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-400" size={28} /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
