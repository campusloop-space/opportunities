"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";

interface SaveButtonProps {
  opportunityId: string;
  initialSaved?: boolean;
  isAuthenticated?: boolean;
  className?: string;
  showText?: boolean;
}

export function SaveButton({
  opportunityId,
  initialSaved = false,
  isAuthenticated = false,
  className = "",
  showText = false,
}: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/auth/login/campusloop?returnTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setIsLoading(true);
    // Optimistic update
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/save`, {
        method: "POST",
      });
      if (!res.ok) {
        setIsSaved(!nextSaved); // Revert
      } else {
        const data = await res.json();
        setIsSaved(data.saved);
        router.refresh();
      }
    } catch {
      setIsSaved(!nextSaved); // Revert
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      title={isSaved ? "Remove from saved opportunities" : "Save opportunity"}
      className={`inline-flex items-center justify-center space-x-1.5 rounded-lg border transition-all ${
        isSaved
          ? "bg-[#BD4B2A]/10 border-[#BD4B2A] text-[#BD4B2A]"
          : "bg-white border-[#E8E1D5] text-[#6B635B] hover:text-[#BD4B2A] hover:border-[#BD4B2A]/50"
      } ${className || "p-2"}`}
    >
      <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
      {showText && (
        <span className="text-xs font-medium">
          {isSaved ? "Saved" : "Save"}
        </span>
      )}
    </button>
  );
}
