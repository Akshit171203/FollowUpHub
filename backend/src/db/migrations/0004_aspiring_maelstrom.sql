CREATE TYPE "public"."notification_severity" AS ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'CRITICAL');--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"email_enabled" boolean DEFAULT true NOT NULL,
	"in_app_enabled" boolean DEFAULT true NOT NULL,
	"types_disabled" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"quiet_hours_enabled" boolean DEFAULT false NOT NULL,
	"quiet_hours_start" varchar(5),
	"quiet_hours_end" varchar(5),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "group_key" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "severity" "notification_severity" DEFAULT 'INFO' NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "action_type" varchar(50);--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notifications_group_key_idx" ON "notifications" USING btree ("group_key");