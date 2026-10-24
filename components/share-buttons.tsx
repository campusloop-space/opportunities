"use client";

import { useState } from "react";
import { Share2, Check, Copy, MessageCircle, Send } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  slug: string;
  organizerName: string;
  category?: string;
  stipend?: string | null;
}

export function ShareButtons({ title, slug, organizerName, category, stipend }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/opportunities/${slug}`
      : `https://opportunities.campusloop.space/opportunities/${slug}`;

  const perks = stipend ? ` (Stipend: ${stipend})` : "";
  const shareText = `🎓 ${title} by ${organizerName}${perks} on CampusLoop Opportunities:`;

  async function handleNativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${title} | CampusLoop Opportunities`,
          text: `${shareText}\n`,
          url: shareUrl,
        });
        return;
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }
    setShowShareModal(true);
  }

  function handleCopy() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  }

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${shareText}\n${shareUrl}\n\n👉 Apply now on verified portal.`
  )}`;

  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
    shareUrl
  )}&text=${encodeURIComponent(shareText)}`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Looking for opportunities? Check out ${title} by ${organizerName} on @campusloop:`
  )}&url=${encodeURIComponent(shareUrl)}&hashtags=CampusLoop,Internships,Hackathons`;

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl
  )}`;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {/* Primary WhatsApp Share for College Groups */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Share to WhatsApp college group"
          className="inline-flex items-center space-x-1.5 rounded-lg border border-[#25D366]/40 dark:border-[#25D366]/30 bg-[#25D366]/10 dark:bg-[#25D366]/15 px-3 py-1.5 text-xs font-semibold text-[#1E7E34] dark:text-[#4ADE80] hover:bg-[#25D366]/20 transition shadow-2xs"
        >
          <MessageCircle className="h-3.5 w-3.5 text-[#25D366] fill-[#25D366]/20" />
          <span>WhatsApp</span>
        </a>

        {/* Telegram Share */}
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Share on Telegram"
          className="hidden sm:inline-flex items-center space-x-1.5 rounded-lg border border-[#0088cc]/30 bg-[#0088cc]/10 dark:bg-[#0088cc]/15 px-3 py-1.5 text-xs font-medium text-[#0077b5] dark:text-[#60A5FA] hover:bg-[#0088cc]/20 transition"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Telegram</span>
        </a>

        {/* Copy Link Button */}
        <button
          onClick={handleCopy}
          title="Copy direct link"
          className="inline-flex items-center space-x-1.5 rounded-lg border border-[#E8E1D5] dark:border-[#2B2622] bg-white dark:bg-[#1A1816] px-3 py-1.5 text-xs font-medium text-[#4A4238] dark:text-[#D5CDC4] hover:border-[#BD4B2A]/40 dark:hover:border-[#E26543]/40 hover:text-[#BD4B2A] dark:hover:text-[#E26543] transition shadow-2xs"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-[#8C8377] dark:text-[#736C63]" />
              <span>Copy Link</span>
            </>
          )}
        </button>

        {/* More Social Share / Native Share */}
        <button
          onClick={handleNativeShare}
          title="More share options"
          className="inline-flex items-center justify-center rounded-lg border border-[#E8E1D5] dark:border-[#2B2622] bg-white dark:bg-[#1A1816] p-2 text-[#4A4238] dark:text-[#D5CDC4] hover:border-[#BD4B2A]/40 dark:hover:border-[#E26543]/40 hover:text-[#BD4B2A] dark:hover:text-[#E26543] transition shadow-2xs"
        >
          <Share2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Share Modal Dialog */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-[#E8E1D5] dark:border-[#2B2622] bg-[#FDFBF7] dark:bg-[#171513] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#F2ECE3] dark:border-[#26211D] pb-3">
              <h3 className="text-sm font-bold text-[#1E1A17] dark:text-[#F5EFEB] flex items-center gap-2">
                <Share2 className="h-4 w-4 text-[#BD4B2A] dark:text-[#E26543]" />
                Share this Opportunity
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-xs text-[#8C8377] dark:text-[#736C63] hover:text-[#1E1A17] dark:hover:text-[#F5EFEB]"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-[#6B635B] dark:text-[#B8AEA3] line-clamp-2">
              <strong className="text-[#1E1A17] dark:text-[#F5EFEB]">{title}</strong> by {organizerName}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 dark:bg-[#25D366]/15 p-2.5 text-[#1E7E34] dark:text-[#4ADE80] hover:bg-[#25D366]/20 transition"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>

              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 rounded-xl border border-[#0088cc]/30 bg-[#0088cc]/10 dark:bg-[#0088cc]/15 p-2.5 text-[#0077b5] dark:text-[#60A5FA] hover:bg-[#0088cc]/20 transition"
              >
                <Send className="h-4 w-4" />
                <span>Telegram</span>
              </a>

              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 rounded-xl border border-[#0A66C2]/30 bg-[#0A66C2]/10 dark:bg-[#0A66C2]/15 p-2.5 text-[#0A66C2] dark:text-[#60A5FA] hover:bg-[#0A66C2]/20 transition"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.97 0-1.75-.79-1.75-1.76s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.76-1.75 1.76m1.39 9.74v-8.37H5.07v8.37h2.78z" />
                </svg>
                <span>LinkedIn</span>
              </a>

              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 rounded-xl border border-neutral-300 dark:border-[#2B2622] bg-white dark:bg-[#1A1816] p-2.5 text-[#1E1A17] dark:text-[#F5EFEB] hover:bg-neutral-50 dark:hover:bg-[#211D1A] transition"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Twitter / X</span>
              </a>
            </div>

            <div className="flex items-center gap-1.5 rounded-xl border border-[#E8E1D5] dark:border-[#2B2622] bg-white dark:bg-[#1A1816] p-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full text-[11px] text-[#6B635B] dark:text-[#9E958A] bg-transparent outline-hidden select-all"
              />
              <button
                onClick={handleCopy}
                className="rounded-lg bg-[#FDF3EE] dark:bg-[#2A1712] px-2.5 py-1 text-xs font-semibold text-[#BD4B2A] dark:text-[#F09A78] hover:bg-[#F6DCD2] dark:hover:bg-[#4D261C] transition shrink-0"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
