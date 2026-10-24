"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "./theme-provider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggle = () => {
    if (resolvedTheme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  if (!mounted) {
    return (
      <div
        className={`h-9 w-9 rounded-lg border border-[#E8E1D5] dark:border-[#2B2622] bg-white/50 dark:bg-[#1A1816]/50 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`group relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#E8E1D5] dark:border-[#2B2622] bg-white dark:bg-[#1A1816] text-[#4A4238] dark:text-[#D5CDC4] shadow-2xs hover:border-[#BD4B2A]/50 dark:hover:border-[#E26543]/50 hover:text-[#BD4B2A] dark:hover:text-[#E26543] transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#BD4B2A]/40 ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45 text-[#F09A78]" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12 text-[#6B635B] group-hover:text-[#BD4B2A]" />
      )}
    </button>
  );
}
