"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Scale,
  Eye,
  EyeOff,
} from "lucide-react";
import Image from "next/image";

const SPECIALISATIONS = [
  "Employment & Labour",
  "Family Law",
  "Criminal Defence",
  "Property & Land",
  "Contract Law",
  "Human Rights",
  "Debt Recovery",
  "Immigration",
  "General Practice",
];

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    barNumber: "",
    specialisation: "",
    state: "",
  });

  // Dynamic password criteria tracked live against form state
  const isLongEnough = form.password.length >= 8;
  const hasUpper = /[A-Z]/.test(form.password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(form.password);
  const passwordValid = isLongEnough && hasUpper && hasSpecial;

  // Live match feedback — only show once the user has started typing the confirmation
  const passwordsMatch =
    form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const passwordsMismatch =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Consent states
  const [hasConsented, setHasConsented] = useState<boolean>(false);
  const [consentError, setConsentError] = useState<string>("");

  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setHasConsented(e.target.checked);
    if (e.target.checked) {
      setConsentError("");
    }
  }

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Front-end structural security checks matching the API validation constraints
    if (!passwordValid) {
      setError("Password does not meet the specified security criteria.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!hasConsented) {
      setConsentError(
        "You must agree to the Terms and Privacy Policy to create an account.",
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          confirmPassword: form.confirmPassword,
          barNumber: form.barNumber.trim(),
          specialisation: form.specialisation,
          state: form.state,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Registration failed. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md card text-center">
          <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-brand-600" />
          </div>
          <h1 className="text-xl font-medium mb-2">Application submitted</h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Thank you for applying to volunteer with Humri. Your account is
            pending review by an admin. You will receive an email once your
            account is approved.
          </p>
          <Link
            href="/auth/login"
            className="btn btn-primary inline-flex justify-center w-full py-2.5"
          >
            Return to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-emerald-50/40 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4 overflow-hidden">
      <Scale
        className="absolute -left-16 -bottom-16 w-80 h-80 text-emerald-900/[0.04] dark:text-emerald-100/[0.04] rotate-[-8deg] pointer-events-none select-none"
        strokeWidth={1}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg">
        <div className="flex items-center gap-3 justify-center mb-8">
          <Link
            href="/"
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 ring-1 ring-emerald-900/10 dark:ring-emerald-100/10"
          >
            <Image src="/humri.png" alt="HUMRI Logo" width={52} height={52} />
          </Link>
          <div>
            <Link href="/" className="text-lg font-semibold leading-none">
              HUMRI
            </Link>
            <div className="text-xs text-gray-400 tracking-wide uppercase mt-0.5">
              Volunteer lawyer registration
            </div>
          </div>
        </div>

        <div className="card border border-emerald-900/5 shadow-emerald-900/5 shadow-xl">
          <h1 className="text-xl font-medium mb-1">
            Join as a volunteer lawyer
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Your application will be reviewed by an admin before you can access
            the platform.
          </p>

          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5"
            >
              <AlertCircle
                className="w-4 h-4 mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label" htmlFor="name">
                  Full name<span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  className="input focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Chidi Okoro"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <label className="label" htmlFor="email">
                  Email address<span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="input focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="chidi@example.com"
                  required
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="col-span-2 sm:col-span-1">
                <label className="label" htmlFor="password">
                  Password<span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    aria-describedby="password-requirements"
                    aria-invalid={form.password.length > 0 && !passwordValid}
                    className="input pr-10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Min. 8 characters"
                    required
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>

                <ul
                  id="password-requirements"
                  className="text-[11px] mt-2 space-y-1 p-2 bg-gray-900/5 dark:bg-slate-900 rounded border border-gray-100 dark:border-slate-800"
                >
                  <li
                    className={
                      isLongEnough
                        ? "text-emerald-600 dark:text-emerald-400 font-medium"
                        : "text-red-500 opacity-70"
                    }
                  >
                    {isLongEnough ? "✓" : "✗"} Minimum 8 characters
                  </li>
                  <li
                    className={
                      hasUpper
                        ? "text-emerald-600 dark:text-emerald-400 font-medium"
                        : "text-red-500 opacity-70"
                    }
                  >
                    {hasUpper ? "✓" : "✗"} Contains an uppercase letter
                  </li>
                  <li
                    className={
                      hasSpecial
                        ? "text-emerald-600 dark:text-emerald-400 font-medium"
                        : "text-red-500 opacity-70"
                    }
                  >
                    {hasSpecial ? "✓" : "✗"} Contains a special character
                  </li>
                </ul>
              </div>

              {/* Confirm Password */}
              <div className="col-span-2 sm:col-span-1">
                <label className="label" htmlFor="confirmPassword">
                  Confirm password<span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    aria-invalid={passwordsMismatch}
                    className={`input pr-10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      passwordsMismatch ? "border-red-300" : ""
                    }`}
                    placeholder="Repeat password"
                    required
                    value={form.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>

                {/* Live match feedback, mirrors the password requirements list */}
                <div className="text-[11px] mt-2 p-2 rounded border border-gray-100 dark:border-slate-800 bg-gray-900/5 dark:bg-slate-900 min-h-[1.75rem] flex items-center">
                  {passwordsMatch && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ Passwords match
                    </span>
                  )}
                  {passwordsMismatch && (
                    <span className="text-red-500 opacity-70">
                      ✗ Passwords do not match
                    </span>
                  )}
                  {!passwordsMatch && !passwordsMismatch && (
                    <span className="text-gray-400">
                      Re-enter your password to confirm
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                <Scale className="w-3.5 h-3.5" aria-hidden="true" />
                Professional details
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="barNumber">
                    SCN Number<span className="text-red-500">*</span>
                  </label>
                  <input
                    id="barNumber"
                    className="input focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g. SCN123456"
                    required
                    value={form.barNumber}
                    onChange={(e) =>
                      update("barNumber", e.target.value.toUpperCase())
                    }
                  />
                </div>
                <div>
                  <label className="label" htmlFor="state">
                    State<span className="text-red-500">*</span>
                  </label>
                  <select
                    id="state"
                    className="input focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                  >
                    <option value="">Select state…</option>
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label" htmlFor="specialisation">
                    Area of specialisation
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="specialisation"
                    className="input focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                    value={form.specialisation}
                    onChange={(e) => update("specialisation", e.target.value)}
                  >
                    <option value="">Select specialisation…</option>
                    {SPECIALISATIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-4 space-y-2">
                <div className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                  <input
                    type="checkbox"
                    id="legal-consent"
                    checked={hasConsented}
                    onChange={handleCheckboxChange}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label
                    htmlFor="legal-consent"
                    className="select-none leading-normal cursor-pointer"
                  >
                    I agree to the{" "}
                    <Link
                      href="/legal/terms"
                      target="_blank"
                      className="text-emerald-700 font-medium underline hover:text-emerald-800"
                    >
                      Terms of Use
                    </Link>{" "}
                    and have read the{" "}
                    <Link
                      href="/legal/privacy"
                      target="_blank"
                      className="text-emerald-700 font-medium underline hover:text-emerald-800"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>

                {consentError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 text-rose-500 text-sm font-medium pt-1"
                  >
                    <AlertCircle
                      className="w-3.5 h-3.5 mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{consentError}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                (form.password.length > 0 && !passwordValid) ||
                passwordsMismatch
              }
              className="btn w-full justify-center py-2.5 mt-1 bg-emerald-800 hover:bg-emerald-900 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2
                    className="w-4 h-4 animate-spin"
                    aria-hidden="true"
                  />{" "}
                  Submitting application…
                </>
              ) : (
                "Submit application"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-emerald-700 hover:underline font-medium"
          >
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}
