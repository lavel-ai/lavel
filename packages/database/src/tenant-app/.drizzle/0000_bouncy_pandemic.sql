CREATE SCHEMA "embeddings";
--> statement-breakpoint
CREATE SCHEMA "main";
--> statement-breakpoint
CREATE SCHEMA "reference";
--> statement-breakpoint
CREATE TYPE "main"."event_status" AS ENUM('confirmed', 'tentative', 'cancelled');--> statement-breakpoint
CREATE TYPE "main"."event_type" AS ENUM('hearing', 'appointment', 'call', 'meeting', 'other');--> statement-breakpoint
CREATE TABLE "main"."users" (
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
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "main"."ai_interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"user_query" text NOT NULL,
	"query_metadata" jsonb,
	"ai_response" text NOT NULL,
	"suggested_operations" jsonb,
	"response_time" integer,
	"token_count" integer,
	"was_helpful" boolean,
	"user_feedback" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "main"."case_parties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"is_client" boolean DEFAULT false,
	"client_id" uuid,
	"corporation_id" uuid,
	"role" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"is_active" boolean DEFAULT true,
	"contact_info" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "main"."cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"state_id" integer,
	"city_id" integer,
	"type" text NOT NULL,
	"case_law_branch_id" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"status" text NOT NULL,
	"risk_level" text NOT NULL,
	"original_case_id" uuid,
	"relationship_type" text,
	"start_date" timestamp NOT NULL,
	"estimated_end_date" timestamp,
	"actual_end_date" timestamp,
	"transformation_date" timestamp,
	"lead_attorney_id" uuid NOT NULL,
	"assigned_team_id" uuid NOT NULL,
	"last_activity_at" timestamp DEFAULT now() NOT NULL,
	"last_activity_by_id" uuid NOT NULL,
	"last_activity_type" text NOT NULL,
	"documents_count" integer DEFAULT 0,
	"private_documents_count" integer DEFAULT 0,
	"tasks_count" integer DEFAULT 0,
	"pending_tasks_count" integer DEFAULT 0,
	"completed_tasks_count" integer DEFAULT 0,
	"events_count" integer DEFAULT 0,
	"upcoming_events_count" integer DEFAULT 0,
	"notes_count" integer DEFAULT 0,
	"private_notes_count" integer DEFAULT 0,
	"last_note_at" timestamp,
	"last_note_by_id" uuid,
	"comments_count" integer DEFAULT 0,
	"unread_comments_count" integer DEFAULT 0,
	"total_billable_hours" numeric(10, 2) DEFAULT '0',
	"total_non_billable_hours" numeric(10, 2) DEFAULT '0',
	"total_hours" numeric(10, 2) DEFAULT '0',
	"total_task_hours" numeric(10, 2) DEFAULT '0',
	"total_other_hours" numeric(10, 2) DEFAULT '0',
	"total_media_count" integer DEFAULT 0,
	"total_media_size" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"version" integer DEFAULT 1,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "main"."clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"client_type" varchar(50) DEFAULT 'individual' NOT NULL,
	"description" text,
	"contact_info" jsonb,
	"preferred_language" varchar(5) DEFAULT 'es',
	"portal_access" boolean DEFAULT false NOT NULL,
	"portal_access_email" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"billing_info" jsonb,
	"primary_team_id" uuid,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"deleted_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"deleted_by" uuid,
	CONSTRAINT "clients_portal_access_email_unique" UNIQUE("portal_access_email"),
	CONSTRAINT "unique_client_name" UNIQUE("name"),
	CONSTRAINT "unique_portal_email" UNIQUE("portal_access_email"),
	CONSTRAINT "portal_email_check" CHECK (portal_access_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}$')
);
--> statement-breakpoint
CREATE TABLE "main"."corporations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"rfc" varchar(13),
	"constitution_date" timestamp with time zone,
	"notary_number" integer,
	"notary_state" varchar(100),
	"instrument_number" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	CONSTRAINT "unique_name_per_client" UNIQUE("client_id","name")
);
--> statement-breakpoint
CREATE TABLE "main"."court_participations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"party_id" uuid NOT NULL,
	"court_role" text NOT NULL,
	"service_date" timestamp,
	"appearance_date" timestamp,
	"service_status" text,
	"appearance_status" text,
	"has_appearance" boolean DEFAULT false,
	"represented_by" text,
	"last_action_date" timestamp,
	"next_action_deadline" timestamp,
	"process_status" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "main"."document_operations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"operation_type" text NOT NULL,
	"operation_data" jsonb NOT NULL,
	"position" jsonb NOT NULL,
	"sequence_number" integer NOT NULL,
	"ai_suggested" boolean DEFAULT false,
	"ai_context" jsonb,
	"ai_interaction_id" uuid,
	"status" text DEFAULT 'pending' NOT NULL,
	"resolved_at" timestamp with time zone,
	"resolved_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	CONSTRAINT "document_operations_document_id_sequence_number_unique" UNIQUE("document_id","sequence_number")
);
--> statement-breakpoint
CREATE TABLE "main"."document_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"cursor_position" jsonb,
	"selection_range" jsonb,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_active_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"client_info" jsonb,
	CONSTRAINT "document_sessions_document_id_user_id_unique" UNIQUE("document_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "main"."documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"tiptap_content" jsonb NOT NULL,
	"document_type" text NOT NULL,
	"is_template" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"language" text DEFAULT 'es' NOT NULL,
	"case_id" uuid,
	"effective_date" date,
	"expiration_date" date,
	"signature_date" date,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"version_count" integer DEFAULT 1 NOT NULL,
	"word_count" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid
);
--> statement-breakpoint
CREATE TABLE "main"."events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"is_all_day" boolean DEFAULT false NOT NULL,
	"location" varchar(255),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"status" "main"."event_status" DEFAULT 'confirmed' NOT NULL,
	"recurrence_rule" text,
	"organizer_id" uuid NOT NULL,
	"timezone" varchar(50) DEFAULT 'UTC' NOT NULL,
	"color" varchar(7),
	"metadata" jsonb,
	"case_id" uuid,
	"event_type" "main"."event_type" DEFAULT 'appointment' NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "main"."litigation_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"courthouse_id" integer,
	"filing_number" text,
	"filing_date" timestamp,
	"admission_date" timestamp,
	"service_date" timestamp,
	"first_hearing_date" timestamp,
	"next_hearing_date" timestamp,
	"proceeding_type" text NOT NULL,
	"current_stage" text NOT NULL,
	"claim_amount" numeric(15, 2),
	"date_of_calculation" timestamp,
	"real_cost" numeric(10, 2),
	"hearings_count" numeric DEFAULT '0',
	"next_deadline" timestamp,
	"response_deadline" timestamp,
	"appeal_deadline" timestamp,
	"special_instructions" text,
	"required_documents" text,
	"total_court_hours" numeric(10, 2) DEFAULT '0',
	"total_preparation_hours" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"version" numeric DEFAULT '1'
);
--> statement-breakpoint
CREATE TABLE "main"."mentions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_type" text NOT NULL,
	"source_id" uuid NOT NULL,
	"mentioned_user_id" uuid NOT NULL,
	"context" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "main"."notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text,
	"message" text,
	"metadata" jsonb,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "main"."tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid,
	"assigned_by" uuid NOT NULL,
	"assigned_to" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"due_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "main"."team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"role" varchar(50) DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	"deleted_by" uuid,
	CONSTRAINT "team_members_team_id_profile_id_unique" UNIQUE("team_id","profile_id")
);
--> statement-breakpoint
CREATE TABLE "main"."teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	"deleted_by" uuid
);
--> statement-breakpoint
CREATE TABLE "main"."time_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" uuid NOT NULL,
	"time_spent" interval NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "main"."transcriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"transcription" text NOT NULL,
	"summary" text,
	"video_url" text NOT NULL,
	"video_duration" integer NOT NULL,
	"transcription_provider_id" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_processed" boolean DEFAULT false NOT NULL,
	"is_private" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reference"."states" (
	"id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "reference"."states_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "states_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "reference"."cities" (
	"id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "reference"."cities_id2_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"state_id" integer,
	CONSTRAINT "cities_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "reference"."law_branches" (
	"id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "reference"."law_branches_id2_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "law_branches_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "reference"."jurisdictions" (
	"id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "reference"."jurisdictions_id2_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "jurisdictions_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "reference"."courthouses" (
	"id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "reference"."courthouses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"contact_info" jsonb,
	"judicial_district" text,
	"city_id" integer,
	"law_branch_id" integer,
	"parent_id" integer,
	"jurisdiction_id" integer,
	"abbreviation" text,
	"state_id" integer,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL,
	CONSTRAINT "courthouses_city_id_unique" UNIQUE("city_id"),
	CONSTRAINT "courthouses_law_branch_id_unique" UNIQUE("law_branch_id"),
	CONSTRAINT "courthouses_jurisdiction_id_unique" UNIQUE("jurisdiction_id"),
	CONSTRAINT "courthouses_state_id_unique" UNIQUE("state_id")
);
--> statement-breakpoint
CREATE TABLE "reference"."trial_stages" (
	"id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "reference"."trial_stages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar NOT NULL,
	"description" text,
	"order" integer,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
	CONSTRAINT "trial_stages_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "reference"."trial_types" (
	"id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "reference"."trial_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
	"law_branch_id" integer
);
--> statement-breakpoint
CREATE TABLE "reference"."trial_stages_types" (
	"trial_stage_id" integer NOT NULL,
	"trial_type_id" integer NOT NULL,
	CONSTRAINT "trial_stages_types_trial_stage_id_trial_type_id_pk" PRIMARY KEY("trial_stage_id","trial_type_id")
);
--> statement-breakpoint
ALTER TABLE "main"."ai_interactions" ADD CONSTRAINT "ai_interactions_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "main"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."ai_interactions" ADD CONSTRAINT "ai_interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."case_parties" ADD CONSTRAINT "case_parties_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "main"."cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."case_parties" ADD CONSTRAINT "case_parties_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "main"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."case_parties" ADD CONSTRAINT "case_parties_corporation_id_corporations_id_fk" FOREIGN KEY ("corporation_id") REFERENCES "main"."corporations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."case_parties" ADD CONSTRAINT "case_parties_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."case_parties" ADD CONSTRAINT "case_parties_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."cases" ADD CONSTRAINT "cases_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "reference"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."cases" ADD CONSTRAINT "cases_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "reference"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."cases" ADD CONSTRAINT "cases_case_law_branch_id_law_branches_id_fk" FOREIGN KEY ("case_law_branch_id") REFERENCES "reference"."law_branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."cases" ADD CONSTRAINT "cases_original_case_id_cases_id_fk" FOREIGN KEY ("original_case_id") REFERENCES "main"."cases"("id") ON DELETE set null ON UPDATE set null;--> statement-breakpoint
ALTER TABLE "main"."cases" ADD CONSTRAINT "cases_lead_attorney_id_users_id_fk" FOREIGN KEY ("lead_attorney_id") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."cases" ADD CONSTRAINT "cases_assigned_team_id_teams_id_fk" FOREIGN KEY ("assigned_team_id") REFERENCES "main"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."cases" ADD CONSTRAINT "cases_last_activity_by_id_users_id_fk" FOREIGN KEY ("last_activity_by_id") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."cases" ADD CONSTRAINT "cases_last_note_by_id_users_id_fk" FOREIGN KEY ("last_note_by_id") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."cases" ADD CONSTRAINT "cases_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."cases" ADD CONSTRAINT "cases_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."clients" ADD CONSTRAINT "clients_primary_team_id_teams_id_fk" FOREIGN KEY ("primary_team_id") REFERENCES "main"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."clients" ADD CONSTRAINT "clients_created_by_auth_users_id" FOREIGN KEY ("created_by") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."clients" ADD CONSTRAINT "clients_updated_by_auth_users_id" FOREIGN KEY ("updated_by") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."clients" ADD CONSTRAINT "clients_primary_team_id_fkey" FOREIGN KEY ("primary_team_id") REFERENCES "main"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."corporations" ADD CONSTRAINT "corporations_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "main"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."corporations" ADD CONSTRAINT "corporations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."corporations" ADD CONSTRAINT "corporations_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."court_participations" ADD CONSTRAINT "court_participations_party_id_case_parties_id_fk" FOREIGN KEY ("party_id") REFERENCES "main"."case_parties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."court_participations" ADD CONSTRAINT "court_participations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."court_participations" ADD CONSTRAINT "court_participations_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."document_operations" ADD CONSTRAINT "document_operations_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "main"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."document_operations" ADD CONSTRAINT "document_operations_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."document_operations" ADD CONSTRAINT "document_operations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."document_sessions" ADD CONSTRAINT "document_sessions_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "main"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."document_sessions" ADD CONSTRAINT "document_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."documents" ADD CONSTRAINT "documents_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "main"."cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."documents" ADD CONSTRAINT "documents_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."documents" ADD CONSTRAINT "documents_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."documents" ADD CONSTRAINT "documents_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."events" ADD CONSTRAINT "fk_events_case" FOREIGN KEY ("case_id") REFERENCES "main"."cases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."events" ADD CONSTRAINT "fk_events_created_by" FOREIGN KEY ("created_by") REFERENCES "main"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."events" ADD CONSTRAINT "fk_events_updated_by" FOREIGN KEY ("updated_by") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."litigation_details" ADD CONSTRAINT "litigation_details_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "main"."cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."litigation_details" ADD CONSTRAINT "litigation_details_courthouse_id_courthouses_id_fk" FOREIGN KEY ("courthouse_id") REFERENCES "reference"."courthouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."litigation_details" ADD CONSTRAINT "litigation_details_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."litigation_details" ADD CONSTRAINT "litigation_details_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."mentions" ADD CONSTRAINT "mentions_mentioned_user_id_users_id_fk" FOREIGN KEY ("mentioned_user_id") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."tasks" ADD CONSTRAINT "tasks_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "main"."cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."tasks" ADD CONSTRAINT "tasks_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."tasks" ADD CONSTRAINT "tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "main"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."team_members" ADD CONSTRAINT "team_members_profile_id_users_id_fk" FOREIGN KEY ("profile_id") REFERENCES "main"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."team_members" ADD CONSTRAINT "team_members_created_by_users_in_auth_id" FOREIGN KEY ("created_by") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."team_members" ADD CONSTRAINT "team_members_updated_by_users_in_auth_id" FOREIGN KEY ("updated_by") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."teams" ADD CONSTRAINT "teams_created_by_users_in_auth_id" FOREIGN KEY ("created_by") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."teams" ADD CONSTRAINT "teams_updated_by_users_in_auth_id" FOREIGN KEY ("updated_by") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."time_entries" ADD CONSTRAINT "time_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."transcriptions" ADD CONSTRAINT "transcriptions_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "main"."cases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."transcriptions" ADD CONSTRAINT "transcriptions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."transcriptions" ADD CONSTRAINT "transcriptions_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "main"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reference"."cities" ADD CONSTRAINT "cities_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "reference"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reference"."courthouses" ADD CONSTRAINT "courthouses_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "reference"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reference"."courthouses" ADD CONSTRAINT "courthouses_jurisdiction_id_fkey" FOREIGN KEY ("jurisdiction_id") REFERENCES "reference"."jurisdictions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reference"."courthouses" ADD CONSTRAINT "courthouses_law_branch_id_fkey" FOREIGN KEY ("law_branch_id") REFERENCES "reference"."law_branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reference"."courthouses" ADD CONSTRAINT "courthouses_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "reference"."courthouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reference"."courthouses" ADD CONSTRAINT "courthouses_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "reference"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reference"."trial_types" ADD CONSTRAINT "trial_types_law_branch_id_fkey" FOREIGN KEY ("law_branch_id") REFERENCES "reference"."law_branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reference"."trial_stages_types" ADD CONSTRAINT "trial_stages_types_trial_stage_id_trial_stages_id_fk" FOREIGN KEY ("trial_stage_id") REFERENCES "reference"."trial_stages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reference"."trial_stages_types" ADD CONSTRAINT "trial_stages_types_trial_type_id_trial_types_id_fk" FOREIGN KEY ("trial_type_id") REFERENCES "reference"."trial_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_events_end_time" ON "main"."events" USING btree ("end_time");--> statement-breakpoint
CREATE INDEX "idx_events_organizer_id" ON "main"."events" USING btree ("organizer_id");--> statement-breakpoint
CREATE INDEX "idx_events_start_time" ON "main"."events" USING btree ("start_time");