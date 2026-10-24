import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CampusLoop Opportunities",
    short_name: "Opportunities",
    description:
      "Discover verified student internships, hackathons, scholarships, fellowships, and research programs.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FDFBF7",
    theme_color: "#BD4B2A",
    categories: ["education", "productivity", "business", "lifestyle"],
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Browse Internships",
        short_name: "Internships",
        description: "View verified summer & off-campus internships",
        url: "/categories/internships",
        icons: [{ src: "/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Upcoming Hackathons",
        short_name: "Hackathons",
        description: "National & college coding hackathons",
        url: "/categories/hackathons",
        icons: [{ src: "/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Saved Bookmarks",
        short_name: "Saved",
        description: "Access your saved student opportunities",
        url: "/saved",
        icons: [{ src: "/icon-192x192.png", sizes: "192x192" }],
      },
    ],
  };
}
