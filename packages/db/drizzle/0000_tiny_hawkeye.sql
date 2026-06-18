CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" varchar(255) NOT NULL,
	"source" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"category_raw" varchar(100),
	"category_internal" varchar(50),
	"venue_name" varchar(255),
	"lat" real,
	"lng" real,
	"address_formatted" varchar(500),
	"street" varchar(255),
	"city" varchar(100),
	"state" varchar(100),
	"country" varchar(2),
	"postal_code" varchar(20),
	"start_time" timestamp with time zone,
	"end_time" timestamp with time zone,
	"price_range" varchar(100),
	"url" text,
	"cached_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "places" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" varchar(255) NOT NULL,
	"source" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"category_raw" varchar(100),
	"category_internal" varchar(50),
	"lat" real,
	"lng" real,
	"address_formatted" varchar(500),
	"street" varchar(255),
	"city" varchar(100),
	"state" varchar(100),
	"country" varchar(2),
	"postal_code" varchar(20),
	"rating" real,
	"hours" jsonb,
	"cached_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"item_type" varchar(20) NOT NULL,
	"external_id" varchar(255),
	"source" varchar(50),
	"title" varchar(255) NOT NULL,
	"venue" varchar(255),
	"start_time" timestamp with time zone,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"destination" varchar(255) NOT NULL,
	"lat" real,
	"lng" real,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"share_slug" varchar(20) NOT NULL,
	"visibility" varchar(20) DEFAULT 'public' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "trips_share_slug_unique" UNIQUE("share_slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"display_name" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
ALTER TABLE "trip_items" ADD CONSTRAINT "trip_items_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "events_external_id_source_idx" ON "events" USING btree ("external_id","source");--> statement-breakpoint
CREATE UNIQUE INDEX "places_external_id_source_idx" ON "places" USING btree ("external_id","source");