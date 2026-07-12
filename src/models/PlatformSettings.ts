import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPlatformSettingsDocument extends Document {
  maxMattersPerLawyer: number;
  staleMatterDays: number;
  reminderDays: number;
  suspensionDays: number;
  platformName: string;
  supportEmail: string;
  updatedBy?: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const PlatformSettingsSchema = new Schema<IPlatformSettingsDocument>(
  {
    maxMattersPerLawyer: { type: Number, default: 3,    min: 1, max: 10  },
    staleMatterDays:     { type: Number, default: 7,    min: 1, max: 30  },
    reminderDays:        { type: Number, default: 5,    min: 1, max: 29  },
    suspensionDays:      { type: Number, default: 14,   min: 7, max: 60  },
    platformName:        { type: String, default: "HUMRI"                },
    supportEmail:        { type: String, default: "support@humri.ng"     },
    updatedBy:           { type: Schema.Types.ObjectId, ref: "User"      },
  },
  { timestamps: true }
);

const PlatformSettings: Model<IPlatformSettingsDocument> =
  mongoose.models.PlatformSettings ||
  mongoose.model<IPlatformSettingsDocument>("PlatformSettings", PlatformSettingsSchema);

export default PlatformSettings;
