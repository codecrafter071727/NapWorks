import { Suspense } from "react";
import ProductPageClient from "@/components/product/ProductPageClient";

export default function ProductPage() {
  return (
    <Suspense
      fallback={
        <div className="text-[14px] text-[#9CA3AF]">Loading products...</div>
      }
    >
      <ProductPageClient />
    </Suspense>
  );
}
