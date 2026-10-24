import Link from "next/link";
import { Suspense } from "react";
import { getSession } from "@/lib/auth/session";
import { listOpportunities, getUserSavedOpportunities } from "@/lib/opportunities/service";
import { OpportunityCard } from "@/components/opportunity-card";
import { SearchFilters } from "@/components/search-filters";
import {
  Briefcase,
  Code2,
  GraduationCap,
  Award,
  FlaskConical,
  Trophy,
  Users,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";
import { generateItemListJsonLd } from "@/lib/seo";
import type { OpportunityCategory, DeliveryMode } from "@/lib/db/schema";

interface PageProps {
  searchParams: Promise<{
    category?: OpportunityCategory;
    mode?: DeliveryMode;
    search?: string;
    closingSoon?: string;
    qualityTier?: "A" | "B" | "C" | "D";
    sortBy?: "publishedAt" | "deadlineAt" | "createdAt" | "updatedAt" | "qualityScore";
    offset?: string;
  }>;
}

export const revalidate = 60; // ISR 60s

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await getSession();

  const category = params.category;
  const deliveryMode = params.mode;
  const search = params.search;
  const closingSoonOnly = params.closingSoon === "true";
  const offset = Number(params.offset) || 0;
  const limit = 24;

  const { items, total } = await listOpportunities({
    category,
    deliveryMode,
    search,
    qualityTier: params.qualityTier,
    closingSoonOnly,
    offset,
    limit,
    sortBy: closingSoonOnly ? "deadlineAt" : (params.sortBy || "publishedAt"),
    sortOrder: closingSoonOnly ? "asc" : params.sortBy === "qualityScore" ? "desc" : params.sortBy === "deadlineAt" ? "asc" : "desc",
  });

  // Closing soon spotlight (up to 3 items)
  const closingSoonResult = await listOpportunities({
    closingSoonOnly: true,
    limit: 3,
    sortBy: "deadlineAt",
    sortOrder: "asc",
  });

  // Get user saved IDs if authenticated
  let savedOppIds = new Set<string>();
  if (session?.sub) {
    const savedList = await getUserSavedOpportunities(session.sub);
    savedOppIds = new Set(savedList.map((s) => s.opportunity.id));
  }

  const categoryCards = [
    { id: "internships", title: "Internships", icon: Briefcase, color: "text-[#BD4B2A] dark:text-[#F09A78] bg-[#FDF3EE] dark:bg-[#2A1712]" },
    { id: "hackathons", title: "Hackathons", icon: Code2, color: "text-[#2B6CB0] dark:text-[#60A5FA] bg-[#EBF8FF] dark:bg-[#131D33]" },
    { id: "scholarships", title: "Scholarships", icon: GraduationCap, color: "text-[#2F855A] dark:text-[#4ADE80] bg-[#F0FFF4] dark:bg-[#102A18]" },
    { id: "fellowships", title: "Fellowships", icon: Award, color: "text-[#6B46C1] dark:text-[#C084FC] bg-[#FAF5FF] dark:bg-[#231733]" },
    { id: "research", title: "Research", icon: FlaskConical, color: "text-[#C05621] dark:text-[#FB923C] bg-[#FFFAF0] dark:bg-[#2A1B10]" },
    { id: "competitions", title: "Competitions", icon: Trophy, color: "text-[#D69E2E] dark:text-[#FBBF24] bg-[#FFFFF0] dark:bg-[#29220D]" },
    { id: "student_programs", title: "Programs", icon: Users, color: "text-[#319795] dark:text-[#2DD4BF] bg-[#E6FFFA] dark:bg-[#0D2624]" },
  ];

  const itemListSchema = generateItemListJsonLd(items);

  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListSchema),
        }}
      />
      {/* Value proposition & search section with ambient glow */}
      <section className="relative space-y-4 pt-2">
        {/* Subtle decorative radial glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 left-1/2 -z-10 h-72 w-full max-w-4xl -translate-x-1/2 rounded-full bg-gradient-to-r from-[#BD4B2A]/10 via-[#E5855E]/10 to-[#BD4B2A]/5 blur-3xl dark:from-[#E26543]/15 dark:via-[#F09A78]/10 dark:to-transparent"
        />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8E1D5] dark:border-[#2B2622] pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 rounded-full bg-[#FDF3EE] dark:bg-[#2A1712] px-3 py-1 text-xs font-semibold text-[#BD4B2A] dark:text-[#F09A78] border border-[#F6DCD2] dark:border-[#4D261C]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>CampusLoop Verified Pipeline</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#1E1A17] dark:text-[#F5EFEB]">
              Student Opportunities That Matter
            </h1>
            <p className="text-sm text-[#5C554D] dark:text-[#B8AEA3] leading-relaxed">
              Curated internships, hackathons, scholarships, and research positions with verified deadlines and official application portals. Zero spam, zero ghost listings.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs text-[#6B635B] dark:text-[#9E958A] bg-[#FAF7F2] dark:bg-[#1A1816] p-3 rounded-xl border border-[#E8E1D5] dark:border-[#2B2622] shadow-2xs">
            <div className="text-center px-2">
              <div className="font-bold text-base text-[#1E1A17] dark:text-[#F5EFEB]">{total}</div>
              <div>Live Listings</div>
            </div>
            <div className="h-8 w-px bg-[#E8E1D5] dark:bg-[#2B2622]" />
            <div className="text-center px-2">
              <div className="font-bold text-base text-[#1E1A17] dark:text-[#F5EFEB]">{closingSoonResult.total}</div>
              <div>Closing Soon</div>
            </div>
          </div>
        </div>

        {/* Quick Category Browse Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {categoryCards.map((cat) => {
            const Icon = cat.icon;
            const isActive = category === cat.id;
            return (
              <Link
                key={cat.id}
                href={isActive ? "/" : `/categories/${cat.id}`}
                className={`flex items-center space-x-2 rounded-xl border p-2.5 transition-all text-xs font-semibold ${
                  isActive
                    ? "border-[#BD4B2A] dark:border-[#E26543] bg-[#FDF3EE] dark:bg-[#2A1712] text-[#BD4B2A] dark:text-[#F09A78] shadow-2xs"
                    : "border-[#E8E1D5] dark:border-[#2B2622] bg-white dark:bg-[#1A1816] text-[#4A4238] dark:text-[#D5CDC4] hover:border-[#BD4B2A]/40 dark:hover:border-[#E26543]/40 hover:bg-[#FAF7F2] dark:hover:bg-[#211D1A]"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${cat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="truncate">{cat.title}</span>
              </Link>
            );
          })}
        </div>

        {/* Search & Filters */}
        <Suspense fallback={<div className="h-14 bg-white/50 dark:bg-[#1A1816]/50 rounded-xl animate-pulse" />}>
          <SearchFilters />
        </Suspense>
      </section>

      {/* Closing Soon Section (if not filtered) */}
      {!category && !search && closingSoonResult.items.length > 0 && (
        <section className="rounded-2xl border border-[#FDE047] dark:border-[#78350F] bg-[#FEFCE8]/50 dark:bg-[#20170A] p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-[#854D0E] dark:text-[#FCD34D]" />
              <h2 className="text-base font-bold text-[#854D0E] dark:text-[#FCD34D]">
                Closing Soon (Next 7 Days)
              </h2>
            </div>
            <Link
              href="/?closingSoon=true"
              className="text-xs font-semibold text-[#854D0E] dark:text-[#FCD34D] hover:underline"
            >
              View all ({closingSoonResult.total}) →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {closingSoonResult.items.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                isSaved={savedOppIds.has(opp.id)}
                isAuthenticated={!!session}
              />
            ))}
          </div>
        </section>
      )}

      {/* Main Opportunities Feed */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1E1A17] dark:text-[#F5EFEB]">
            {category
              ? `Browse ${category.replace("_", " ").toUpperCase()} (${total})`
              : search
              ? `Search Results for "${search}" (${total})`
              : `All Active Opportunities (${total})`}
          </h2>

          <div className="text-xs text-[#6B635B] dark:text-[#9E958A]">
            Showing {items.length} of {total}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E8E1D5] dark:border-[#2B2622] bg-[#FAF7F2] dark:bg-[#1A1816] p-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F3EAE0] dark:bg-[#211D1A] text-[#BD4B2A] dark:text-[#E26543]">
              🔍
            </div>
            <h3 className="text-base font-semibold text-[#1E1A17] dark:text-[#F5EFEB]">
              No matching opportunities found
            </h3>
            <p className="text-xs text-[#6B635B] dark:text-[#9E958A] max-w-md mx-auto">
              Try adjusting your search terms, clearing selected category filters, or checking back later as new opportunities are verified.
            </p>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 rounded-lg bg-[#BD4B2A] dark:bg-[#E26543] px-4 py-2 text-xs font-semibold text-white hover:bg-[#A33F22] dark:hover:bg-[#CC4E2C] transition"
            >
              Reset All Filters
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

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-center space-x-3 pt-6">
            {offset > 0 && (
              <Link
                href={`/?offset=${Math.max(0, offset - limit)}`}
                className="rounded-lg border border-[#E8E1D5] dark:border-[#2B2622] bg-white dark:bg-[#1A1816] px-4 py-2 text-xs font-semibold text-[#4A4238] dark:text-[#D5CDC4] hover:border-[#BD4B2A] dark:hover:border-[#E26543]"
              >
                ← Previous Page
              </Link>
            )}
            {offset + limit < total && (
              <Link
                href={`/?offset=${offset + limit}`}
                className="rounded-lg bg-[#BD4B2A] dark:bg-[#E26543] px-4 py-2 text-xs font-semibold text-white hover:bg-[#A33F22] dark:hover:bg-[#CC4E2C]"
              >
                Next Page →
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Editorial Trust & Sourcing Section */}
      <section className="rounded-2xl border border-[#E8E1D5] dark:border-[#2B2622] bg-white dark:bg-[#1A1816] p-6 sm:p-8 space-y-4 shadow-2xs">
        <div className="flex items-center space-x-2 text-[#BD4B2A] dark:text-[#E26543]">
          <ShieldCheck className="h-5 w-5" />
          <h3 className="text-base font-bold text-[#1E1A17] dark:text-[#F5EFEB]">
            How CampusLoop Verifies Opportunities
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#5C554D] dark:text-[#B8AEA3] leading-relaxed">
          <div>
            <div className="font-semibold text-[#1E1A17] dark:text-[#F5EFEB] mb-1">Official Links Only</div>
            Every listing points directly to the organizer&apos;s verified domain. We never use affiliate redirect middle-pages or hidden referral links.
          </div>
          <div>
            <div className="font-semibold text-[#1E1A17] dark:text-[#F5EFEB] mb-1">Grounded Deadlines</div>
            Deadlines are parsed from official guidelines and periodically checked by automated crawlers and student editorial maintainers.
          </div>
          <div>
            <div className="font-semibold text-[#1E1A17] dark:text-[#F5EFEB] mb-1">Zero Paywalls</div>
            Public opportunity discovery is completely open and free. Indian college students can browse without an account and sign in only to save.
          </div>
        </div>
      </section>
    </div>
  );
}
