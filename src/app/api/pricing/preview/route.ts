import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Metal from "@/models/Metal";
import Gemstone from "@/models/Gemstone";
import { calculateProductPrice } from "@/lib/pricing";

/**
 * GET /api/pricing/preview
 * Preview the impact of a price change on affected products.
 *
 * Query params:
 *   entityType: "metal" | "gemstone"
 *   entityId: ObjectId of the metal or gemstone
 *   variantId: ObjectId of the specific variant
 *   newPrice: The proposed new price per gram/carat
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");
    const variantId = searchParams.get("variantId");
    const newPriceStr = searchParams.get("newPrice");

    if (!entityType || !entityId || !variantId || !newPriceStr) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters: entityType, entityId, variantId, newPrice" },
        { status: 400 }
      );
    }

    if (!["metal", "gemstone"].includes(entityType)) {
      return NextResponse.json(
        { success: false, error: "entityType must be 'metal' or 'gemstone'" },
        { status: 400 }
      );
    }

    const newPrice = parseFloat(newPriceStr);
    if (isNaN(newPrice) || newPrice < 0) {
      return NextResponse.json(
        { success: false, error: "newPrice must be a non-negative number" },
        { status: 400 }
      );
    }

    // Get the current entity to find the old price and variant name
    let oldPrice = 0;
    let variantName = "";
    let entityName = "";

    if (entityType === "metal") {
      const metal = await Metal.findById(entityId).lean();
      if (!metal) {
        return NextResponse.json(
          { success: false, error: "Metal not found" },
          { status: 404 }
        );
      }
      entityName = metal.name;
      const variant = metal.variants.find(
        (v) => v._id?.toString() === variantId
      );
      if (!variant) {
        return NextResponse.json(
          { success: false, error: "Variant not found" },
          { status: 404 }
        );
      }
      oldPrice = variant.pricePerGram;
      variantName = variant.name;
    } else {
      const gemstone = await Gemstone.findById(entityId).lean();
      if (!gemstone) {
        return NextResponse.json(
          { success: false, error: "Gemstone not found" },
          { status: 404 }
        );
      }
      entityName = gemstone.name;
      const variant = gemstone.variants.find(
        (v) => v._id?.toString() === variantId
      );
      if (!variant) {
        return NextResponse.json(
          { success: false, error: "Variant not found" },
          { status: 404 }
        );
      }
      oldPrice = variant.pricePerCarat;
      variantName = variant.name;
    }

    // If price hasn't changed, no products are affected
    if (oldPrice === newPrice) {
      return NextResponse.json({
        success: true,
        data: {
          entityType,
          entityName,
          variantName,
          oldPrice,
          newPrice,
          affectedCount: 0,
          products: [],
        },
      });
    }

    // Find all affected products
    const compositionField =
      entityType === "metal" ? "metalComposition" : "gemstoneComposition";
    const entityField = entityType === "metal" ? "metal" : "gemstone";

    const products = await Product.find({
      [`${compositionField}.${entityField}`]: entityId,
      [`${compositionField}.variantId`]: variantId,
    })
      .select(
        "name productCode totalPrice metalComposition gemstoneComposition makingCharges wastageCharges gstPercentage otherCharges"
      )
      .lean();

    // Calculate new prices for each affected product
    const affectedProducts = products.map((product) => {
      // Create updated composition with new price
      const updatedMetal = product.metalComposition.map((comp) => {
        if (
          entityType === "metal" &&
          comp.metal.toString() === entityId &&
          comp.variantId.toString() === variantId
        ) {
          return { ...comp, pricePerGram: newPrice };
        }
        return comp;
      });

      const updatedGemstone = product.gemstoneComposition.map((comp) => {
        if (
          entityType === "gemstone" &&
          comp.gemstone.toString() === entityId &&
          comp.variantId.toString() === variantId
        ) {
          return { ...comp, pricePerCarat: newPrice };
        }
        return comp;
      });

      const newPrices = calculateProductPrice({
        metalComposition: updatedMetal,
        gemstoneComposition: updatedGemstone,
        makingCharges: product.makingCharges,
        wastageCharges: product.wastageCharges,
        gstPercentage: product.gstPercentage,
        otherCharges: product.otherCharges || [],
      });

      return {
        _id: product._id,
        name: product.name,
        productCode: product.productCode,
        oldTotalPrice: product.totalPrice,
        newTotalPrice: newPrices.totalPrice,
        priceDifference: newPrices.totalPrice - product.totalPrice,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        entityType,
        entityName,
        variantName,
        oldPrice,
        newPrice,
        affectedCount: affectedProducts.length,
        products: affectedProducts,
      },
    });
  } catch (error) {
    console.error("GET /api/pricing/preview error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate pricing preview" },
      { status: 500 }
    );
  }
}
