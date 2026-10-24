"use client";

import { useState } from "react";
import { Share2, Check, Copy, MessageCircle } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  slug: string;
  organizerName: string;
}

export function ShareButtons({ title, slug, organizerName }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/opportunities/${slug}`
    : `https://opportunities.campusloop.space/opportunities/${slug}`;

  const shareText = `Check out ${title} by ${organizerName} on CampusLoop Opportunities: ${shareUrl}`;

  async function handleNativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out ${title} by ${organizerName}:`,
          url: shareUrl,
        });
        return;
      } catch {
        // Fall back to copy
      }
    }
    handleCopy();
  }

  function handleCopy() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="flex items-center space-x-2">
      {/* WhatsApp Share */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Share to WhatsApp college group"
        className="inline-flex items-center space-x-1.5 rounded-lg border border-[#25D366]/30 bg-[#25D366]/10 px-3 py-1.5 text-xs font-medium text-[#1E7E34] hover:bg-[#25D366]/20 transition"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        <span>WhatsApp</span>
      </a>

      {/* Copy Link */}
      <button
        onClick={handleCopy}
        title="Copy link to clipboard"
        className="inline-flex items-center space-x-1.5 rounded-lg border border-[#E8E1D5] bg-white px-3 py-1.5 text-xs font-medium text-[#4A4238] hover:border-[#BD4B2A]/40 hover:text-[#BD4B2A] transition"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-emerald-700">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            <span>Copy Link</span>
          </>
        )}
      </button>

      {/* Native Share button */}
      <button
        onClick={handleNativeShare}
        title="Share"
        className="inline-flex items-center justify-center rounded-lg border border-[#E8E1D5] bg-white p-2 text-[#4A4238] hover:border-[#BD4B2A]/40 hover:text-[#BD4B2A] transition"
      >
        <Share2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
