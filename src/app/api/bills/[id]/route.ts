import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Bill from "@/models/Bill";
import Customer from "@/models/Customer";

export const dynamic = "force-dynamic";

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

// DELETE /api/bills/:id — Delete a bill and reverse customer debt
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;

    const bill = await Bill.findById(id);

    if (!bill) {
      return NextResponse.json(
        { success: false, error: "Bill not found" },
        { status: 404 }
      );
    }

    // Reverse customer debt if the bill was linked to a customer
    if (bill.customerRef) {
      const customer = await Customer.findById(bill.customerRef);
      if (customer) {
        const unpaidFromBill = Math.max(
          0,
          bill.finalAmount - (bill.amountPaid || 0)
        );
        const debtBefore = customer.totalDebt;
        const debtAfter = Math.max(0, debtBefore - unpaidFromBill);

        customer.totalDebt = debtAfter;
        customer.totalPurchases = Math.max(
          0,
          customer.totalPurchases - bill.finalAmount
        );
        customer.totalPaid = Math.max(
          0,
          customer.totalPaid - (bill.amountPaid || 0)
        );
        customer.billCount = Math.max(0, customer.billCount - 1);

        customer.paymentHistory.push({
          billNumber: bill.billNumber,
          billAmount: bill.finalAmount,
          amountPaid: 0,
          debtAdded: -unpaidFromBill,
          debtBefore,
          debtAfter,
          note: `Bill ${bill.billNumber} deleted — debt reversed`,
          date: new Date(),
        });

        await customer.save();
      }
    }

    await Bill.findByIdAndDelete(id);

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
