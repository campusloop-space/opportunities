"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

function ReportForm() {
  const searchParams = useSearchParams();
  const oppId = searchParams.get("oppId") || "";

  const [reason, setReason] = useState<string>("closed");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: oppId || null,
          reason,
          details,
          reporterEmail: email.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit report");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-[#C3E6CB] bg-[#EBF7EE] p-8 text-center space-y-4">
        <CheckCircle2 className="mx-auto h-12 w-12 text-[#1E7E34]" />
        <h2 className="text-xl font-bold text-[#1E7E34]">
          Thank You for Keeping CampusLoop Clean!
        </h2>
        <p className="text-sm text-[#2b542c] max-w-md mx-auto">
          Our maintainers have received your report and will verify the listing within 24 hours.
        </p>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 rounded-xl bg-[#BD4B2A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#A33F22] transition"
        >
          Return to Opportunities
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-[#E8E1D5] bg-white p-6 sm:p-8 shadow-2xs">
      {errorMsg && (
        <div className="rounded-xl border border-[#F8B4B4] bg-[#FDF2F2] p-3 text-xs text-[#9B1C1C]">
          {errorMsg}
        </div>
      )}

      {oppId && (
        <div className="text-xs text-[#6B635B] bg-[#FAF7F2] p-3 rounded-xl border border-[#E8E1D5]">
          Reporting Opportunity ID: <span className="font-mono text-[#1E1A17]">{oppId}</span>
        </div>
      )}

      {/* Reason */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#1E1A17] uppercase tracking-wider">
          What is wrong with this listing?
        </label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-xl border border-[#E8E1D5] bg-white p-2.5 text-sm text-[#1E1A17] focus:border-[#BD4B2A] focus:outline-hidden"
          required
        >
          <option value="closed">Applications are closed / program deadline passed</option>
          <option value="broken_link">Broken application URL or dead website</option>
          <option value="outdated_info">Outdated information or incorrect dates</option>
          <option value="suspicious">Suspicious listing or asking for upfront fees</option>
          <option value="other">Other issue</option>
        </select>
      </div>

      {/* Details */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#1E1A17] uppercase tracking-wider">
          Details / Evidence
        </label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Please explain what is incorrect, or paste the updated link..."
          rows={4}
          className="w-full rounded-xl border border-[#E8E1D5] bg-white p-3 text-sm text-[#1E1A17] focus:border-[#BD4B2A] focus:outline-hidden"
          required
          minLength={5}
        />
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#1E1A17] uppercase tracking-wider">
          Your Email (Optional, if you wish to receive updates)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@college.edu"
          className="w-full rounded-xl border border-[#E8E1D5] bg-white p-2.5 text-sm text-[#1E1A17] focus:border-[#BD4B2A] focus:outline-hidden"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-[#BD4B2A] px-6 py-2.5 font-bold text-sm text-white hover:bg-[#A33F22] transition disabled:opacity-50"
      >
        <span>{isSubmitting ? "Submitting..." : "Submit Report"}</span>
      </button>
    </form>
  );
}

export default function ReportPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div className="space-y-2 border-b border-[#E8E1D5] pb-6">
        <div className="inline-flex items-center space-x-1.5 rounded-full bg-[#FDF3EE] px-3 py-1 text-xs font-semibold text-[#BD4B2A] border border-[#F6DCD2]">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Listing Quality Control</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1A17] tracking-tight">
          Report an Opportunity
        </h1>
        <p className="text-xs text-[#5C554D] leading-relaxed">
          Spotted a broken application link, closed registration, or suspicious fee requirement? Help protect fellow students by reporting it.
        </p>
      </div>

      <Suspense fallback={<div className="h-64 bg-white/50 rounded-2xl animate-pulse" />}>
        <ReportForm />
      </Suspense>
    </div>
  );
}
