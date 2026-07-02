"use client";

import { useState } from "react";
import Link from "next/link";
import { Scale, CheckCircle, AlertCircle, Loader2, Copy, Check } from "lucide-react";

const MATTER_TYPES = [
  { value: "employment",    label: "Employment dispute"  },
  { value: "tenancy",       label: "Tenancy / landlord"  },
  { value: "family_law",    label: "Family law"          },
  { value: "criminal",      label: "Criminal defence"    },
  { value: "land_property", label: "Land / property"     },
  { value: "contract",      label: "Contract dispute"    },
  { value: "human_rights",  label: "Human rights"        },
  { value: "debt",          label: "Debt recovery"       },
  { value: "immigration",   label: "Immigration"         },
  { value: "other",         label: "Other"               },
];

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara",
];

type Urgency = "normal" | "urgent" | "critical";

export default function SubmitPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    state: "",
    preferredLanguage: "English",
    type: "",
    description: "",
    urgency: "normal" as Urgency,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [refNum, setRefNum] = useState("");
  const [copied, setCopied] = useState(false);

  // Consent states
  const [hasConsented, setHasConsented] = useState<boolean>(false);
  const [consentError, setConsentError] = useState<string>("");

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setHasConsented(e.target.checked);

    if (e.target.checked) {
      setConsentError("");
    }
  };

  // Capitalization helper to clean user names on the fly
  const capitalizeWords = (str: string): string => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  function update(field: string, value: string) {
    const finalValue = field === "name" ? capitalizeWords(value) : value;
    setForm((prev) => ({ ...prev, [field]: finalValue }));
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.type) {
      setError("Please select a matter type.");
      return;
    }

    if (form.description.length < 20) {
      setError(
        "Please describe your matter in more detail (at least 20 characters).",
      );
      return;
    }

    if (!hasConsented) {
      setConsentError(
        "You must agree to the Terms and Privacy Policy to create an account.",
      );
      return;
    }

    setLoading(true);
    const res = await fetch("/api/matters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Submission failed. Please try again.");
      return;
    }
    setRefNum(data.referenceNumber);
  }

  function copyRef() {
    navigator.clipboard.writeText(refNum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (refNum) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 dark:bg-gray-900">
        <div className="w-full max-w-md card text-center">
          <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-brand-600" />
          </div>
          <h1 className="text-xl font-medium mb-2">Matter submitted</h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed dark:text-gray-400">
            Your matter has been received. A qualified volunteer lawyer will be
            assigned within 72 hours and will contact you directly.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 dark:bg-gray-800 dark:border-gray-700">
            <p className="text-xs text-gray-500 mb-2">
              Your reference number — save this
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-xl font-mono font-semibold text-brand-700 dark:-gray-300">
                {refNum}
              </span>
              <button
                onClick={copyRef}
                className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-400"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <Link
            href="/track"
            className="btn btn-primary w-full justify-center py-2.5 mb-3 block"
          >
            Track my matter
          </Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50  dark:bg-gray-900">
      <header className="bg-brand-900 px-6 py-4 flex items-center justify-between  dark:bg-gray-800">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
            <Scale className="w-4 h-4 text-brand-900" />
          </div>
          <span className="text-sm font-semibold text-brand-50">HUMRI</span>
        </Link>
        <Link
          href="/track"
          className="text-sm text-brand-300 hover:text-brand-50"
        >
          Track existing matter →
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900  dark:text-gray-300">
            Submit a legal matter
          </h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            All submissions are reviewed confidentially. A volunteer lawyer will
            be assigned to you within 72 hours at no cost whatsoever.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <h2 className="text-sm font-medium text-brand-700 uppercase tracking-wide mb-4">
              Your details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  First name <span className="text-red-500">*</span>
                </label>
                <input
                  className="input capitalize"
                  placeholder="Amaka"
                  required
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                />
              </div>
              <div>
                <label className="label capitalize">
                  Last name <span className="text-red-500">*</span>
                </label>
                <input
                  className="input"
                  placeholder="Okafor"
                  required
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                />
              </div>
              <div>
                <label className="label">
                  Email address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="input"
                  placeholder="amaka@email.com"
                  required
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Phone number (optional)</label>
                <input
                  className="input"
                  placeholder="+234 ..."
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>
              <div>
                <label className="label">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  className="input"
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                >
                  <option value="">Select state...</option>
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Preferred language (optional)</label>
                <select
                  className="input"
                  value={form.preferredLanguage}
                  onChange={(e) => update("preferredLanguage", e.target.value)}
                >
                  {["English", "Yoruba", "Igbo", "Hausa", "Pidgin"].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-sm font-medium text-brand-700 uppercase tracking-wide mb-4">
              Matter details
            </h2>
            <div className="mb-4">
              <label className="label mb-2">
                Matter type <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {MATTER_TYPES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update("type", value)}
                    className={
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all " +
                      (form.type === value
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-brand-400")
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="label">
                Describe your situation <span className="text-red-500">*</span>
              </label>
              <textarea
                className="input min-h-[120px]"
                placeholder="Explain what happened, who is involved, and what outcome you are seeking..."
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">
                {form.description.length} / 2000 characters
              </p>
            </div>
            <div>
              <label className="label mb-2">Urgency level</label>
              <div className="grid grid-cols-3 gap-3">
                {(["normal", "urgent", "critical"] as Urgency[]).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => update("urgency", u)}
                    className={
                      "py-2.5 rounded-xl border text-sm font-medium transition-all " +
                      (form.urgency === u
                        ? u === "critical"
                          ? "bg-red-50 border-red-400 text-red-800"
                          : u === "urgent"
                            ? "bg-amber-50 border-amber-400 text-amber-800"
                            : "bg-green-50 border-green-400 text-green-800"
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300")
                    }
                  >
                    {u === "normal"
                      ? "Normal"
                      : u === "urgent"
                        ? "Urgent"
                        : "Critical"}
                  </button>
                ))}
              </div>
              {/* Consent Box Section */}
              <div className="border-t border-gray-100 pt-4 dark:border-gray-800 space-y-2">
                <div className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                  {/* The Checkbox element */}
                  <input
                    type="checkbox"
                    id="legal-consent"
                    checked={hasConsented}
                    onChange={handleCheckboxChange}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                  />
                  <label
                    htmlFor="legal-consent"
                    className="select-none leading-normal cursor-pointer"
                  >
                    I agree to the{" "}
                    <Link
                      href="/legal/terms"
                      target="_blank"
                      className="text-brand-600 font-medium underline hover:text-brand-700"
                    >
                      Terms of Use
                    </Link>{" "}
                    and have read the{" "}
                    <Link
                      href="/legal/privacy"
                      target="_blank"
                      className="text-brand-600 font-medium underline hover:text-brand-700"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>

                {/* Consent Warning Message */}
                {consentError && (
                  <div className="flex items-start gap-2 text-rose-500 text-sm font-medium pt-1 animate-pulse">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{consentError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full justify-center py-3 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
              </>
            ) : (
              "Submit matter — it's free"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
