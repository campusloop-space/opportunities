import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const opportunityCategories = [
  "internships",
  "hackathons",
  "scholarships",
  "fellowships",
  "research",
  "competitions",
  "student_programs",
] as const;

export type OpportunityCategory = (typeof opportunityCategories)[number];

export const opportunityStatuses = [
  "draft",
  "published",
  "closed",
  "expired",
  "rejected",
] as const;

export type OpportunityStatus = (typeof opportunityStatuses)[number];

export const deliveryModes = ["remote", "in_person", "hybrid", "unknown"] as const;
export type DeliveryMode = (typeof deliveryModes)[number];

export const sourceMethods = [
  "official",
  "organizer_submitted",
  "editorial",
  "imported",
] as const;
export type SourceMethod = (typeof sourceMethods)[number];

export const opportunities = pgTable(
  "opportunities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 500 }).notNull(),
    summary: text("summary").notNull(),
    description: text("description").notNull(),
    category: varchar("category", { length: 50 }).notNull(), // One of opportunityCategories
    tags: jsonb("tags").$type<string[]>().default([]).notNull(),
    organizerName: varchar("organizer_name", { length: 255 }).notNull(),
    organizerWebsite: text("organizer_website"),
    sourceUrl: text("source_url").notNull(),
    applicationUrl: text("application_url").notNull(),
    location: varchar("location", { length: 255 }).default("Worldwide"),
    deliveryMode: varchar("delivery_mode", { length: 50 }).default("unknown").notNull(), // remote, in_person, hybrid, unknown
    eligibilitySummary: text("eligibility_summary"),
    
    // Structured eligibility
    eligibleDegrees: jsonb("eligible_degrees").$type<string[]>().default([]),
    eligibleYears: jsonb("eligible_years").$type<string[]>().default([]),
    eligibleFields: jsonb("eligible_fields").$type<string[]>().default([]),
    eligibleCountries: jsonb("eligible_countries").$type<string[]>().default([]),
    
    // Grounded benefits & awards
    benefitsSummary: text("benefits_summary"),
    stipendAmount: varchar("stipend_amount", { length: 100 }),
    stipendCurrency: varchar("stipend_currency", { length: 10 }), // e.g. INR, USD
    
    // Dates & Deadlines
    applicationOpensAt: timestamp("application_opens_at", { withTimezone: true }),
    deadlineAt: timestamp("deadline_at", { withTimezone: true }),
    deadlineTimezone: varchar("deadline_timezone", { length: 100 }),
    rollingDeadline: boolean("rolling_deadline").default(false).notNull(),
    
    // Lifecycle Status
    status: varchar("status", { length: 50 }).default("draft").notNull(), // draft, published, closed, expired, rejected
    sourceCheckedAt: timestamp("source_checked_at", { withTimezone: true }).defaultNow().notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow(),
    closedReason: text("closed_reason"),
    
    // Provenance & Audit
    sourceMethod: varchar("source_method", { length: 50 }).default("imported").notNull(),
    sourceNotes: text("source_notes"),
    contentHash: varchar("content_hash", { length: 128 }),
    createdBy: varchar("created_by", { length: 100 }).default("system"),
    updatedBy: varchar("updated_by", { length: 100 }).default("system"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_opportunities_slug").on(table.slug),
    index("idx_opportunities_status").on(table.status),
    index("idx_opportunities_category").on(table.category),
    index("idx_opportunities_deadline").on(table.deadlineAt),
    index("idx_opportunities_published_at").on(table.publishedAt),
    index("idx_opportunities_delivery_mode").on(table.deliveryMode),
    index("idx_opportunities_source_url").on(table.sourceUrl),
    index("idx_opportunities_status_category").on(table.status, table.category),
    index("idx_opportunities_status_deadline").on(table.status, table.deadlineAt),
  ]
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sub: varchar("sub", { length: 255 }).notNull().unique(), // Stable pairwise subject from CampusLoop OIDC
    name: varchar("name", { length: 255 }),
    preferredUsername: varchar("preferred_username", { length: 255 }),
    email: varchar("email", { length: 255 }),
    picture: text("picture"),
    studentVerified: boolean("student_verified").default(false).notNull(),
    verificationMethod: varchar("verification_method", { length: 100 }),
    collegeId: varchar("college_id", { length: 100 }),
    collegeName: varchar("college_name", { length: 255 }),
    collegeSlug: varchar("college_slug", { length: 255 }),
    collegeState: varchar("college_state", { length: 100 }),
    branch: varchar("branch", { length: 255 }),
    degree: varchar("degree", { length: 255 }),
    year: varchar("year", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_users_sub").on(table.sub),
    index("idx_users_email").on(table.email),
    index("idx_users_student_verified").on(table.studentVerified),
  ]
);

export const savedOpportunities = pgTable(
  "saved_opportunities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userSub: varchar("user_sub", { length: 255 })
      .notNull()
      .references(() => users.sub, { onDelete: "cascade" }),
    opportunityId: uuid("opportunity_id")
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_saved_opp_user_opp").on(table.userSub, table.opportunityId),
    index("idx_saved_opp_user").on(table.userSub),
    index("idx_saved_opp_opportunity").on(table.opportunityId),
  ]
);

export const opportunityAuditLogs = pgTable(
  "opportunity_audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    opportunityId: uuid("opportunity_id").references(() => opportunities.id, {
      onDelete: "cascade",
    }),
    action: varchar("action", { length: 50 }).notNull(), // create, update, publish, close, expire, delete
    actorType: varchar("actor_type", { length: 50 }).notNull(), // mcp_agent, admin, system
    actorId: varchar("actor_id", { length: 100 }),
    changes: jsonb("changes").$type<Record<string, unknown>>().default({}),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_audit_logs_opportunity_id").on(table.opportunityId),
    index("idx_audit_logs_created_at").on(table.createdAt),
    index("idx_audit_logs_actor").on(table.actorType, table.actorId),
  ]
);

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    opportunityId: uuid("opportunity_id").references(() => opportunities.id, {
      onDelete: "set null",
    }),
    reason: varchar("reason", { length: 100 }).notNull(), // closed, outdated_info, broken_link, suspicious, other
    details: text("details"),
    reporterEmail: varchar("reporter_email", { length: 255 }),
    reporterSub: varchar("reporter_sub", { length: 255 }),
    status: varchar("status", { length: 50 }).default("pending").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_reports_opportunity_id").on(table.opportunityId),
    index("idx_reports_status").on(table.status),
  ]
);

export type Opportunity = typeof opportunities.$inferSelect;
export type NewOpportunity = typeof opportunities.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type SavedOpportunity = typeof savedOpportunities.$inferSelect;
export type NewSavedOpportunity = typeof savedOpportunities.$inferInsert;
export type OpportunityAuditLog = typeof opportunityAuditLogs.$inferSelect;
export type NewOpportunityAuditLog = typeof opportunityAuditLogs.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
