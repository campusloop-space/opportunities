I'll take a quick look at DSAloop and CampusLoop so the ideas fit what you've already built.

One thing matters more than which site you build next. DSALoop is no-signup and stores progress locally, which is good for SEO and bounce rate. But it also means that traffic leaves without ever becoming a CampusLoop account. You already have "Login with CampusLoop", so use the same pattern on every sub-platform: keep the content fully open and indexable, then offer an optional sign-in that syncs progress and counts toward the main CampusLoop streak and Loop Points. Solving a DSALoop problem should keep your loop alive. That turns each sub-site into a funnel instead of a separate island.

## Sub-platforms worth building

I judged each one on four things: a large long tail of searches, a reason to come back, something shareable, and a natural path into CampusLoop.

**1. PlaceLoop: placements and interview prep**
Interview experiences, company-wise questions, and aptitude practice for mass recruiters (TCS NQT, Infosys, Accenture, Cognizant, Capgemini). That's where most Indian students actually get placed, so it's a much bigger audience than the LeetCode crowd.
- SEO: pages for every company × role × year, plus college placement pages. NIRF reports publish median packages, so you have real data to start from.
- Viral: "got placed" offer cards, and reels on the aptitude question most people get wrong.
- Bridge: only verified students can post experiences, which is your trust edge over random blogs. Each company page links to DSALoop's company track.

**2. GATELoop: GATE CSE and DA prep**
- SEO: one page per previous-year question (PYQ), plus topic and year pages.
- Viral: a score and rank predictor based on the response sheet. After the exam, people share their predicted rank.
- Bridge: the NPTEL courses already on CampusLoop, and the same CS topics as DSALoop.

**3. ExamLoop: university exams**
PYQs, important questions, syllabus, and SGPA/CGPA calculators for specific universities (AKTU, VTU, RGPV, MAKAUT, JNTU, Anna, and so on).
- SEO: pages for every university × subject × year, plus one calculator page per university.
- Viral: a "bunk calculator" that tells you how many classes you can skip. It's funny and very shareable.
- Bridge: this is the Academic Vault with a sharper SEO surface. Uploading requires login.

**4. AdmitLoop: JoSAA/CSAB counselling**
Cutoffs, a college predictor, and honest reviews from verified students.
- SEO: pages for every college × branch × round × category.
- Viral: predictor result cards during counselling season.
- Bridge: incoming freshers join their future college hub before day one, which solves your cold start for every new batch.
- Safety: many visitors here will be under 18. Moderate the "ask a senior" Q&A, and keep this funnel away from Campus Match entirely.

**5. ResumeLoop: resumes and LinkedIn**
An ATS-friendly resume builder, an AI "resume roast", and LinkedIn headline tools.
- SEO: resume pages per role, branch, and "fresher" variant.
- Viral: roast screenshots and reels.
- Bridge: the resume automatically pulls CampusLoop course certificates and DSALoop progress, with a verified-student badge.

**6. OppLoop: opportunities with deadlines**
Hackathons, internships, scholarships, and fellowships.
- SEO: fresh pages like "hackathons in India this month" and "scholarships for B.Tech students 2026".
- Viral: deadline posts that get forwarded in college WhatsApp groups.
- Bridge: a "find teammates from your college" button on each hackathon, inside your communities.

**7. BuildLoop: projects**
Final-year and mini-project ideas with open-source references, plus a student project showcase.
- SEO: idea pages per branch, tech stack, and year.
- Viral: a weekly top-projects list and demo reels.
- Bridge: projects live on CampusLoop profiles.

**8. FestLoop: fest calendar**
Tech and cultural fests across India.
- SEO: a page per fest name × year covering dates, events, and passes.
- Viral: fest reels are the most reel-able thing in Indian college life, so run a user-submitted "fest reel of the week".
- Bridge: RSVPs and college hubs already exist on CampusLoop.

**Where I'd start:**
- **PlaceLoop** first. It shares company pages with DSALoop and reaches a broader audience.
- **GATELoop** next, because of timing. GATE is in early February, so launching now catches the run-up and the post-exam predictor spike.
- **ExamLoop's calculators** in parallel. They're the cheapest to build, about a weekend on Workers.
- **AdmitLoop** should be live by spring, before counselling season.

## Growth playbook

**SEO**
- Programmatic pages only work when each page carries unique data: a cutoff table, a real interview experience, a worked solution. Google's scaled content abuse policy targets mass-produced thin pages. That applies to your daily article pipeline too.
- Cross-link the ecosystem around entities. For example, Amazon on DSALoop ↔ Amazon experiences on PlaceLoop ↔ Amazon resume template on ResumeLoop. That builds topical clusters Google recognizes.
- Choose subdomain vs subfolder deliberately. Subdomains give each brand its own identity and deploy, but in practice they don't lift campusloop.space the way subfolders do. Rule of thumb:
  - Standalone brands like DSALoop and GATELoop go on subdomains.
  - College-centric content (ExamLoop, AdmitLoop) goes under campusloop.space/, next to the college hubs.
- Give each subdomain its own Search Console property and sitemap. You're already on IndexNow.
- Make Hinglish versions of high-intent pages. There's much less competition.
- Plan launches around the student calendar: placements (roughly Aug–Dec), GATE (Feb), end-sems (around Nov–Dec and Apr–May), JoSAA (Jun–Jul).

**App-viral (built into the product)**
- Make every result a shareable card with a dynamic OG image: GATE rank, resume score, bunk budget, pattern mastery map. Make sharing WhatsApp-first with a prefilled message, since college distribution runs on WhatsApp groups.
- Run college-vs-college leaderboards, like a weekly DSALoop contest or GATE mock rankings. Inter-college rivalry recruits campus ambassadors for you.
- Offer README and LinkedIn badges ("DSALoop streak: 42 days"), like GitHub readme stats. Each badge is a backlink and an ad, and it's an evening's build for you.
- Give campus ambassadors referral codes, with a per-college leaderboard.
- Put login in front of the social and sync features, never the content. Gating content kills SEO.

**Reel-viral (content engine)**
- Use CodeVisualizer to render pattern animations as a daily series, e.g. "Sliding Window in 30 seconds". Once set up, each reel costs almost nothing to make.
- Make data reels from your own datasets, e.g. "Average package at every NIT in 30 seconds". They get saved and shared, nobody else has them, and the same data can feed the documentary-style YouTube series.
- Use comment-to-DM automation ("comment GRAPHS for the roadmap"). Links in reels aren't clickable, and the comments boost reach.
- Turn campus-feed confessions into anonymized reels, but only with the poster's explicit opt-in.
- Run consistent series rather than chasing one-off hits: "Day 14/75 of Blind 75", "TCS NQT question of the day".

**Traps to skip:** NPTEL weekly assignment answers, selling ready-made final-year projects, and leaked papers. They all have big search volume, but they're cheating-adjacent and would undercut the verified-student trust CampusLoop is built on.

Want me to write a build spec for PlaceLoop (page matrix, D1 schema, structured data, share cards), or put this whole plan into a doc you can keep?
