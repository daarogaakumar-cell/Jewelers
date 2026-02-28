import mongoose, { Schema, Model } from "mongoose";
import { ICustomerRecord } from "@/types";

const PaymentHistorySchema = new Schema(
  {
    bill: { type: Schema.Types.ObjectId, ref: "Bill" },
    billNumber: { type: String },
    billAmount: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, required: true, min: 0 },
    debtAdded: { type: Number, default: 0 },
    debtBefore: { type: Number, default: 0 },
    debtAfter: { type: Number, default: 0 },
    note: { type: String, default: "" },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const CustomerSchema = new Schema<ICustomerRecord>(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },
    email: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    totalDebt: { type: Number, default: 0, min: 0 },
    totalPurchases: { type: Number, default: 0, min: 0 },
    totalPaid: { type: Number, default: 0, min: 0 },
    billCount: { type: Number, default: 0, min: 0 },
    paymentHistory: { type: [PaymentHistorySchema], default: [] },
    notes: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Indexes
CustomerSchema.index({ phone: 1 }, { unique: true });
CustomerSchema.index({ name: "text", phone: "text" });
CustomerSchema.index({ totalDebt: -1 });
CustomerSchema.index({ createdAt: -1 });

const Customer: Model<ICustomerRecord> =
  mongoose.models.Customer ||
  mongoose.model<ICustomerRecord>("Customer", CustomerSchema);

export default Customer;
