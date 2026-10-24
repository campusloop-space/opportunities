"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { opportunityCategories } from "@/lib/db/schema";

export function SearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentMode = searchParams.get("mode") || "";
  const currentClosingSoon = searchParams.get("closingSoon") === "true";

  const [searchVal, setSearchVal] = useState(currentSearch);

  function applyFilters(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(updates)) {
      if (val === null || val === "" || val === "false") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    }
    // Reset offset when changing filters
    params.delete("offset");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    applyFilters({ search: searchVal.trim() });
  }

  const categoryLabels: Record<string, string> = {
    internships: "Internships",
    hackathons: "Hackathons",
    scholarships: "Scholarships",
    fellowships: "Fellowships",
    research: "Research",
    competitions: "Competitions",
    student_programs: "Programs",
  };

  const hasActiveFilters = currentSearch || currentCategory || currentMode || currentClosingSoon;

  return (
    <div className="space-y-3">
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <Search className="absolute left-3.5 h-4 w-4 text-[#8C8377] dark:text-[#736C63]" />
        <input
          type="text"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          placeholder="Search opportunities by title, organization, or tech stack..."
          className="w-full rounded-xl border border-[#E8E1D5] dark:border-[#2B2622] bg-white dark:bg-[#1A1816] py-2.5 pl-10 pr-24 text-sm text-[#1E1A17] dark:text-[#F5EFEB] placeholder:text-[#8C8377] dark:placeholder:text-[#736C63] focus:border-[#BD4B2A] dark:focus:border-[#E26543] focus:outline-hidden focus:ring-2 focus:ring-[#BD4B2A]/20 dark:focus:ring-[#E26543]/20 transition shadow-2xs"
        />
        <button
          type="submit"
          className="absolute right-1.5 rounded-lg bg-[#BD4B2A] dark:bg-[#E26543] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#A33F22] dark:hover:bg-[#CC4E2C] transition"
        >
          Search
        </button>
      </form>

      {/* Category Pills & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => applyFilters({ category: null })}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
              !currentCategory
                ? "bg-[#BD4B2A] dark:bg-[#E26543] text-white shadow-2xs"
                : "bg-white dark:bg-[#1A1816] border border-[#E8E1D5] dark:border-[#2B2622] text-[#5C554D] dark:text-[#D5CDC4] hover:border-[#BD4B2A]/50 dark:hover:border-[#E26543]/50 hover:text-[#BD4B2A] dark:hover:text-[#E26543]"
            }`}
          >
            All
          </button>
          {opportunityCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => applyFilters({ category: currentCategory === cat ? null : cat })}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                currentCategory === cat
                  ? "bg-[#BD4B2A] dark:bg-[#E26543] text-white shadow-2xs"
                  : "bg-white dark:bg-[#1A1816] border border-[#E8E1D5] dark:border-[#2B2622] text-[#5C554D] dark:text-[#D5CDC4] hover:border-[#BD4B2A]/50 dark:hover:border-[#E26543]/50 hover:text-[#BD4B2A] dark:hover:text-[#E26543]"
              }`}
            >
              {categoryLabels[cat] || cat}
            </button>
          ))}
        </div>

        {/* Secondary Filters */}
        <div className="flex items-center space-x-2 text-xs">
          {/* Delivery Mode */}
          <select
            value={currentMode}
            onChange={(e) => applyFilters({ mode: e.target.value || null })}
            className="rounded-lg border border-[#E8E1D5] dark:border-[#2B2622] bg-white dark:bg-[#1A1816] px-2.5 py-1 text-xs text-[#5C554D] dark:text-[#D5CDC4] focus:border-[#BD4B2A] dark:focus:border-[#E26543] focus:outline-hidden"
          >
            <option value="">Any Mode</option>
            <option value="remote">Remote Only</option>
            <option value="in_person">In-Person Only</option>
            <option value="hybrid">Hybrid</option>
          </select>

          {/* Closing Soon Toggle */}
          <button
            onClick={() => applyFilters({ closingSoon: currentClosingSoon ? null : "true" })}
            className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
              currentClosingSoon
                ? "bg-[#FEF08A]/50 dark:bg-[#2E200B] border-[#FDE047] dark:border-[#78350F] text-[#854D0E] dark:text-[#FCD34D]"
                : "bg-white dark:bg-[#1A1816] border-[#E8E1D5] dark:border-[#2B2622] text-[#5C554D] dark:text-[#D5CDC4] hover:border-[#BD4B2A]/40 dark:hover:border-[#E26543]/40"
            }`}
          >
            Closing Soon
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearchVal("");
                router.push(pathname);
              }}
              className="inline-flex items-center space-x-1 text-[#BD4B2A] dark:text-[#E26543] hover:underline px-1 py-1"
            >
              <X className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {isPending && (
        <div className="h-0.5 w-full bg-[#BD4B2A]/20 dark:bg-[#E26543]/20 overflow-hidden">
          <div className="h-full bg-[#BD4B2A] dark:bg-[#E26543] animate-pulse"></div>
        </div>
      )}
    </div>
  );
}
