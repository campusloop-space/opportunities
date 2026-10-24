import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getUserSavedOpportunities } from "@/lib/opportunities/service";
import { OpportunityCard } from "@/components/opportunity-card";
import { Bookmark, ShieldCheck, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Saved Opportunities",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SavedPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login/campusloop?returnTo=/saved");
  }

  const savedList = await getUserSavedOpportunities(session.sub);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-[#E8E1D5] bg-white p-6 sm:p-8 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 rounded-full bg-[#FDF3EE] px-3 py-1 text-xs font-semibold text-[#BD4B2A] border border-[#F6DCD2]">
              <Bookmark className="h-3.5 w-3.5" />
              <span>Personal Bookmarks</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1A17] tracking-tight">
              Saved Opportunities
            </h1>
            <p className="text-xs text-[#5C554D]">
              Linked to your CampusLoop student account ({session.name || session.email}).
            </p>
          </div>

          {session.studentVerified && (
            <div className="inline-flex items-center space-x-1.5 rounded-xl border border-[#C3E6CB] bg-[#EBF7EE] px-3.5 py-2 text-xs font-semibold text-[#1E7E34] self-start sm:self-auto">
              <ShieldCheck className="h-4 w-4" />
              <span>Verified Student Account</span>
            </div>
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#1E1A17]">
          Your Bookmarked Listings ({savedList.length})
        </h2>

        {savedList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E8E1D5] bg-[#FAF7F2] p-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F3EAE0] text-[#BD4B2A]">
              <Bookmark className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-[#1E1A17]">
              No saved opportunities yet
            </h3>
            <p className="text-xs text-[#6B635B] max-w-sm mx-auto">
              Click the bookmark icon on any opportunity card while browsing to save it to your personal dashboard.
            </p>
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 rounded-lg bg-[#BD4B2A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#A33F22] transition"
            >
              <span>Explore Opportunities</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedList.map(({ opportunity }) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                isSaved={true}
                isAuthenticated={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
