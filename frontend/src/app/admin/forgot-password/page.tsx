"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email"); return; }
    setError("");
    setLoading(true);
    try {
      await api.post("/admin/forgot-password", { email: email.trim() });
      setSent(true);
    } catch {
      // Always show success to avoid email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm space-y-5">

        {sent ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Check your email</h2>
            <p className="text-sm text-gray-500">
              If <span className="font-medium text-gray-700">{email}</span> is registered,
              a password reset link has been sent. Check your inbox (and spam folder).
            </p>
            <p className="text-xs text-gray-400">The link expires in 1 hour.</p>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
            >
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center space-y-1">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Mail size={22} className="text-indigo-600" />
                </div>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Forgot Password</h1>
              <p className="text-sm text-gray-500">
                Enter the admin email address and we&apos;ll send a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="anwarmdnoor@gmail.com"
                  autoComplete="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
            </form>

            <div className="text-center">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
              >
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
