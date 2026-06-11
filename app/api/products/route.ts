import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { uploadImage } from "@/lib/cloudinary";
import { buildProductFilter, getSearchTerms, apiError } from "@/lib/api-utils";
import { normalizeSearchTerm } from "@/lib/search";
import {
  createProductSchema,
  productQuerySchema,
  validateImageFiles,
} from "@/lib/validations/product";
import Product from "@/models/Product";

function getSearchRelevanceScore(
  name: string,
  terms: string[],
  rawQuery?: string
): number {
  const lowerName = name.toLowerCase();
  let score = 0;

  const phrase = (rawQuery ?? "").trim().toLowerCase();
  if (phrase && lowerName.includes(phrase)) {
    score += 100;
  }

  for (const term of terms) {
    const normalized = normalizeSearchTerm(term);
    if (!normalized) continue;

    const index = lowerName.indexOf(normalized);
    if (index >= 0) {
      score += 20 - Math.min(index, 19);
    }
  }

  if (terms.every((term) => lowerName.includes(normalizeSearchTerm(term)))) {
    score += 50;
  }

  return score;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const parsed = productQuerySchema.safeParse({
      search: searchParams.get("search") ?? undefined,
      startDate: searchParams.get("startDate") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined,
      minPrice: searchParams.get("minPrice") ?? undefined,
      maxPrice: searchParams.get("maxPrice") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid query", 400);
    }

    const { page, limit, search, startDate, endDate, minPrice, maxPrice } =
      parsed.data;

    const filter = buildProductFilter({
      search,
      startDate,
      endDate,
      minPrice,
      maxPrice,
    });

    const skip = (page - 1) * limit;
    const searchTerms = getSearchTerms(search);

    const [total, totalCount] = await Promise.all([
      Product.countDocuments(filter),
      Product.countDocuments(),
    ]);

    let rawProducts;

    if (searchTerms.length > 0) {
      const matches = await Product.find(filter).lean();
      rawProducts = matches
        .sort((a, b) => {
          const scoreA = getSearchRelevanceScore(a.name, searchTerms, search);
          const scoreB = getSearchRelevanceScore(b.name, searchTerms, search);
          return (
            scoreB - scoreA || b.createdAt.getTime() - a.createdAt.getTime()
          );
        })
        .slice(skip, skip + limit);
    } else {
      rawProducts = await Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    }

    const products = rawProducts.map((product) => ({
      ...product,
      _id: String(product._id),
    }));

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const from = total === 0 ? 0 : skip + 1;
    const to = Math.min(skip + limit, total);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        from,
        to,
      },
      totalCount,
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return apiError("Failed to fetch products", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const name = formData.get("name");
    const price = formData.get("price");
    const imageFiles = formData
      .getAll("images")
      .filter((item): item is File => item instanceof File && item.size > 0);

    const parsed = createProductSchema.safeParse({ name, price });
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid product data", 400);
    }

    const imageValidationError = validateImageFiles(imageFiles);
    if (imageValidationError) {
      return apiError(imageValidationError, 400);
    }

    const imageUrls: string[] = [];

    for (const file of imageFiles) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const url = await uploadImage(buffer, file.type);
      imageUrls.push(url);
    }

    const product = await Product.create({
      name: parsed.data.name,
      price: parsed.data.price,
      images: imageUrls,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return apiError("Failed to create product", 500);
  }
}
