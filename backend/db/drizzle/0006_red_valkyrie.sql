CREATE TABLE "compliance_obligations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"startup_id" uuid NOT NULL,
	"entity_id" uuid NOT NULL,
	"rule_id" uuid,
	"title" varchar(500) NOT NULL,
	"regulator" varchar(255),
	"category" varchar(100) NOT NULL,
	"status" varchar(40) DEFAULT 'needs_confirmation' NOT NULL,
	"due_at" timestamp,
	"date_status" varchar(32) DEFAULT 'pending_confirmation' NOT NULL,
	"explanation" text,
	"source" varchar(32) DEFAULT 'user' NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "compliance_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_key" varchar(255) NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"name" varchar(500) NOT NULL,
	"regulator" varchar(255),
	"jurisdiction" varchar(255) NOT NULL,
	"applicability" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"calculation" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"explanation" text,
	"official_source" text,
	"effective_at" timestamp,
	"verified_at" timestamp,
	"publication_status" varchar(32) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "compliance_obligations" ADD CONSTRAINT "compliance_obligations_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_obligations" ADD CONSTRAINT "compliance_obligations_entity_id_entity_structures_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entity_structures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_obligations" ADD CONSTRAINT "compliance_obligations_rule_id_compliance_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."compliance_rules"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "compliance_rules_key_version_uniq" ON "compliance_rules" USING btree ("rule_key","version");