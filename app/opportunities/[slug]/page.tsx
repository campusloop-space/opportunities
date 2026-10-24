import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getOpportunityBySlug, isOpportunitySaved } from "@/lib/opportunities/service";
import { getSession } from "@/lib/auth/session";
import { generateOpportunityJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";
import { SaveButton } from "@/components/save-button";
import { ShareButtons } from "@/components/share-buttons";
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  ExternalLink,
  Coins,
  GraduationCap,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const opp = await getOpportunityBySlug(slug);
  if (!opp) return { title: "Opportunity Not Found" };

  const baseUrl = process.env.APP_URL || "https://opportunities.campusloop.space";
  const canonicalUrl = `${baseUrl}/opportunities/${opp.slug}`;

  return {
    title: `${opp.title} — ${opp.organizerName}`,
    description: opp.summary,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${opp.title} — ${opp.organizerName}`,
      description: opp.summary,
      url: canonicalUrl,
      type: "article",
      publishedTime: opp.publishedAt?.toISOString(),
      modifiedTime: opp.updatedAt?.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: `${opp.title} | CampusLoop`,
      description: opp.summary,
    },
  };
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const opp = await getOpportunityBySlug(slug);

  if (!opp) {
    notFound();
  }

  const session = await getSession();
  const isSaved = session?.sub ? await isOpportunitySaved(session.sub, opp.id) : false;

  const jsonLd = generateOpportunityJsonLd(opp);
  const breadcrumbsJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: opp.category.replace("_", " "), url: `/categories/${opp.category}` },
    { name: opp.title, url: `/opportunities/${opp.slug}` },
  ]);

  const now = new Date();
  const deadline = opp.deadlineAt ? new Date(opp.deadlineAt) : null;
  const daysLeft = deadline ? Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <>
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <div className="space-y-6">
        {/* Breadcrumb nav */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-[#6B635B]">
          <Link href="/" className="hover:text-[#BD4B2A] transition">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-[#8C8377]" />
          <Link href={`/categories/${opp.category}`} className="capitalize hover:text-[#BD4B2A] transition">
            {opp.category.replace("_", " ")}
          </Link>
          <ChevronRight className="h-3 w-3 text-[#8C8377]" />
          <span className="truncate max-w-[200px] sm:max-w-xs text-[#1E1A17] font-medium">
            {opp.title}
          </span>
        </nav>

        {/* Main Header Card */}
        <div className="rounded-2xl border border-[#E8E1D5] bg-white p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-[#FDF3EE] px-2.5 py-0.5 text-xs font-semibold text-[#BD4B2A] border border-[#F6DCD2] capitalize">
                  {opp.category.replace("_", " ")}
                </span>
                <span className="inline-flex items-center space-x-1 rounded-md bg-[#F7F3ED] px-2.5 py-0.5 text-xs font-medium text-[#5C554D] border border-[#E8E1D5]">
                  <MapPin className="h-3 w-3" />
                  <span className="capitalize">{opp.deliveryMode}</span>
                  {opp.location && opp.location !== "Worldwide" && ` • ${opp.location}`}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1A17] tracking-tight leading-tight">
                {opp.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-[#5C554D]">
                <div className="flex items-center space-x-1.5">
                  <Building2 className="h-4 w-4 text-[#8C8377]" />
                  <span>{opp.organizerName}</span>
                </div>
                {opp.organizerWebsite && (
                  <a
                    href={opp.organizerWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#BD4B2A] hover:underline inline-flex items-center space-x-1"
                  >
                    <span>Official Website</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Actions: Save & Share */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <SaveButton
                opportunityId={opp.id}
                initialSaved={isSaved}
                isAuthenticated={!!session}
                showText={true}
                className="px-4 py-2"
              />
              <ShareButtons
                title={opp.title}
                slug={opp.slug}
                organizerName={opp.organizerName}
              />
            </div>
          </div>

          {/* Key Facts Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-[#F2ECE3] text-xs">
            {/* Deadline */}
            <div className="space-y-1">
              <span className="text-[#8C8377] font-medium flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-[#BD4B2A]" />
                Application Deadline
              </span>
              <div className="font-bold text-sm text-[#1E1A17]">
                {opp.rollingDeadline ? (
                  <span className="text-[#2F65CB]">Rolling Deadline</span>
                ) : deadline ? (
                  deadline.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
                ) : (
                  "Not Specified"
                )}
              </div>
              {daysLeft !== null && !opp.rollingDeadline && (
                <div className="text-[11px] text-[#6B635B]">
                  {daysLeft < 0 ? (
                    <span className="text-[#9B1C1C] font-semibold">Deadline has passed</span>
                  ) : daysLeft <= 7 ? (
                    <span className="text-[#854D0E] font-semibold">Closing in {daysLeft} day(s)!</span>
                  ) : (
                    `${daysLeft} days remaining`
                  )}
                </div>
              )}
            </div>

            {/* Benefits / Stipend */}
            <div className="space-y-1">
              <span className="text-[#8C8377] font-medium flex items-center gap-1">
                <Coins className="h-3.5 w-3.5 text-[#1E7E34]" />
                Award / Stipend
              </span>
              <div className="font-bold text-sm text-[#1E1A17]">
                {opp.stipendAmount ? `${opp.stipendCurrency || "INR"} ${opp.stipendAmount}` : opp.benefitsSummary || "As per program"}
              </div>
              <div className="text-[11px] text-[#6B635B]">Direct from organizer</div>
            </div>

            {/* Verified Sourcing */}
            <div className="space-y-1">
              <span className="text-[#8C8377] font-medium flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-[#BD4B2A]" />
                Source Verification
              </span>
              <div className="font-bold text-sm text-[#1E1A17] capitalize">
                {opp.sourceMethod.replace("_", " ")}
              </div>
              <div className="text-[11px] text-[#6B635B]">
                Checked {opp.sourceCheckedAt ? new Date(opp.sourceCheckedAt).toLocaleDateString("en-IN") : "recently"}
              </div>
            </div>

            {/* Official CTA Button */}
            <div className="flex flex-col justify-center">
              <a
                href={opp.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 rounded-xl bg-[#BD4B2A] px-4 py-2.5 font-bold text-sm text-white shadow-xs hover:bg-[#A33F22] transition text-center"
              >
                <span>Apply on Official Portal</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content col */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <div className="rounded-2xl border border-[#E8E1D5] bg-white p-6 sm:p-8 space-y-4 shadow-2xs">
              <h2 className="text-lg font-bold text-[#1E1A17]">
                Overview & Description
              </h2>
              <p className="text-sm text-[#4A4238] leading-relaxed font-medium">
                {opp.summary}
              </p>
              <div className="text-sm text-[#4A4238] leading-relaxed whitespace-pre-line border-t border-[#F2ECE3] pt-4">
                {opp.description}
              </div>
            </div>

            {/* Eligibility Section */}
            {(opp.eligibilitySummary || (opp.eligibleDegrees && opp.eligibleDegrees.length > 0)) && (
              <div className="rounded-2xl border border-[#E8E1D5] bg-white p-6 sm:p-8 space-y-4 shadow-2xs">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-[#BD4B2A]" />
                  <h2 className="text-lg font-bold text-[#1E1A17]">
                    Eligibility Criteria
                  </h2>
                </div>

                {opp.eligibilitySummary && (
                  <p className="text-sm text-[#4A4238] leading-relaxed">
                    {opp.eligibilitySummary}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                  {opp.eligibleDegrees && opp.eligibleDegrees.length > 0 && (
                    <div className="space-y-1">
                      <div className="font-semibold text-[#1E1A17]">Degrees</div>
                      <div className="flex flex-wrap gap-1">
                        {opp.eligibleDegrees.map((deg) => (
                          <span key={deg} className="rounded bg-[#F3EAE0] px-2 py-0.5 text-[#5C554D]">
                            {deg}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {opp.eligibleYears && opp.eligibleYears.length > 0 && (
                    <div className="space-y-1">
                      <div className="font-semibold text-[#1E1A17]">Batches / Years</div>
                      <div className="flex flex-wrap gap-1">
                        {opp.eligibleYears.map((yr) => (
                          <span key={yr} className="rounded bg-[#F3EAE0] px-2 py-0.5 text-[#5C554D]">
                            {yr}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar col */}
          <div className="space-y-6">
            {/* Direct Apply Card */}
            <div className="rounded-2xl border border-[#BD4B2A]/30 bg-[#FDF3EE] p-6 space-y-4">
              <h3 className="font-bold text-sm text-[#BD4B2A] uppercase tracking-wider">
                Ready to Apply?
              </h3>
              <p className="text-xs text-[#5C554D] leading-relaxed">
                CampusLoop Opportunities redirects you directly to the official organizer form or portal. Make sure to review requirements before submitting.
              </p>
              <a
                href={opp.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center space-x-2 rounded-xl bg-[#BD4B2A] px-4 py-2.5 font-bold text-sm text-white hover:bg-[#A33F22] transition"
              >
                <span>Open Application</span>
                <ExternalLink className="h-4 w-4" />
              </a>

              <div className="pt-2 flex items-center space-x-1.5 text-[11px] text-[#6B635B]">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Zero fees • Official application URL</span>
              </div>
            </div>

            {/* Tags Card */}
            {opp.tags && opp.tags.length > 0 && (
              <div className="rounded-2xl border border-[#E8E1D5] bg-white p-6 space-y-3 shadow-2xs">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#6B635B]">
                  Tags & Fields
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {opp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-[#FAF7F2] border border-[#E8E1D5] px-2.5 py-1 text-xs text-[#5C554D]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sourcing & Report Card */}
            <div className="rounded-2xl border border-[#E8E1D5] bg-white p-6 space-y-3 shadow-2xs text-xs">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#6B635B]">
                Listing Provenance
              </h3>
              <div className="space-y-1.5 text-[#5C554D]">
                <div>
                  <span className="font-medium text-[#1E1A17]">Source:</span>{" "}
                  <a
                    href={opp.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#BD4B2A] hover:underline"
                  >
                    View Official Source
                  </a>
                </div>
                <div>
                  <span className="font-medium text-[#1E1A17]">Last verified:</span>{" "}
                  {opp.sourceCheckedAt ? new Date(opp.sourceCheckedAt).toLocaleDateString("en-IN") : "Recently"}
                </div>
              </div>

              <div className="pt-3 border-t border-[#F2ECE3]">
                <Link
                  href={`/report?oppId=${opp.id}`}
                  className="inline-flex items-center space-x-1.5 text-[#6B635B] hover:text-[#BD4B2A] transition"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Report incorrect or closed listing</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
