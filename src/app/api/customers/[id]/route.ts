import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import Bill from "@/models/Bill";
import { customerUpdateSchema } from "@/lib/validators/customer";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/customers/:id — Get a single customer with bills
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;

    const customer = await Customer.findById(id).lean();
    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    // Fetch bills linked to this customer
    const bills = await Bill.find({ customerRef: id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: { ...customer, bills },
    });
  } catch (error) {
    console.error("GET /api/customers/:id error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

// PUT /api/customers/:id — Update customer details
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = customerUpdateSchema.parse(body);

    // If phone is being changed, check for duplicates
    if (validatedData.phone) {
      const existing = await Customer.findOne({
        phone: validatedData.phone,
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: "Another customer with this phone number exists" },
          { status: 409 }
        );
      }
    }

    const customer = await Customer.findByIdAndUpdate(id, validatedData, {
      new: true,
      runValidators: true,
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: customer,
      message: "Customer updated successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    console.error("PUT /api/customers/:id error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/:id — Delete a customer
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    // Unlink bills (don't delete them, just remove the customer ref)
    await Bill.updateMany({ customerRef: id }, { $unset: { customerRef: "" } });

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/customers/:id error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
