CREATE TABLE "followup_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"title" varchar(255) NOT NULL,
	"target" varchar(255),
	"notes" text,
	"default_due_offset_minutes" integer DEFAULT 1440 NOT NULL,
	"default_priority" "followup_priority" DEFAULT 'MEDIUM' NOT NULL,
	"default_reminder_policy" "reminder_policy" DEFAULT 'NORMAL' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "templates_user_id_idx" ON "followup_templates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "templates_name_idx" ON "followup_templates" USING btree ("name");