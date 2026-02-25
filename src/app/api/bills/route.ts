import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Bill from "@/models/Bill";
import Product from "@/models/Product";
import { getNextSequence } from "@/models/Counter";
import { billCreateSchema } from "@/lib/validators/bill";
import { generateBillNumber } from "@/lib/utils";
import { auth } from "@/lib/auth";

// GET /api/bills — List all bills with search and pagination
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { billNumber: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.phone": { $regex: search, $options: "i" } },
      ];
    }

    if (from || to) {
      filter.createdAt = {};
      if (from) (filter.createdAt as Record<string, Date>).$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        (filter.createdAt as Record<string, Date>).$lte = toDate;
      }
    }

    const [bills, total] = await Promise.all([
      Bill.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Bill.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: bills,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/bills error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bills" },
      { status: 500 }
    );
  }
}

// POST /api/bills — Create a new bill
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
    const validatedData = billCreateSchema.parse(body);

    /** Build a denormalised product snapshot for a lean product document */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buildSnapshot = (p: any) => ({
      _id: p._id,
      name: p.name,
      productCode: p.productCode,
      description: p.description,
      category: p.category,
      gender: p.gender,
      metalComposition: p.metalComposition,
      gemstoneComposition: p.gemstoneComposition,
      makingCharges: p.makingCharges,
      wastageCharges: p.wastageCharges,
      gstPercentage: p.gstPercentage,
      otherCharges: p.otherCharges,
      metalTotal: p.metalTotal,
      gemstoneTotal: p.gemstoneTotal,
      makingChargeAmount: p.makingChargeAmount,
      wastageChargeAmount: p.wastageChargeAmount,
      otherChargesTotal: p.otherChargesTotal,
      subtotal: p.subtotal,
      gstAmount: p.gstAmount,
      totalPrice: p.totalPrice,
      images: p.images,
      thumbnailImage: p.thumbnailImage,
    });

    // ── Resolve items ──────────────────────────────────────────────────────
    // New multi-item flow: validatedData.items[]
    // Legacy single-product flow: validatedData.product
    let resolvedItems: Array<{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      product: any;
      quantity: number;
      productSnapshot: Record<string, unknown>;
    }> = [];

    if (validatedData.items && validatedData.items.length > 0) {
      // Fetch all products in parallel
      const products = await Promise.all(
        validatedData.items.map(async (item) => {
          const p = await Product.findById(item.product)
            .populate("category", "name slug")
            .populate("metalComposition.metal", "name")
            .populate("gemstoneComposition.gemstone", "name")
            .lean();
          if (!p) throw new Error(`Product ${item.product} not found`);
          return { product: p, quantity: item.quantity };
        })
      );
      resolvedItems = products.map(({ product: p, quantity }) => ({
        product: p._id,
        quantity,
        productSnapshot: buildSnapshot(p),
      }));
    } else if (validatedData.product) {
      // Legacy single-product
      const p = await Product.findById(validatedData.product)
        .populate("category", "name slug")
        .populate("metalComposition.metal", "name")
        .populate("gemstoneComposition.gemstone", "name")
        .lean();
      if (!p) {
        return NextResponse.json(
          { success: false, error: "Product not found" },
          { status: 404 }
        );
      }
      resolvedItems = [{ product: p._id, quantity: 1, productSnapshot: buildSnapshot(p) }];
    }

    if (resolvedItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid products provided" },
        { status: 400 }
      );
    }

    // Generate bill number
    const year = new Date().getFullYear();
    const seq = await getNextSequence("bill", "AJ", year);
    const billNumber = generateBillNumber(year, seq);

    // Use the first item's snapshot as top-level productSnapshot (backward compat)
    const primarySnapshot = resolvedItems[0].productSnapshot;

    // Calculate discount against total (client already calculated, but re-validate)
    const bill = await Bill.create({
      billNumber,
      product: resolvedItems[0].product,
      customer: validatedData.customer,
      productSnapshot: primarySnapshot,
      items: resolvedItems,
      discount: validatedData.discount,
      finalAmount: validatedData.finalAmount,
      paymentMode: validatedData.paymentMode,
      notes: validatedData.notes,
      generatedBy: session.user.id,
    });

    return NextResponse.json(
      {
        success: true,
        data: bill,
        message: `Bill ${billNumber} created successfully`,
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
    console.error("POST /api/bills error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create bill" },
      { status: 500 }
    );
  }
}
