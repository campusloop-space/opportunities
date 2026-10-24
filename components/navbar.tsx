import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth/session";
import { Bookmark, ShieldCheck, LogOut } from "lucide-react";

export async function Navbar() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E8E1D5] bg-[#FFFDF9]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2.5">
            {/* Logo Emblem */}
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#D95C36] to-[#933318] p-1.5 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon.svg"
                alt="CampusLoop"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-[#1E1A17] flex items-center gap-1.5 leading-none">
                CampusLoop <span className="font-bold text-[#BD4B2A]">Opportunities</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[#8C8377] mt-1">
                CampusLoop Labs
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center space-x-1 text-xs font-semibold text-[#4A4238]">
            <Link
              href="/categories/internships"
              className="rounded-md px-2.5 py-1.5 hover:bg-[#F3EAE0] transition-colors"
            >
              Internships
            </Link>
            <Link
              href="/categories/hackathons"
              className="rounded-md px-2.5 py-1.5 hover:bg-[#F3EAE0] transition-colors"
            >
              Hackathons
            </Link>
            <Link
              href="/categories/scholarships"
              className="rounded-md px-2.5 py-1.5 hover:bg-[#F3EAE0] transition-colors"
            >
              Scholarships
            </Link>
            <Link
              href="/categories/fellowships"
              className="rounded-md px-2.5 py-1.5 hover:bg-[#F3EAE0] transition-colors"
            >
              Fellowships
            </Link>
            <Link
              href="/categories/research"
              className="rounded-md px-2.5 py-1.5 hover:bg-[#F3EAE0] transition-colors"
            >
              Research
            </Link>
            <Link
              href="/categories/competitions"
              className="rounded-md px-2.5 py-1.5 hover:bg-[#F3EAE0] transition-colors"
            >
              Competitions
            </Link>
          </nav>
        </div>

        {/* Right action / auth */}
        <div className="flex items-center space-x-3">
          {session ? (
            <div className="flex items-center space-x-3">
              <Link
                href="/saved"
                className="flex items-center space-x-1.5 text-xs sm:text-sm font-medium text-[#4A4238] hover:text-[#BD4B2A] rounded-lg border border-[#E8E1D5] bg-white px-3 py-1.5 shadow-2xs hover:border-[#BD4B2A]/40 transition"
              >
                <Bookmark className="h-4 w-4" />
                <span>Saved</span>
              </Link>

              <div className="flex items-center space-x-2 pl-1">
                {session.studentVerified && (
                  <span
                    title="Verified Indian College Student via CampusLoop"
                    className="inline-flex items-center space-x-1 rounded-full bg-[#EBF7EE] px-2 py-0.5 text-[11px] font-medium text-[#1E7E34] border border-[#C3E6CB]"
                  >
                    <ShieldCheck className="h-3 w-3" />
                    <span className="hidden sm:inline">Verified Student</span>
                  </span>
                )}
                <span className="text-sm font-medium text-[#1E1A17] max-w-[120px] truncate">
                  {session.name || "Student"}
                </span>
                <Link
                  href="/auth/logout"
                  title="Sign out"
                  className="rounded-md p-1.5 text-[#6B635B] hover:bg-[#F3EAE0] hover:text-[#1E1A17] transition"
                >
                  <LogOut className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <Link
              href="/auth/login/campusloop"
              className="inline-flex items-center space-x-2 rounded-lg bg-[#BD4B2A] px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white shadow-xs hover:bg-[#A33F22] transition-colors"
            >
              <span className="font-bold">↻</span>
              <span>Continue with CampusLoop</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
