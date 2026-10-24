import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getOpportunityBySlug, isOpportunitySaved } from "@/lib/opportunities/service";
import { getSession } from "@/lib/auth/session";
import { generateOpportunityJsonLd, generateBreadcrumbJsonLd, generateFaqJsonLd } from "@/lib/seo";
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

  const oppLogo =
    ((opp.metadata as Record<string, unknown>)?.logoUrl as string) ||
    `${baseUrl}/og-image.png`;

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
      siteName: "CampusLoop Opportunities",
      images: [
        {
          url: oppLogo,
          width: 1200,
          height: 630,
          alt: `${opp.title} by ${opp.organizerName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${opp.title} | CampusLoop`,
      description: opp.summary,
      images: [oppLogo],
    },
    other: {
      "geo.region": "IN",
      "geo.placename": opp.location || "India",
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

  const faqs = [
    {
      question: `Who is eligible to apply for ${opp.title}?`,
      answer:
        opp.eligibilitySummary ||
        `Open to college and university students. Refer to official guidelines on ${opp.organizerName}'s portal for specific branch requirements.`,
    },
    {
      question: `What is the financial stipend or award for this opportunity?`,
      answer:
        opp.benefitsSummary ||
        (opp.stipendAmount
          ? `A verified stipend of ${opp.stipendCurrency || "INR"} ${opp.stipendAmount} is provided directly by the organizer.`
          : "Check the official application portal for full awards and benefits details."),
    },
    {
      question: `How do I apply for this opportunity?`,
      answer: `Submit your application directly through the verified official portal at ${opp.applicationUrl}. CampusLoop never charges any application or processing fees.`,
    },
  ];
  const faqJsonLd = generateFaqJsonLd(faqs);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="space-y-6">
        {/* Breadcrumb nav */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-[#6B635B] dark:text-[#9E958A]">
          <Link href="/" className="hover:text-[#BD4B2A] dark:hover:text-[#E26543] transition">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-[#8C8377] dark:text-[#736C63]" />
          <Link href={`/categories/${opp.category}`} className="capitalize hover:text-[#BD4B2A] dark:hover:text-[#E26543] transition">
            {opp.category.replace("_", " ")}
          </Link>
          <ChevronRight className="h-3 w-3 text-[#8C8377] dark:text-[#736C63]" />
          <span className="truncate max-w-[200px] sm:max-w-xs text-[#1E1A17] dark:text-[#F5EFEB] font-medium">
            {opp.title}
          </span>
        </nav>

        {/* Main Header Card */}
        <div className="rounded-2xl border border-[#E8E1D5] dark:border-[#2B2622] bg-white dark:bg-[#1A1816] p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-[#FDF3EE] dark:bg-[#2A1712] px-2.5 py-0.5 text-xs font-semibold text-[#BD4B2A] dark:text-[#F09A78] border border-[#F6DCD2] dark:border-[#4D261C] capitalize">
                  {opp.category.replace("_", " ")}
                </span>
                <span className="inline-flex items-center space-x-1 rounded-md bg-[#F7F3ED] dark:bg-[#211D1A] px-2.5 py-0.5 text-xs font-medium text-[#5C554D] dark:text-[#D5CDC4] border border-[#E8E1D5] dark:border-[#2B2622]">
                  <MapPin className="h-3 w-3" />
                  <span className="capitalize">{opp.deliveryMode}</span>
                  {opp.location && opp.location !== "Worldwide" && ` • ${opp.location}`}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1A17] dark:text-[#F5EFEB] tracking-tight leading-tight">
                {opp.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-[#5C554D] dark:text-[#D5CDC4]">
                <div className="flex items-center space-x-1.5">
                  <Building2 className="h-4 w-4 text-[#8C8377] dark:text-[#736C63]" />
                  <span>{opp.organizerName}</span>
                </div>
                {opp.organizerWebsite && (
                  <a
                    href={opp.organizerWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#BD4B2A] dark:text-[#E26543] hover:underline inline-flex items-center space-x-1"
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
                category={opp.category}
                stipend={opp.stipendAmount ? `${opp.stipendCurrency || "INR"} ${opp.stipendAmount}` : null}
              />
            </div>
          </div>

          {/* Key Facts Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-[#F2ECE3] dark:border-[#26211D] text-xs">
            {/* Deadline */}
            <div className="space-y-1">
              <span className="text-[#8C8377] dark:text-[#736C63] font-medium flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-[#BD4B2A] dark:text-[#E26543]" />
                Application Deadline
              </span>
              <div className="font-bold text-sm text-[#1E1A17] dark:text-[#F5EFEB]">
                {opp.rollingDeadline ? (
                  <span className="text-[#2F65CB] dark:text-[#60A5FA]">Rolling Deadline</span>
                ) : deadline ? (
                  deadline.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
                ) : (
                  "Not Specified"
                )}
              </div>
              {daysLeft !== null && !opp.rollingDeadline && (
                <div className="text-[11px] text-[#6B635B] dark:text-[#9E958A]">
                  {daysLeft < 0 ? (
                    <span className="text-[#9B1C1C] dark:text-[#F87171] font-semibold">Deadline has passed</span>
                  ) : daysLeft <= 7 ? (
                    <span className="text-[#854D0E] dark:text-[#FCD34D] font-semibold">Closing in {daysLeft} day(s)!</span>
                  ) : (
                    `${daysLeft} days remaining`
                  )}
                </div>
              )}
            </div>

            {/* Benefits / Stipend */}
            <div className="space-y-1">
              <span className="text-[#8C8377] dark:text-[#736C63] font-medium flex items-center gap-1">
                <Coins className="h-3.5 w-3.5 text-[#1E7E34] dark:text-[#4ADE80]" />
                Award / Stipend
              </span>
              <div className="font-bold text-sm text-[#1E1A17] dark:text-[#F5EFEB]">
                {opp.stipendAmount ? `${opp.stipendCurrency || "INR"} ${opp.stipendAmount}` : opp.benefitsSummary || "As per program"}
              </div>
              <div className="text-[11px] text-[#6B635B] dark:text-[#9E958A]">Direct from organizer</div>
            </div>

            {/* Verified Sourcing */}
            <div className="space-y-1">
              <span className="text-[#8C8377] dark:text-[#736C63] font-medium flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-[#BD4B2A] dark:text-[#E26543]" />
                Source Verification
              </span>
              <div className="font-bold text-sm text-[#1E1A17] dark:text-[#F5EFEB] capitalize">
                {opp.sourceMethod.replace("_", " ")}
              </div>
              <div className="text-[11px] text-[#6B635B] dark:text-[#9E958A]">
                Checked {opp.sourceCheckedAt ? new Date(opp.sourceCheckedAt).toLocaleDateString("en-IN") : "recently"}
              </div>
            </div>

            {/* Official CTA Button */}
            <div className="flex flex-col justify-center">
              <a
                href={opp.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 rounded-xl bg-[#BD4B2A] dark:bg-[#E26543] px-4 py-2.5 font-bold text-sm text-white shadow-xs hover:bg-[#A33F22] dark:hover:bg-[#CC4E2C] transition text-center"
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
            <div className="rounded-2xl border border-[#E8E1D5] dark:border-[#2B2622] bg-white dark:bg-[#1A1816] p-6 sm:p-8 space-y-4 shadow-2xs">
              <h2 className="text-lg font-bold text-[#1E1A17] dark:text-[#F5EFEB]">
                Overview & Description
              </h2>
              <p className="text-sm text-[#4A4238] dark:text-[#D5CDC4] leading-relaxed font-medium">
                {opp.summary}
              </p>
              <div className="text-sm text-[#4A4238] dark:text-[#B8AEA3] leading-relaxed whitespace-pre-line border-t border-[#F2ECE3] dark:border-[#26211D] pt-4">
                {opp.description}
              </div>
            </div>

            {/* Eligibility Section */}
            {(opp.eligibilitySummary || (opp.eligibleDegrees && opp.eligibleDegrees.length > 0)) && (
              <div className="rounded-2xl border border-[#E8E1D5] dark:border-[#2B2622] bg-white dark:bg-[#1A1816] p-6 sm:p-8 space-y-4 shadow-2xs">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-[#BD4B2A] dark:text-[#E26543]" />
                  <h2 className="text-lg font-bold text-[#1E1A17] dark:text-[#F5EFEB]">
                    Eligibility Criteria
                  </h2>
                </div>

                {opp.eligibilitySummary && (
                  <p className="text-sm text-[#4A4238] dark:text-[#D5CDC4] leading-relaxed">
                    {opp.eligibilitySummary}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                  {opp.eligibleDegrees && opp.eligibleDegrees.length > 0 && (
                    <div className="space-y-1">
                      <div className="font-semibold text-[#1E1A17] dark:text-[#F5EFEB]">Degrees</div>
                      <div className="flex flex-wrap gap-1">
                        {opp.eligibleDegrees.map((deg) => (
                          <span key={deg} className="rounded bg-[#F3EAE0] dark:bg-[#211D1A] px-2 py-0.5 text-[#5C554D] dark:text-[#D5CDC4]">
                            {deg}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {opp.eligibleYears && opp.eligibleYears.length > 0 && (
                    <div className="space-y-1">
                      <div className="font-semibold text-[#1E1A17] dark:text-[#F5EFEB]">Batches / Years</div>
                      <div className="flex flex-wrap gap-1">
                        {opp.eligibleYears.map((yr) => (
                          <span key={yr} className="rounded bg-[#F3EAE0] dark:bg-[#211D1A] px-2 py-0.5 text-[#5C554D] dark:text-[#D5CDC4]">
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
            <div className="rounded-2xl border border-[#BD4B2A]/30 dark:border-[#E26543]/40 bg-[#FDF3EE] dark:bg-[#2A1712] p-6 space-y-4">
              <h3 className="font-bold text-sm text-[#BD4B2A] dark:text-[#F09A78] uppercase tracking-wider">
                Ready to Apply?
              </h3>
              <p className="text-xs text-[#5C554D] dark:text-[#D5CDC4] leading-relaxed">
                CampusLoop Opportunities redirects you directly to the official organizer form or portal. Make sure to review requirements before submitting.
              </p>
              <a
                href={opp.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center space-x-2 rounded-xl bg-[#BD4B2A] dark:bg-[#E26543] px-4 py-2.5 font-bold text-sm text-white hover:bg-[#A33F22] dark:hover:bg-[#CC4E2C] transition"
              >
                <span>Open Application</span>
                <ExternalLink className="h-4 w-4" />
              </a>

              <div className="pt-2 flex items-center space-x-1.5 text-[11px] text-[#6B635B] dark:text-[#9E958A]">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Zero fees • Official application URL</span>
              </div>
            </div>

            {/* Tags Card */}
            {opp.tags && opp.tags.length > 0 && (
              <div className="rounded-2xl border border-[#E8E1D5] dark:border-[#2B2622] bg-white dark:bg-[#1A1816] p-6 space-y-3 shadow-2xs">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#6B635B] dark:text-[#9E958A]">
                  Tags & Fields
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {opp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-[#FAF7F2] dark:bg-[#211D1A] border border-[#E8E1D5] dark:border-[#2B2622] px-2.5 py-1 text-xs text-[#5C554D] dark:text-[#D5CDC4]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sourcing & Report Card */}
            <div className="rounded-2xl border border-[#E8E1D5] dark:border-[#2B2622] bg-white dark:bg-[#1A1816] p-6 space-y-3 shadow-2xs text-xs">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#6B635B] dark:text-[#9E958A]">
                Listing Provenance
              </h3>
              <div className="space-y-1.5 text-[#5C554D] dark:text-[#D5CDC4]">
                <div>
                  <span className="font-medium text-[#1E1A17] dark:text-[#F5EFEB]">Source:</span>{" "}
                  <a
                    href={opp.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#BD4B2A] dark:text-[#E26543] hover:underline"
                  >
                    View Official Source
                  </a>
                </div>
                <div>
                  <span className="font-medium text-[#1E1A17] dark:text-[#F5EFEB]">Last verified:</span>{" "}
                  {opp.sourceCheckedAt ? new Date(opp.sourceCheckedAt).toLocaleDateString("en-IN") : "Recently"}
                </div>
              </div>

              <div className="pt-3 border-t border-[#F2ECE3] dark:border-[#26211D]">
                <Link
                  href={`/report?oppId=${opp.id}`}
                  className="inline-flex items-center space-x-1.5 text-[#6B635B] dark:text-[#9E958A] hover:text-[#BD4B2A] dark:hover:text-[#E26543] transition"
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
