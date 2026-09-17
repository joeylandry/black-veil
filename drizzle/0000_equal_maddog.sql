CREATE TABLE "rsvps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"attending" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"dress_acknowledged" boolean DEFAULT false NOT NULL,
	"attendance_status" text,
	"recorded_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
