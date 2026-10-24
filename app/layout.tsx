import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { InstallPWA } from "@/components/install-pwa";
import { generateWebsiteJsonLd, generateOrganizationJsonLd } from "@/lib/seo";

const BASE_URL = process.env.APP_URL || "https://opportunities.campusloop.space";

export const viewport: Viewport = {
  themeColor: "#BD4B2A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "CampusLoop Opportunities — Verified Internships, Hackathons & Scholarships",
    template: "%s | CampusLoop Opportunities",
  },
  description:
    "Discover verified student internships, hackathons, scholarships, fellowships, and research programs for Indian college students. Fresh deadlines, official organizer links, and anti-fraud verification.",
  keywords: [
    "internships for college students",
    "hackathons India 2026",
    "scholarships B.Tech India",
    "research fellowships",
    "GSoC 2026",
    "SIH 2026",
    "student competitions",
    "campus ambassador programs",
    "CampusLoop",
    "CampusLoop Labs",
  ],
  authors: [{ name: "CampusLoop Labs", url: "https://campusloop.space" }],
  creator: "CampusLoop",
  publisher: "CampusLoop Labs",
  applicationName: "CampusLoop Opportunities",
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: BASE_URL,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/icon-192x192.png"],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "CampusLoop Opportunities",
    title: "CampusLoop Opportunities — Verified Student Programs & Hackathons",
    description:
      "A fast, verified student discovery engine for internships, hackathons, and scholarships across Indian engineering and undergraduate colleges.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CampusLoop Opportunities — Verified Internships, Hackathons & Scholarships",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusLoop Opportunities — Student Internships, Hackathons & Scholarships",
    description:
      "Discover verified internships, hackathons, scholarships, and fellowships for Indian college students.",
    creator: "@campusloop",
    site: "@campusloop",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Opportunities",
  },
  other: {
    // Geo metadata for India and local student relevance
    "geo.region": "IN",
    "geo.placename": "India",
    "geo.position": "20.5937;78.9629",
    "ICBM": "20.5937, 78.9629",
    // PWA & Mobile hints
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const websiteSchema = generateWebsiteJsonLd();
  const organizationSchema = generateOrganizationJsonLd();

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([websiteSchema, organizationSchema]),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col justify-between bg-[#FFFDF9] text-[#1E1A17] selection:bg-[#BD4B2A]/20 selection:text-[#BD4B2A]">
        <div>
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
        <Footer />
        <InstallPWA />
      </body>
    </html>
  );
}
