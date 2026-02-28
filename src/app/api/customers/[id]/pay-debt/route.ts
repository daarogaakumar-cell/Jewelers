import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import { debtPaymentSchema } from "@/lib/validators/customer";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/customers/:id/pay-debt — Record a debt payment
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
    const { amount, note } = debtPaymentSchema.parse(body);

    const customer = await Customer.findById(id);
    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    if (customer.totalDebt <= 0) {
      return NextResponse.json(
        { success: false, error: "Customer has no outstanding debt" },
        { status: 400 }
      );
    }

    const paymentAmount = Math.min(amount, customer.totalDebt);
    const debtBefore = customer.totalDebt;
    const debtAfter = Math.max(0, debtBefore - paymentAmount);

    customer.totalDebt = debtAfter;
    customer.totalPaid += paymentAmount;
    customer.paymentHistory.push({
      billAmount: 0,
      amountPaid: paymentAmount,
      debtAdded: 0,
      debtBefore,
      debtAfter,
      note: note || `Debt payment of ₹${paymentAmount}`,
      date: new Date(),
    });

    await customer.save();

    return NextResponse.json({
      success: true,
      data: customer,
      message: `Payment of ₹${paymentAmount} recorded. Remaining debt: ₹${debtAfter}`,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error },
        { status: 400 }
      );
    }
    console.error("POST /api/customers/:id/pay-debt error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record payment" },
      { status: 500 }
    );
  }
}
