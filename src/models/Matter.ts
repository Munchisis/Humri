import mongoose, { Schema, Document, Model } from "mongoose";
import type {
  MatterStatus,
  MatterUrgency,
  MatterStage,
  MatterType,
  IClient,
} from "@/types";

export interface IMatterDocument extends Document {
  referenceNumber: string;
  client: IClient;
  type: MatterType;
  description: string;
  urgency: MatterUrgency;
  status: MatterStatus;
  stage: MatterStage;
  staleMatterReminderSent?: boolean;
  assignedLawyer?: mongoose.Types.ObjectId;
  notes: {
    author: mongoose.Types.ObjectId;
    authorName: string;
    content: string;
    createdAt: Date;
  }[];
  stageHistory: {
    stage: MatterStage;
    changedBy: mongoose.Types.ObjectId;
    changedAt: Date;
  }[];
}

const ClientSchema = new Schema<IClient>(
  {
    firstName:         { type: String, required: true, trim: true },
    lastName:          { type: String, required: true, trim: true },
    email:             { type: String, required: true, lowercase: true, trim: true },
    phone:             { type: String, default: "" },
    state:             { type: String, default: "" },
    preferredLanguage: { type: String, default: "English" },
  },
  { _id: false }
);

const NoteSchema = new Schema({
  author:     { type: Schema.Types.ObjectId, ref: "User", required: true },
  authorName: { type: String, required: true },
  content:    { type: String, required: true },
  createdAt:  { type: Date, default: Date.now },
});

const StageEventSchema = new Schema({
  stage:     { type: String, required: true },
  changedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  changedAt: { type: Date, default: Date.now },
});

const MatterSchema = new Schema<IMatterDocument>(
  {
    referenceNumber: {
      type:     String,
      required: true,
      unique:   true,
      index:    true,
    },
    client:  { type: ClientSchema, required: true },
    type: {
      type: String,
      enum: [
        "employment", "tenancy", "family_law", "criminal",
        "land_property", "contract", "human_rights",
        "debt", "immigration", "other",
      ],
      required: true,
    },
    description:             { type: String, required: true, maxlength: 2000 },
    urgency:                 { type: String, enum: ["normal", "urgent", "critical"], default: "normal" },
    staleMatterReminderSent: { type: Boolean, default: false },
    status: {
      type:    String,
      enum:    ["unassigned", "assigned", "in_progress", "under_review", "completed", "archived"],
      default: "unassigned",
    },
    stage: {
      type:    String,
      enum:    ["intake", "client_consultation", "document_review", "filing",
                "negotiation", "hearing", "awaiting_judgment", "completed"],
      default: "intake",
    },
    assignedLawyer: { type: Schema.Types.ObjectId, ref: "User", default: null },
    notes:          { type: [NoteSchema], default: [] },
    stageHistory:   { type: [StageEventSchema], default: [] },
  },
  { timestamps: true }
);

// Text index for search
MatterSchema.index({
  "client.firstName": "text",
  "client.lastName":  "text",
  "client.email":     "text",
  referenceNumber:    "text",
  description:        "text",
});

const Matter: Model<IMatterDocument> =
  mongoose.models.Matter || mongoose.model<IMatterDocument>("Matter", MatterSchema);

export default Matter;
