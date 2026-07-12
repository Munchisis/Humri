"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Loader2, CheckCircle, AlertCircle, User,
  Lock, Eye, EyeOff, Mail,
} from "lucide-react";

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara",
];

const SPECIALISATIONS = [
  "Employment & Labour","Family Law","Criminal Defence","Property & Land",
  "Contract Law","Human Rights","Debt Recovery","Immigration","General Practice",
];

type Tab = "profile" | "password" | "email";

export default function LawyerSettingsPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<Tab>("profile");

  // Profile state
  const [profile, setProfile] = useState({
    name: "", specialisation: "", state: "", barNumber: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg]         = useState({ text: "", error: false });

  // Password state
  const [passwords, setPasswords] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg]         = useState({ text: "", error: false });

  // Email verification
  const emailVerified = (session?.user as Record<string, unknown> | undefined)?.emailVerified as boolean | undefined;
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg]         = useState("");

  useEffect(() => {
    async function loadProfile() {
      const res  = await fetch("/api/user/profile");
      const data = await res.json();
      if (data.user) {
        setProfile({
          name:           data.user.name           ?? "",
          specialisation: data.user.specialisation ?? "",
          state:          data.user.state          ?? "",
          barNumber:      data.user.barNumber      ?? "",
        });
      }
    }
    loadProfile();
  }, []);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg({ text: "", error: false });
    setProfileLoading(true);
    const res  = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    const data = await res.json();
    setProfileLoading(false);
    setProfileMsg({ text: data.message ?? data.error, error: !res.ok });
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg({ text: "", error: false });
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg({ text: "New passwords do not match.", error: true });
      return;
    }
    setPasswordLoading(true);
    const res  = await fetch("/api/user/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: passwords.currentPassword,
        newPassword:     passwords.newPassword,
      }),
    });
    const data = await res.json();
    setPasswordLoading(false);
    setPasswordMsg({ text: data.message ?? data.error, error: !res.ok });
    if (res.ok) setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
  }

  async function resendVerification() {
    setResendLoading(true);
    setResendMsg("");
    const res  = await fetch("/api/auth/resend-verification", { method: "POST" });
    const data = await res.json();
    setResendLoading(false);
    setResendMsg(data.message ?? data.error ?? "");
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "profile",  label: "Profile",         icon: <User className="w-4 h-4" />  },
    { key: "password", label: "Change password", icon: <Lock className="w-4 h-4" />  },
    { key: "email",    label: "Email",           icon: <Mail className="w-4 h-4" />  },
  ];

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-medium">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your account details and preferences.
        </p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {tabs.map(({ key, label, icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={"flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all " +
              (tab === key
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300")}>
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === "profile" && (
        <div className="card">
          <h2 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-5">
            Personal details
          </h2>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input className="input" value={profile.name}
                onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">NBA bar number</label>
                <input className="input" value={profile.barNumber}
                  onChange={(e) => setProfile(p => ({ ...p, barNumber: e.target.value }))} />
              </div>
              <div>
                <label className="label">State</label>
                <select className="input" value={profile.state}
                  onChange={(e) => setProfile(p => ({ ...p, state: e.target.value }))}>
                  <option value="">Select state…</option>
                  {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Area of specialisation</label>
              <select className="input" value={profile.specialisation}
                onChange={(e) => setProfile(p => ({ ...p, specialisation: e.target.value }))}>
                <option value="">Select specialisation…</option>
                {SPECIALISATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Read-only email */}
            <div>
              <label className="label">Email address</label>
              <input className="input bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                value={session?.user?.email ?? ""} disabled />
              <p className="text-xs text-gray-400 mt-1">
                Email cannot be changed. Contact admin if you need to update it.
              </p>
            </div>

            {profileMsg.text && (
              <div className={"flex items-center gap-2 text-sm rounded-lg px-4 py-3 " +
                (profileMsg.error
                  ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
                  : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400")}>
                {profileMsg.error
                  ? <AlertCircle className="w-4 h-4 shrink-0" />
                  : <CheckCircle className="w-4 h-4 shrink-0" />}
                {profileMsg.text}
              </div>
            )}

            <button type="submit" disabled={profileLoading}
              className="btn btn-primary w-full justify-center py-2.5">
              {profileLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : "Save changes"}
            </button>
          </form>
        </div>
      )}

      {/* Password tab */}
      {tab === "password" && (
        <div className="card">
          <h2 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-5">
            Change password
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="label">Current password</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  className="input pr-10"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
                  required />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowCurrent(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">New password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  className="input pr-10"
                  placeholder="Min. 8 characters"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                  required />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirm new password</label>
              <input
                type="password"
                className="input"
                placeholder="Repeat new password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                required />
            </div>

            {passwordMsg.text && (
              <div className={"flex items-center gap-2 text-sm rounded-lg px-4 py-3 " +
                (passwordMsg.error
                  ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
                  : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400")}>
                {passwordMsg.error
                  ? <AlertCircle className="w-4 h-4 shrink-0" />
                  : <CheckCircle className="w-4 h-4 shrink-0" />}
                {passwordMsg.text}
              </div>
            )}

            <button type="submit" disabled={passwordLoading}
              className="btn btn-primary w-full justify-center py-2.5">
              {passwordLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
                : "Update password"}
            </button>
          </form>
        </div>
      )}

      {/* Email tab */}
      {tab === "email" && (
        <div className="card">
          <h2 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-5">
            Email settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {session?.user?.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Your registered email address
                </p>
              </div>
              {emailVerified ? (
                <span className="badge bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 shrink-0">
                  ✓ Verified
                </span>
              ) : (
                <span className="badge bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 shrink-0">
                  Unverified
                </span>
              )}
            </div>

            {!emailVerified && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
                  Verify your email address
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mb-3 leading-relaxed">
                  A verified email ensures you receive matter notifications, admin replies,
                  and important platform updates. Unverified accounts may be suspended after 14 days.
                </p>
                {resendMsg && (
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-2">{resendMsg}</p>
                )}
                <button onClick={resendVerification} disabled={resendLoading}
                  className="btn text-xs gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40">
                  {resendLoading
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending…</>
                    : <><Mail className="w-3.5 h-3.5" /> Resend verification email</>}
                </button>
              </div>
            )}

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                Email notifications you receive
              </p>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {[
                  "Matter assigned to you",
                  "Matter auto-released after inactivity",
                  "Admin replies to your support messages",
                  "Email verification reminders",
                  "Account approval confirmation",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                All notifications are essential and cannot be disabled individually.
                To stop receiving emails, contact the admin team.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
