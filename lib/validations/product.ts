import { z } from "zod";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  MAX_IMAGES_PER_PRODUCT,
} from "@/lib/constants";

export const productQuerySchema = z.object({
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const productNameSchema = z
  .string()
  .trim()
  .min(1, "Product name is required")
  .max(200, "Product name must be 200 characters or less")
  .refine((value) => /[a-zA-Z]/.test(value), {
    message: "Product name must include at least one letter",
  });

export const createProductSchema = z.object({
  name: productNameSchema,
  price: z.coerce
    .number({ message: "Price must be a valid number" })
    .min(0, "Price must be 0 or greater"),
});

export const updateProductSchema = createProductSchema;

export function validateProductName(name: string): string | null {
  const parsed = productNameSchema.safeParse(name);
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Invalid product name";
  }
  return null;
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return "Only SVG, PNG, or JPG images are allowed";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Image size must not exceed 4MB";
  }

  return null;
}

export function validateImageFiles(files: File[]): string | null {
  if (files.length === 0) {
    return "At least one product image is required";
  }

  if (files.length > MAX_IMAGES_PER_PRODUCT) {
    return `Maximum ${MAX_IMAGES_PER_PRODUCT} images allowed`;
  }

  for (const file of files) {
    const error = validateImageFile(file);
    if (error) return error;
  }

  return null;
}
