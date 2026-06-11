"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Plus, Search, X } from "lucide-react";
import ProductFilters from "./ProductFilters";
import ProductTable from "./ProductTable";
import EditProductModal from "./EditProductModal";
import ProductImageViewer from "./ProductImageViewer";
import type { Product, ProductsResponse } from "@/types/product";

const SEARCH_DEBOUNCE_MS = 400;

export default function ProductPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const search = searchParams.get("search") ?? "";
  const startDate = searchParams.get("startDate") ?? "";
  const endDate = searchParams.get("endDate") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const page = searchParams.get("page") ?? "1";

  const [searchInput, setSearchInput] = useState(search);

  const updateParams = useCallback(
    (updates: Record<string, string>, replace = false) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      const query = params.toString();
      const url = query ? `/product?${query}` : "/product";

      if (replace) {
        router.replace(url);
      } else {
        router.push(url);
      }
    },
    [router, searchParams]
  );

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    params.set("page", page);

    try {
      const response = await fetch(`/api/products?${params.toString()}`, {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to fetch products");
      }

      setData({
        ...result,
        products: result.products.map(
          (product: ProductsResponse["products"][number]) => ({
            ...product,
            _id: String(product._id),
          })
        ),
      });
      setSelectedIds([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [search, startDate, endDate, minPrice, maxPrice, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    if (startDate || endDate || minPrice || maxPrice) {
      setShowFilters(true);
    }
  }, [startDate, endDate, minPrice, maxPrice]);

  useEffect(() => {
    if (!actionMessage) return;

    const timer = setTimeout(() => setActionMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [actionMessage]);

  const applySearch = useCallback(
    (value: string) => {
      updateParams({ search: value.trim(), page: "1" }, true);
    },
    [updateParams]
  );

  const handleSearchChange = (value: string) => {
    setSearchInput(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      applySearch(value);
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    applySearch(searchInput);
  };

  const handleClearSearch = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setSearchInput("");
    applySearch("");
  };

  const handleProductUpdate = (updatedProduct: Product) => {
    setData((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        products: prev.products.map((item) =>
          item._id === updatedProduct._id ? updatedProduct : item
        ),
      };
    });
    setActionMessage("Product updated successfully.");
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    const product = data?.products.find((item) => item._id === id);
    const productName = product?.name ?? "this product";

    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    setDeletingId(id);
    setActionMessage(null);

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        cache: "no-store",
      });

      let result: { error?: string; message?: string } = {};
      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to delete product");
      }

      setData((prev) => {
        if (!prev) return prev;

        const nextProducts = prev.products.filter((item) => item._id !== id);
        const nextTotal = Math.max(0, prev.pagination.total - 1);
        const nextTotalPages = Math.max(1, Math.ceil(nextTotal / prev.pagination.limit));
        const currentPage = Math.min(prev.pagination.page, nextTotalPages);
        const from = nextTotal === 0 ? 0 : (currentPage - 1) * prev.pagination.limit + 1;
        const to = Math.min(currentPage * prev.pagination.limit, nextTotal);

        return {
          ...prev,
          products: nextProducts,
          totalCount: Math.max(0, prev.totalCount - 1),
          pagination: {
            ...prev.pagination,
            total: nextTotal,
            totalPages: nextTotalPages,
            page: currentPage,
            from,
            to,
          },
        };
      });

      setActionMessage("Product deleted successfully.");
      router.refresh();

      if (data && data.products.length === 1 && data.pagination.page > 1) {
        updateParams({ page: String(data.pagination.page - 1) }, true);
      } else {
        await fetchProducts();
      }
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : "Failed to delete product"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const pagination = data?.pagination;
  const products = data?.products ?? [];
  const isSearching = Boolean(search.trim());

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111827] sm:text-[28px]">Product</h1>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[#9CA3AF] sm:text-[14px]">
        <span>Dashboard</span>
        <span>&gt;</span>
        <span>Product</span>
        <span>&gt;</span>
        <span className="font-medium text-[#2563EB]">Sneakers</span>
      </div>

      <div className="mt-4 rounded-xl border border-[#E8ECF0] bg-white sm:mt-6">
        <div className="flex flex-col gap-3 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
          <form onSubmit={handleSearchSubmit} className="relative w-full lg:max-w-xl">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search product"
              className="h-11 w-full rounded-lg border border-[#E5E7EB] bg-white pr-20 pl-4 text-[14px] text-[#111827] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
            />
            <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1">
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="rounded p-1 text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#6B7280]"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="submit"
                className="rounded p-1 text-[#9CA3AF] transition-colors hover:text-[#2563EB]"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className={`flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-[14px] font-medium transition-colors ${
                showFilters
                  ? "border-[#2563EB] bg-[#EEF4FF] text-[#2563EB]"
                  : "border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <Link
              href="/product/new"
              className="col-span-1 flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 text-[14px] font-medium text-white transition-colors hover:bg-[#1D4ED8] sm:px-5"
            >
              <span className="truncate">New Product</span>
              <Plus className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        </div>

        {actionMessage && (
          <div
            className={`mx-4 mb-2 rounded-lg px-4 py-2 text-[14px] sm:mx-6 ${
              actionMessage.includes("success")
                ? "bg-[#ECFDF5] text-[#047857]"
                : "bg-[#FEF2F2] text-[#DC2626]"
            }`}
          >
            {actionMessage}
          </div>
        )}

        {showFilters && (
          <ProductFilters
            startDate={startDate}
            endDate={endDate}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onStartDateChange={(value) =>
              updateParams({ startDate: value, page: "1" })
            }
            onEndDateChange={(value) =>
              updateParams({ endDate: value, page: "1" })
            }
            onMinPriceChange={(value) =>
              updateParams({ minPrice: value, page: "1" })
            }
            onMaxPriceChange={(value) =>
              updateParams({ maxPrice: value, page: "1" })
            }
          />
        )}

        {error ? (
          <div className="px-4 py-8 text-center text-[14px] text-[#EF4444] sm:px-6">
            {error}
          </div>
        ) : loading ? (
          <div className="px-4 py-12 text-center text-[14px] text-[#9CA3AF] sm:px-6">
            Loading products...
          </div>
        ) : (
          <ProductTable
            products={products}
            selectedIds={selectedIds}
            emptyMessage={
              isSearching
                ? `No products found for "${search}"`
                : "No products found"
            }
            onToggleSelect={(id) =>
              setSelectedIds((prev) =>
                prev.includes(id)
                  ? prev.filter((item) => item !== id)
                  : [...prev, id]
              )
            }
            onToggleSelectAll={() =>
              setSelectedIds((prev) =>
                prev.length === products.length
                  ? []
                  : products.map((product) => product._id)
              )
            }
            onViewImages={setViewingProduct}
            onEdit={setEditingProduct}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        )}

        {pagination && !loading && (
          <div className="flex flex-col gap-4 border-t border-[#E8ECF0] px-4 py-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-[13px] text-[#2563EB] sm:text-left sm:text-[14px]">
              {pagination.from} - {pagination.to} of {pagination.total} Pages
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end sm:gap-3">
              <span className="text-[13px] text-[#6B7280] sm:text-[14px]">The page on</span>
              <select
                value={pagination.page}
                onChange={(e) => updateParams({ page: e.target.value })}
                className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[14px] text-[#111827] outline-none focus:border-[#2563EB]"
              >
                {Array.from({ length: pagination.totalPages }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {index + 1}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    updateParams({ page: String(Math.max(1, pagination.page - 1)) })
                  }
                  disabled={pagination.page <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateParams({
                      page: String(
                        Math.min(pagination.totalPages, pagination.page + 1)
                      ),
                    })
                  }
                  disabled={pagination.page >= pagination.totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {viewingProduct && (
        <ProductImageViewer
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
          onEdit={() => {
            setEditingProduct(viewingProduct);
            setViewingProduct(null);
          }}
        />
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={handleProductUpdate}
        />
      )}
    </div>
  );
}
