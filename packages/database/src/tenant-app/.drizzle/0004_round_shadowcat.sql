CREATE TABLE "profile_practice_areas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"law_branch_id" integer NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"experience_years" integer,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	"deleted_by" uuid,
	CONSTRAINT "profile_practice_areas_profile_id_law_branch_id_unique" UNIQUE("profile_id","law_branch_id")
);
--> statement-breakpoint
CREATE TABLE "team_practice_areas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"law_branch_id" integer NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	"deleted_by" uuid,
	CONSTRAINT "team_practice_areas_team_id_law_branch_id_unique" UNIQUE("team_id","law_branch_id")
);
--> statement-breakpoint
ALTER TABLE "departments" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "departments" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "departments" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "law_branches" ADD COLUMN "description" varchar(500);--> statement-breakpoint
ALTER TABLE "law_branches" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "law_branches" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "law_branches" ADD COLUMN "created_by" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "law_branches" ADD COLUMN "updated_by" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "law_branches" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "profile_practice_areas" ADD CONSTRAINT "profile_practice_areas_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_practice_areas" ADD CONSTRAINT "profile_practice_areas_law_branch_id_law_branches_id_fk" FOREIGN KEY ("law_branch_id") REFERENCES "public"."law_branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_practice_areas" ADD CONSTRAINT "profile_practice_areas_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_practice_areas" ADD CONSTRAINT "profile_practice_areas_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_practice_areas" ADD CONSTRAINT "profile_practice_areas_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_practice_areas" ADD CONSTRAINT "team_practice_areas_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_practice_areas" ADD CONSTRAINT "team_practice_areas_law_branch_id_law_branches_id_fk" FOREIGN KEY ("law_branch_id") REFERENCES "public"."law_branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_practice_areas" ADD CONSTRAINT "team_practice_areas_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_practice_areas" ADD CONSTRAINT "team_practice_areas_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_practice_areas" ADD CONSTRAINT "team_practice_areas_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN "practice_area";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "practice_area";