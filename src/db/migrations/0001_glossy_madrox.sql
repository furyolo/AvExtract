CREATE TABLE "avmovie" (
	"code" varchar(50) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"magnet_link" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "movies" CASCADE;