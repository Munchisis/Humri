import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessageDocument extends Document {
  from: mongoose.Types.ObjectId;
  fromName: string;
  fromEmail: string;
  subject: string;
  body: string;
  status: "unread" | "read" | "resolved";
  adminReply?: string;
  repliedAt?: Date;
  repliedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessageDocument>(
  {
    from:        { type: Schema.Types.ObjectId, ref: "User", required: true },
    fromName:    { type: String, required: true },
    fromEmail:   { type: String, required: true },
    subject:     { type: String, required: true, maxlength: 120 },
    body:        { type: String, required: true, maxlength: 2000 },
    status:      { type: String, enum: ["unread", "read", "resolved"], default: "unread" },
    adminReply:  { type: String, maxlength: 2000 },
    repliedAt:   { type: Date },
    repliedBy:   { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Message: Model<IMessageDocument> =
  mongoose.models.Message ||
  mongoose.model<IMessageDocument>("Message", MessageSchema);

export default Message;
