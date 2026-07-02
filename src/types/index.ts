import type { DefaultSession } from "next-auth";

// ─── Auth ────────────────────────────────────────────────────────────────────

export type UserRole = "admin" | "lawyer";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  specialisation?: string;
  isApproved: boolean;      // admin must approve lawyers before first login
  emailVerified?: boolean;
  barNumber?: string;       // Nigerian Bar Association number
  state?: string;
  activeMatters: number;
  completedMatters: number;
  proBonoHours: number;
  createdAt: Date;
  updatedAt: Date;
}

// Extend NextAuth session type to include our custom fields
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      isApproved: boolean;
    } & DefaultSession["user"];
  }
  interface User {
    id: string;
    role: UserRole;
    isApproved: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    isApproved: boolean;
  }
}

// ─── Matters ─────────────────────────────────────────────────────────────────

export type MatterStatus =
  | "unassigned"
  | "assigned"
  | "in_progress"
  | "under_review"
  | "completed"
  | "archived";

export type MatterUrgency = "normal" | "urgent" | "critical";

export type MatterStage =
  | "intake"
  | "client_consultation"
  | "document_review"
  | "filing"
  | "negotiation"
  | "hearing"
  | "awaiting_judgment"
  | "completed";

export type MatterType =
  | "employment"
  | "tenancy"
  | "family_law"
  | "criminal"
  | "land_property"
  | "contract"
  | "human_rights"
  | "debt"
  | "immigration"
  | "other";

export interface IClient {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  state?: string;
  preferredLanguage?: string;
}

export interface IMatter {
  _id: string;
  referenceNumber: string;       // e.g. LG-2026-00847 — given to client
  client: IClient;
  type: MatterType;
  description: string;
  urgency: MatterUrgency;
  status: MatterStatus;
  stage: MatterStage;
  assignedLawyer?: string | IUser; // populated or ref
  notes: INote[];
  stageHistory: IStageEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface INote {
  _id: string;
  author: string;               // lawyer _id
  authorName: string;
  content: string;
  createdAt: Date;
}

export interface IStageEvent {
  stage: MatterStage;
  changedBy: string;
  changedAt: Date;
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
}

export const MATTER_STAGES: { value: MatterStage; label: string; step: number }[] = [
  { value: "intake",               label: "Intake",               step: 1 },
  { value: "client_consultation",  label: "Client consultation",  step: 2 },
  { value: "document_review",      label: "Document review",      step: 3 },
  { value: "filing",               label: "Filing",               step: 4 },
  { value: "negotiation",          label: "Negotiation",          step: 5 },
  { value: "hearing",              label: "Hearing",              step: 6 },
  { value: "awaiting_judgment",    label: "Awaiting judgment",    step: 7 },
  { value: "completed",            label: "Completed",            step: 8 },
];

export const MATTER_TYPES: { value: MatterType; label: string }[] = [
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
