import { z } from "zod";
import {
  opportunityCategories,
  opportunityStatuses,
  deliveryModes,
  sourceMethods,
} from "../db/schema";
import { isSafeExternalUrl } from "../security";

export const SafeUrlSchema = z
  .string()
  .url("Must be a valid URL")
  .refine(
    (url) => isSafeExternalUrl(url),
    "URL must use HTTP/HTTPS and not target private or local networks"
  );

export const CreateOpportunitySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(500),
  summary: z.string().min(10, "Summary must be at least 10 characters").max(1000),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.enum(opportunityCategories),
  tags: z.array(z.string().trim().max(50)).default([]),
  organizerName: z.string().min(2, "Organizer name must be at least 2 characters").max(255),
  organizerWebsite: SafeUrlSchema.optional().nullable(),
  sourceUrl: SafeUrlSchema,
  applicationUrl: SafeUrlSchema,
  location: z.string().max(255).default("Worldwide"),
  deliveryMode: z.enum(deliveryModes).default("unknown"),
  eligibilitySummary: z.string().optional().nullable(),
  
  eligibleDegrees: z.array(z.string()).default([]),
  eligibleYears: z.array(z.string()).default([]),
  eligibleFields: z.array(z.string()).default([]),
  eligibleCountries: z.array(z.string()).default([]),
  
  benefitsSummary: z.string().optional().nullable(),
  stipendAmount: z.string().max(100).optional().nullable(),
  stipendCurrency: z.string().max(10).optional().nullable(),
  
  applicationOpensAt: z.string().datetime().optional().nullable(),
  deadlineAt: z.string().datetime().optional().nullable(),
  deadlineTimezone: z.string().max(100).optional().nullable(),
  rollingDeadline: z.boolean().default(false),
  
  status: z.enum(opportunityStatuses).default("draft"),
  sourceMethod: z.enum(sourceMethods).default("imported"),
  sourceNotes: z.string().optional().nullable(),
  metadata: z.record(z.unknown()).default({}),
});

export const UpdateOpportunitySchema = CreateOpportunitySchema.partial().extend({
  id: z.string().uuid().optional(),
  slug: z.string().optional(),
  closedReason: z.string().optional().nullable(),
});

export const UpsertOpportunitySchema = CreateOpportunitySchema.extend({
  slug: z.string().optional(),
  allowImmediatePublish: z.boolean().default(false),
});

export const PublishOpportunitySchema = z.object({
  idOrSlug: z.string().min(1),
  sourceNotes: z.string().optional(),
});

export const CloseOpportunitySchema = z.object({
  idOrSlug: z.string().min(1),
  reason: z.string().min(3, "Reason required to close listing").max(500),
});

export const MarkExpiredSchema = z.object({
  idOrSlug: z.string().min(1),
  effectiveDate: z.string().datetime().optional(),
});

export const CheckDuplicateSchema = z.object({
  title: z.string().min(3),
  sourceUrl: SafeUrlSchema,
  organizerName: z.string().min(2),
});

export const ReportSourceStatusSchema = z.object({
  idOrSlug: z.string().min(1),
  status: z.enum(["active", "closed", "broken", "unreachable"]),
  evidenceUrl: SafeUrlSchema.optional().nullable(),
  notes: z.string().optional(),
});

export const ListOpportunitiesSchema = z.object({
  category: z.enum(opportunityCategories).optional(),
  status: z.enum(opportunityStatuses).optional(),
  deliveryMode: z.enum(deliveryModes).optional(),
  search: z.string().max(100).optional(),
  closingSoonOnly: z.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  sortBy: z.enum(["publishedAt", "deadlineAt", "createdAt", "updatedAt"]).default("publishedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const BulkUpsertSchema = z.object({
  items: z.array(CreateOpportunitySchema).min(1).max(50, "Batch size capped at 50 records"),
  allowImmediatePublish: z.boolean().default(false),
});

export const CreateReportSchema = z.object({
  opportunityId: z.string().uuid().optional().nullable(),
  reason: z.enum(["closed", "outdated_info", "broken_link", "suspicious", "other"]),
  details: z.string().min(5, "Details must be at least 5 characters").max(2000),
  reporterEmail: z.string().email().optional().nullable(),
});
