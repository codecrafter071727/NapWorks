"use client";

interface ProductFiltersProps {
  startDate: string;
  endDate: string;
  minPrice: string;
  maxPrice: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
}

export default function ProductFilters({
  startDate,
  endDate,
  minPrice,
  maxPrice,
  onStartDateChange,
  onEndDateChange,
  onMinPriceChange,
  onMaxPriceChange,
}: ProductFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-4 border-t border-[#E8ECF0] px-4 py-4 sm:px-6 sm:py-5 md:grid-cols-2">
      <div>
        <label className="mb-2 block text-[13px] font-medium text-[#374151]">
          Start Date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 text-[14px] text-[#111827] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
        />
      </div>
      <div>
        <label className="mb-2 block text-[13px] font-medium text-[#374151]">
          End Date
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 text-[14px] text-[#111827] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
        />
      </div>
      <div>
        <label className="mb-2 block text-[13px] font-medium text-[#374151]">
          Min Price
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={minPrice}
          onChange={(e) => onMinPriceChange(e.target.value)}
          className="h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 text-[14px] text-[#111827] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
        />
      </div>
      <div>
        <label className="mb-2 block text-[13px] font-medium text-[#374151]">
          Max Price
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(e.target.value)}
          className="h-11 w-full rounded-lg border border-[#E5E7EB] bg-white px-4 text-[14px] text-[#111827] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
        />
      </div>
    </div>
  );
}
