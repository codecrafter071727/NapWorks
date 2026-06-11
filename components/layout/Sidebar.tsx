"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  FileText,
  Users,
  LineChart,
} from "lucide-react";

interface SidebarProps {
  productCount: number;
  isOpen: boolean;
  onNavigate: () => void;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home, count: null },
  { label: "Product", href: "/product", icon: Package, countKey: "product" as const },
  { label: "Transaction", href: "#", icon: FileText, count: null },
  { label: "Customers", href: "#", icon: Users, count: null },
  { label: "Sales Report", href: "#", icon: LineChart, count: null },
];

export default function Sidebar({
  productCount,
  isOpen,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed top-0 left-0 z-50 flex h-screen w-[260px] shrink-0 flex-col border-r border-[#E8ECF0] bg-white transition-transform duration-300 ease-in-out lg:sticky lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="px-4 pt-5 sm:px-5 sm:pt-6">
        <div className="rounded-xl border border-[#E8ECF0] bg-white px-4 py-3">
          <p className="text-[11px] font-medium text-[#9CA3AF]">Company</p>
          <div className="mt-1 flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Napworks logo"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="text-[15px] font-semibold text-[#111827]">Napworks</span>
          </div>
        </div>
      </div>

      <nav className="mt-6 flex-1 overflow-y-auto px-3 sm:mt-8 sm:px-4">
        <p className="mb-3 px-3 text-[11px] font-semibold tracking-wide text-[#9CA3AF]">
          GENERAL
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href !== "#" &&
              (pathname === item.href || pathname.startsWith(`${item.href}/`));
            const count =
              item.countKey === "product" ? productCount : item.count;
            const Icon = item.icon;

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors ${
                    isActive
                      ? "bg-[#EEF4FF] text-[#2563EB]"
                      : "text-[#4B5563] hover:bg-[#F9FAFB]"
                  }`}
                >
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 ${
                      isActive ? "text-[#2563EB]" : "text-[#9CA3AF]"
                    }`}
                  />
                  <span className="truncate">
                    {item.label}
                    {count !== null && count !== undefined ? ` (${count})` : ""}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
