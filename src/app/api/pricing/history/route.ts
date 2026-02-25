import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PriceHistory from "@/models/PriceHistory";

// GET /api/pricing/history — Get price change history
export async function GET() {
  try {
    await dbConnect();
    const history = await PriceHistory.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    console.error("GET /api/pricing/history error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch price history" },
      { status: 500 }
    );
  }
}
