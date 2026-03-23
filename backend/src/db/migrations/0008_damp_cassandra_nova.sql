CREATE TYPE "public"."jira_sync_status" AS ENUM('SUCCESS', 'FAILED');--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'JIRA_TICKET_REMINDER';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'JIRA_TICKET_ESCALATED';--> statement-breakpoint
CREATE TABLE "jira_sync_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "jira_sync_status" NOT NULL,
	"tickets_synced" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "followups" ADD COLUMN "external_source" varchar(50);--> statement-breakpoint
ALTER TABLE "followups" ADD COLUMN "external_id" varchar(255);--> statement-breakpoint
ALTER TABLE "followups" ADD COLUMN "external_url" text;--> statement-breakpoint
ALTER TABLE "followups" ADD COLUMN "last_manager_notified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "jira_email" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "jira_domain" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "jira_api_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "manager_email" varchar(255);--> statement-breakpoint
ALTER TABLE "jira_sync_logs" ADD CONSTRAINT "jira_sync_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "jira_sync_logs_user_id_idx" ON "jira_sync_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "jira_sync_logs_status_idx" ON "jira_sync_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "followups_external_id_source_idx" ON "followups" USING btree ("external_id","external_source");