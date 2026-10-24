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
import type { OpportunityCategory, DeliveryMode } from "@/lib/db/schema";

interface PageProps {
  searchParams: Promise<{
    category?: OpportunityCategory;
    mode?: DeliveryMode;
    search?: string;
    closingSoon?: string;
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
    closingSoonOnly,
    offset,
    limit,
    sortBy: closingSoonOnly ? "deadlineAt" : "publishedAt",
    sortOrder: closingSoonOnly ? "asc" : "desc",
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
    { id: "internships", title: "Internships", icon: Briefcase, color: "text-[#BD4B2A] bg-[#FDF3EE]" },
    { id: "hackathons", title: "Hackathons", icon: Code2, color: "text-[#2B6CB0] bg-[#EBF8FF]" },
    { id: "scholarships", title: "Scholarships", icon: GraduationCap, color: "text-[#2F855A] bg-[#F0FFF4]" },
    { id: "fellowships", title: "Fellowships", icon: Award, color: "text-[#6B46C1] bg-[#FAF5FF]" },
    { id: "research", title: "Research", icon: FlaskConical, color: "text-[#C05621] bg-[#FFFAF0]" },
    { id: "competitions", title: "Competitions", icon: Trophy, color: "text-[#D69E2E] bg-[#FFFFF0]" },
    { id: "student_programs", title: "Programs", icon: Users, color: "text-[#319795] bg-[#E6FFFA]" },
  ];

  return (
    <div className="space-y-10">
      {/* Value proposition & search section */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8E1D5] pb-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 rounded-full bg-[#FDF3EE] px-3 py-1 text-xs font-semibold text-[#BD4B2A] border border-[#F6DCD2]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>CampusLoop Verified Pipeline</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E1A17]">
              Student Opportunities That Matter
            </h1>
            <p className="text-sm text-[#5C554D] leading-relaxed">
              Curated internships, hackathons, scholarships, and research positions with verified deadlines and official application portals. No spam, no ghost listings.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs text-[#6B635B] bg-[#FAF7F2] p-3 rounded-xl border border-[#E8E1D5]">
            <div className="text-center px-2">
              <div className="font-bold text-base text-[#1E1A17]">{total}</div>
              <div>Live Listings</div>
            </div>
            <div className="h-8 w-px bg-[#E8E1D5]" />
            <div className="text-center px-2">
              <div className="font-bold text-base text-[#1E1A17]">{closingSoonResult.total}</div>
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
                    ? "border-[#BD4B2A] bg-[#FDF3EE] text-[#BD4B2A] shadow-2xs"
                    : "border-[#E8E1D5] bg-white text-[#4A4238] hover:border-[#BD4B2A]/40 hover:bg-[#FAF7F2]"
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
        <Suspense fallback={<div className="h-14 bg-white/50 rounded-xl animate-pulse" />}>
          <SearchFilters />
        </Suspense>
      </section>

      {/* Closing Soon Section (if not filtered) */}
      {!category && !search && closingSoonResult.items.length > 0 && (
        <section className="rounded-2xl border border-[#FDE047] bg-[#FEFCE8]/50 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-[#854D0E]" />
              <h2 className="text-base font-bold text-[#854D0E]">
                Closing Soon (Next 7 Days)
              </h2>
            </div>
            <Link
              href="/?closingSoon=true"
              className="text-xs font-semibold text-[#854D0E] hover:underline"
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
          <h2 className="text-lg font-bold text-[#1E1A17]">
            {category
              ? `Browse ${category.replace("_", " ").toUpperCase()} (${total})`
              : search
              ? `Search Results for "${search}" (${total})`
              : `All Active Opportunities (${total})`}
          </h2>

          <div className="text-xs text-[#6B635B]">
            Showing {items.length} of {total}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E8E1D5] bg-[#FAF7F2] p-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F3EAE0] text-[#BD4B2A]">
              🔍
            </div>
            <h3 className="text-base font-semibold text-[#1E1A17]">
              No matching opportunities found
            </h3>
            <p className="text-xs text-[#6B635B] max-w-md mx-auto">
              Try adjusting your search terms, clearing selected category filters, or checking back later as new opportunities are verified.
            </p>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 rounded-lg bg-[#BD4B2A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#A33F22] transition"
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
                className="rounded-lg border border-[#E8E1D5] bg-white px-4 py-2 text-xs font-semibold text-[#4A4238] hover:border-[#BD4B2A]"
              >
                ← Previous Page
              </Link>
            )}
            {offset + limit < total && (
              <Link
                href={`/?offset=${offset + limit}`}
                className="rounded-lg bg-[#BD4B2A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#A33F22]"
              >
                Next Page →
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Editorial Trust & Sourcing Section */}
      <section className="rounded-2xl border border-[#E8E1D5] bg-white p-6 sm:p-8 space-y-4 shadow-2xs">
        <div className="flex items-center space-x-2 text-[#BD4B2A]">
          <ShieldCheck className="h-5 w-5" />
          <h3 className="text-base font-bold text-[#1E1A17]">
            How CampusLoop Verifies Opportunities
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#5C554D] leading-relaxed">
          <div>
            <div className="font-semibold text-[#1E1A17] mb-1">Official Links Only</div>
            Every listing points directly to the organizer&apos;s verified domain. We never use affiliate redirect middle-pages or hidden referral links.
          </div>
          <div>
            <div className="font-semibold text-[#1E1A17] mb-1">Grounded Deadlines</div>
            Deadlines are parsed from official guidelines and periodically checked by automated crawlers and student editorial maintainers.
          </div>
          <div>
            <div className="font-semibold text-[#1E1A17] mb-1">Zero Paywalls</div>
            Public opportunity discovery is completely open and free. Indian college students can browse without an account and sign in only to save.
          </div>
        </div>
      </section>
    </div>
  );
}
