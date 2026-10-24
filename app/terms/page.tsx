export const metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using CampusLoop Opportunities.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4 text-[#4A4238] text-sm leading-relaxed">
      <div className="space-y-2 border-b border-[#E8E1D5] pb-6">
        <h1 className="text-3xl font-extrabold text-[#1E1A17] tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs text-[#6B635B]">
          Effective date: January 2026 • CampusLoop Labs
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-[#1E1A17]">1. Service Scope & Educational Purpose</h2>
        <p>
          CampusLoop Opportunities provides an informational discovery directory indexing internships, hackathons, scholarships, and academic programs for college students in India. We do not act as an employer, recruiter, or scholarship granting body unless explicitly noted.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-[#1E1A17]">2. Accuracy & Independent Verification</h2>
        <p>
          While we diligently verify official sources, deadlines, eligibility requirements, and stipends may change at the discretion of the respective program organizers. Users are advised to review the official organizer guidelines prior to submitting personal information or applications.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-[#1E1A17]">3. Prohibited Usage</h2>
        <p>
          Users and automated systems agree not to:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
          <li>Attempt unauthorized access to private ingestion endpoints without a valid API bearer secret.</li>
          <li>Scrape or flood the service in a manner that degrades performance for other students.</li>
          <li>Submit fraudulent listings, phishing links, or paid-training promotions disguised as internships.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-[#1E1A17]">4. Intellectual Property</h2>
        <p>
          All trademarks, logos, and brand names featured on CampusLoop Opportunities remain the property of their respective owners. Their mention does not imply sponsorship, endorsement, or formal affiliation.
        </p>
      </section>
    </div>
  );
}
