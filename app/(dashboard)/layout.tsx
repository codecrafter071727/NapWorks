import DashboardShell from "@/components/layout/DashboardShell";
import { getProductCount } from "@/lib/products";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const productCount = await getProductCount();

  return (
    <DashboardShell productCount={productCount}>{children}</DashboardShell>
  );
}
