CREATE TYPE "public"."event_type" AS ENUM('CREATED', 'REMINDER_SENT', 'SNOOZED', 'RESCHEDULED', 'ESCALATED', 'DONE');--> statement-breakpoint
CREATE TYPE "public"."followup_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT');--> statement-breakpoint
CREATE TYPE "public"."followup_status" AS ENUM('PENDING', 'SNOOZED', 'ESCALATED', 'DONE');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('FOLLOWUP_DUE', 'FOLLOWUP_ESCALATED', 'REMINDER_SENT');--> statement-breakpoint
CREATE TYPE "public"."reminder_policy" AS ENUM('NORMAL', 'PERSISTENT', 'AGGRESSIVE');--> statement-breakpoint
CREATE TABLE "followup_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"followup_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"event_type" "event_type" NOT NULL,
	"message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "followups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"target" varchar(255),
	"notes" text,
	"due_at" timestamp with time zone NOT NULL,
	"status" "followup_status" DEFAULT 'PENDING' NOT NULL,
	"priority" "followup_priority" DEFAULT 'MEDIUM' NOT NULL,
	"reminder_policy" "reminder_policy" DEFAULT 'NORMAL' NOT NULL,
	"ignore_count" integer DEFAULT 0 NOT NULL,
	"escalation_level" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"followup_id" uuid,
	"type" "notification_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"body" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "events_followup_id_idx" ON "followup_events" USING btree ("followup_id");--> statement-breakpoint
CREATE INDEX "followups_user_id_idx" ON "followups" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "followups_due_at_idx" ON "followups" USING btree ("due_at");--> statement-breakpoint
CREATE INDEX "followups_status_idx" ON "followups" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_is_read_idx" ON "notifications" USING btree ("is_read");