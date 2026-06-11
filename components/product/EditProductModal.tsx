"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import ImageUploadSlot from "./ImageUploadSlot";
import type { Product } from "@/types/product";
import { validateProductName } from "@/lib/validations/product";
import { MAX_IMAGES_PER_PRODUCT } from "@/lib/constants";
import { revokeBlobPreview } from "@/lib/image-slots";

interface ImageSlot {
  existingUrl: string | null;
  file: File | null;
  preview: string | null;
}

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSuccess: (product: Product) => void;
}

function createSlotsFromImages(images: string[]): ImageSlot[] {
  const slots: ImageSlot[] = Array.from({ length: MAX_IMAGES_PER_PRODUCT }, () => ({
    existingUrl: null,
    file: null,
    preview: null,
  }));

  images.forEach((url, index) => {
    if (index < MAX_IMAGES_PER_PRODUCT) {
      slots[index] = {
        existingUrl: url,
        file: null,
        preview: url,
      };
    }
  });

  return slots;
}

export default function EditProductModal({
  product,
  onClose,
  onSuccess,
}: EditProductModalProps) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(String(product.price));
  const [slots, setSlots] = useState<ImageSlot[]>(() =>
    createSlotsFromImages(product.images)
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const filledSlots = slots.filter((slot) => slot.preview);

  useEffect(() => {
    if (previewIndex >= filledSlots.length) {
      setPreviewIndex(0);
    }
  }, [filledSlots.length, previewIndex]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const updateSlot = (index: number, file: File | null, preview: string | null) => {
    setSlots((prev) => {
      const next = [...prev];
      const current = next[index];

      if (current?.preview?.startsWith("blob:") && current.preview !== preview) {
        URL.revokeObjectURL(current.preview);
      }

      next[index] = {
        existingUrl: file ? null : current?.existingUrl ?? null,
        file,
        preview,
      };

      if (file && preview) {
        next[index].existingUrl = null;
      }

      return next;
    });
    setError(null);
  };

  const removeSlot = (index: number) => {
    setSlots((prev) => {
      const next = [...prev];
      const current = next[index];

      if (current?.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(current.preview);
      }

      next[index] = { existingUrl: null, file: null, preview: null };
      return next;
    });
    setError(null);
  };

  const handleMultipleSelect = (startIndex: number, files: File[]) => {
    setSlots((prev) => {
      const next = [...prev];

      for (let index = startIndex; index < startIndex + files.length; index++) {
        revokeBlobPreview(next[index]?.preview ?? null);
        const file = files[index - startIndex];
        next[index] = {
          existingUrl: null,
          file,
          preview: URL.createObjectURL(file),
        };
      }

      return next;
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nameError = validateProductName(name);
    if (nameError) {
      setError(nameError);
      return;
    }

    if (!price.trim() || Number.isNaN(Number(price)) || Number(price) < 0) {
      setError("Please enter a valid price");
      return;
    }

    const hasImage = slots.some(
      (slot) => slot.file || slot.existingUrl || slot.preview
    );

    if (!hasImage) {
      setError("At least one product image is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("price", price);

      slots.forEach((slot, index) => {
        if (slot.file) {
          formData.append(`image_${index}`, slot.file);
        } else if (slot.existingUrl) {
          formData.append(`existing_${index}`, slot.existingUrl);
        }
      });

      const response = await fetch(`/api/products/${product._id}`, {
        method: "PATCH",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to update product");
      }

      onSuccess({
        ...result,
        _id: String(result._id),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-8 sm:items-center sm:pt-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-[#E8ECF0] px-6 py-4">
          <div className="min-w-0 pr-4">
            <h2 className="text-[20px] font-semibold text-[#111827]">Edit Product</h2>
            <p className="mt-1 text-[14px] text-[#9CA3AF]">
              Update product name, price, and images
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[#6B7280] transition-colors hover:bg-[#EF4444] hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[14px] font-medium text-[#374151]">
                  Product Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 text-[14px] text-[#111827] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-[14px] font-medium text-[#374151]">
                  Price
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 text-[14px] text-[#111827] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
            </div>

            {filledSlots.length > 0 && (
              <div>
                <p className="mb-2 text-[14px] font-medium text-[#374151]">
                  Current Images
                </p>
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#F3F4F6]">
                  <Image
                    src={filledSlots[previewIndex]?.preview ?? filledSlots[0].preview!}
                    alt={name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 768px"
                  />
                </div>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {filledSlots.map((slot, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setPreviewIndex(index)}
                      className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${
                        index === previewIndex
                          ? "border-[#2563EB]"
                          : "border-transparent"
                      }`}
                    >
                      <Image
                        src={slot.preview!}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-[14px] font-medium text-[#374151]">Update Images</p>
              <p className="mt-1 text-[13px] text-[#2563EB]">
                Note : Format photos SVG, PNG, or JPG (Max size 4mb)
              </p>
              <p className="mt-2 text-[12px] text-[#9CA3AF]">
                Click any photo box to select one or multiple images (up to 4).
              </p>

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {slots.map((slot, index) => (
                  <div key={index}>
                    <ImageUploadSlot
                      slotIndex={index}
                      label={`Photo ${index + 1}`}
                      preview={slot.preview}
                      onChange={(file, preview) => {
                        if (file === null && preview === null) {
                          removeSlot(index);
                        } else {
                          updateSlot(index, file, preview);
                        }
                      }}
                      onMultipleSelect={handleMultipleSelect}
                      onError={setError}
                    />
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-[14px] text-[#EF4444]">{error}</p>}

            <div className="flex justify-end gap-3 border-t border-[#E8ECF0] pt-4">
              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-lg border border-[#E5E7EB] px-6 text-[14px] font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-11 rounded-lg bg-[#2563EB] px-6 text-[14px] font-medium text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
