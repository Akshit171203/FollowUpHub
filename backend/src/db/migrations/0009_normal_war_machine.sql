ALTER TABLE "followups" ADD COLUMN "ai_draft" text;--> statement-breakpoint
ALTER TABLE "followups" ADD COLUMN "is_ai_generated" boolean DEFAULT false NOT NULL;