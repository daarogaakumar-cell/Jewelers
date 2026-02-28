import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Bill from "@/models/Bill";
import { generateBillPDF } from "@/lib/pdf";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/bills/:id/pdf — Download bill as PDF
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

    // Generate the PDF
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const billDoc = bill as any;
    const pdfBuffer = await generateBillPDF({
      billNumber: billDoc.billNumber,
      createdAt: billDoc.createdAt?.toString() || new Date().toISOString(),
      paymentMode: billDoc.paymentMode,
      customer: billDoc.customer,
      productSnapshot: billDoc.productSnapshot,
      // Pass multi-item data if present
      items:
        billDoc.items && billDoc.items.length > 0
          ? billDoc.items.map((item: { productSnapshot: unknown; quantity?: number }) => ({
              productSnapshot: item.productSnapshot,
              quantity: item.quantity ?? 1,
            }))
          : undefined,
      discount: billDoc.discount,
      finalAmount: billDoc.finalAmount,
      notes: billDoc.notes,
      generatedBy: billDoc.generatedBy as { name: string } | null,
    });

    // Return PDF as downloadable response
    // Use ArrayBuffer (sliced correctly from the Node Buffer) to avoid
    // Turbopack TransformStream compatibility issues with Uint8Array bodies.
    const arrayBuffer = pdfBuffer.buffer.slice(
      pdfBuffer.byteOffset,
      pdfBuffer.byteOffset + pdfBuffer.byteLength
    ) as ArrayBuffer;
    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Bill-${bill.billNumber}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error("GET /api/bills/:id/pdf error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
