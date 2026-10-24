import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const BASE_URL = process.env.APP_URL || "https://opportunities.campusloop.space";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "CampusLoop Opportunities — Verified Internships, Hackathons & Scholarships",
    template: "%s | CampusLoop Opportunities",
  },
  description:
    "Discover verified internships, hackathons, scholarships, fellowships, and student research programs for Indian college students. Fresh deadlines, official application links, and verified student credentials.",
  keywords: [
    "internships for college students",
    "hackathons India 2026",
    "scholarships B.Tech India",
    "research fellowships",
    "student competitions",
    "CampusLoop",
  ],
  authors: [{ name: "CampusLoop Labs", url: "https://campusloop.space" }],
  creator: "CampusLoop",
  publisher: "CampusLoop Labs",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "CampusLoop Opportunities",
    title: "CampusLoop Opportunities — Verified Student Programs & Hackathons",
    description:
      "A fast, verified student discovery engine for internships, hackathons, and scholarships across Indian engineering and undergraduate colleges.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusLoop Opportunities",
    description:
      "Verified internships, hackathons, scholarships, and fellowships for Indian college students.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/campusloop/icon.svg",
    shortcut: "/campusloop/icon.svg",
    apple: "/campusloop/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col justify-between bg-[#FFFDF9] text-[#1E1A17] selection:bg-[#BD4B2A]/20 selection:text-[#BD4B2A]">
        <div>
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
