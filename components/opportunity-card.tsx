"use client";
import Link from "next/link";
import { useState } from "react";
import { Clock, MapPin, Coins, ArrowUpRight, Sparkles } from "lucide-react";
import type { Opportunity } from "@/lib/db/schema";
import { getMetadataImage, getOpportunityQuality, getOrganizerLogoUrl } from "@/lib/opportunities/quality";
import { SaveButton } from "./save-button";

interface Props { opportunity: Opportunity; isSaved?: boolean; isAuthenticated?: boolean; }
const CATEGORIES: Record<string,string> = {internships:"Internship",hackathons:"Hackathon",scholarships:"Scholarship",fellowships:"Fellowship",research:"Research",competitions:"Competition",student_programs:"Student program"};
const MODES: Record<string,string> = {remote:"Remote",in_person:"In-person",hybrid:"Hybrid",unknown:"Mode varies"};

function Logo({name,url}:{name:string;url:string|null}) {
  const [failed,setFailed] = useState(false);
  return <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E8E1D5] bg-white text-xs font-extrabold text-[#BD4B2A] dark:border-[#2B2622] dark:bg-[#211D1A] dark:text-[#F09A78]">
    <span aria-hidden="true">{name.trim().slice(0,1).toUpperCase() || "C"}</span>
    {url && !failed && <img src={url} alt={`${name} logo`} loading="lazy" className="absolute inset-1 h-[calc(100%-8px)] w-[calc(100%-8px)] object-contain" onError={()=>setFailed(true)}/>}
  </span>;
}

export function OpportunityCard({opportunity,isSaved=false,isAuthenticated=false}:Props) {
  const metadata = (opportunity.metadata ?? {}) as Record<string,unknown>;
  const quality = getOpportunityQuality(opportunity);
  const logo = getMetadataImage(metadata,"logoUrl") || getOrganizerLogoUrl(opportunity.organizerName);
  const poster = getMetadataImage(metadata,"posterUrl") || `/api/poster/${encodeURIComponent(opportunity.slug)}`;
  const deadline = opportunity.deadlineAt ? new Date(opportunity.deadlineAt) : null;
  const days = deadline ? Math.ceil((deadline.getTime()-Date.now())/86400000) : null;
  const deadlineLabel = opportunity.rollingDeadline ? "Rolling deadline" : !deadline ? "Deadline not listed" : days !== null && days < 0 ? "Deadline passed" : days === 0 ? "Closes today" : days !== null && days <= 7 ? `Closes in ${days}d` : deadline.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
  const qualityStyle:Record<string,string> = {A:"border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300",B:"border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/60 dark:text-sky-300",C:"border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300",D:"border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300"};
  return <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E8E1D5] bg-white shadow-2xs transition duration-200 hover:-translate-y-0.5 hover:border-[#BD4B2A]/40 hover:shadow-md dark:border-[#2B2622] dark:bg-[#1A1816] dark:hover:border-[#E26543]/45">
    <Link href={`/opportunities/${opportunity.slug}`} className="relative block aspect-[16/7] overflow-hidden bg-[#F7F3ED] dark:bg-[#211D1A]" aria-label={`View ${opportunity.title}`}>
      <img src={poster} alt={`${opportunity.title} poster`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"/>
      <span className="absolute left-3 top-3 rounded-lg border border-white/30 bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">{CATEGORIES[opportunity.category] || opportunity.category}</span>
    </Link>
    <div className="flex flex-1 flex-col p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5"><Logo name={opportunity.organizerName} url={logo}/><div className="min-w-0"><p className="truncate text-xs font-medium text-[#6B635B] dark:text-[#9E958A]">{opportunity.organizerName}</p><p className="mt-0.5 text-[10px] text-[#8C8377] dark:text-[#736C63]">Organizer</p></div></div>
        <div className="flex shrink-0 items-center gap-1.5"><span title="Information quality score based on source, deadline, eligibility and completeness — not popularity or a guarantee of outcomes." className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-bold ${qualityStyle[quality.tier]}`}><Sparkles className="h-3 w-3 icon-animated"/>{quality.tier} · {quality.score}</span><SaveButton opportunityId={opportunity.id} initialSaved={isSaved} isAuthenticated={isAuthenticated}/></div>
      </div>
      <h3 className="mt-3 text-[15px] font-bold leading-snug text-[#1E1A17] transition-colors group-hover:text-[#BD4B2A] dark:text-[#F5EFEB] dark:group-hover:text-[#E26543]"><Link href={`/opportunities/${opportunity.slug}`} className="focus:outline-hidden">{opportunity.title}</Link></h3>
      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[#5C554D] dark:text-[#B8AEA3]">{opportunity.summary}</p>
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="inline-flex items-center gap-1 rounded-lg bg-[#F7F3ED] px-2 py-1 text-[#5C554D] dark:bg-[#211D1A] dark:text-[#D5CDC4]"><MapPin className="h-3 w-3 icon-animated"/>{MODES[opportunity.deliveryMode] || opportunity.location || "Mode varies"}</span>
        <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 ${days !== null && days >= 0 && days <= 7 ? "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300" : "bg-[#F7F3ED] text-[#5C554D] dark:bg-[#211D1A] dark:text-[#D5CDC4]"}`}><Clock className="h-3 w-3 icon-animated"/>{deadlineLabel}</span>
        {opportunity.stipendAmount && <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"><Coins className="h-3 w-3 icon-animated"/>{opportunity.stipendCurrency || "INR"} {opportunity.stipendAmount}</span>}
      </div>
      {!!quality.labels.length && <div className="mt-3 flex flex-wrap gap-1.5">{quality.labels.slice(0,2).map(label=><span key={label} className="max-w-full truncate rounded-md border border-[#E8E1D5] px-2 py-1 text-[10px] text-[#6B635B] dark:border-[#2B2622] dark:text-[#9E958A]">{label}</span>)}</div>}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#F2ECE3] pt-3 dark:border-[#26211D]"><span className="text-[10px] text-[#8C8377] dark:text-[#736C63]">Info quality, not popularity</span><Link href={`/opportunities/${opportunity.slug}`} className="inline-flex items-center gap-1 text-xs font-semibold text-[#BD4B2A] transition hover:text-[#A33F22] dark:text-[#E26543] dark:hover:text-[#F07A5A]">Details <ArrowUpRight className="h-3.5 w-3.5 icon-animated"/></Link></div>
    </div>
  </article>;
}
