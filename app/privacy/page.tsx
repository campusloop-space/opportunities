export const metadata = {
  title: "Privacy Policy",
  description: "Transparent privacy practices of CampusLoop Opportunities.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4 text-[#4A4238] text-sm leading-relaxed">
      <div className="space-y-2 border-b border-[#E8E1D5] pb-6">
        <h1 className="text-3xl font-extrabold text-[#1E1A17] tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#6B635B]">
          Effective date: January 2026 • CampusLoop Labs
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-[#1E1A17]">1. Information We Collect</h2>
        <p>
          <strong>Public Browsing:</strong> You can browse all public opportunities, categories, and search filters completely anonymously without creating an account or providing any personal information.
        </p>
        <p>
          <strong>CampusLoop Sign-In:</strong> If you choose to sign in via &quot;Continue with CampusLoop&quot; to bookmark opportunities, we receive authenticated claims through OpenID Connect:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
          <li><strong>Pairwise Subject ID (sub):</strong> A unique, pseudonymous identifier scoped specifically to this application.</li>
          <li><strong>Profile Data:</strong> Your name and email address as provided by your CampusLoop account.</li>
          <li><strong>Student Verification:</strong> A boolean flag indicating whether your student status has been validated, along with college name and branch if provided.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-[#1E1A17]">2. How We Use Your Information</h2>
        <p>
          Your information is solely used to maintain your session and synchronize your bookmarked opportunities across devices. We do not sell your personal data, and we do not use third-party behavioral advertising trackers.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-[#1E1A17]">3. Cookies & Local Storage</h2>
        <p>
          We use essential, encrypted, HttpOnly session cookies (<code>campusloop_session</code>) to keep you signed in securely. A short-lived transient cookie (<code>campusloop_oauth_state</code>) is used solely to prevent CSRF during the OAuth redirect flow and expires after 10 minutes.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-[#1E1A17]">4. External Links & Third Parties</h2>
        <p>
          Our service indexes opportunities and provides links to official organizer websites and application portals. When you click &quot;Apply on Official Portal&quot;, you navigate to a third-party website governed by their independent privacy policies.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-[#1E1A17]">5. Data Retention & Deletion</h2>
        <p>
          You may sign out at any time or request removal of your account records by contacting <code>privacy@campusloop.space</code>.
        </p>
      </section>
    </div>
  );
}
