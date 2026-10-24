import crypto from "crypto";
import { eq, and, or, ilike, desc, asc, lte, gte, count, sql } from "drizzle-orm";
import { db } from "../db";
import {
  opportunities,
  opportunityAuditLogs,
  savedOpportunities,
  users,
  type Opportunity,
  type NewOpportunity,
} from "../db/schema";
import { normalizeUrl } from "../security";
import type { z } from "zod";
import type {
  CreateOpportunitySchema,
  UpdateOpportunitySchema,
  ListOpportunitiesSchema,
} from "../validation/opportunity";

export function generateBaseSlug(title: string, organizerName?: string): string {
  const combined = organizerName ? `${organizerName} ${title}` : title;
  return combined
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export function computeContentHash(data: Record<string, unknown>): string {
  const normalized = JSON.stringify({
    title: data.title,
    summary: data.summary,
    description: data.description,
    category: data.category,
    sourceUrl: data.sourceUrl,
    applicationUrl: data.applicationUrl,
    deadlineAt: data.deadlineAt,
  });
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

export async function createOpportunity(
  input: z.infer<typeof CreateOpportunitySchema>,
  actor: { type: string; id?: string } = { type: "system" }
) {
  const normSourceUrl = normalizeUrl(input.sourceUrl);
  const normAppUrl = normalizeUrl(input.applicationUrl);
  const baseSlug = generateBaseSlug(input.title, input.organizerName);

  // Check unique slug
  let slug = baseSlug;
  const existingWithSlug = await db
    .select({ id: opportunities.id })
    .from(opportunities)
    .where(eq(opportunities.slug, slug))
    .limit(1);

  if (existingWithSlug.length > 0) {
    slug = `${baseSlug}-${crypto.randomBytes(3).toString("hex")}`;
  }

  const contentHash = computeContentHash(input);

  const newRecord: NewOpportunity = {
    slug,
    title: input.title,
    summary: input.summary,
    description: input.description,
    category: input.category,
    tags: input.tags,
    organizerName: input.organizerName,
    organizerWebsite: input.organizerWebsite ? normalizeUrl(input.organizerWebsite) : null,
    sourceUrl: normSourceUrl,
    applicationUrl: normAppUrl,
    location: input.location,
    deliveryMode: input.deliveryMode,
    eligibilitySummary: input.eligibilitySummary ?? null,
    eligibleDegrees: input.eligibleDegrees,
    eligibleYears: input.eligibleYears,
    eligibleFields: input.eligibleFields,
    eligibleCountries: input.eligibleCountries,
    benefitsSummary: input.benefitsSummary ?? null,
    stipendAmount: input.stipendAmount ?? null,
    stipendCurrency: input.stipendCurrency ?? null,
    applicationOpensAt: input.applicationOpensAt ? new Date(input.applicationOpensAt) : null,
    deadlineAt: input.deadlineAt ? new Date(input.deadlineAt) : null,
    deadlineTimezone: input.deadlineTimezone ?? null,
    rollingDeadline: input.rollingDeadline,
    status: input.status,
    sourceCheckedAt: new Date(),
    publishedAt: input.status === "published" ? new Date() : null,
    sourceMethod: input.sourceMethod,
    sourceNotes: input.sourceNotes ?? null,
    contentHash,
    createdBy: actor.id || actor.type,
    updatedBy: actor.id || actor.type,
    metadata: input.metadata,
  };

  const [inserted] = await db.insert(opportunities).values(newRecord).returning();

  // Audit log
  await db.insert(opportunityAuditLogs).values({
    opportunityId: inserted.id,
    action: "create",
    actorType: actor.type,
    actorId: actor.id || null,
    changes: { status: inserted.status, slug: inserted.slug },
  });

  return inserted;
}

export async function upsertOpportunity(
  input: z.infer<typeof CreateOpportunitySchema> & {
    slug?: string;
    allowImmediatePublish?: boolean;
  },
  actor: { type: string; id?: string } = { type: "system" }
) {
  const normSourceUrl = normalizeUrl(input.sourceUrl);
  const normAppUrl = normalizeUrl(input.applicationUrl);

  // Check if exists by sourceUrl
  const existing = await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.sourceUrl, normSourceUrl))
    .limit(1);

  if (existing.length > 0) {
    const opp = existing[0];
    const contentHash = computeContentHash(input);

    // If content hash matches, just update sourceCheckedAt & lastSeenAt
    if (opp.contentHash === contentHash) {
      const [updated] = await db
        .update(opportunities)
        .set({
          sourceCheckedAt: new Date(),
          lastSeenAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(opportunities.id, opp.id))
        .returning();
      return { operation: "skipped_unchanged" as const, opportunity: updated };
    }

    const nextStatus = input.allowImmediatePublish ? "published" : opp.status;
    const [updated] = await db
      .update(opportunities)
      .set({
        title: input.title,
        summary: input.summary,
        description: input.description,
        category: input.category,
        tags: input.tags,
        organizerName: input.organizerName,
        organizerWebsite: input.organizerWebsite ? normalizeUrl(input.organizerWebsite) : opp.organizerWebsite,
        applicationUrl: normAppUrl,
        location: input.location,
        deliveryMode: input.deliveryMode,
        eligibilitySummary: input.eligibilitySummary ?? opp.eligibilitySummary,
        eligibleDegrees: input.eligibleDegrees.length ? input.eligibleDegrees : opp.eligibleDegrees,
        eligibleYears: input.eligibleYears.length ? input.eligibleYears : opp.eligibleYears,
        eligibleFields: input.eligibleFields.length ? input.eligibleFields : opp.eligibleFields,
        eligibleCountries: input.eligibleCountries.length ? input.eligibleCountries : opp.eligibleCountries,
        benefitsSummary: input.benefitsSummary ?? opp.benefitsSummary,
        stipendAmount: input.stipendAmount ?? opp.stipendAmount,
        stipendCurrency: input.stipendCurrency ?? opp.stipendCurrency,
        applicationOpensAt: input.applicationOpensAt ? new Date(input.applicationOpensAt) : opp.applicationOpensAt,
        deadlineAt: input.deadlineAt ? new Date(input.deadlineAt) : opp.deadlineAt,
        deadlineTimezone: input.deadlineTimezone ?? opp.deadlineTimezone,
        rollingDeadline: input.rollingDeadline,
        status: nextStatus,
        publishedAt: nextStatus === "published" && !opp.publishedAt ? new Date() : opp.publishedAt,
        sourceCheckedAt: new Date(),
        lastSeenAt: new Date(),
        contentHash,
        updatedBy: actor.id || actor.type,
        updatedAt: new Date(),
      })
      .where(eq(opportunities.id, opp.id))
      .returning();

    await db.insert(opportunityAuditLogs).values({
      opportunityId: opp.id,
      action: "update",
      actorType: actor.type,
      actorId: actor.id || null,
      changes: { prevStatus: opp.status, newStatus: updated.status },
    });

    return { operation: "updated" as const, opportunity: updated };
  }

  // Otherwise create new
  const status = input.allowImmediatePublish ? "published" : (input.status || "draft");
  const created = await createOpportunity({ ...input, status }, actor);
  return { operation: "created" as const, opportunity: created };
}

export async function updateOpportunity(
  idOrSlug: string,
  patch: z.infer<typeof UpdateOpportunitySchema>,
  actor: { type: string; id?: string } = { type: "system" }
) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  const whereClause = isUuid ? eq(opportunities.id, idOrSlug) : eq(opportunities.slug, idOrSlug);

  const existing = await db.select().from(opportunities).where(whereClause).limit(1);
  if (existing.length === 0) {
    throw new Error(`Opportunity not found: ${idOrSlug}`);
  }

  const opp = existing[0];
  const updateFields: Partial<NewOpportunity> = {
    updatedBy: actor.id || actor.type,
    updatedAt: new Date(),
  };

  if (patch.title !== undefined) updateFields.title = patch.title;
  if (patch.summary !== undefined) updateFields.summary = patch.summary;
  if (patch.description !== undefined) updateFields.description = patch.description;
  if (patch.category !== undefined) updateFields.category = patch.category;
  if (patch.tags !== undefined) updateFields.tags = patch.tags;
  if (patch.organizerName !== undefined) updateFields.organizerName = patch.organizerName;
  if (patch.organizerWebsite !== undefined) updateFields.organizerWebsite = patch.organizerWebsite;
  if (patch.sourceUrl !== undefined) updateFields.sourceUrl = normalizeUrl(patch.sourceUrl);
  if (patch.applicationUrl !== undefined) updateFields.applicationUrl = normalizeUrl(patch.applicationUrl);
  if (patch.location !== undefined) updateFields.location = patch.location;
  if (patch.deliveryMode !== undefined) updateFields.deliveryMode = patch.deliveryMode;
  if (patch.eligibilitySummary !== undefined) updateFields.eligibilitySummary = patch.eligibilitySummary;
  if (patch.benefitsSummary !== undefined) updateFields.benefitsSummary = patch.benefitsSummary;
  if (patch.stipendAmount !== undefined) updateFields.stipendAmount = patch.stipendAmount;
  if (patch.stipendCurrency !== undefined) updateFields.stipendCurrency = patch.stipendCurrency;
  if (patch.deadlineAt !== undefined) updateFields.deadlineAt = patch.deadlineAt ? new Date(patch.deadlineAt) : null;
  if (patch.rollingDeadline !== undefined) updateFields.rollingDeadline = patch.rollingDeadline;
  if (patch.status !== undefined) {
    updateFields.status = patch.status;
    if (patch.status === "published" && !opp.publishedAt) {
      updateFields.publishedAt = new Date();
    }
  }
  if (patch.closedReason !== undefined) updateFields.closedReason = patch.closedReason;

  const [updated] = await db
    .update(opportunities)
    .set(updateFields)
    .where(eq(opportunities.id, opp.id))
    .returning();

  await db.insert(opportunityAuditLogs).values({
    opportunityId: opp.id,
    action: "update",
    actorType: actor.type,
    actorId: actor.id || null,
    changes: patch as Record<string, unknown>,
  });

  return updated;
}

export async function publishOpportunity(
  idOrSlug: string,
  actor: { type: string; id?: string } = { type: "system" }
) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  const whereClause = isUuid ? eq(opportunities.id, idOrSlug) : eq(opportunities.slug, idOrSlug);

  const existing = await db.select().from(opportunities).where(whereClause).limit(1);
  if (existing.length === 0) {
    throw new Error(`Opportunity not found: ${idOrSlug}`);
  }

  const opp = existing[0];
  if (!opp.applicationUrl || !opp.sourceUrl || !opp.title) {
    throw new Error("Cannot publish opportunity: required fields (title, applicationUrl, sourceUrl) are missing.");
  }

  const [published] = await db
    .update(opportunities)
    .set({
      status: "published",
      publishedAt: opp.publishedAt || new Date(),
      sourceCheckedAt: new Date(),
      updatedAt: new Date(),
      updatedBy: actor.id || actor.type,
    })
    .where(eq(opportunities.id, opp.id))
    .returning();

  await db.insert(opportunityAuditLogs).values({
    opportunityId: opp.id,
    action: "publish",
    actorType: actor.type,
    actorId: actor.id || null,
  });

  return published;
}

export async function closeOpportunity(
  idOrSlug: string,
  reason: string,
  actor: { type: string; id?: string } = { type: "system" }
) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  const whereClause = isUuid ? eq(opportunities.id, idOrSlug) : eq(opportunities.slug, idOrSlug);

  const existing = await db.select().from(opportunities).where(whereClause).limit(1);
  if (existing.length === 0) {
    throw new Error(`Opportunity not found: ${idOrSlug}`);
  }

  const opp = existing[0];
  const [closed] = await db
    .update(opportunities)
    .set({
      status: "closed",
      closedReason: reason,
      updatedAt: new Date(),
      updatedBy: actor.id || actor.type,
    })
    .where(eq(opportunities.id, opp.id))
    .returning();

  await db.insert(opportunityAuditLogs).values({
    opportunityId: opp.id,
    action: "close",
    actorType: actor.type,
    actorId: actor.id || null,
    changes: { reason },
  });

  return closed;
}

export async function markExpiredOpportunity(
  idOrSlug: string,
  actor: { type: string; id?: string } = { type: "system" }
) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  const whereClause = isUuid ? eq(opportunities.id, idOrSlug) : eq(opportunities.slug, idOrSlug);

  const existing = await db.select().from(opportunities).where(whereClause).limit(1);
  if (existing.length === 0) {
    throw new Error(`Opportunity not found: ${idOrSlug}`);
  }

  const opp = existing[0];
  if (opp.rollingDeadline) {
    throw new Error("Cannot expire rolling deadline opportunity without explicit closure reason.");
  }

  const [expired] = await db
    .update(opportunities)
    .set({
      status: "expired",
      updatedAt: new Date(),
      updatedBy: actor.id || actor.type,
    })
    .where(eq(opportunities.id, opp.id))
    .returning();

  await db.insert(opportunityAuditLogs).values({
    opportunityId: opp.id,
    action: "expire",
    actorType: actor.type,
    actorId: actor.id || null,
  });

  return expired;
}

export async function checkDuplicateOpportunities(params: {
  title: string;
  sourceUrl: string;
  organizerName: string;
}) {
  const normSourceUrl = normalizeUrl(params.sourceUrl);

  // Exact source url match
  const byUrl = await db
    .select({ id: opportunities.id, slug: opportunities.slug, title: opportunities.title, status: opportunities.status })
    .from(opportunities)
    .where(eq(opportunities.sourceUrl, normSourceUrl))
    .limit(1);

  if (byUrl.length > 0) {
    return { isDuplicate: true, matchType: "source_url" as const, match: byUrl[0] };
  }

  // Near title + same organizer match
  const byOrganizerAndTitle = await db
    .select({ id: opportunities.id, slug: opportunities.slug, title: opportunities.title, status: opportunities.status })
    .from(opportunities)
    .where(
      and(
        ilike(opportunities.organizerName, `%${params.organizerName.trim()}%`),
        ilike(opportunities.title, `%${params.title.trim()}%`)
      )
    )
    .limit(3);

  if (byOrganizerAndTitle.length > 0) {
    return {
      isDuplicate: true,
      matchType: "organizer_and_title" as const,
      candidates: byOrganizerAndTitle,
    };
  }

  return { isDuplicate: false, matchType: null, candidates: [] };
}

export async function getOpportunityBySlug(
  slug: string,
  options: { includeUnpublished?: boolean } = {}
) {
  const query = db
    .select()
    .from(opportunities)
    .where(eq(opportunities.slug, slug))
    .limit(1);

  const results = await query;
  if (results.length === 0) return null;

  const opp = results[0];
  if (!options.includeUnpublished && opp.status !== "published") {
    return null;
  }
  return opp;
}

export async function listOpportunities(
  filters: Partial<z.infer<typeof ListOpportunitiesSchema>> = {},
  options: { includeUnpublished?: boolean } = {}
) {
  const conditions = [];
  const limit = filters.limit ?? 20;
  const offset = filters.offset ?? 0;

  if (!options.includeUnpublished) {
    conditions.push(eq(opportunities.status, "published"));
  } else if (filters.status) {
    conditions.push(eq(opportunities.status, filters.status));
  }

  if (filters.category) {
    conditions.push(eq(opportunities.category, filters.category));
  }

  if (filters.deliveryMode) {
    conditions.push(eq(opportunities.deliveryMode, filters.deliveryMode));
  }

  if (filters.search) {
    const term = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(opportunities.title, term),
        ilike(opportunities.summary, term),
        ilike(opportunities.organizerName, term)
      )
    );
  }

  if (filters.closingSoonOnly) {
    const now = new Date();
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    conditions.push(
      and(
        gte(opportunities.deadlineAt, now),
        lte(opportunities.deadlineAt, sevenDaysFromNow)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  let orderExpr;
  const isAsc = filters.sortOrder === "asc";
  switch (filters.sortBy) {
    case "deadlineAt":
      orderExpr = isAsc ? asc(opportunities.deadlineAt) : desc(opportunities.deadlineAt);
      break;
    case "createdAt":
      orderExpr = isAsc ? asc(opportunities.createdAt) : desc(opportunities.createdAt);
      break;
    case "updatedAt":
      orderExpr = isAsc ? asc(opportunities.updatedAt) : desc(opportunities.updatedAt);
      break;
    case "publishedAt":
    default:
      orderExpr = isAsc ? asc(opportunities.publishedAt) : desc(opportunities.publishedAt);
      break;
  }

  const items = await db
    .select()
    .from(opportunities)
    .where(whereClause)
    .orderBy(orderExpr)
    .limit(limit)
    .offset(offset);

  const [totalResult] = await db
    .select({ count: count() })
    .from(opportunities)
    .where(whereClause);

  return {
    items,
    total: Number(totalResult?.count || 0),
    limit,
    offset,
  };
}

export async function getIngestionStats() {
  const [totalRes] = await db.select({ count: count() }).from(opportunities);

  const byCategory = await db
    .select({ category: opportunities.category, count: count() })
    .from(opportunities)
    .groupBy(opportunities.category);

  const byStatus = await db
    .select({ status: opportunities.status, count: count() })
    .from(opportunities)
    .groupBy(opportunities.status);

  return {
    total: Number(totalRes?.count || 0),
    byCategory: Object.fromEntries(byCategory.map((c) => [c.category, Number(c.count)])),
    byStatus: Object.fromEntries(byStatus.map((s) => [s.status, Number(s.count)])),
    checkedAt: new Date().toISOString(),
  };
}

export async function bulkUpsertOpportunities(
  items: z.infer<typeof CreateOpportunitySchema>[],
  allowImmediatePublish: boolean = false,
  actor: { type: string; id?: string } = { type: "system" }
) {
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: { index: number; title: string; error: string }[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      const res = await upsertOpportunity({ ...item, allowImmediatePublish }, actor);
      if (res.operation === "created") created++;
      else if (res.operation === "updated") updated++;
      else skipped++;
    } catch (err: unknown) {
      errors.push({
        index: i,
        title: item.title,
        error: (err as Error).message,
      });
    }
  }

  return {
    total: items.length,
    created,
    updated,
    skipped,
    failed: errors.length,
    errors,
  };
}

// User bookmarks
export async function toggleSaveOpportunity(userSub: string, opportunityId: string) {
  const existing = await db
    .select()
    .from(savedOpportunities)
    .where(
      and(
        eq(savedOpportunities.userSub, userSub),
        eq(savedOpportunities.opportunityId, opportunityId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .delete(savedOpportunities)
      .where(eq(savedOpportunities.id, existing[0].id));
    return { saved: false };
  }

  await db.insert(savedOpportunities).values({
    userSub,
    opportunityId,
  });
  return { saved: true };
}

export async function getUserSavedOpportunities(userSub: string) {
  const saved = await db
    .select({
      savedAt: savedOpportunities.createdAt,
      opportunity: opportunities,
    })
    .from(savedOpportunities)
    .innerJoin(opportunities, eq(savedOpportunities.opportunityId, opportunities.id))
    .where(eq(savedOpportunities.userSub, userSub))
    .orderBy(desc(savedOpportunities.createdAt));

  return saved;
}

export async function isOpportunitySaved(userSub: string, opportunityId: string): Promise<boolean> {
  const found = await db
    .select({ id: savedOpportunities.id })
    .from(savedOpportunities)
    .where(
      and(
        eq(savedOpportunities.userSub, userSub),
        eq(savedOpportunities.opportunityId, opportunityId)
      )
    )
    .limit(1);
  return found.length > 0;
}
