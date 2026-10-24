import type { Opportunity } from "@/lib/db/schema";

export type QualityTier = "A" | "B" | "C" | "D";
const tierForScore = (score: number): QualityTier => score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "D";

export function getOpportunityQuality(opp: Pick<Opportunity, "metadata" | "sourceMethod" | "sourceUrl" | "applicationUrl" | "deadlineAt" | "rollingDeadline" | "eligibilitySummary" | "benefitsSummary" | "description" | "category" | "tags">) {
  const metadata = (opp.metadata ?? {}) as Record<string, unknown>;
  const storedScore = Number(metadata.qualityScore);
  const score = Number.isFinite(storedScore) && storedScore >= 0 ? Math.min(98, Math.max(0, Math.round(storedScore))) : (() => {
    let value = 35;
    if (opp.sourceMethod === "official") value += 20;
    if (opp.sourceUrl?.startsWith("https://")) value += 10;
    if (opp.applicationUrl?.startsWith("https://")) value += 10;
    if (opp.deadlineAt || opp.rollingDeadline) value += 10;
    if (opp.eligibilitySummary && opp.eligibilitySummary.length > 20) value += 5;
    if (opp.benefitsSummary) value += 5;
    if (opp.description && opp.description.length > 220) value += 5;
    return Math.min(98, value);
  })();
  const savedTier = metadata.qualityTier;
  const tier: QualityTier = savedTier === "A" || savedTier === "B" || savedTier === "C" || savedTier === "D" ? savedTier : tierForScore(score);
  const storedLabels = Array.isArray(metadata.labels) ? metadata.labels.filter((x): x is string => typeof x === "string" && x.trim().length > 0) : [];
  const labels = storedLabels.length ? storedLabels : [
    opp.sourceMethod === "official" ? "Official source" : "Source needs review",
    opp.deadlineAt || opp.rollingDeadline ? "Deadline information present" : "Deadline not confirmed",
    opp.eligibilitySummary ? "Eligibility documented" : "Check eligibility",
  ];
  return { score, tier, labels };
}

const ICONS: Array<[string, string]> = [
  ["amazon web services","amazonaws"],["aws","amazonaws"],["google cloud","googlecloud"],["microsoft azure","microsoftazure"],
  ["microsoft","microsoft"],["github","github"],["gitlab","gitlab"],["openai","openai"],["nvidia","nvidia"],
  ["anthropic","anthropic"],["adobe","adobe"],["figma","figma"],["jetbrains","jetbrains"],["vercel","vercel"],
  ["ibm","ibm"],["cisco","cisco"],["oracle","oracle"],["unity","unity"],["mongodb","mongodb"],["canva","canva"],
  ["autodesk","autodesk"],["salesforce","salesforce"],["linux foundation","linuxfoundation"],["mathworks","mathworks"],
  ["intel","intel"],["kaggle","kaggle"],["paypal","paypal"],["google","google"],["meta","meta"],["devpost","devpost"]
];
export function getOrganizerLogoUrl(name: string): string | null {
  const match = ICONS.find(([needle]) => name.toLowerCase().includes(needle));
  return match ? `https://cdn.simpleicons.org/${match[1]}` : null;
}
export function getMetadataImage(metadata: Record<string, unknown> | null | undefined, key: "logoUrl" | "posterUrl"): string | null {
  const value = metadata?.[key];
  if (typeof value !== "string" || !value.trim()) return null;
  try { const url = new URL(value); return url.protocol === "https:" ? url.toString() : null; } catch { return null; }
}
