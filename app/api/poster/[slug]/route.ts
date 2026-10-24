import { getOpportunityBySlug } from "@/lib/opportunities/service";
import { getOpportunityQuality } from "@/lib/opportunities/quality";
function escapeXml(s:string){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");}
function splitLines(value:string,max=30,maxLines=3){
 const words=value.split(/\s+/),lines:string[]=[];let line="";
 for(const word of words){const next=line?`${line} ${word}`:word;if(next.length>max&&line){lines.push(line);line=word;if(lines.length===maxLines-1)break;}else line=next;}
 if(line&&lines.length<maxLines)lines.push(line);
 if(lines.join(" ").length<value.length&&lines.length)lines[lines.length-1]=lines[lines.length-1].replace(/[.…]*$/,"")+"…";
 return lines;
}
export async function GET(_request:Request,context:{params:Promise<{slug:string}>}){
 const {slug}=await context.params,opp=await getOpportunityBySlug(slug);
 if(!opp)return new Response("Not found",{status:404});
 const lines=splitLines(opp.title).map(escapeXml);
 const titleMarkup=lines.map((line,i)=>`<text x="76" y="${300+i*65}" font-size="54" font-weight="750" fill="#fffaf3">${line}</text>`).join("");
 const quality=getOpportunityQuality(opp),category=escapeXml(opp.category.replace(/_/g," ")),organizer=escapeXml(opp.organizerName),score=escapeXml(`INFO QUALITY ${quality.tier} · ${quality.score}/100`);
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#251b17"/><stop offset="58%" stop-color="#5d2b1d"/><stop offset="100%" stop-color="#bd4b2a"/></linearGradient><radialGradient id="glow"><stop offset="0%" stop-color="#f2ad86" stop-opacity=".6"/><stop offset="100%" stop-color="#f2ad86" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="630" fill="url(#bg)"/><circle cx="1030" cy="80" r="390" fill="url(#glow)"/><circle cx="1070" cy="580" r="260" fill="#f5c6a6" opacity=".08"/><rect x="52" y="48" width="1096" height="534" rx="28" fill="none" stroke="#fffaf3" stroke-opacity=".16"/><rect x="76" y="76" width="56" height="56" rx="16" fill="#fffaf3" fill-opacity=".13"/><text x="104" y="112" text-anchor="middle" font-size="29" font-weight="800" fill="#fffaf3">C</text><text x="150" y="99" font-size="15" font-weight="700" letter-spacing="2.5" fill="#f2d1bf">CAMPUSLOOP OPPORTUNITIES</text><text x="150" y="123" font-size="13" fill="#efd4c6">Verified sources · Student-focused discovery</text><rect x="76" y="177" width="${Math.max(158,Math.min(330,category.length*12+28))}" height="34" rx="9" fill="#fffaf3" fill-opacity=".15"/><text x="91" y="199" font-size="16" font-weight="650" fill="#fffaf3">${category.toUpperCase()}</text>${titleMarkup}<text x="76" y="492" font-size="21" fill="#f9e0d1">${organizer}</text><rect x="76" y="527" width="238" height="32" rx="9" fill="#fffaf3" fill-opacity=".13"/><text x="90" y="548" font-size="14" font-weight="650" fill="#fffaf3">${score}</text><text x="1120" y="548" text-anchor="end" font-size="14" fill="#f5ceba">opportunities.campusloop.space</text></svg>`;
 return new Response(svg,{headers:{"Content-Type":"image/svg+xml; charset=utf-8","Cache-Control":"public, max-age=3600, stale-while-revalidate=86400","X-Content-Type-Options":"nosniff"}});
}
