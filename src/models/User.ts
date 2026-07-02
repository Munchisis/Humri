import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import type { UserRole } from "@/types";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  specialisation: string;
  isApproved: boolean;
  barNumber: string;
  state: string;
  activeMatters: number;
  completedMatters: number;
  proBonoHours: number;
  emailVerified: boolean;
  emailVerifyToken?: string;
  emailVerifyExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name:             { type: String, required: true, trim: true },
    email:            { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:         { type: String, required: true, minlength: 8, select: false },
    role:             { type: String, enum: ["admin", "lawyer"], required: true },
    specialisation:   { type: String, default: "" },
    isApproved:       { type: Boolean, default: false },
    barNumber:        { type: String, default: "" },
    state:            { type: String, default: "" },
    activeMatters:    { type: Number, default: 0 },
    completedMatters: { type: Number, default: 0 },
    proBonoHours:     { type: Number, default: 0 },

    emailVerified:         { type: Boolean, default: false },
    emailVerifyToken:      { type: String, select: false },
    emailVerifyExpires:    { type: Date,   select: false },

    resetPasswordToken:    { type: String, select: false },
    resetPasswordExpires:  { type: Date,   select: false },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method for password comparison
UserSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// Admins are auto-approved; lawyers must be approved by an admin
UserSchema.pre("save", function (next) {
  if (this.role === "admin" && !this.isApproved) {
    this.isApproved = true;
  }
  next();
});

const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

export default User;
