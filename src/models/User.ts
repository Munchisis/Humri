import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "admin" | "lawyer";

export interface IUserDocument extends Document {
  name:                  string;
  email:                 string;
  password:              string;
  role:                  UserRole;       // primary role — kept for backward compatibility
  roles:                 UserRole[];     // all roles this user holds
  specialisation:        string;
  barNumber:             string;
  state:                 string;
  isApproved:            boolean;
  emailVerified:         boolean;
  emailVerifyToken?:     string;
  emailVerifyExpires?:   Date;
  resetPasswordToken?:   string;
  resetPasswordExpires?: Date;
  activeMatters:         number;
  completedMatters:      number;
  proBonoHours:          number;
  createdAt:             Date;
  updatedAt:             Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name:                 { type: String,   required: true, trim: true },
    email:                { type: String,   required: true, unique: true, lowercase: true, trim: true },
    password:             { type: String,   required: true, select: false },
    role:                 { type: String,   enum: ["admin","lawyer"], default: "lawyer" },
    roles:                { type: [String], enum: ["admin","lawyer"], default: ["lawyer"] },
    specialisation:       { type: String,   default: "" },
    barNumber:            { type: String,   default: "" },
    state:                { type: String,   default: "" },
    isApproved:           { type: Boolean,  default: false },
    emailVerified:        { type: Boolean,  default: false },
    emailVerifyToken:     { type: String,   select: false },
    emailVerifyExpires:   { type: Date,     select: false },
    resetPasswordToken:   { type: String,   select: false },
    resetPasswordExpires: { type: Date,     select: false },
    activeMatters:        { type: Number,   default: 0 },
    completedMatters:     { type: Number,   default: 0 },
    proBonoHours:         { type: Number,   default: 0 },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

export default User;
