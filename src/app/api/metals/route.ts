import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Metal from "@/models/Metal";
import { metalCreateSchema } from "@/lib/validators/metal";

export const dynamic = "force-dynamic";

// GET /api/metals — List all metals
export async function GET() {
  try {
    await dbConnect();
    const metals = await Metal.find().sort({ name: 1 }).lean();
    return NextResponse.json(
      { success: true, data: metals },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/metals error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch metals" },
      { status: 500 }
    );
  }
}

// POST /api/metals — Create a metal
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const validatedData = metalCreateSchema.parse(body);

    const existingMetal = await Metal.findOne({ name: validatedData.name });
    if (existingMetal) {
      return NextResponse.json(
        { success: false, error: "Metal with this name already exists" },
        { status: 400 }
      );
    }

    const metal = await Metal.create(validatedData);
    return NextResponse.json(
      { success: true, data: metal, message: "Metal created successfully" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    console.error("POST /api/metals error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create metal" },
      { status: 500 }
    );
  }
}
