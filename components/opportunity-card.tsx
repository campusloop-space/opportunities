import Link from "next/link";
import { Clock, MapPin, Building2, Coins, ArrowUpRight } from "lucide-react";
import type { Opportunity } from "@/lib/db/schema";
import { SaveButton } from "./save-button";

interface OpportunityCardProps {
  opportunity: Opportunity;
  isSaved?: boolean;
  isAuthenticated?: boolean;
}

export function OpportunityCard({
  opportunity,
  isSaved = false,
  isAuthenticated = false,
}: OpportunityCardProps) {
  const now = new Date();
  const deadline = opportunity.deadlineAt ? new Date(opportunity.deadlineAt) : null;
  const daysLeft = deadline ? Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

  let deadlineLabel = "Rolling Deadline";
  let deadlineClass = "bg-[#F3EAE0] dark:bg-[#211D1A] text-[#6B635B] dark:text-[#9E958A]";

  if (opportunity.rollingDeadline) {
    deadlineLabel = "Rolling Deadline";
    deadlineClass = "bg-[#EEF4FF] dark:bg-[#131D33] text-[#2F65CB] dark:text-[#60A5FA] border border-[#D0E2FF] dark:border-[#1E3A8A]";
  } else if (deadline) {
    if (daysLeft !== null && daysLeft < 0) {
      deadlineLabel = "Expired";
      deadlineClass = "bg-[#FDF2F2] dark:bg-[#2B1315] text-[#9B1C1C] dark:text-[#F87171] border border-[#F8B4B4] dark:border-[#7F1D1D]";
    } else if (daysLeft !== null && daysLeft <= 7) {
      deadlineLabel = daysLeft === 0 ? "Closing Today!" : `Closing in ${daysLeft}d`;
      deadlineClass = "bg-[#FEF08A]/40 dark:bg-[#2E200B] text-[#854D0E] dark:text-[#FCD34D] border border-[#FDE047] dark:border-[#78350F]";
    } else {
      deadlineLabel = `Deadline: ${deadline.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}`;
      deadlineClass = "bg-[#F3EAE0] dark:bg-[#211D1A] text-[#5C554D] dark:text-[#9E958A] border border-[#E8E1D5] dark:border-[#2B2622]";
    }
  }

  const categoryLabels: Record<string, string> = {
    internships: "Internship",
    hackathons: "Hackathon",
    scholarships: "Scholarship",
    fellowships: "Fellowship",
    research: "Research",
    competitions: "Competition",
    student_programs: "Student Program",
  };

  const deliveryModeLabels: Record<string, string> = {
    remote: "Remote",
    in_person: "In-Person",
    hybrid: "Hybrid",
    unknown: "Location Varies",
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-[#E8E1D5] dark:border-[#2B2622] bg-white dark:bg-[#1A1816] p-5 shadow-2xs hover:border-[#BD4B2A]/50 dark:hover:border-[#E26543]/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center rounded-md bg-[#FDF3EE] dark:bg-[#2A1712] px-2.5 py-0.5 text-xs font-semibold text-[#BD4B2A] dark:text-[#F09A78] border border-[#F6DCD2] dark:border-[#4D261C]">
              {categoryLabels[opportunity.category] || opportunity.category}
            </span>
            <span className={`inline-flex items-center space-x-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${deadlineClass}`}>
              <Clock className="h-3 w-3 inline" />
              <span>{deadlineLabel}</span>
            </span>
          </div>

          <SaveButton
            opportunityId={opportunity.id}
            initialSaved={isSaved}
            isAuthenticated={isAuthenticated}
          />
        </div>

        {/* Title & Organizer */}
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5 text-xs font-medium text-[#6B635B] dark:text-[#9E958A]">
            <Building2 className="h-3.5 w-3.5" />
            <span className="truncate max-w-[240px]">{opportunity.organizerName}</span>
          </div>

          <h3 className="text-base font-bold text-[#1E1A17] dark:text-[#F5EFEB] group-hover:text-[#BD4B2A] dark:group-hover:text-[#E26543] transition-colors leading-snug line-clamp-2">
            <Link href={`/opportunities/${opportunity.slug}`} className="focus:outline-hidden">
              {opportunity.title}
            </Link>
          </h3>
        </div>

        {/* Summary */}
        <p className="mt-2 text-xs leading-relaxed text-[#5C554D] dark:text-[#B8AEA3] line-clamp-2">
          {opportunity.summary}
        </p>

        {/* Metadata Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-[#6B635B] dark:text-[#9E958A]">
          <span className="inline-flex items-center space-x-1 rounded bg-[#F7F3ED] dark:bg-[#211D1A] px-2 py-0.5">
            <MapPin className="h-3 w-3 text-[#8C8377] dark:text-[#736C63]" />
            <span>{deliveryModeLabels[opportunity.deliveryMode] || opportunity.location}</span>
          </span>

          {opportunity.stipendAmount && (
            <span className="inline-flex items-center space-x-1 rounded bg-[#EBF7EE] dark:bg-[#102A18] text-[#1E7E34] dark:text-[#4ADE80] px-2 py-0.5 border border-[#C3E6CB] dark:border-[#166534]">
              <Coins className="h-3 w-3" />
              <span>
                {opportunity.stipendCurrency || "INR"} {opportunity.stipendAmount}
              </span>
            </span>
          )}

          {opportunity.benefitsSummary && !opportunity.stipendAmount && (
            <span className="inline-flex items-center space-x-1 rounded bg-[#FDF3EE] dark:bg-[#2A1712] text-[#BD4B2A] dark:text-[#F09A78] px-2 py-0.5 border border-[#F6DCD2] dark:border-[#4D261C]">
              <span>{opportunity.benefitsSummary.slice(0, 30)}</span>
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-[#F2ECE3] dark:border-[#26211D] flex items-center justify-between text-xs">
        <span className="text-[11px] text-[#8C8377] dark:text-[#736C63]">
          Verified source
        </span>

        <Link
          href={`/opportunities/${opportunity.slug}`}
          className="inline-flex items-center space-x-1 font-semibold text-[#BD4B2A] dark:text-[#E26543] hover:text-[#A33F22] dark:hover:text-[#F07A5A] transition"
        >
          <span>View Details</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
