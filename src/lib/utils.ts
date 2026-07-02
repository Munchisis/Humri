
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Reference number generator ──────────────────────────────────────────────

export function generateReferenceNumber(): string {
  const year = new Date().getFullYear();
  const seq  = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `LG-${year}-${seq}`;
}

// ─── Badge colour maps ────────────────────────────────────────────────────────

export const statusStyles: Record<string, string> = {
  unassigned:   "bg-blue-50 text-blue-800 border-blue-200",
  assigned:     "bg-amber-50 text-amber-800 border-amber-200",
  in_progress:  "bg-purple-50 text-purple-800 border-purple-200",
  under_review: "bg-teal-50 text-teal-800 border-teal-200",
  completed:    "bg-green-50 text-green-800 border-green-200",
  archived:     "bg-gray-50 text-gray-600 border-gray-200",
};

export const statusLabels: Record<string, string> = {
  unassigned:   "Unassigned",
  assigned:     "Assigned",
  in_progress:  "In progress",
  under_review: "Under review",
  completed:    "Completed",
  archived:     "Archived",
};

export const urgencyStyles: Record<string, string> = {
  normal:   "bg-green-50 text-green-800 border-green-200",
  urgent:   "bg-amber-50 text-amber-800 border-amber-200",
  critical: "bg-red-50 text-red-800 border-red-200",
};

export const urgencyLabels: Record<string, string> = {
  normal:   "Normal",
  urgent:   "Urgent",
  critical: "Critical",
};

// ─── Stage config — objects with value, label, step ─────────────────────────
// Use this everywhere you need .value, .label, or .step

export const MATTER_STAGES: { value: string; label: string; step: number }[] = [
  { value: "intake",              label: "Intake",              step: 1 },
  { value: "client_consultation", label: "Client consultation", step: 2 },
  { value: "document_review",     label: "Document review",     step: 3 },
  { value: "filing",              label: "Filing",              step: 4 },
  { value: "negotiation",         label: "Negotiation",         step: 5 },
  { value: "hearing",             label: "Hearing",             step: 6 },
  { value: "awaiting_judgment",   label: "Awaiting judgment",   step: 7 },
  { value: "completed",           label: "Completed",           step: 8 },
];

export const TOTAL_STAGES = 8;

// ─── Step lookup by stage value ───────────────────────────────────────────────

export const stageStepMap: Record<string, number> = {
  intake:              1,
  client_consultation: 2,
  document_review:     3,
  filing:              4,
  negotiation:         5,
  hearing:             6,
  awaiting_judgment:   7,
  completed:           8,
};

// ─── Initials from name ───────────────────────────────────────────────────────

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}