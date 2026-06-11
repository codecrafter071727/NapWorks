import { NextResponse } from "next/server";
import { buildSearchNameConditions, tokenizeSearchQuery } from "@/lib/search";

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

interface DateRangeFilter {
  $gte?: Date;
  $lte?: Date;
}

interface PriceRangeFilter {
  $gte?: number;
  $lte?: number;
}

interface NameRegexCondition {
  name: { $regex: string; $options: string };
}

export interface ProductFilter {
  $and?: NameRegexCondition[];
  createdAt?: DateRangeFilter;
  price?: PriceRangeFilter;
}

export function buildProductFilter(params: {
  search?: string;
  startDate?: string;
  endDate?: string;
  minPrice?: number;
  maxPrice?: number;
}): ProductFilter {
  const filter: ProductFilter = {};
  const terms = tokenizeSearchQuery(params.search ?? "");

  // AND logic: every search word must appear in the product name (Amazon-style).
  if (terms.length > 0) {
    const searchConditions = buildSearchNameConditions(terms);

    if (filter.$and) {
      filter.$and.push(...searchConditions);
    } else {
      filter.$and = searchConditions;
    }
  }

  if (params.startDate || params.endDate) {
    filter.createdAt = {};

    if (params.startDate) {
      const start = new Date(params.startDate);
      start.setHours(0, 0, 0, 0);
      filter.createdAt.$gte = start;
    }

    if (params.endDate) {
      const end = new Date(params.endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    filter.price = {};

    if (params.minPrice !== undefined) {
      filter.price.$gte = params.minPrice;
    }

    if (params.maxPrice !== undefined) {
      filter.price.$lte = params.maxPrice;
    }
  }

  return filter;
}

export function getSearchTerms(search?: string): string[] {
  return tokenizeSearchQuery(search ?? "");
}
