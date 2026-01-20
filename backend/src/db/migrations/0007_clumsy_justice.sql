CREATE TYPE "public"."email_template_type" AS ENUM('REMINDER', 'ESCALATION', 'DIGEST');--> statement-breakpoint
CREATE TYPE "public"."todo_status" AS ENUM('PENDING', 'DONE');--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'TODO_REMINDER';--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"type" "email_template_type" NOT NULL,
	"subject" varchar(255) NOT NULL,
	"body_html" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "todos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"notes" text,
	"status" "todo_status" DEFAULT 'PENDING' NOT NULL,
	"for_date" timestamp NOT NULL,
	"remind_at" timestamp with time zone,
	"last_reminded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "email_templates_user_id_idx" ON "email_templates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_templates_type_idx" ON "email_templates" USING btree ("type");--> statement-breakpoint
CREATE INDEX "todos_user_id_for_date_idx" ON "todos" USING btree ("user_id","for_date");--> statement-breakpoint
CREATE INDEX "todos_user_id_status_idx" ON "todos" USING btree ("user_id","status");