import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import { customerCreateSchema } from "@/lib/validators/customer";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/customers — List customers with search & pagination
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const hasDebt = searchParams.get("hasDebt");
    const phone = searchParams.get("phone");

    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    // Exact phone lookup (for bill form autocomplete)
    if (phone) {
      filter.phone = phone;
      const customer = await Customer.findOne(filter).lean();
      return NextResponse.json({
        success: true,
        data: customer ? [customer] : [],
        pagination: { page: 1, limit: 1, total: customer ? 1 : 0, totalPages: 1 },
      });
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (hasDebt === "true") {
      filter.totalDebt = { $gt: 0 };
    }

    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Customer.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/customers error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

// POST /api/customers — Create a new customer
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = customerCreateSchema.parse(body);

    // Check if phone already exists
    const existing = await Customer.findOne({ phone: validatedData.phone });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A customer with this phone number already exists" },
        { status: 409 }
      );
    }

    const customer = await Customer.create({
      ...validatedData,
      // If initial debt is provided, record it in payment history
      paymentHistory:
        validatedData.totalDebt > 0
          ? [
              {
                billAmount: 0,
                amountPaid: 0,
                debtAdded: validatedData.totalDebt,
                debtBefore: 0,
                debtAfter: validatedData.totalDebt,
                note: "Initial debt added when creating customer",
                date: new Date(),
              },
            ]
          : [],
    });

    return NextResponse.json(
      {
        success: true,
        data: customer,
        message: "Customer created successfully",
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
    console.error("POST /api/customers error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
