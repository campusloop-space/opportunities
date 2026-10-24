"use client";

import { useEffect, useState } from "react";
import { Download, X, Share, PlusSquare } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(true); // default true until checked client-side
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // Check if dismissed recently
    const dismissedTime = localStorage.getItem("cl_pwa_dismissed");
    if (dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 7 * 24 * 60 * 60 * 1000) {
      setDismissed(true);
    } else {
      setDismissed(false);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
      localStorage.setItem("cl_pwa_installed", "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("cl_pwa_dismissed", Date.now().toString());
  };

  // Do not show if already installed in standalone or dismissed or nothing to prompt on desktop
  if (isStandalone || dismissed || (!deferredPrompt && !isIOS)) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#BD4B2A]/30 bg-[#FDFBF7] p-3.5 shadow-xl backdrop-blur-md">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#BD4B2A] text-white shadow-xs">
              <Download className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#1E1A17] truncate">
                Install CampusLoop Opportunities
              </p>
              <p className="text-[11px] text-[#6B635B] truncate">
                Instant alerts &amp; 1-tap offline access
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="rounded-lg bg-[#BD4B2A] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#A33F22] transition"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss install banner"
              className="rounded-lg p-1.5 text-[#8C8377] hover:bg-[#F2ECE3] hover:text-[#1E1A17] transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-sm rounded-2xl border border-[#E8E1D5] bg-[#FDFBF7] p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 rounded-lg p-1 text-[#8C8377] hover:bg-[#F2ECE3] transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1E1A17]">Install on your iPhone / iPad</h3>
              <p className="text-xs text-[#6B635B]">
                Follow these two steps to add CampusLoop Opportunities to your Home Screen:
              </p>
            </div>

            <div className="space-y-3 pt-2 text-xs text-[#4A4238]">
              <div className="flex items-start space-x-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FDF3EE] font-bold text-[#BD4B2A]">
                  1
                </span>
                <p>
                  Tap the <Share className="inline h-4 w-4 text-[#BD4B2A] mx-0.5" /> <strong>Share</strong> button in Safari's bottom toolbar.
                </p>
              </div>

              <div className="flex items-start space-x-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FDF3EE] font-bold text-[#BD4B2A]">
                  2
                </span>
                <p>
                  Scroll down and select <PlusSquare className="inline h-4 w-4 text-[#BD4B2A] mx-0.5" /> <strong>Add to Home Screen</strong>.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full rounded-xl bg-[#BD4B2A] py-2 text-xs font-bold text-white shadow-xs hover:bg-[#A33F22] transition"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
