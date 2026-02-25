import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Bill from "@/models/Bill";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/bills/:id — Get a single bill
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;

    const bill = await Bill.findById(id)
      .populate("generatedBy", "name email")
      .lean();

    if (!bill) {
      return NextResponse.json(
        { success: false, error: "Bill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: bill });
  } catch (error) {
    console.error("GET /api/bills/:id error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bill" },
      { status: 500 }
    );
  }
}

// DELETE /api/bills/:id — Delete a bill
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;

    const bill = await Bill.findByIdAndDelete(id);

    if (!bill) {
      return NextResponse.json(
        { success: false, error: "Bill not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Bill deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/bills/:id error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete bill" },
      { status: 500 }
    );
  }
}
