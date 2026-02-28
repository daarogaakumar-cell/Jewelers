import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import { debtAdjustSchema } from "@/lib/validators/customer";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/customers/:id/adjust-debt — Manually set/adjust debt amount
export async function POST(request: NextRequest, { params }: RouteParams) {
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
    const { amount, note } = debtAdjustSchema.parse(body);

    const customer = await Customer.findById(id);
    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    const debtBefore = customer.totalDebt;
    const debtAfter = amount;
    const difference = debtAfter - debtBefore;

    customer.totalDebt = debtAfter;
    customer.paymentHistory.push({
      billAmount: 0,
      amountPaid: 0,
      debtAdded: difference,
      debtBefore,
      debtAfter,
      note: note || `Debt manually adjusted from ₹${debtBefore} to ₹${debtAfter}`,
      date: new Date(),
    });

    await customer.save();

    return NextResponse.json({
      success: true,
      data: customer,
      message: `Debt adjusted to ₹${debtAfter}`,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    console.error("POST /api/customers/:id/adjust-debt error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to adjust debt" },
      { status: 500 }
    );
  }
}
