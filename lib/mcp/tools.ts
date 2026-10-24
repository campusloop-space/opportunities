import { z } from "zod";
import {
  createOpportunity,
  upsertOpportunity,
  updateOpportunity,
  publishOpportunity,
  closeOpportunity,
  markExpiredOpportunity,
  checkDuplicateOpportunities,
  getOpportunityBySlug,
  listOpportunities,
  getIngestionStats,
  bulkUpsertOpportunities,
} from "../opportunities/service";
import {
  CreateOpportunitySchema,
  UpdateOpportunitySchema,
  UpsertOpportunitySchema,
  PublishOpportunitySchema,
  CloseOpportunitySchema,
  MarkExpiredSchema,
  CheckDuplicateSchema,
  ReportSourceStatusSchema,
  ListOpportunitiesSchema,
  BulkUpsertSchema,
} from "../validation/opportunity";
import { opportunityCategories, opportunities, opportunityAuditLogs } from "../db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, unknown>, actor: { type: string; id?: string }) => Promise<unknown>;
}

export const mcpTools: McpToolDefinition[] = [
  {
    name: "create_opportunity",
    description: "Validate payload, normalize URLs, deduplicate and create an opportunity (draft by default; immediate publication requires allowImmediatePublish).",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Opportunity title (e.g. Google Summer of Code 2026)" },
        summary: { type: "string", description: "Concise summary (10-1000 chars)" },
        description: { type: "string", description: "Detailed description or markdown" },
        category: { type: "string", enum: [...opportunityCategories], description: "Opportunity category" },
        tags: { type: "array", items: { type: "string" }, description: "Tags (e.g. ['Open Source', 'Mentorship'])" },
        organizerName: { type: "string", description: "Organization name" },
        organizerWebsite: { type: "string", description: "Official website of organizer" },
        sourceUrl: { type: "string", description: "Official source URL" },
        applicationUrl: { type: "string", description: "Official application or registration link" },
        location: { type: "string", description: "Location or Worldwide" },
        deliveryMode: { type: "string", enum: ["remote", "in_person", "hybrid", "unknown"] },
        eligibilitySummary: { type: "string", description: "Summary of who is eligible" },
        eligibleDegrees: { type: "array", items: { type: "string" } },
        eligibleYears: { type: "array", items: { type: "string" } },
        eligibleFields: { type: "array", items: { type: "string" } },
        eligibleCountries: { type: "array", items: { type: "string" } },
        benefitsSummary: { type: "string", description: "Benefits, perks or prizes" },
        stipendAmount: { type: "string" },
        stipendCurrency: { type: "string" },
        applicationOpensAt: { type: "string", description: "ISO date string" },
        deadlineAt: { type: "string", description: "ISO date string" },
        deadlineTimezone: { type: "string" },
        rollingDeadline: { type: "boolean", default: false },
        status: { type: "string", enum: ["draft", "published"], default: "draft" },
        sourceMethod: { type: "string", enum: ["official", "organizer_submitted", "editorial", "imported"], default: "imported" },
        sourceNotes: { type: "string" },
      },
      required: ["title", "summary", "description", "category", "organizerName", "sourceUrl", "applicationUrl"],
    },
    handler: async (args, actor) => {
      const validated = CreateOpportunitySchema.parse(args);
      const res = await createOpportunity(validated, actor);
      return { opportunityId: res.id, slug: res.slug, status: res.status };
    },
  },
  {
    name: "upsert_opportunity",
    description: "Idempotently create or update an opportunity by source_url, slug, or external ID. Preserves existing fields if update does not supply them.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        summary: { type: "string" },
        description: { type: "string" },
        category: { type: "string", enum: [...opportunityCategories] },
        tags: { type: "array", items: { type: "string" } },
        organizerName: { type: "string" },
        organizerWebsite: { type: "string" },
        sourceUrl: { type: "string" },
        applicationUrl: { type: "string" },
        location: { type: "string" },
        deliveryMode: { type: "string", enum: ["remote", "in_person", "hybrid", "unknown"] },
        eligibilitySummary: { type: "string" },
        eligibleDegrees: { type: "array", items: { type: "string" } },
        eligibleYears: { type: "array", items: { type: "string" } },
        eligibleFields: { type: "array", items: { type: "string" } },
        eligibleCountries: { type: "array", items: { type: "string" } },
        benefitsSummary: { type: "string" },
        stipendAmount: { type: "string" },
        stipendCurrency: { type: "string" },
        applicationOpensAt: { type: "string" },
        deadlineAt: { type: "string" },
        deadlineTimezone: { type: "string" },
        rollingDeadline: { type: "boolean" },
        status: { type: "string", enum: ["draft", "published"] },
        sourceMethod: { type: "string", enum: ["official", "organizer_submitted", "editorial", "imported"] },
        allowImmediatePublish: { type: "boolean", default: false },
      },
      required: ["title", "summary", "description", "category", "organizerName", "sourceUrl", "applicationUrl"],
    },
    handler: async (args, actor) => {
      const validated = UpsertOpportunitySchema.parse(args);
      const res = await upsertOpportunity(validated, actor);
      return {
        operation: res.operation,
        opportunityId: res.opportunity.id,
        slug: res.opportunity.slug,
        status: res.opportunity.status,
      };
    },
  },
  {
    name: "update_opportunity",
    description: "Update fields of an opportunity by internal UUID id or unique slug.",
    inputSchema: {
      type: "object",
      properties: {
        idOrSlug: { type: "string", description: "Internal UUID or slug" },
        patch: { type: "object", description: "Fields to update" },
      },
      required: ["idOrSlug", "patch"],
    },
    handler: async (args, actor) => {
      const idOrSlug = z.string().parse(args.idOrSlug);
      const patch = UpdateOpportunitySchema.parse(args.patch);
      const updated = await updateOpportunity(idOrSlug, patch, actor);
      return { opportunityId: updated.id, slug: updated.slug, status: updated.status, updatedAt: updated.updatedAt };
    },
  },
  {
    name: "get_opportunity",
    description: "Retrieve a single opportunity listing by slug or UUID. Includes internal provenance fields for authenticated agent.",
    inputSchema: {
      type: "object",
      properties: {
        idOrSlug: { type: "string", description: "Opportunity UUID or slug" },
      },
      required: ["idOrSlug"],
    },
    handler: async (args) => {
      const idOrSlug = z.string().parse(args.idOrSlug);
      const opp = await getOpportunityBySlug(idOrSlug, { includeUnpublished: true });
      if (!opp) throw new Error(`Opportunity not found: ${idOrSlug}`);
      return opp;
    },
  },
  {
    name: "search_opportunities",
    description: "Search opportunities by text query, category, delivery mode, or status with pagination.",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string", description: "Keyword search in title, summary, organizer" },
        category: { type: "string", enum: [...opportunityCategories] },
        deliveryMode: { type: "string", enum: ["remote", "in_person", "hybrid", "unknown"] },
        status: { type: "string", enum: ["draft", "published", "closed", "expired", "rejected"] },
        limit: { type: "number", default: 20 },
        offset: { type: "number", default: 0 },
      },
    },
    handler: async (args) => {
      const validated = ListOpportunitiesSchema.parse(args);
      return await listOpportunities(validated, { includeUnpublished: true });
    },
  },
  {
    name: "list_opportunities",
    description: "List opportunities with sorting (by publishedAt, deadlineAt, createdAt, updatedAt) and filters.",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", enum: [...opportunityCategories] },
        status: { type: "string", enum: ["draft", "published", "closed", "expired", "rejected"] },
        sortBy: { type: "string", enum: ["publishedAt", "deadlineAt", "createdAt", "updatedAt"], default: "publishedAt" },
        sortOrder: { type: "string", enum: ["asc", "desc"], default: "desc" },
        closingSoonOnly: { type: "boolean" },
        limit: { type: "number", default: 20 },
        offset: { type: "number", default: 0 },
      },
    },
    handler: async (args) => {
      const validated = ListOpportunitiesSchema.parse(args);
      return await listOpportunities(validated, { includeUnpublished: true });
    },
  },
  {
    name: "publish_opportunity",
    description: "Explicitly transition an opportunity from draft to published after validating mandatory application and source links.",
    inputSchema: {
      type: "object",
      properties: {
        idOrSlug: { type: "string", description: "Opportunity UUID or slug" },
      },
      required: ["idOrSlug"],
    },
    handler: async (args, actor) => {
      const validated = PublishOpportunitySchema.parse(args);
      const res = await publishOpportunity(validated.idOrSlug, actor);
      return { opportunityId: res.id, slug: res.slug, status: res.status, publishedAt: res.publishedAt };
    },
  },
  {
    name: "close_opportunity",
    description: "Close an active listing with an explicit closure reason (e.g. applications reached capacity, program discontinued).",
    inputSchema: {
      type: "object",
      properties: {
        idOrSlug: { type: "string", description: "Opportunity UUID or slug" },
        reason: { type: "string", description: "Reason why listing is closed" },
      },
      required: ["idOrSlug", "reason"],
    },
    handler: async (args, actor) => {
      const validated = CloseOpportunitySchema.parse(args);
      const res = await closeOpportunity(validated.idOrSlug, validated.reason, actor);
      return { opportunityId: res.id, slug: res.slug, status: res.status, closedReason: res.closedReason };
    },
  },
  {
    name: "mark_opportunity_expired",
    description: "Mark an opportunity as expired when its application deadline has passed.",
    inputSchema: {
      type: "object",
      properties: {
        idOrSlug: { type: "string", description: "Opportunity UUID or slug" },
      },
      required: ["idOrSlug"],
    },
    handler: async (args, actor) => {
      const validated = MarkExpiredSchema.parse(args);
      const res = await markExpiredOpportunity(validated.idOrSlug, actor);
      return { opportunityId: res.id, slug: res.slug, status: res.status };
    },
  },
  {
    name: "check_duplicate_opportunities",
    description: "Check for duplicate opportunities using normalized source URL or title and organizer similarity without exposing private fields.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        sourceUrl: { type: "string" },
        organizerName: { type: "string" },
      },
      required: ["title", "sourceUrl", "organizerName"],
    },
    handler: async (args) => {
      const validated = CheckDuplicateSchema.parse(args);
      return await checkDuplicateOpportunities(validated);
    },
  },
  {
    name: "report_source_status",
    description: "Log an automated crawler or editorial check verifying that the official source URL is live or broken.",
    inputSchema: {
      type: "object",
      properties: {
        idOrSlug: { type: "string" },
        status: { type: "string", enum: ["active", "closed", "broken", "unreachable"] },
        evidenceUrl: { type: "string" },
        notes: { type: "string" },
      },
      required: ["idOrSlug", "status"],
    },
    handler: async (args, actor) => {
      const validated = ReportSourceStatusSchema.parse(args);
      const opp = await getOpportunityBySlug(validated.idOrSlug, { includeUnpublished: true });
      if (!opp) throw new Error(`Opportunity not found: ${validated.idOrSlug}`);

      await db
        .update(opportunities)
        .set({
          sourceCheckedAt: new Date(),
          lastSeenAt: validated.status === "active" ? new Date() : opp.lastSeenAt,
          updatedAt: new Date(),
        })
        .where(eq(opportunities.id, opp.id));

      await db.insert(opportunityAuditLogs).values({
        opportunityId: opp.id,
        action: "source_check",
        actorType: actor.type,
        actorId: actor.id || null,
        metadata: {
          status: validated.status,
          evidenceUrl: validated.evidenceUrl,
          notes: validated.notes,
        },
      });

      return { opportunityId: opp.id, status: validated.status, checkedAt: new Date().toISOString() };
    },
  },
  {
    name: "delete_opportunity",
    description: "Soft-delete (reject) or archive an opportunity listing with an audit log record.",
    inputSchema: {
      type: "object",
      properties: {
        idOrSlug: { type: "string" },
        reason: { type: "string" },
      },
      required: ["idOrSlug"],
    },
    handler: async (args, actor) => {
      const idOrSlug = z.string().parse(args.idOrSlug);
      const opp = await getOpportunityBySlug(idOrSlug, { includeUnpublished: true });
      if (!opp) throw new Error(`Opportunity not found: ${idOrSlug}`);

      const [rejected] = await db
        .update(opportunities)
        .set({
          status: "rejected",
          closedReason: (args.reason as string) || "Archived by maintainer",
          updatedAt: new Date(),
          updatedBy: actor.id || actor.type,
        })
        .where(eq(opportunities.id, opp.id))
        .returning();

      await db.insert(opportunityAuditLogs).values({
        opportunityId: opp.id,
        action: "delete",
        actorType: actor.type,
        actorId: actor.id || null,
        changes: { reason: args.reason },
      });

      return { opportunityId: rejected.id, status: rejected.status };
    },
  },
  {
    name: "get_ingestion_stats",
    description: "Get aggregate count statistics across all categories and lifecycle statuses.",
    inputSchema: {
      type: "object",
      properties: {},
    },
    handler: async () => {
      return await getIngestionStats();
    },
  },
  {
    name: "bulk_upsert_opportunities",
    description: "Batch upsert multiple opportunities (capped at 50 per batch) with per-record validation and partial success summary.",
    inputSchema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            required: ["title", "summary", "description", "category", "organizerName", "sourceUrl", "applicationUrl"],
          },
          description: "List of opportunities to ingest (max 50)",
        },
        allowImmediatePublish: { type: "boolean", default: false },
      },
      required: ["items"],
    },
    handler: async (args, actor) => {
      const validated = BulkUpsertSchema.parse(args);
      return await bulkUpsertOpportunities(validated.items, validated.allowImmediatePublish, actor);
    },
  },
  {
    name: "get_categories",
    description: "List all canonical categories and their formal descriptions in CampusLoop Opportunities.",
    inputSchema: {
      type: "object",
      properties: {},
    },
    handler: async () => {
      return [
        { id: "internships", name: "Internships", description: "Summer, winter, and off-campus internships for college students" },
        { id: "hackathons", name: "Hackathons", description: "National, global, and collegiate coding hackathons & product sprints" },
        { id: "scholarships", name: "Scholarships", description: "Merit-based, need-based, and corporate scholarships for students" },
        { id: "fellowships", name: "Fellowships", description: "Pre-doctoral, leadership, open source, and research fellowships" },
        { id: "research", name: "Research Programs", description: "Undergraduate and graduate research internships and lab positions" },
        { id: "competitions", name: "Competitions", description: "Case competitions, algorithmic challenges, and collegiate awards" },
        { id: "student_programs", name: "Student Programs", description: "Campus ambassador programs, developer clubs, and student benefits" },
      ];
    },
  },
];
