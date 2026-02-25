import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Metal from "@/models/Metal";
import { metalUpdateSchema } from "@/lib/validators/metal";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/metals/:id — Get a single metal
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;
    const metal = await Metal.findById(id).lean();

    if (!metal) {
      return NextResponse.json(
        { success: false, error: "Metal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: metal });
  } catch (error) {
    console.error("GET /api/metals/:id error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch metal" },
      { status: 500 }
    );
  }
}

// PUT /api/metals/:id — Update a metal
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const validatedData = metalUpdateSchema.parse(body);

    const metal = await Metal.findByIdAndUpdate(
      id,
      { ...validatedData },
      { new: true, runValidators: true }
    );

    if (!metal) {
      return NextResponse.json(
        { success: false, error: "Metal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: metal,
      message: "Metal updated successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    console.error("PUT /api/metals/:id error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update metal" },
      { status: 500 }
    );
  }
}

// DELETE /api/metals/:id — Delete a metal
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;

    const metal = await Metal.findByIdAndDelete(id);

    if (!metal) {
      return NextResponse.json(
        { success: false, error: "Metal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Metal deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/metals/:id error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete metal" },
      { status: 500 }
    );
  }
}
