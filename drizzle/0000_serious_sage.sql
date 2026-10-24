CREATE TABLE "opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(500) NOT NULL,
	"summary" text NOT NULL,
	"description" text NOT NULL,
	"category" varchar(50) NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"organizer_name" varchar(255) NOT NULL,
	"organizer_website" text,
	"source_url" text NOT NULL,
	"application_url" text NOT NULL,
	"location" varchar(255) DEFAULT 'Worldwide',
	"delivery_mode" varchar(50) DEFAULT 'unknown' NOT NULL,
	"eligibility_summary" text,
	"eligible_degrees" jsonb DEFAULT '[]'::jsonb,
	"eligible_years" jsonb DEFAULT '[]'::jsonb,
	"eligible_fields" jsonb DEFAULT '[]'::jsonb,
	"eligible_countries" jsonb DEFAULT '[]'::jsonb,
	"benefits_summary" text,
	"stipend_amount" varchar(100),
	"stipend_currency" varchar(10),
	"application_opens_at" timestamp with time zone,
	"deadline_at" timestamp with time zone,
	"deadline_timezone" varchar(100),
	"rolling_deadline" boolean DEFAULT false NOT NULL,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"source_checked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	"last_seen_at" timestamp with time zone DEFAULT now(),
	"closed_reason" text,
	"source_method" varchar(50) DEFAULT 'imported' NOT NULL,
	"source_notes" text,
	"content_hash" varchar(128),
	"created_by" varchar(100) DEFAULT 'system',
	"updated_by" varchar(100) DEFAULT 'system',
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "opportunities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "opportunity_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid,
	"action" varchar(50) NOT NULL,
	"actor_type" varchar(50) NOT NULL,
	"actor_id" varchar(100),
	"changes" jsonb DEFAULT '{}'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opportunity_id" uuid,
	"reason" varchar(100) NOT NULL,
	"details" text,
	"reporter_email" varchar(255),
	"reporter_sub" varchar(255),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_sub" varchar(255) NOT NULL,
	"opportunity_id" uuid NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sub" varchar(255) NOT NULL,
	"name" varchar(255),
	"preferred_username" varchar(255),
	"email" varchar(255),
	"picture" text,
	"student_verified" boolean DEFAULT false NOT NULL,
	"verification_method" varchar(100),
	"college_id" varchar(100),
	"college_name" varchar(255),
	"college_slug" varchar(255),
	"college_state" varchar(100),
	"branch" varchar(255),
	"degree" varchar(255),
	"year" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_sub_unique" UNIQUE("sub")
);
--> statement-breakpoint
ALTER TABLE "opportunity_audit_logs" ADD CONSTRAINT "opportunity_audit_logs_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_opportunities" ADD CONSTRAINT "saved_opportunities_user_sub_users_sub_fk" FOREIGN KEY ("user_sub") REFERENCES "public"."users"("sub") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_opportunities" ADD CONSTRAINT "saved_opportunities_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_opportunities_slug" ON "opportunities" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_opportunities_status" ON "opportunities" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_opportunities_category" ON "opportunities" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_opportunities_deadline" ON "opportunities" USING btree ("deadline_at");--> statement-breakpoint
CREATE INDEX "idx_opportunities_published_at" ON "opportunities" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "idx_opportunities_delivery_mode" ON "opportunities" USING btree ("delivery_mode");--> statement-breakpoint
CREATE INDEX "idx_opportunities_source_url" ON "opportunities" USING btree ("source_url");--> statement-breakpoint
CREATE INDEX "idx_opportunities_status_category" ON "opportunities" USING btree ("status","category");--> statement-breakpoint
CREATE INDEX "idx_opportunities_status_deadline" ON "opportunities" USING btree ("status","deadline_at");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_opportunity_id" ON "opportunity_audit_logs" USING btree ("opportunity_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_created_at" ON "opportunity_audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_actor" ON "opportunity_audit_logs" USING btree ("actor_type","actor_id");--> statement-breakpoint
CREATE INDEX "idx_reports_opportunity_id" ON "reports" USING btree ("opportunity_id");--> statement-breakpoint
CREATE INDEX "idx_reports_status" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_saved_opp_user_opp" ON "saved_opportunities" USING btree ("user_sub","opportunity_id");--> statement-breakpoint
CREATE INDEX "idx_saved_opp_user" ON "saved_opportunities" USING btree ("user_sub");--> statement-breakpoint
CREATE INDEX "idx_saved_opp_opportunity" ON "saved_opportunities" USING btree ("opportunity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_sub" ON "users" USING btree ("sub");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_student_verified" ON "users" USING btree ("student_verified");