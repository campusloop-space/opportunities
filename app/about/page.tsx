import Link from "next/link";
import { ShieldCheck, CheckCircle2, AlertOctagon, Sparkles } from "lucide-react";

export const metadata = {
  title: "About & Editorial Policy",
  description: "Learn how CampusLoop Opportunities sources, verifies, and audits student programs, internships, and hackathons.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4">
      {/* Header */}
      <div className="space-y-3 border-b border-[#E8E1D5] pb-6">
        <div className="inline-flex items-center space-x-1.5 rounded-full bg-[#FDF3EE] px-3 py-1 text-xs font-semibold text-[#BD4B2A] border border-[#F6DCD2]">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Trust & Verification Charter</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#1E1A17] tracking-tight">
          About CampusLoop Opportunities
        </h1>
        <p className="text-sm text-[#5C554D] leading-relaxed">
          Building India&apos;s most reliable, open, and fast discovery directory for student career milestones.
        </p>
      </div>

      {/* Mission */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[#1E1A17]">Our Mission</h2>
        <p className="text-sm text-[#4A4238] leading-relaxed">
          Indian college students face a noisy internet filled with ghost job postings, dubious &quot;training-with-internship&quot; scams requiring upfront fees, and outdated hackathon links circulated on WhatsApp.
        </p>
        <p className="text-sm text-[#4A4238] leading-relaxed">
          CampusLoop Opportunities was built to fix this by providing a clean, fast, and verified index where every opportunity is grounded in an official organizer website, has an actionable deadline, and is completely free to discover.
        </p>
      </section>

      {/* Editorial Standards */}
      <section className="space-y-4 rounded-2xl border border-[#E8E1D5] bg-white p-6 sm:p-8 shadow-2xs">
        <h2 className="text-xl font-bold text-[#1E1A17] flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#BD4B2A]" />
          Editorial Verification Standards
        </h2>
        <div className="space-y-4 text-xs sm:text-sm text-[#4A4238] leading-relaxed">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#1E1A17]">Direct Official Destinations:</strong> We never link to intermediate aggregator forms, spam newsletters, or affiliate redirects. All application buttons route directly to the organizer&apos;s primary domain.
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#1E1A17]">Transparent Deadlines:</strong> Every deadline is checked against the organizer&apos;s published timeline. If a deadline is rolling or not announced, it is explicitly marked as such.
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#1E1A17]">Periodic Automated Integrity Checks:</strong> Dedicated crawler agents check HTTP response codes and official page availability, reporting source status into our audit log.
            </div>
          </div>
        </div>
      </section>

      {/* Anti-Fraud Guidelines */}
      <section className="space-y-4 rounded-2xl border border-[#F8B4B4] bg-[#FDF2F2]/40 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-[#9B1C1C] flex items-center gap-2">
          <AlertOctagon className="h-5 w-5 text-[#9B1C1C]" />
          Anti-Fraud & Student Safety Policy
        </h2>
        <div className="space-y-3 text-xs sm:text-sm text-[#771D1D] leading-relaxed">
          <p>We reject and prohibit:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 font-medium">
            <li>Any internship asking applicants to pay fees for &quot;training&quot;, &quot;materials&quot;, or &quot;certificates&quot;.</li>
            <li>Multi-level marketing (MLM) schemes disguised as student ambassador roles.</li>
            <li>Unpaid commercial work masked as &quot;virtual internships&quot; without clear educational mentorship.</li>
            <li>Programs promoting leaked examination papers or dishonest academic services.</li>
          </ul>
        </div>
      </section>

      {/* Sourcing / Reporting */}
      <section className="space-y-3 pt-2">
        <h2 className="text-xl font-bold text-[#1E1A17]">Found an Outdated or Suspicious Listing?</h2>
        <p className="text-sm text-[#4A4238] leading-relaxed">
          Help us keep the directory pristine. If you spot a closed program or broken link, submit a report in seconds:
        </p>
        <Link
          href="/report"
          className="inline-flex items-center space-x-2 rounded-xl bg-[#BD4B2A] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#A33F22] transition"
        >
          <span>Submit a Correction or Report</span>
        </Link>
      </section>
    </div>
  );
}
