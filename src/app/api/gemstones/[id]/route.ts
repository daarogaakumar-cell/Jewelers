import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Gemstone from "@/models/Gemstone";
import { gemstoneUpdateSchema } from "@/lib/validators/gemstone";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/gemstones/:id — Get a single gemstone
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;
    const gemstone = await Gemstone.findById(id).lean();

    if (!gemstone) {
      return NextResponse.json(
        { success: false, error: "Gemstone not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: gemstone });
  } catch (error) {
    console.error("GET /api/gemstones/:id error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch gemstone" },
      { status: 500 }
    );
  }
}

// PUT /api/gemstones/:id — Update a gemstone
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const validatedData = gemstoneUpdateSchema.parse(body);

    const gemstone = await Gemstone.findByIdAndUpdate(
      id,
      { ...validatedData },
      { new: true, runValidators: true }
    );

    if (!gemstone) {
      return NextResponse.json(
        { success: false, error: "Gemstone not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: gemstone,
      message: "Gemstone updated successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    console.error("PUT /api/gemstones/:id error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update gemstone" },
      { status: 500 }
    );
  }
}

// DELETE /api/gemstones/:id — Delete a gemstone
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;

    const gemstone = await Gemstone.findByIdAndDelete(id);

    if (!gemstone) {
      return NextResponse.json(
        { success: false, error: "Gemstone not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Gemstone deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/gemstones/:id error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete gemstone" },
      { status: 500 }
    );
  }
}
