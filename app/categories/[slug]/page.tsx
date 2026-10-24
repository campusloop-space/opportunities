import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { listOpportunities, getUserSavedOpportunities } from "@/lib/opportunities/service";
import { getSession } from "@/lib/auth/session";
import { OpportunityCard } from "@/components/opportunity-card";
import { opportunityCategories, type OpportunityCategory } from "@/lib/db/schema";
import { generateBreadcrumbJsonLd, generateItemListJsonLd, generateFaqJsonLd } from "@/lib/seo";
import { ChevronRight, Sparkles } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

const categoryMeta: Record<
  string,
  { title: string; subtitle: string; description: string; longCopy: string }
> = {
  internships: {
    title: "Student Internships 2026",
    subtitle: "Software engineering, research, design, and data science internships for Indian college students",
    description: "Browse verified summer, winter, and off-campus internships. All listings feature official application links and stated stipends.",
    longCopy:
      "Landing an internship is the highest-leverage milestone for college students in India. Whether you are aiming for product-based tech companies, startups, or research institutions, our listings are checked for active application portals and genuine student eligibility.",
  },
  hackathons: {
    title: "National & Global Hackathons 2026",
    subtitle: "Hackathons, product build sprints, and collegiate coding competitions",
    description: "Discover upcoming hackathons across India and globally. Find themes, registration deadlines, and cash prize pools.",
    longCopy:
      "Hackathons offer students the fastest way to build real projects, earn prizes, and get noticed by recruiters. We index university hackathons, national contests (like Smart India Hackathon), and open global hackathons.",
  },
  scholarships: {
    title: "College Scholarships & Grants",
    subtitle: "Merit-based, need-based, and corporate scholarships for undergraduate and engineering students",
    description: "Verified college scholarships, tuition waivers, and education grants with transparent eligibility criteria.",
    longCopy:
      "Education financing should never be a mystery. We track vetted scholarships from corporate foundations, government initiatives, and philanthropy funds with transparent eligibility criteria and verified deadlines.",
  },
  fellowships: {
    title: "Fellowships & Young Leadership Programs",
    subtitle: "Prestigious fellowships in open source, policy, leadership, and technical innovation",
    description: "Explore funded fellowships including Google Summer of Code, MLH Fellowship, and research programs.",
    longCopy:
      "Fellowships provide sustained mentorship, global peer cohorts, and generous stipends. These programs often bridge the gap between academic theory and high-impact industry or open source contribution.",
  },
  research: {
    title: "Undergraduate Research Programs",
    subtitle: "Summer research fellowships at IITs, IISc, TIFR, and international labs",
    description: "Discover undergraduate research internships, SURGE, SRFP, and university research opportunities.",
    longCopy:
      "Engaging in scientific or technical research builds deep domain mastery. Explore summer research fellowships at premier Indian institutes and global university labs.",
  },
  competitions: {
    title: "Competitions & Challenges",
    subtitle: "Algorithmic contests, data science challenges, and collegiate awards",
    description: "Participate in competitive programming, case challenges, and global developer contests.",
    longCopy:
      "Test your problem-solving skills against peers across the country. We feature coding competitions, data science hackathons, and collegiate innovation challenges.",
  },
  student_programs: {
    title: "Student Ambassador & Campus Programs",
    subtitle: "Campus ambassador, student developer clubs, and community programs",
    description: "Join official campus ambassador and student community programs across top tech companies.",
    longCopy:
      "Student partner and campus ambassador programs provide exclusive swag, networking with company engineering leads, and leadership experience on your campus.",
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = categoryMeta[slug];
  if (!meta) return { title: "Category Not Found" };

  const baseUrl = process.env.APP_URL || "https://opportunities.campusloop.space";
  const canonicalUrl = `${baseUrl}/categories/${slug}`;

  return {
    title: `${meta.title} — Verified Deadlines`,
    description: meta.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${meta.title} | CampusLoop Opportunities`,
      description: meta.description,
      url: canonicalUrl,
      siteName: "CampusLoop Opportunities",
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${meta.title} | CampusLoop`,
      description: meta.description,
      images: [`${baseUrl}/og-image.png`],
    },
    other: {
      "geo.region": "IN",
      "geo.placename": "India",
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  if (!opportunityCategories.includes(slug as OpportunityCategory)) {
    notFound();
  }

  const meta = categoryMeta[slug] || {
    title: slug.toUpperCase(),
    subtitle: `Explore opportunities in ${slug}`,
    description: `Curated student opportunities for ${slug}.`,
    longCopy: "",
  };

  const session = await getSession();
  const { items, total } = await listOpportunities({
    category: slug as OpportunityCategory,
    limit: 50,
    sortBy: "publishedAt",
    sortOrder: "desc",
  });

  let savedOppIds = new Set<string>();
  if (session?.sub) {
    const savedList = await getUserSavedOpportunities(session.sub);
    savedOppIds = new Set(savedList.map((s) => s.opportunity.id));
  }

  const breadcrumbsSchema = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: meta.title, url: `/categories/${slug}` },
  ]);

  const itemListSchema = generateItemListJsonLd(items);

  const categoryFaqs = [
    {
      question: `Are all ${slug.replace("_", " ")} listings on CampusLoop verified?`,
      answer: `Yes. Every ${slug.replace("_", " ")} indexed on CampusLoop is verified against the official organizer website. We reject ghost jobs, middleman fees, and unverified postings.`,
    },
    {
      question: `How frequently are new ${slug.replace("_", " ")} added?`,
      answer: `Our curation and AI ingestion pipeline scans verified university portals, corporate engineering blogs, and foundation announcements daily.`,
    },
    {
      question: `Can I bookmark opportunities for later?`,
      answer: `Yes. Click the save icon on any listing to store it in your personal saved list. When signed in with CampusLoop, your saved opportunities sync across all your devices.`,
    },
  ];
  const faqSchema = generateFaqJsonLd(categoryFaqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-[#6B635B] dark:text-[#9E958A]">
          <Link href="/" className="hover:text-[#BD4B2A] dark:hover:text-[#E26543] transition">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-[#8C8377] dark:text-[#736C63]" />
          <span className="text-[#1E1A17] dark:text-[#F5EFEB] font-medium capitalize">{slug.replace("_", " ")}</span>
        </nav>

        {/* Hero Card */}
        <div className="rounded-2xl border border-[#E8E1D5] dark:border-[#2B2622] bg-white dark:bg-[#1A1816] p-6 sm:p-8 shadow-2xs space-y-3">
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-[#FDF3EE] dark:bg-[#2A1712] px-3 py-1 text-xs font-semibold text-[#BD4B2A] dark:text-[#F09A78] border border-[#F6DCD2] dark:border-[#4D261C]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Curated Category Hub</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1A17] dark:text-[#F5EFEB] tracking-tight">
            {meta.title}
          </h1>

          <p className="text-sm font-medium text-[#4A4238] dark:text-[#D5CDC4] max-w-2xl leading-relaxed">
            {meta.subtitle}
          </p>

          <p className="text-xs text-[#6B635B] dark:text-[#9E958A] max-w-3xl leading-relaxed pt-2 border-t border-[#F2ECE3] dark:border-[#26211D]">
            {meta.longCopy}
          </p>

          <div className="pt-2 text-xs font-medium text-[#BD4B2A] dark:text-[#E26543]">
            Showing {items.length} of {total} verified active opportunities
          </div>
        </div>

        {/* Listings Feed */}
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E8E1D5] dark:border-[#2B2622] bg-white dark:bg-[#1A1816] p-12 text-center space-y-3">
            <h3 className="text-base font-semibold text-[#1E1A17] dark:text-[#F5EFEB]">No opportunities currently listed</h3>
            <p className="text-xs text-[#6B635B] dark:text-[#9E958A] max-w-md mx-auto">
              Our automated ingestion agents are scanning for fresh {slug.replace("_", " ")} programs. Check back soon or explore other categories.
            </p>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-xs font-bold text-[#BD4B2A] dark:text-[#E26543] hover:underline"
            >
              <span>Explore all opportunities</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                isSaved={savedOppIds.has(opp.id)}
                isAuthenticated={!!session}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
