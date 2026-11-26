CREATE TYPE "public"."workspace_role" AS ENUM('owner', 'administrator', 'compliance_manager', 'contributor', 'reviewer', 'viewer', 'external_adviser');--> statement-breakpoint
CREATE TABLE "workspace_member_entities" (
	"member_id" uuid NOT NULL,
	"entity_id" uuid NOT NULL,
	CONSTRAINT "workspace_member_entities_member_id_entity_id_pk" PRIMARY KEY("member_id","entity_id")
);
--> statement-breakpoint
CREATE TABLE "workspace_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"startup_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "workspace_role" NOT NULL,
	"entity_scope" varchar(16) DEFAULT 'all' NOT NULL,
	"invited_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workspace_member_entities" ADD CONSTRAINT "workspace_member_entities_member_id_workspace_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."workspace_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_member_entities" ADD CONSTRAINT "workspace_member_entities_entity_id_entity_structures_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entity_structures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "workspace_member_entities_entity_idx" ON "workspace_member_entities" USING btree ("entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_members_startup_user_uniq" ON "workspace_members" USING btree ("startup_id","user_id");--> statement-breakpoint
CREATE INDEX "workspace_members_user_idx" ON "workspace_members" USING btree ("user_id");--> statement-breakpoint
-- Backfill: every existing workspace creator becomes its owner member.
INSERT INTO "workspace_members" ("startup_id", "user_id", "role", "entity_scope")
SELECT "id", "user_id", 'owner', 'all' FROM "startups"
ON CONFLICT ("startup_id", "user_id") DO NOTHING;
