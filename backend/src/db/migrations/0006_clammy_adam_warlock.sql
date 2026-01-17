ALTER TYPE "public"."notification_type" ADD VALUE 'FOLLOWUP_CREATED' BEFORE 'REMINDER_SENT';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'FOLLOWUP_DONE' BEFORE 'REMINDER_SENT';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'FOLLOWUP_SNOOZED' BEFORE 'REMINDER_SENT';