"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { opportunityCategories } from "@/lib/db/schema";
const selectClass = "rounded-lg border border-[#E8E1D5] bg-white px-2.5 py-2 text-xs text-[#5C554D] focus:border-[#BD4B2A] focus:outline-hidden dark:border-[#2B2622] dark:bg-[#1A1816] dark:text-[#D5CDC4]";

export function SearchFilters() {
  const router=useRouter(), pathname=usePathname(), searchParams=useSearchParams();
  const [pending,startTransition]=useTransition();
  const currentSearch=searchParams.get("search")||"", currentCategory=searchParams.get("category")||"", currentMode=searchParams.get("mode")||"", currentTier=searchParams.get("qualityTier")||"", currentSort=searchParams.get("sortBy")||"publishedAt", closingSoon=searchParams.get("closingSoon")==="true";
  const [searchVal,setSearchVal]=useState(currentSearch);
  useEffect(()=>setSearchVal(currentSearch),[currentSearch]);
  function applyFilters(updates:Record<string,string|null>) {
    const params=new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key,value])=>{ if(value===null||value===""||value==="false") params.delete(key); else params.set(key,value); });
    params.delete("offset");
    startTransition(()=>router.push(params.size ? `${pathname}?${params.toString()}` : pathname));
  }
  function submit(e:React.FormEvent<HTMLFormElement>) { e.preventDefault(); applyFilters({search:searchVal.trim()||null}); }
  const labels:Record<string,string>={internships:"Internships",hackathons:"Hackathons",scholarships:"Scholarships",fellowships:"Fellowships",research:"Research",competitions:"Competitions",student_programs:"Student programs"};
  const active=Boolean(currentSearch||currentCategory||currentMode||currentTier||closingSoon||currentSort!=="publishedAt");
  return <div className="space-y-3">
    <form onSubmit={submit} className="relative flex items-center"><Search className="absolute left-3.5 h-4 w-4 text-[#8C8377] dark:text-[#736C63]"/><input type="search" value={searchVal} onChange={e=>setSearchVal(e.target.value)} placeholder="Search internships, hackathons, scholarships and more…" aria-label="Search opportunities" className="w-full rounded-xl border border-[#E8E1D5] bg-white py-3 pl-10 pr-24 text-sm text-[#1E1A17] shadow-2xs transition focus:border-[#BD4B2A] focus:outline-hidden focus:ring-2 focus:ring-[#BD4B2A]/15 dark:border-[#2B2622] dark:bg-[#1A1816] dark:text-[#F5EFEB] dark:placeholder:text-[#736C63]"/><button type="submit" className="absolute right-1.5 rounded-lg bg-[#BD4B2A] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#A33F22] dark:bg-[#E26543] dark:hover:bg-[#CC4E2C]">Search</button></form>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-1.5"><button onClick={()=>applyFilters({category:null})} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${!currentCategory?"bg-[#BD4B2A] text-white dark:bg-[#E26543]":"border border-[#E8E1D5] bg-white text-[#5C554D] hover:border-[#BD4B2A]/40 dark:border-[#2B2622] dark:bg-[#1A1816] dark:text-[#D5CDC4]"}`}>All</button>{opportunityCategories.map(cat=><button key={cat} onClick={()=>applyFilters({category:currentCategory===cat?null:cat})} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${currentCategory===cat?"bg-[#BD4B2A] text-white dark:bg-[#E26543]":"border border-[#E8E1D5] bg-white text-[#5C554D] hover:border-[#BD4B2A]/40 dark:border-[#2B2622] dark:bg-[#1A1816] dark:text-[#D5CDC4]"}`}>{labels[cat]||cat}</button>)}</div>
      <div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6B635B] dark:text-[#9E958A]"><SlidersHorizontal className="h-3.5 w-3.5"/>Filter</span>
        <select aria-label="Filter by delivery mode" value={currentMode} onChange={e=>applyFilters({mode:e.target.value||null})} className={selectClass}><option value="">Any mode</option><option value="remote">Remote</option><option value="in_person">In-person</option><option value="hybrid">Hybrid</option></select>
        <select aria-label="Filter by listing quality" value={currentTier} onChange={e=>applyFilters({qualityTier:e.target.value||null})} className={selectClass}><option value="">Any quality</option><option value="A">A · Excellent info</option><option value="B">B · Strong info</option><option value="C">C · Some details missing</option><option value="D">D · Needs review</option></select>
        <select aria-label="Sort opportunities" value={currentSort} onChange={e=>applyFilters({sortBy:e.target.value==="publishedAt"?null:e.target.value})} className={selectClass}><option value="publishedAt">Recently added</option><option value="qualityScore">Highest info quality</option><option value="deadlineAt">Nearest deadline</option></select>
        <button onClick={()=>applyFilters({closingSoon:closingSoon?null:"true"})} aria-pressed={closingSoon} className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${closingSoon?"border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300":"border-[#E8E1D5] bg-white text-[#5C554D] dark:border-[#2B2622] dark:bg-[#1A1816] dark:text-[#D5CDC4]"}`}>Closing soon</button>
        {active && <button onClick={()=>{setSearchVal("");router.push(pathname);}} className="inline-flex items-center gap-1 px-1 py-2 text-xs font-semibold text-[#BD4B2A] hover:underline dark:text-[#E26543]"><X className="h-3.5 w-3.5"/>Reset</button>}
      </div>
    </div>
    {pending && <div aria-label="Updating results" className="h-0.5 w-full overflow-hidden rounded bg-[#BD4B2A]/15 dark:bg-[#E26543]/15"><div className="h-full w-1/3 animate-pulse rounded bg-[#BD4B2A] dark:bg-[#E26543]"/></div>}
    <p className="text-[11px] text-[#8C8377] dark:text-[#736C63]">Quality scores measure listing completeness and source confidence—not popularity, prestige or likelihood of winning.</p>
  </div>;
}
