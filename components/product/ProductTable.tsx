"use client";

import Image from "next/image";
import { Eye, Pencil, Trash2 } from "lucide-react";
import type { Product } from "@/types/product";
import { formatPrice, formatProductDate } from "@/lib/format";

interface ProductTableProps {
  products: Product[];
  selectedIds: string[];
  emptyMessage?: string;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onViewImages: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
}

function ProductActions({
  product,
  onViewImages,
  onEdit,
  onDelete,
  deletingId,
}: {
  product: Product;
  onViewImages: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <button
        type="button"
        onClick={() => onViewImages(product)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#2563EB]"
        aria-label={`View images for ${product.name}`}
      >
        <Eye className="h-[18px] w-[18px]" />
      </button>
      <button
        type="button"
        onClick={() => onEdit(product)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#2563EB]"
        aria-label={`Edit ${product.name}`}
      >
        <Pencil className="h-[18px] w-[18px]" />
      </button>
      <button
        type="button"
        onClick={() => onDelete(product._id)}
        disabled={deletingId === product._id}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-[#FEF2F2] hover:text-[#EF4444] disabled:opacity-50"
        aria-label={`Delete ${product.name}`}
      >
        <Trash2 className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
}

export default function ProductTable({
  products,
  selectedIds,
  emptyMessage = "No products found",
  onToggleSelect,
  onToggleSelectAll,
  onViewImages,
  onEdit,
  onDelete,
  deletingId,
}: ProductTableProps) {
  const allSelected =
    products.length > 0 && selectedIds.length === products.length;

  if (products.length === 0) {
    return (
      <div className="px-4 py-12 text-center text-[14px] text-[#9CA3AF] sm:px-6">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {/* Mobile card layout */}
      <div className="space-y-3 p-4 lg:hidden">
        <div className="flex items-center gap-2 px-1">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onToggleSelectAll}
            className="h-4 w-4 rounded border-[#D1D5DB] text-[#2563EB] focus:ring-[#2563EB]"
          />
          <span className="text-[13px] text-[#6B7280]">Select all</span>
        </div>

        {products.map((product) => (
          <article
            key={product._id}
            className="rounded-xl border border-[#E8ECF0] bg-white p-4"
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selectedIds.includes(product._id)}
                onChange={() => onToggleSelect(product._id)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-[#D1D5DB] text-[#2563EB] focus:ring-[#2563EB]"
              />

              <button
                type="button"
                onClick={() => onViewImages(product)}
                className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#F3F4F6]"
                aria-label={`View images for ${product.name}`}
              >
                {product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : null}
              </button>

              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-[14px] font-semibold text-[#111827]">
                  {product.name}
                </h3>
                <p className="mt-1 text-[15px] font-medium text-[#111827]">
                  {formatPrice(product.price)}
                </p>
                <p className="mt-1 text-[12px] text-[#9CA3AF]">
                  {formatProductDate(product.createdAt)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end border-t border-[#F1F5F9] pt-3">
              <ProductActions
                product={product}
                onViewImages={onViewImages}
                onEdit={onEdit}
                onDelete={onDelete}
                deletingId={deletingId}
              />
            </div>
          </article>
        ))}
      </div>

      {/* Desktop table layout */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-[#E8ECF0] bg-[#FAFBFC]">
              <th className="w-12 px-6 py-4">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="h-4 w-4 rounded border-[#D1D5DB] text-[#2563EB] focus:ring-[#2563EB]"
                />
              </th>
              <th className="px-4 py-4 text-left text-[13px] font-semibold text-[#6B7280]">
                Product
              </th>
              <th className="px-4 py-4 text-left text-[13px] font-semibold text-[#6B7280]">
                Price
              </th>
              <th className="px-4 py-4 text-left text-[13px] font-semibold text-[#6B7280]">
                Date
              </th>
              <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#6B7280]">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product._id}
                className="border-b border-[#F1F5F9] last:border-b-0"
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(product._id)}
                    onChange={() => onToggleSelect(product._id)}
                    className="h-4 w-4 rounded border-[#D1D5DB] text-[#2563EB] focus:ring-[#2563EB]"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onViewImages(product)}
                      className="group relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#F3F4F6]"
                      aria-label={`View images for ${product.name}`}
                    >
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover transition-opacity group-hover:opacity-80"
                          sizes="40px"
                        />
                      ) : null}
                      <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                        <Eye className="h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                      </span>
                    </button>
                    <span className="text-[14px] font-medium text-[#111827]">
                      {product.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-[14px] text-[#111827]">
                  {formatPrice(product.price)}
                </td>
                <td className="px-4 py-4 text-[14px] text-[#6B7280]">
                  {formatProductDate(product.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <ProductActions
                    product={product}
                    onViewImages={onViewImages}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    deletingId={deletingId}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
