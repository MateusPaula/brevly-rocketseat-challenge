CREATE TABLE "links" (
	"short_url" text PRIMARY KEY NOT NULL,
	"original_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"visits" integer DEFAULT 0 NOT NULL
);
