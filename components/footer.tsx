import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#E8E1D5] bg-[#FAF7F2] text-[#6B635B] text-xs">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-[#BD4B2A] text-white font-bold text-xs">
                Ω
              </span>
              <span className="font-semibold text-sm text-[#1E1A17]">CampusLoop Opportunities</span>
            </div>
            <p className="text-xs leading-relaxed text-[#6B635B]">
              Verified discovery engine for internships, hackathons, scholarships, and research programs for Indian college students.
            </p>
            <p className="text-[11px] text-[#8C8377]">
              Part of the CampusLoop Labs ecosystem.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <div className="font-semibold text-[#1E1A17] uppercase tracking-wider text-[11px]">
              Categories
            </div>
            <ul className="space-y-1.5">
              <li>
                <Link href="/categories/internships" className="hover:text-[#BD4B2A] transition">
                  Internships
                </Link>
              </li>
              <li>
                <Link href="/categories/hackathons" className="hover:text-[#BD4B2A] transition">
                  Hackathons
                </Link>
              </li>
              <li>
                <Link href="/categories/scholarships" className="hover:text-[#BD4B2A] transition">
                  Scholarships
                </Link>
              </li>
              <li>
                <Link href="/categories/fellowships" className="hover:text-[#BD4B2A] transition">
                  Fellowships
                </Link>
              </li>
              <li>
                <Link href="/categories/research" className="hover:text-[#BD4B2A] transition">
                  Research Programs
                </Link>
              </li>
              <li>
                <Link href="/categories/competitions" className="hover:text-[#BD4B2A] transition">
                  Competitions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <div className="font-semibold text-[#1E1A17] uppercase tracking-wider text-[11px]">
              Ecosystem
            </div>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="https://campusloop.space"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#BD4B2A] transition"
                >
                  CampusLoop Network ↗
                </a>
              </li>
              <li>
                <a
                  href="https://dsaloop.campusloop.space"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#BD4B2A] transition"
                >
                  DSALoop Practice ↗
                </a>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#BD4B2A] transition">
                  Editorial & Sourcing Policy
                </Link>
              </li>
              <li>
                <Link href="/report" className="hover:text-[#BD4B2A] transition">
                  Report Broken / Closed Listing
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <div className="font-semibold text-[#1E1A17] uppercase tracking-wider text-[11px]">
              Trust & Legal
            </div>
            <ul className="space-y-1.5">
              <li>
                <Link href="/privacy" className="hover:text-[#BD4B2A] transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#BD4B2A] transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/api/health" className="hover:text-[#BD4B2A] transition">
                  System Health Check
                </Link>
              </li>
            </ul>
            <p className="text-[11px] text-[#8C8377] pt-2">
              All applications occur directly on official organizer portals. We do not charge application or referral fees.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#E8E1D5] flex flex-col sm:flex-row justify-between items-center text-[11px] text-[#8C8377] gap-2">
          <div>
            © {new Date().getFullYear()} CampusLoop Labs. Built for students across India.
          </div>
          <div>
            All trademarks and copyrights belong to their respective program organizers.
          </div>
        </div>
      </div>
    </footer>
  );
}
