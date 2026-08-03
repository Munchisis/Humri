"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import {
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  Compass,
  LifeBuoy,
} from "lucide-react";
import Image from "next/image";
import logo from "../../../public/humri.png";

interface LawyerOnboardingProps {
  children: ReactNode;
  userId?: string;
  userName?: string | null;
}

const slides = [
  {
    exhibit: "A",
    title: "Welcome to your portal",
    description:
      "You're approved and ready to start taking up matters. This short guide walks you through the steps.",
    bullets: [
      "Review the open matters in the pool.",
      "Choose a matter that fits your expertise.",
      "Keep your workload manageable and stay organized.",
    ],
    icon: logo,
  },
  {
    exhibit: "B",
    title: "Choose the right matter",
    description:
      "Open the matter pool and look for matters that match your experience, location, and availability.",
    bullets: [
      "Filter by matter type or urgency.",
      "Pick a matter you can realistically handle.",
      "Only take on matters you can progress well.",
    ],
    icon: Compass,
  },
  {
    exhibit: "C",
    title: "Claim it and finish it",
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
    exhibit: "D",
    title: "Need help? Reach out",
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

  // Default to `true` on both server and first client render so hydration
  // never mismatches. The real value (read from localStorage) is applied
  // a moment later, in the effect below.
  const [ready, setReady] = useState(true);
  const [checked, setChecked] = useState(false);
  const [step, setStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const seen = window.localStorage.getItem(storageKey) === "true";
    setReady(seen);
    setChecked(true);
  }, [storageKey]);

  const finish = () => {
    window.localStorage.setItem(storageKey, "true");
    setReady(true);
  };

  const goTo = (index: number) => {
    setStep(Math.max(0, Math.min(slides.length - 1, index)));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") goTo(step + 1);
    if (event.key === "ArrowLeft") goTo(step - 1);
  };

  // Until we've checked localStorage, render a quiet placeholder instead of
  // guessing — avoids both a hydration mismatch and a flash of real content.
  if (!checked) {
    return (
      <div className="max-w-5xl w-full">
        <div className="h-[420px] w-full animate-pulse rounded-2xl border border-[#E4DAC4] bg-[#F6F1E7] dark:border-[#2A3A57] dark:bg-[#17243B]" />
      </div>
    );
  }

  if (ready) {
    return <>{children}</>;
  }

  const currentSlide = slides[step];
  const Icon = currentSlide.icon;
  const firstName = userName?.trim().split(" ")[0] || "counsel";
  const isLastStep = step === slides.length - 1;

  return (
    <div className="max-w-5xl w-full">
      <div
        ref={containerRef}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        className="relative overflow-hidden rounded-2xl border border-[#E4DAC4] bg-white/30 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.45)] dark:border-[#2A3A57] dark:bg-[#17243B]"
      >
        {/* letterhead rule */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#187807] via-[#51863e] to-[#526b06]" />

        <div className="flex flex-col sm:flex-row">
          {/* Exhibit tab rail */}
          <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-[#E4DAC4] px-4 py-3 sm:flex-col sm:gap-1.5 sm:overflow-visible sm:border-b-0 sm:border-r sm:px-0 sm:py-6 dark:border-[#2A3A57]">
            {slides.map((slide, index) => {
              const isActive = index === step;
              return (
                <button
                  key={slide.exhibit}
                  onClick={() => goTo(index)}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`Exhibit ${slide.exhibit}: ${slide.title}`}
                  className={`group flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold tracking-wide transition-all sm:w-[92%] sm:rounded-r-full sm:rounded-l-none sm:pl-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#AD8A4E] ${
                    isActive
                      ? "bg-brand-800 text-[#F6F1E7] sm:translate-x-1 sm:shadow-md dark:bg-brand-600 dark:text-gray-200"
                      : "text-[#010a00] hover:bg-brand-100 dark:text-[#B7C2D6] dark:hover:bg-[#1F3050]"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                      isActive
                        ? "border-[#F6F1E7]/50 dark:border-[#14213D]/40"
                        : "border-current opacity-60"
                    }`}
                  >
                    {slide.exhibit}
                  </span>
                  <span className="hidden sm:inline">{slide.title}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-600 dark:text-gray-400">
                  Exhibit {currentSlide.exhibit} · Onboarding guide
                </p>
                <h2 className="mt-1.5 font-serif text-xl font-semibold text-brand-800 dark:text-[#F6F1E7]">
                  Welcome, {firstName}
                </h2>
              </div>
              <button
                onClick={finish}
                className="shrink-0 text-xs font-medium text-brand-600 underline-offset-4 transition hover:text-brand-800 hover:underline dark:text-[#B7C2D6] dark:hover:text-[#F6F1E7]"
              >
                Skip guide
              </button>
            </div>

            <div aria-live="polite">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#F6F1E7] shadow-sm dark:bg-white dark:text-[#14213D]">
                <Image src={logo} alt="Humri Logo" />
              </div>

              <h3 className="font-serif text-2xl font-semibold text-[#14213D] dark:text-[#F6F1E7]">
                {currentSlide.title}
              </h3>
              <p className="mt-2.5 max-w-xl text-sm leading-7 text-[#334a45] dark:text-[#CBD3E1]">
                {currentSlide.description}
              </p>

              <ul className="mt-5 space-y-2.5">
                {currentSlide.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-start gap-2.5 text-sm text-[#3A3222] dark:text-[#DCE3EE]"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600 dark:bg-gray-500" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-[#E4DAC4] pt-5 dark:border-[#2A3A57]">
              <button
                onClick={() => goTo(step - 1)}
                disabled={step === 0}
                className="flex items-center gap-1 text-sm font-medium text-brand-900 transition hover:text-[#14213D] disabled:cursor-not-allowed disabled:opacity-30 dark:text-[#B7C2D6] dark:hover:text-[#F6F1E7]"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <div className="flex items-center gap-1.5" aria-hidden="true">
                {slides.map((slide, index) => (
                  <span
                    key={slide.exhibit}
                    className={`h-1.5 rounded-full transition-all ${
                      index === step
                        ? "w-5 bg-brand-600 dark:bg-[#F6F1E7]"
                        : "w-1.5 bg-[#E4DAC4] dark:bg-[#2A3A57]"
                    }`}
                  />
                ))}
              </div>

              {isLastStep ? (
                <button
                  onClick={finish}
                  className="flex items-center gap-1.5 rounded-full bg-[#14213D] px-4 py-2 text-sm font-semibold text-[#F6F1E7] shadow-sm transition hover:bg-[#1C2E4A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#AD8A4E] dark:bg-brand-800 dark:text-gray-300 dark:hover:bg-brand-600"
                >
                  Go to dashboard
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => goTo(step + 1)}
                  className="flex items-center gap-1.5 rounded-full bg-[#14213D] px-4 py-2 text-sm font-semibold text-[#F6F1E7] shadow-sm transition hover:bg-[#1C2E4A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#AD8A4E] dark:bg-brand-800 dark:text-gray-300 dark:hover:bg-brand-600"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
