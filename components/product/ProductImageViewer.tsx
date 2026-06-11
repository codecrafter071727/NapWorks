"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pencil, X } from "lucide-react";
import type { Product } from "@/types/product";

interface ProductImageViewerProps {
  product: Product;
  onClose: () => void;
  onEdit: () => void;
}

export default function ProductImageViewer({
  product,
  onClose,
  onEdit,
}: ProductImageViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = product.images.filter(Boolean);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const goPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-8 sm:items-center sm:pt-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-[#E8ECF0] px-6 py-4">
          <div className="min-w-0 pr-4">
            <h2 className="truncate text-[20px] font-semibold text-[#111827]">
              {product.name}
            </h2>
            <p className="mt-1 text-[14px] text-[#9CA3AF]">Product Images</p>
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
          {images.length > 0 ? (
            <>
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#F3F4F6]">
                <Image
                  src={images[activeIndex]}
                  alt={`${product.name} - image ${activeIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 672px"
                />
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      className="absolute top-1/2 left-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#374151] shadow-md transition-colors hover:bg-white"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#374151] shadow-md transition-colors hover:bg-white"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                      index === activeIndex
                        ? "border-[#2563EB]"
                        : "border-transparent"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="text-[14px] text-[#9CA3AF]">No images available</p>
          )}

          <div className="mt-6 flex justify-end gap-3 border-t border-[#E8ECF0] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-[#E5E7EB] px-5 text-[14px] font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="flex h-10 items-center gap-2 rounded-lg bg-[#2563EB] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#1D4ED8]"
            >
              <Pencil className="h-4 w-4" />
              Edit Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
