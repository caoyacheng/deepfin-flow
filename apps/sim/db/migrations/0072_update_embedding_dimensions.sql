-- Update embedding dimensions from 1536 to 1024 for Qwen3-Embedding
-- This migration updates the vector columns to match Qwen3-Embedding API output

-- Drop existing indexes that depend on the old dimensions
DROP INDEX IF EXISTS "embedding_vector_hnsw_idx";
DROP INDEX IF EXISTS "docs_embedding_vector_hnsw_idx";

-- Update embedding column dimensions in the embedding table
ALTER TABLE "embedding" ALTER COLUMN "embedding" TYPE vector(1024);

-- Update embedding column dimensions in the docs_embeddings table  
ALTER TABLE "docs_embeddings" ALTER COLUMN "embedding" TYPE vector(1024);

-- Recreate the HNSW indexes with new dimensions
CREATE INDEX "embedding_vector_hnsw_idx" ON "embedding" 
USING hnsw ("embedding" vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

-- Recreate the HNSW indexes with new dimensions
CREATE INDEX "docs_embedding_vector_hnsw_idx" ON "docs_embeddings" 
USING hnsw ("embedding" vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

-- Add comment explaining the change
COMMENT ON COLUMN "embedding"."embedding" IS 'Vector embedding with 1024 dimensions from Qwen3-Embedding API';
COMMENT ON COLUMN "docs_embeddings"."embedding" IS 'Vector embedding with 1024 dimensions from Qwen3-Embedding API';
