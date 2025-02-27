ALTER TABLE "clients" DROP CONSTRAINT "clients_primary_lawyer_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "status" SET DEFAULT 'prospecto';--> statement-breakpoint
ALTER TABLE "client_addresses" ADD COLUMN "is_primary" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "industry" varchar(255) DEFAULT 'Not specified';--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "lead_lawyer_id" uuid;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "billing_name" varchar(255);--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "billing_email" varchar(255);--> statement-breakpoint
ALTER TABLE "client_addresses" ADD CONSTRAINT "client_addresses_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_addresses" ADD CONSTRAINT "client_addresses_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_lead_lawyer_id_profiles_id_fk" FOREIGN KEY ("lead_lawyer_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "primary_lawyer_id";--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_name_unique" UNIQUE("name");