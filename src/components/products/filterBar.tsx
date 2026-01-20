"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import SearchIcon from "@/assets/search.svg";
import CloseIcon from "@/assets/close.svg";

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [inputValue, setInputValue] = useState(
    searchParams.get("search") || "",
  );

  function applyFilters(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });

    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: inputValue });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-10 w-full items-center justify-between">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="w-full md:w-1/2 relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <SearchIcon className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search items..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full pl-11 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-full outline-none focus:bg-white focus:border-black transition-all"
        />
        {inputValue && (
          <button
            type="button"
            onClick={() => {
              setInputValue("");
              applyFilters({ search: null });
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Single Sort Dropdown */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        <label className="text-sm font-medium text-gray-500 whitespace-nowrap">
          Sort by:
        </label>
        <select
          onChange={(e) => applyFilters({ sort: e.target.value })}
          value={searchParams.get("sort") || "newest"}
          className="w-full md:w-48 px-4 py-2.5 bg-white border border-gray-200 rounded-md cursor-pointer hover:border-black outline-none transition-all text-sm appearance-none"
          style={{
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.7rem top 50%",
            backgroundSize: "1rem",
          }}
        >
          <option value="newest">Latest Arrivals</option>
          <option value="price_asc">Price: Low to High ↑</option>
          <option value="price_desc">Price: High to Low ↓</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
    </div>
  );
}
