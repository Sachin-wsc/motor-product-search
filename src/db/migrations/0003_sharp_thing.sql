ALTER TABLE "products" ADD COLUMN "images" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "image_url";