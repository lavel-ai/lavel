ALTER TABLE "main"."team_members" DROP CONSTRAINT "team_members_team_id_profile_id_unique";--> statement-breakpoint
ALTER TABLE "main"."team_members" DROP CONSTRAINT "team_members_profile_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "main"."time_entries" DROP CONSTRAINT "time_entries_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "main"."time_entries" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "main"."team_members" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "main"."team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "main"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."team_members" DROP COLUMN "profile_id";--> statement-breakpoint
ALTER TABLE "main"."team_members" ADD CONSTRAINT "team_members_team_id_user_id_unique" UNIQUE("team_id","user_id");