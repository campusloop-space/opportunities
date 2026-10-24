import fs from "fs";
import { upsertOpportunity } from "../opportunities/service";

// Load .env.local
if (fs.existsSync(".env.local")) {
  const lines = fs.readFileSync(".env.local", "utf8").split("\n");
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
}

const seedOpportunities = [
  {
    title: "Google Summer of Code (GSoC) 2026",
    summary: "Global, online program focusing on bringing new contributors into open source software development with stipends and 1-on-1 mentorship.",
    description: `Google Summer of Code is a global program focused on introducing contributors to open source software development. Contributors work on a 12+ week programming project with an open source organization under the guidance of mentors.

Key Highlights:
- Work with prestigious organizations like Python Software Foundation, Linux Foundation, Blender, TensorFlow, and Apache.
- Receive a competitive stipend adjusted by country purchasing power parity.
- Build production-level software experience visible to engineering hiring teams worldwide.`,
    category: "fellowships" as const,
    tags: ["Open Source", "Mentorship", "Software Engineering", "Global"],
    organizerName: "Google Open Source",
    organizerWebsite: "https://summerofcode.withgoogle.com",
    sourceUrl: "https://summerofcode.withgoogle.com/how-it-works",
    applicationUrl: "https://summerofcode.withgoogle.com/get-started",
    location: "Worldwide",
    deliveryMode: "remote" as const,
    eligibilitySummary: "Must be at least 18 years old upon registration and eligible to work in your country of residence. Open to students and beginner open source contributors.",
    eligibleDegrees: ["B.Tech", "B.E.", "BCA", "MCA", "B.Sc", "M.Tech"],
    eligibleYears: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    benefitsSummary: "USD 1500 - 3000 stipend based on project size and local purchasing power parity.",
    stipendAmount: "250000",
    stipendCurrency: "INR",
    applicationOpensAt: "2026-03-10T18:00:00Z",
    deadlineAt: "2026-04-04T18:00:00Z",
    rollingDeadline: false,
    status: "published" as const,
    sourceMethod: "official" as const,
    allowImmediatePublish: true,
  },
  {
    title: "Smart India Hackathon (SIH) 2026",
    summary: "India's premier nationwide product initiative providing students a platform to solve real pressing problems faced by Ministries and industry leaders.",
    description: `Smart India Hackathon is a nationwide initiative to provide students with a platform to solve some of the pressing problems we face in our daily lives, and thus inculcate a culture of product innovation and a mindset of problem-solving.

Highlights:
- Problem statements released directly by central Government ministries, departments, and leading private organizations.
- 36-hour non-stop digital product development round.
- Winners receive cash prizes, incubation support, and direct recognition from government leadership.`,
    category: "hackathons" as const,
    tags: ["Nationwide", "Innovation", "Hardware & Software", "Government of India"],
    organizerName: "Ministry of Education & AICTE",
    organizerWebsite: "https://sih.gov.in",
    sourceUrl: "https://sih.gov.in/guidelines",
    applicationUrl: "https://sih.gov.in/register",
    location: "Nodal Centers across India",
    deliveryMode: "in_person" as const,
    eligibilitySummary: "Regular college students enrolled in AICTE/UGC approved institutes in India pursuing undergraduate or postgraduate programs.",
    eligibleDegrees: ["B.Tech", "B.E.", "BCA", "MCA", "Diploma"],
    benefitsSummary: "INR 1,00,000 cash prize per problem statement track plus national recognition.",
    stipendAmount: "100000",
    stipendCurrency: "INR",
    applicationOpensAt: "2026-08-01T00:00:00Z",
    deadlineAt: "2026-09-30T23:59:59Z",
    rollingDeadline: false,
    status: "published" as const,
    sourceMethod: "official" as const,
    allowImmediatePublish: true,
  },
  {
    title: "Reliance Foundation Undergraduate Scholarships 2026",
    summary: "Merit-cum-means scholarship supporting meritorious undergraduate students in India across any discipline for the duration of their degree.",
    description: `The Reliance Foundation Undergraduate Scholarships aim to support up to 5,000 meritorious students pursuing full-time undergraduate degrees in India. The scholarship provides financial support up to INR 2 Lakhs over the duration of the degree program.

Features:
- Merit-cum-means selection based on aptitude test and 12th standard academic performance.
- Alumni mentorship network and leadership development opportunities.`,
    category: "scholarships" as const,
    tags: ["Financial Aid", "Undergraduate", "Merit-cum-Means", "Higher Education"],
    organizerName: "Reliance Foundation",
    organizerWebsite: "https://www.reliancefoundation.org",
    sourceUrl: "https://www.reliancefoundation.org/our-work/education/scholarships",
    applicationUrl: "https://scholarships.reliancefoundation.org",
    location: "India",
    deliveryMode: "remote" as const,
    eligibilitySummary: "Resident Indian citizen enrolled in 1st year full-time regular undergraduate degree. Minimum 60% in Class 12. Household income criteria apply.",
    eligibleDegrees: ["B.Tech", "B.Sc", "B.Com", "B.A.", "BBA", "B.E."],
    eligibleYears: ["1st Year"],
    benefitsSummary: "Scholarship grant up to INR 2,00,000 disbursed over the course of study.",
    stipendAmount: "200000",
    stipendCurrency: "INR",
    applicationOpensAt: "2026-08-15T00:00:00Z",
    deadlineAt: "2026-10-15T23:59:59Z",
    rollingDeadline: false,
    status: "published" as const,
    sourceMethod: "official" as const,
    allowImmediatePublish: true,
  },
  {
    title: "Linux Foundation Mentorship Program (LFX) 2026",
    summary: "Paid mentorship and internship program sponsored by the Linux Foundation to contribute directly to core open source cloud and systems infrastructure.",
    description: `The Linux Foundation Mentorship Program is designed to help developers with necessary skills to experiment, learn, and contribute effectively to open source communities.

Participating Projects:
- Kubernetes, Hyperledger, CNCF, RISC-V, OpenSSF, GraphQL, and Edge computing frameworks.
- Mentorship from core maintainers and committers.
- Stipend awarded in milestones upon successful evaluation.`,
    category: "internships" as const,
    tags: ["Linux", "Cloud Native", "Kubernetes", "Systems Programming"],
    organizerName: "The Linux Foundation",
    organizerWebsite: "https://mentorship.lfx.linuxfoundation.org",
    sourceUrl: "https://mentorship.lfx.linuxfoundation.org/terms",
    applicationUrl: "https://mentorship.lfx.linuxfoundation.org/apply",
    location: "Worldwide",
    deliveryMode: "remote" as const,
    eligibilitySummary: "Open to developers of all backgrounds. Mentee cannot be a current committer or maintainer in the target project.",
    eligibleDegrees: ["B.Tech", "B.E.", "BCA", "MCA", "B.Sc Computer Science"],
    benefitsSummary: "Stipend of USD 3000 to USD 6600 depending on location and term length.",
    stipendAmount: "300000",
    stipendCurrency: "INR",
    applicationOpensAt: "2026-01-15T00:00:00Z",
    deadlineAt: "2026-03-31T23:59:59Z",
    rollingDeadline: false,
    status: "published" as const,
    sourceMethod: "official" as const,
    allowImmediatePublish: true,
  },
  {
    title: "IIT Kanpur SURGE Summer Research Fellowship 2026",
    summary: "8-week intensive research internship at IIT Kanpur working under faculty on cutting-edge engineering and scientific problems.",
    description: `Students UnderGraduate Research Graduate Excellence (SURGE) program at IIT Kanpur provides opportunities to undergraduate students from non-IITK and IITK institutes to undertake research projects under the mentorship of IIT Kanpur faculty.

Features:
- Duration: 8 weeks (May - July).
- Campus accommodation and library/computing facility access.
- Certificate of research training and potential research paper publications.`,
    category: "research" as const,
    tags: ["Research Internship", "IIT Kanpur", "Scientific Discovery", "Summer Fellowship"],
    organizerName: "IIT Kanpur",
    organizerWebsite: "https://www.iitk.ac.in",
    sourceUrl: "https://www.iitk.ac.in/surge",
    applicationUrl: "https://www.iitk.ac.in/surge/apply",
    location: "IIT Kanpur Campus, Uttar Pradesh",
    deliveryMode: "in_person" as const,
    eligibilitySummary: "Students studying in 2nd or 3rd year of B.Tech/B.E./B.Sc with top academic standing (CPI/CGPA > 8.0).",
    eligibleDegrees: ["B.Tech", "B.E.", "B.Sc", "BS-MS"],
    eligibleYears: ["2nd Year", "3rd Year"],
    benefitsSummary: "Monthly stipend of INR 12,500 plus subsidized campus accommodation.",
    stipendAmount: "25000",
    stipendCurrency: "INR",
    applicationOpensAt: "2026-01-01T00:00:00Z",
    deadlineAt: "2026-02-15T23:59:59Z",
    rollingDeadline: false,
    status: "published" as const,
    sourceMethod: "official" as const,
    allowImmediatePublish: true,
  },
  {
    title: "ACM-ICPC India Regionals 2026",
    summary: "The International Collegiate Programming Contest — the oldest, largest, and most prestigious algorithmic programming competition in the world.",
    description: `The ACM International Collegiate Programming Contest (ICPC) is a multitier, team-based, programming competition. Headquartered at Baylor University, it is the premier algorithmic contest for university students worldwide.

Structure:
- Online Preliminary Round followed by On-Site Regionals (Amritapuri, Kanpur, Gwalior, Chennai).
- Top teams advance to the ICPC World Finals.`,
    category: "competitions" as const,
    tags: ["Competitive Programming", "Algorithms", "Data Structures", "ICPC"],
    organizerName: "ICPC Foundation & Amrita University",
    organizerWebsite: "https://icpc.global",
    sourceUrl: "https://icpc.amrita.ac.in",
    applicationUrl: "https://icpc.global/regionals/finder/amritapuri-2026",
    location: "Regional Host Campuses",
    deliveryMode: "in_person" as const,
    eligibilitySummary: "Full-time collegiate students enrolled in an accredited degree program in India. Teams of 3 members from the same institution.",
    benefitsSummary: "Regional trophies, travel subsidies, and direct qualification to the World Finals.",
    applicationOpensAt: "2026-08-01T00:00:00Z",
    deadlineAt: "2026-10-31T23:59:59Z",
    rollingDeadline: false,
    status: "published" as const,
    sourceMethod: "official" as const,
    allowImmediatePublish: true,
  },
  {
    title: "Microsoft Learn Student Ambassadors (MLSA) Program",
    summary: "Global student leadership community providing tech training, Azure cloud credits, certification exam vouchers, and career mentorship.",
    description: `Microsoft Learn Student Ambassadors are a global group of on-campus leaders who are eager to help fellow students, lead tech communities, and build technical solutions.

Ambassador Perks:
- Monthly USD 150 Azure credits.
- Free Microsoft Certification Exam vouchers (AZ-900, AI-900, etc.).
- Direct interaction with Microsoft Cloud Advocates and Engineering teams.
- LinkedIn Learning and Visual Studio Enterprise subscriptions.`,
    category: "student_programs" as const,
    tags: ["Community Leadership", "Azure", "Cloud Computing", "Mentorship"],
    organizerName: "Microsoft",
    organizerWebsite: "https://studentambassadors.microsoft.com",
    sourceUrl: "https://studentambassadors.microsoft.com/faq",
    applicationUrl: "https://studentambassadors.microsoft.com/apply",
    location: "Worldwide",
    deliveryMode: "remote" as const,
    eligibilitySummary: "Must be at least 16 years old and enrolled in an accredited academic institution.",
    eligibleDegrees: ["Any Degree"],
    benefitsSummary: "Free Azure credits, free exam vouchers, and Microsoft technical mentorship.",
    rollingDeadline: true,
    status: "published" as const,
    sourceMethod: "official" as const,
    allowImmediatePublish: true,
  },
];

async function seed() {
  console.log("Seeding verified student opportunities into Neon PostgreSQL...");
  for (const opp of seedOpportunities) {
    try {
      const res = await upsertOpportunity(opp as any, { type: "seed_script" });
      console.log(`[${res.operation}] ${opp.title} (${res.opportunity.slug})`);
    } catch (err: unknown) {
      console.error(`Failed to seed ${opp.title}:`, (err as Error).message);
    }
  }
  console.log("Seeding complete!");
}

seed().catch(console.error);
