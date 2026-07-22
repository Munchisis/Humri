import mongoose, { Schema, models, model } from "mongoose";

export interface IContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "responded";
  createdAt: Date;
}

const ContactSubmissionSchema = new Schema<IContactSubmission>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ["new", "read", "responded"],
    default: "new",
  },
  createdAt: { type: Date, default: Date.now },
});

export default models.ContactSubmission ||
  model<IContactSubmission>("ContactSubmission", ContactSubmissionSchema);
