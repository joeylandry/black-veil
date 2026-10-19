CREATE TABLE "game_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"guest_id" uuid NOT NULL,
	"by_guest_id" uuid,
	"sold" boolean,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_flags" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_grades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guest_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"item_id" text NOT NULL,
	"verdict" text NOT NULL,
	"points" integer NOT NULL,
	"max" integer NOT NULL,
	"rationale" text DEFAULT '' NOT NULL,
	"needs_review" boolean DEFAULT false NOT NULL,
	"source" text DEFAULT 'auto' NOT NULL,
	"graded_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "game_grades_item_unique" UNIQUE("guest_id","kind","item_id")
);
--> statement-breakpoint
CREATE TABLE "game_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guest_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"item_id" text NOT NULL,
	"answer" text NOT NULL,
	"proof" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "game_key" text;--> statement-breakpoint
ALTER TABLE "game_events" ADD CONSTRAINT "game_events_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_events" ADD CONSTRAINT "game_events_by_guest_id_guests_id_fk" FOREIGN KEY ("by_guest_id") REFERENCES "public"."guests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_grades" ADD CONSTRAINT "game_grades_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_submissions" ADD CONSTRAINT "game_submissions_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "game_events_one_sale" ON "game_events" USING btree ("kind") WHERE "game_events"."kind" = 'vial-sold';--> statement-breakpoint
CREATE INDEX "game_events_kind" ON "game_events" USING btree ("kind","created_at");--> statement-breakpoint
CREATE INDEX "game_submissions_lookup" ON "game_submissions" USING btree ("guest_id","kind","item_id","created_at");--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_game_key_unique" UNIQUE("game_key");