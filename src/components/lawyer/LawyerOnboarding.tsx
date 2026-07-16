"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Compass,
  LifeBuoy,
} from "lucide-react";

interface LawyerOnboardingProps {
  children: ReactNode;
  userId?: string;
  userName?: string | null;
}

const slides = [
  {
    title: "Welcome to your lawyer portal",
    description:
      "You’re approved and ready to start helping clients. This short guide will walk you through the first steps.",
    bullets: [
      "Review the open matters in the pool.",
      "Choose a matter that fits your expertise.",
      "Keep your workload manageable and stay organized.",
    ],
    icon: BookOpen,
  },
  {
    title: "Choose the right matter",
    description:
      "Open the matter pool and look for matters that match your experience, location, and availability.",
    bullets: [
      "Filter by matter type or urgency.",
      "Pick a matter that you can realistically handle.",
      "Only take on matters you can progress well.",
    ],
    icon: Compass,
  },
  {
    title: "Claim it and follow through",
    description:
      "Once you claim a matter, it moves into your dashboard so you can monitor progress and updates.",
    bullets: [
      "Claimed matters appear under your active matters.",
      "Track status changes and next steps from there.",
      "Complete or release matters when your capacity changes.",
    ],
    icon: CheckCircle2,
  },
  {
    title: "Need help? Contact admin",
    description:
      "Use the support page whenever you need guidance, and keep your profile updated in settings.",
    bullets: [
      "Reach out to admin for questions or urgent issues.",
      "Update your details and preferences in settings.",
      "You can hold up to 3 active matters at a time.",
    ],
    icon: LifeBuoy,
  },
];

export function LawyerOnboarding({
  children,
  userId,
  userName,
}: LawyerOnboardingProps) {
  const storageKey = userId
    ? `lawyer-onboarding:${userId}`
    : "lawyer-onboarding:guest";
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.localStorage.getItem(storageKey) === "true";
  });

  useEffect(() => {
    const seen = window.localStorage.getItem(storageKey);
    if (seen === "true") {
      setReady(true);
    } else {
      setReady(false);
    }
  }, [storageKey]);

  const finish = () => {
    window.localStorage.setItem(storageKey, "true");
    setReady(true);
  };

  if (ready) {
    return <>{children}</>;
  }

  const currentSlide = slides[step];
  const Icon = currentSlide.icon;

  return (
    <div className="max-w-5xl w-full">
      <div className="relative overflow-hidden rounded-[28px] border border-brand-200/70 bg-gradient-to-br from-brand-50 via-white to-slate-100 p-4 shadow-[0_20px_80px_-30px_rgba(15,23,42,0.35)] dark:border-brand-800/60 dark:from-brand-950/60 dark:via-slate-950 dark:to-brand-900/80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.16),_transparent_30%)]" />
        <div className="relative">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <p className="inline-flex items-center rounded-full border border-brand-200 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-700 dark:border-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                First-time guide
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-brand-950 dark:text-brand-100">
                Welcome, {userName?.split(" ")[0] ?? "lawyer"}
              </h2>
            </div>
            <div className="rounded-full border border-brand-200/80 bg-white/70 px-3 py-1.5 text-sm font-medium text-brand-700 shadow-sm dark:border-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
              Step {step + 1} of {slides.length}
            </div>
          </div>

          <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-white/70 dark:bg-brand-900/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-600 via-cyan-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${((step + 1) / slides.length) * 100}%` }}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[24px] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-brand-800/70 dark:bg-brand-900/30">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-cyan-500 text-white shadow-lg shadow-brand-600/20">
                <Icon className="h-7 w-7" />
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {currentSlide.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
                {currentSlide.description}
              </p>

              <ul className="mt-5 space-y-3 text-sm text-gray-700 dark:text-gray-200">
                {currentSlide.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-start gap-2 rounded-xl bg-slate-50/80 px-3 py-2 dark:bg-brand-900/40"
                  >
                    <span className="mt-1 text-brand-600">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setStep((value) => Math.max(0, value - 1))}
                  disabled={step === 0}
                  className="flex items-center gap-1 text-sm font-medium text-gray-600 transition hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                {step === slides.length - 1 ? (
                  <button onClick={finish} className="btn text-sm gap-1.5">
                    Go to dashboard
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setStep((value) => value + 1)}
                    className="btn text-sm gap-1.5"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-brand-200/70 bg-gradient-to-br from-brand-600 to-cyan-500 p-6 text-white shadow-lg shadow-brand-600/20 dark:border-brand-700">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-100">
                Your next move
              </p>
              <h4 className="mt-3 text-xl font-semibold">
                Start with clarity, finish with confidence.
              </h4>
              <p className="mt-3 text-sm leading-7 text-brand-50/90">
                Review the pool, select a matter that fits your capacity, and
                begin your journey with a calm, guided start.
              </p>
              <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <div className="flex items-center justify-between text-sm">
                  <span>Suggested action</span>
                  <span className="font-semibold">Matter pool</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/20">
                  <div className="h-2 w-2/3 rounded-full bg-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
