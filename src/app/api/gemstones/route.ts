import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Gemstone from "@/models/Gemstone";
import { gemstoneCreateSchema } from "@/lib/validators/gemstone";

// GET /api/gemstones — List all gemstones
export async function GET() {
  try {
    await dbConnect();
    const gemstones = await Gemstone.find().sort({ name: 1 }).lean();
    return NextResponse.json({ success: true, data: gemstones });
  } catch (error) {
    console.error("GET /api/gemstones error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch gemstones" },
      { status: 500 }
    );
  }
}

// POST /api/gemstones — Create a gemstone
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const validatedData = gemstoneCreateSchema.parse(body);

    const existingGemstone = await Gemstone.findOne({
      name: validatedData.name,
    });
    if (existingGemstone) {
      return NextResponse.json(
        { success: false, error: "Gemstone with this name already exists" },
        { status: 400 }
      );
    }

    const gemstone = await Gemstone.create(validatedData);
    return NextResponse.json(
      {
        success: true,
        data: gemstone,
        message: "Gemstone created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    console.error("POST /api/gemstones error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create gemstone" },
      { status: 500 }
    );
  }
}
