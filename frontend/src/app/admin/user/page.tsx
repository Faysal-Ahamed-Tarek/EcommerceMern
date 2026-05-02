"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Loader2, KeyRound, Eye, EyeOff } from "lucide-react";

const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[!@#$%^&*()\-_=+{};:,<.>/?])(.{8,})$/;

type FormKey = "currentPassword" | "newPassword" | "confirmPassword";
type ShowKey = "current" | "new" | "confirm";

const FIELDS: { key: FormKey; label: string; showKey: ShowKey }[] = [
  { key: "currentPassword",  label: "Current Password",      showKey: "current" },
  { key: "newPassword",      label: "New Password",          showKey: "new" },
  { key: "confirmPassword",  label: "Confirm New Password",  showKey: "confirm" },
];

export default function AdminUserPage() {
  const [form, setForm] = useState<Record<FormKey, string>>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState<Record<ShowKey, boolean>>({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FormKey, string>>>({});

  const validate = (): Partial<Record<FormKey, string>> => {
    const e: Partial<Record<FormKey, string>> = {};
    if (!form.currentPassword) e.currentPassword = "Current password is required";
    if (!form.newPassword) e.newPassword = "New password is required";
    else if (!PASSWORD_REGEX.test(form.newPassword))
      e.newPassword = "Must be 8+ characters and include a number and a special character";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your new password";
    else if (form.newPassword !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await api.patch("/admin/me/password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      toast.success("Password changed. Redirecting to login…");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => { window.location.href = "/admin/login"; }, 1800);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to change password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Account Security</h1>
        <p className="text-sm text-gray-500 mt-1">
          Change your admin password. You will be logged out after a successful change.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <KeyRound size={18} className="text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Change Password</p>
            <p className="text-xs text-gray-500">Use a strong, unique password</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {FIELDS.map(({ key, label, showKey }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <div className="relative">
                <input
                  type={show[showKey] ? "text" : "password"}
                  value={form[key]}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, [key]: e.target.value }));
                    setErrors((er) => ({ ...er, [key]: "" }));
                  }}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => ({ ...s, [showKey]: !s[showKey] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={show[showKey] ? "Hide password" : "Show password"}
                >
                  {show[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
            </div>
          ))}

          <div className="pt-1">
            <p className="text-xs text-gray-400 mb-3">
              Password must be at least 8 characters and include at least one number and one special character.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
