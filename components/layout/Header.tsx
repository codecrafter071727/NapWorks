"use client";

import Image from "next/image";
import { Bell, Mail, Menu, PanelLeftClose } from "lucide-react";

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar?: () => void;
}

export default function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#E8ECF0] bg-white px-4 sm:h-[72px] sm:px-6">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] transition-colors hover:bg-[#F9FAFB]"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? (
          <PanelLeftClose className="h-4 w-4 max-lg:hidden" />
        ) : null}
        <Menu className={`h-4 w-4 ${sidebarOpen ? "lg:hidden" : ""}`} />
      </button>

      <div className="flex items-center gap-2 sm:gap-5">
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#6B7280] transition-colors hover:bg-[#F9FAFB] sm:h-10 sm:w-10"
          aria-label="Messages"
        >
          <Mail className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-semibold text-white">
            2
          </span>
        </button>

        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#6B7280] transition-colors hover:bg-[#F9FAFB] sm:h-10 sm:w-10"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-semibold text-white">
            9
          </span>
        </button>

        <div className="flex items-center gap-2 pl-1 sm:gap-3 sm:pl-2">
          <div className="relative">
            <Image
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
              alt="Guy Hawkins"
              width={40}
              height={40}
              className="h-8 w-8 rounded-full object-cover sm:h-10 sm:w-10"
            />
            <span className="absolute right-0 bottom-0 h-2 w-2 rounded-full border-2 border-white bg-[#22C55E] sm:h-2.5 sm:w-2.5" />
          </div>
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-[14px] font-semibold leading-tight text-[#111827]">
              Guy Hawkins
            </p>
            <p className="text-[12px] text-[#9CA3AF]">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
