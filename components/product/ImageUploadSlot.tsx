"use client";

import { useRef } from "react";
import Image from "next/image";
import { ImageIcon, X } from "lucide-react";
import { validateImageFile } from "@/lib/validations/product";

interface ImageUploadSlotProps {
  label: string;
  preview: string | null;
  onChange: (file: File | null, preview: string | null) => void;
  onError: (message: string) => void;
}

export default function ImageUploadSlot({
  label,
  preview,
  onChange,
  onError,
}: ImageUploadSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      onError(validationError);
      e.target.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    onChange(file, objectUrl);
    e.target.value = "";
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    onChange(null, null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-[100px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#93C5FD] bg-[#F8FBFF] transition-colors hover:bg-[#EFF6FF] sm:h-[120px]"
        >
          {preview ? (
            <div className="relative h-full w-full overflow-hidden rounded-lg p-2">
              <Image
                src={preview}
                alt={label}
                fill
                className="rounded-lg object-cover"
                sizes="120px"
              />
            </div>
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-[#2563EB]" />
              <span className="mt-2 text-[13px] font-medium text-[#2563EB]">
                {label}
              </span>
            </>
          )}
        </button>

        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#EF4444] text-white shadow-md transition-colors hover:bg-[#DC2626]"
            aria-label={`Remove ${label}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".svg,.png,.jpg,.jpeg,image/svg+xml,image/png,image/jpeg"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
