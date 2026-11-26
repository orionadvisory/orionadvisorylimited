ALTER TABLE "entity_structures" ADD COLUMN "trading_name" varchar(255);--> statement-breakpoint
ALTER TABLE "entity_structures" ADD COLUMN "state" varchar(255);--> statement-breakpoint
ALTER TABLE "entity_structures" ADD COLUMN "registration_number" varchar(255);--> statement-breakpoint
ALTER TABLE "entity_structures" ADD COLUMN "registered_address" text;--> statement-breakpoint
ALTER TABLE "entity_structures" ADD COLUMN "industry" varchar(255);--> statement-breakpoint
ALTER TABLE "entity_structures" ADD COLUMN "financial_year_end" varchar(5);--> statement-breakpoint
ALTER TABLE "entity_structures" ADD COLUMN "tax_id" varchar(255);--> statement-breakpoint
ALTER TABLE "entity_structures" ADD COLUMN "status" varchar(32) DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "entity_structures" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;