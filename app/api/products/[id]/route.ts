import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { uploadImage } from "@/lib/cloudinary";
import { apiError } from "@/lib/api-utils";
import {
  updateProductSchema,
  validateImageFile,
} from "@/lib/validations/product";
import { MAX_IMAGES_PER_PRODUCT } from "@/lib/constants";
import Product from "@/models/Product";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseProductId(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }
  return id;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params;
    const productId = parseProductId(id);

    if (!productId) {
      return apiError("Invalid product id", 400);
    }

    const product = await Product.findById(productId).lean();

    if (!product) {
      return apiError("Product not found", 404);
    }

    return NextResponse.json({
      ...product,
      _id: String(product._id),
    });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return apiError("Failed to fetch product", 500);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params;
    const productId = parseProductId(id);

    if (!productId) {
      return apiError("Invalid product id", 400);
    }

    const existingProduct = await Product.findById(productId);

    if (!existingProduct) {
      return apiError("Product not found", 404);
    }

    const formData = await request.formData();
    const name = formData.get("name");
    const price = formData.get("price");

    const parsed = updateProductSchema.safeParse({ name, price });
    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Invalid product data",
        400
      );
    }

    const imageUrls: string[] = [];

    for (let index = 0; index < MAX_IMAGES_PER_PRODUCT; index++) {
      const file = formData.get(`image_${index}`);
      const existingUrl = formData.get(`existing_${index}`);

      if (file instanceof File && file.size > 0) {
        const validationError = validateImageFile(file);
        if (validationError) {
          return apiError(validationError, 400);
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const url = await uploadImage(buffer, file.type);
        imageUrls.push(url);
      } else if (typeof existingUrl === "string" && existingUrl.trim()) {
        if (!existingProduct.images.includes(existingUrl)) {
          return apiError("Invalid existing image reference", 400);
        }
        imageUrls.push(existingUrl);
      }
    }

    if (imageUrls.length === 0) {
      return apiError("At least one product image is required", 400);
    }

    existingProduct.name = parsed.data.name;
    existingProduct.price = parsed.data.price;
    existingProduct.images = imageUrls;
    await existingProduct.save();

    return NextResponse.json({
      ...existingProduct.toObject(),
      _id: String(existingProduct._id),
    });
  } catch (error) {
    console.error("PATCH /api/products/[id] error:", error);
    return apiError("Failed to update product", 500);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await connectDB();

    const { id } = await context.params;
    const productId = parseProductId(id);

    if (!productId) {
      return apiError("Invalid product id", 400);
    }

    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return apiError("Product not found", 404);
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return apiError("Failed to delete product", 500);
  }
}
