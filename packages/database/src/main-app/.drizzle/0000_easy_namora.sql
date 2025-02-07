CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"clerk_id" text NOT NULL,
	"signup_status" text DEFAULT 'awaiting_org',
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"image_url" text,
	"email_verified" boolean DEFAULT false,
	"welcome_email_sent" boolean DEFAULT false,
	"status" text DEFAULT 'active',
	"last_sign_in" timestamp with time zone,
	"is_active" boolean DEFAULT true,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_id_unique" UNIQUE("id"),
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar NOT NULL,
	"organization_id" uuid NOT NULL,
	"connection_url" varchar,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text,
	"name" text,
	"slug" text,
	"logo_url" text,
	"status" text DEFAULT 'active',
	"has_project" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "organizations_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid,
	"user_id" uuid,
	"role" text DEFAULT 'member',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;