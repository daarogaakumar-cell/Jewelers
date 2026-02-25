import mongoose, { Schema, Model } from "mongoose";
import { IPriceHistory } from "@/types";

const PriceHistorySchema = new Schema<IPriceHistory>(
  {
    entityType: {
      type: String,
      enum: ["metal", "gemstone"],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    entityName: {
      type: String,
      required: true,
    },
    variantName: {
      type: String,
      required: true,
    },
    oldPrice: {
      type: Number,
      required: true,
    },
    newPrice: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      default: "",
    },
    affectedProducts: {
      type: Number,
      default: 0,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
PriceHistorySchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
PriceHistorySchema.index({ createdAt: -1 });

const PriceHistory: Model<IPriceHistory> =
  mongoose.models.PriceHistory ||
  mongoose.model<IPriceHistory>("PriceHistory", PriceHistorySchema);

export default PriceHistory;
