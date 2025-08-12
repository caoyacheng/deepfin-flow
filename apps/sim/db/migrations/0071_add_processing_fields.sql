-- Add processing fields to document table
ALTER TABLE "document" ADD COLUMN "processing_status" text NOT NULL DEFAULT 'pending';
ALTER TABLE "document" ADD COLUMN "processing_started_at" timestamp without time zone;
ALTER TABLE "document" ADD COLUMN "processing_completed_at" timestamp without time zone;
ALTER TABLE "document" ADD COLUMN "processing_error" text;

-- Add index for processing status
CREATE INDEX "doc_processing_status_idx" ON "document" ("knowledge_base_id", "processing_status");
