import { MAX_IMAGES_PER_PRODUCT } from "@/lib/constants";
import { validateImageFile } from "@/lib/validations/product";

export function validateMultipleImageFiles(
  files: File[],
  startIndex: number
): string | null {
  if (files.length === 0) {
    return "Please select at least one image";
  }

  const availableSlots = MAX_IMAGES_PER_PRODUCT - startIndex;

  if (files.length > availableSlots) {
    return `You can select up to ${availableSlots} image(s) from this slot`;
  }

  for (const file of files) {
    const error = validateImageFile(file);
    if (error) return error;
  }

  return null;
}

export function revokeBlobPreview(preview: string | null) {
  if (preview?.startsWith("blob:")) {
    URL.revokeObjectURL(preview);
  }
}
