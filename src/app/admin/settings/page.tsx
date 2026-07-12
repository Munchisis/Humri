"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Loader2, CheckCircle, AlertCircle,
  User, Lock, Settings, Eye, EyeOff,
} from "lucide-react";

type Tab = "profile" | "password" | "platform";

interface PlatformSettings {
  maxMattersPerLawyer: number;
  staleMatterDays:     number;
  reminderDays:        number;
  suspensionDays:      number;
  platformName:        string;
  supportEmail:        string;
}

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<Tab>("profile");

  // Profile
  const [name, setName]             = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: "", error: false });

  // Password
  const [passwords, setPasswords]   = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg]         = useState({ text: "", error: false });

  // Platform settings
  const [platform, setPlatform]     = useState<PlatformSettings>({
    maxMattersPerLawyer: 3,
    staleMatterDays:     7,
    reminderDays:        5,
    suspensionDays:      14,
    platformName:        "HUMRI",
    supportEmail:        "support@humri.ng",
  });
  const [platformLoading, setPlatformLoading] = useState(false);
  const [platformMsg, setPlatformMsg]         = useState({ text: "", error: false });

  useEffect(() => {
    async function load() {
      const [profileRes, platformRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/admin/platform-settings"),
      ]);
      const [profileData, platformData] = await Promise.all([
        profileRes.json(),
        platformRes.json(),
      ]);
      if (profileData.user)        setName(profileData.user.name ?? "");
      if (platformData.settings)   setPlatform(platformData.settings);
    }
    load();
  }, []);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg({ text: "", error: false });
    setProfileLoading(true);
    const res  = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
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

  async function handlePlatformSave(e: React.FormEvent) {
    e.preventDefault();
    setPlatformMsg({ text: "", error: false });
    setPlatformLoading(true);
    const res  = await fetch("/api/admin/platform-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(platform),
    });
    const data = await res.json();
    setPlatformLoading(false);
    setPlatformMsg({ text: data.message ?? data.error, error: !res.ok });
  }

  function Feedback({ msg }: { msg: { text: string; error: boolean } }) {
    if (!msg.text) return null;
    return (
      <div className={"flex items-center gap-2 text-sm rounded-lg px-4 py-3 " +
        (msg.error
          ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
          : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400")}>
        {msg.error
          ? <AlertCircle className="w-4 h-4 shrink-0" />
          : <CheckCircle className="w-4 h-4 shrink-0" />}
        {msg.text}
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "profile",  label: "Profile",           icon: <User className="w-4 h-4" />     },
    { key: "password", label: "Change password",   icon: <Lock className="w-4 h-4" />     },
    { key: "platform", label: "Platform settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-medium">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your account and platform configuration.
        </p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {tabs.map(({ key, label, icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={"flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all " +
              (tab === key
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300")}>
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Profile */}
      {tab === "profile" && (
        <div className="card">
          <h2 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-5">
            Admin profile
          </h2>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="label">Display name</label>
              <input className="input" value={name}
                onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Email address</label>
              <input className="input bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                value={session?.user?.email ?? ""} disabled />
              <p className="text-xs text-gray-400 mt-1">
                To change your admin email, update the ADMIN_EMAILS environment variable.
              </p>
            </div>
            <Feedback msg={profileMsg} />
            <button type="submit" disabled={profileLoading}
              className="btn btn-primary w-full justify-center py-2.5">
              {profileLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : "Save changes"}
            </button>
          </form>
        </div>
      )}

      {/* Password */}
      {tab === "password" && (
        <div className="card">
          <h2 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-5">
            Change password
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="label">Current password</label>
              <div className="relative">
                <input type={showCurrent ? "text" : "password"} className="input pr-10"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
                  required />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowCurrent(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">New password</label>
              <div className="relative">
                <input type={showNew ? "text" : "password"} className="input pr-10"
                  placeholder="Min. 8 characters"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                  required />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirm new password</label>
              <input type="password" className="input" placeholder="Repeat new password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                required />
            </div>
            <Feedback msg={passwordMsg} />
            <button type="submit" disabled={passwordLoading}
              className="btn btn-primary w-full justify-center py-2.5">
              {passwordLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
                : "Update password"}
            </button>
          </form>
        </div>
      )}

      {/* Platform settings */}
      {tab === "platform" && (
        <div className="card">
          <h2 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
            Platform settings
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
            These values control platform behaviour. Changes take effect on the next cron run.
          </p>
          <form onSubmit={handlePlatformSave} className="space-y-5">

            <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                Matter limits
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Max matters per lawyer</label>
                  <input type="number" className="input" min={1} max={10}
                    value={platform.maxMattersPerLawyer}
                    onChange={(e) => setPlatform(p => ({ ...p, maxMattersPerLawyer: +e.target.value }))} />
                  <p className="text-xs text-gray-400 mt-1">Currently {platform.maxMattersPerLawyer}</p>
                </div>
                <div>
                  <label className="label">Stale matter threshold (days)</label>
                  <input type="number" className="input" min={1} max={30}
                    value={platform.staleMatterDays}
                    onChange={(e) => setPlatform(p => ({ ...p, staleMatterDays: +e.target.value }))} />
                  <p className="text-xs text-gray-400 mt-1">Auto-release after {platform.staleMatterDays} days inactive</p>
                </div>
                <div>
                  <label className="label">Stale reminder (days)</label>
                  <input type="number" className="input" min={1} max={29}
                    value={platform.reminderDays}
                    onChange={(e) => setPlatform(p => ({ ...p, reminderDays: +e.target.value }))} />
                  <p className="text-xs text-gray-400 mt-1">Warn lawyer at day {platform.reminderDays}</p>
                </div>
                <div>
                  <label className="label">Email verification suspension (days)</label>
                  <input type="number" className="input" min={7} max={60}
                    value={platform.suspensionDays}
                    onChange={(e) => setPlatform(p => ({ ...p, suspensionDays: +e.target.value }))} />
                  <p className="text-xs text-gray-400 mt-1">Suspend unverified accounts after {platform.suspensionDays} days</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                Platform identity
              </p>
              <div className="space-y-4">
                <div>
                  <label className="label">Platform name</label>
                  <input className="input" value={platform.platformName}
                    onChange={(e) => setPlatform(p => ({ ...p, platformName: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Support email</label>
                  <input type="email" className="input" value={platform.supportEmail}
                    onChange={(e) => setPlatform(p => ({ ...p, supportEmail: e.target.value }))} />
                </div>
              </div>
            </div>

            <Feedback msg={platformMsg} />

            <button type="submit" disabled={platformLoading}
              className="btn btn-primary w-full justify-center py-2.5">
              {platformLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : "Save platform settings"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
