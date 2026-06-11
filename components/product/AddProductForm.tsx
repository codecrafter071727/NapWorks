"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadSlot from "./ImageUploadSlot";
import { validateProductName } from "@/lib/validations/product";
import { MAX_IMAGES_PER_PRODUCT } from "@/lib/constants";
import { revokeBlobPreview } from "@/lib/image-slots";

interface ImageSlot {
  file: File | null;
  preview: string | null;
}

const createEmptySlots = (): ImageSlot[] =>
  Array.from({ length: MAX_IMAGES_PER_PRODUCT }, () => ({
    file: null,
    preview: null,
  }));

export default function AddProductForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [slots, setSlots] = useState<ImageSlot[]>(createEmptySlots);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateSlot = (index: number, file: File | null, preview: string | null) => {
    setSlots((prev) => {
      const next = [...prev];
      revokeBlobPreview(next[index]?.preview ?? null);
      next[index] = { file, preview };
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

    const imageFiles = slots
      .map((slot) => slot.file)
      .filter((file): file is File => file !== null);

    const nameError = validateProductName(name);
    if (nameError) {
      setError(nameError);
      return;
    }

    if (!price.trim() || Number.isNaN(Number(price)) || Number(price) < 0) {
      setError("Please enter a valid price");
      return;
    }

    if (imageFiles.length === 0) {
      setError("At least one product image is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("price", price);
      imageFiles.forEach((file) => formData.append("images", file));

      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to create product");
      }

      router.push("/product");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold text-[#111827] sm:text-[28px]">Add Product</h1>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="rounded-xl border border-[#E8ECF0] bg-white p-4 sm:p-6">
          <h2 className="text-[17px] font-semibold text-[#111827] sm:text-[18px]">
            Product Information
          </h2>
          <p className="mt-1 text-[13px] text-[#9CA3AF] sm:text-[14px]">
            Fill Details of the product
          </p>

          <div className="mt-5 space-y-4 sm:mt-6 sm:space-y-5">
            <div>
              <label className="mb-2 block text-[14px] font-medium text-[#374151]">
                Product Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Input product name"
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
                placeholder="Enter Price (₹)"
                className="h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 text-[14px] text-[#111827] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-xl border border-[#E8ECF0] bg-white p-4 sm:p-6">
            <h2 className="text-[17px] font-semibold text-[#111827] sm:text-[18px]">
              Image Product
            </h2>
            <p className="mt-2 text-[12px] leading-relaxed text-[#2563EB] sm:text-[13px]">
              Note : Format photos SVG, PNG, or JPG (Max size 4mb)
            </p>
            <p className="mt-2 text-[12px] text-[#9CA3AF]">
              Click any photo box to select one or multiple images (up to 4).
              Use the red X to remove a selected image.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:gap-4 lg:grid-cols-4">
              {slots.map((slot, index) => (
                <ImageUploadSlot
                  key={index}
                  slotIndex={index}
                  label={`Photo ${index + 1}`}
                  preview={slot.preview}
                  onChange={(file, preview) => updateSlot(index, file, preview)}
                  onMultipleSelect={handleMultipleSelect}
                  onError={setError}
                />
              ))}
            </div>
          </div>

          {error && (
            <p className="mt-4 text-[14px] text-[#EF4444]">{error}</p>
          )}

          <div className="mt-4 flex justify-stretch sm:mt-5 sm:justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-lg bg-[#2563EB] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isSubmitting ? "Saving..." : "Save Product"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
