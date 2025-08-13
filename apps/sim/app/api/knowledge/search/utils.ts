import { db } from "@/db";
import { embedding } from "@/db/schema";
import { retryWithExponentialBackoff } from "@/lib/documents/utils";
import { env } from "@/lib/env";
import { createLogger } from "@/lib/logs/console/logger";
import { and, eq, inArray, sql } from "drizzle-orm";

const logger = createLogger("KnowledgeSearchUtils");

export class APIError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "APIError";
    this.status = status;
  }
}

export interface SearchResult {
  id: string;
  content: string;
  documentId: string;
  chunkIndex: number;
  tag1: string | null;
  tag2: string | null;
  tag3: string | null;
  tag4: string | null;
  tag5: string | null;
  tag6: string | null;
  tag7: string | null;
  distance: number;
  knowledgeBaseId: string;
}

export interface SearchParams {
  knowledgeBaseIds: string[];
  topK: number;
  filters?: Record<string, string>;
  queryVector?: string;
  distanceThreshold?: number;
}

export async function generateSearchEmbedding(
  query: string
): Promise<number[]> {
  const dashscopeApiKey = env.DASHSCOPE_API_KEY;
  if (!dashscopeApiKey) {
    throw new Error("DASHSCOPE_API_KEY not configured");
  }

  try {
    const embedding = await retryWithExponentialBackoff(
      async () => {
        // Clean and validate the input text
        let cleanedQuery = query;
        if (typeof cleanedQuery !== "string") {
          cleanedQuery = String(cleanedQuery);
        }

        // Clean the text: remove null bytes, normalize whitespace, limit length
        cleanedQuery = cleanedQuery
          .replace(/\0/g, "") // Remove null bytes
          .replace(/\r\n/g, "\n") // Normalize line endings
          .replace(/\r/g, "\n") // Normalize line endings
          .trim();

        // Limit text length to 8000 characters (Qwen API limit)
        if (cleanedQuery.length > 8000) {
          logger.warn(
            `Query too long (${cleanedQuery.length} chars), truncating to 8000 chars`
          );
          cleanedQuery = cleanedQuery.substring(0, 8000) + "...";
        }

        // Prepare request body and log it for debugging
        const requestBody = {
          model: "text-embedding-v4",
          input: [cleanedQuery],
        };

        // Try with a simple test string first to debug the issue
        const testRequestBody = {
          model: "text-embedding-v4",
          input: ["test"],
        };

        const requestBodyJson = JSON.stringify(requestBody);
        const testRequestBodyJson = JSON.stringify(testRequestBody);

        logger.debug(
          `[generateSearchEmbedding] Original request body: ${requestBodyJson}`
        );
        logger.debug(
          `[generateSearchEmbedding] Test request body: ${testRequestBodyJson}`
        );
        logger.debug(
          `[generateSearchEmbedding] Input type: ${typeof cleanedQuery}, length: ${cleanedQuery.length}`
        );
        logger.debug(
          `[generateSearchEmbedding] Input content preview: "${cleanedQuery.substring(0, 100)}..."`
        );

        // Validate JSON serialization
        try {
          JSON.parse(requestBodyJson);
          JSON.parse(testRequestBodyJson);
          logger.debug(`[generateSearchEmbedding] JSON validation successful`);
        } catch (jsonError) {
          logger.error(
            `[generateSearchEmbedding] JSON validation failed:`,
            jsonError
          );
          throw new Error(
            `Failed to serialize request body: ${jsonError instanceof Error ? jsonError.message : "Unknown error"}`
          );
        }

        const response = await fetch(
          "https://dashscope.aliyuncs.com/compatible-mode/v1/embeddings",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${dashscopeApiKey}`,
              "Content-Type": "application/json",
              "X-DashScope-SSE": "disable",
            },
            body: requestBodyJson,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          const error = new APIError(
            `DashScope API error: ${response.status} ${response.statusText} - ${errorText}`,
            response.status
          );
          throw error;
        }

        const data = await response.json();

        // Handle both standard and compatible mode response formats
        let embedding;
        if (
          data.output &&
          data.output.embeddings &&
          Array.isArray(data.output.embeddings) &&
          data.output.embeddings.length > 0
        ) {
          // Standard DashScope format
          embedding = data.output.embeddings[0].embedding;
        } else if (
          data.data &&
          Array.isArray(data.data) &&
          data.data.length > 0
        ) {
          // Compatible mode format (OpenAI-like)
          embedding = data.data[0].embedding;
        } else {
          throw new Error(
            "Invalid response format from DashScope embeddings API"
          );
        }

        return embedding;
      },
      {
        maxRetries: 5,
        initialDelayMs: 1000,
        maxDelayMs: 30000,
        backoffMultiplier: 2,
      }
    );

    return embedding;
  } catch (error) {
    logger.error("Failed to generate search embedding:", error);
    throw new Error(
      `Embedding generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

function getTagFilters(filters: Record<string, string>, embedding: any) {
  return Object.entries(filters).map(([key, value]) => {
    // Handle OR logic within same tag
    const values = value.includes("|OR|") ? value.split("|OR|") : [value];
    logger.debug(
      `[getTagFilters] Processing ${key}="${value}" -> values:`,
      values
    );

    const getColumnForKey = (key: string) => {
      switch (key) {
        case "tag1":
          return embedding.tag1;
        case "tag2":
          return embedding.tag2;
        case "tag3":
          return embedding.tag3;
        case "tag4":
          return embedding.tag4;
        case "tag5":
          return embedding.tag5;
        case "tag6":
          return embedding.tag6;
        case "tag7":
          return embedding.tag7;
        default:
          return null;
      }
    };

    const column = getColumnForKey(key);
    if (!column) return sql`1=1`; // No-op for unknown keys

    if (values.length === 1) {
      // Single value - simple equality
      logger.debug(
        `[getTagFilters] Single value filter: ${key} = ${values[0]}`
      );
      return sql`LOWER(${column}) = LOWER(${values[0]})`;
    }
    // Multiple values - OR logic
    logger.debug(`[getTagFilters] OR filter: ${key} IN (${values.join(", ")})`);
    const orConditions = values.map((v) => sql`LOWER(${column}) = LOWER(${v})`);
    return sql`(${sql.join(orConditions, sql` OR `)})`;
  });
}

export function getQueryStrategy(kbCount: number, topK: number) {
  const useParallel = kbCount > 4 || (kbCount > 2 && topK > 50);
  const distanceThreshold = kbCount > 3 ? 0.8 : 1.0;
  const parallelLimit = Math.ceil(topK / kbCount) + 5;

  return {
    useParallel,
    distanceThreshold,
    parallelLimit,
    singleQueryOptimized: kbCount <= 2,
  };
}

async function executeTagFilterQuery(
  knowledgeBaseIds: string[],
  filters: Record<string, string>
): Promise<{ id: string }[]> {
  if (knowledgeBaseIds.length === 1) {
    return await db
      .select({ id: embedding.id })
      .from(embedding)
      .where(
        and(
          eq(embedding.knowledgeBaseId, knowledgeBaseIds[0]),
          eq(embedding.enabled, true),
          ...getTagFilters(filters, embedding)
        )
      );
  }
  return await db
    .select({ id: embedding.id })
    .from(embedding)
    .where(
      and(
        inArray(embedding.knowledgeBaseId, knowledgeBaseIds),
        eq(embedding.enabled, true),
        ...getTagFilters(filters, embedding)
      )
    );
}

async function executeVectorSearchOnIds(
  embeddingIds: string[],
  queryVector: string,
  topK: number,
  distanceThreshold: number
): Promise<SearchResult[]> {
  if (embeddingIds.length === 0) {
    return [];
  }

  return await db
    .select({
      id: embedding.id,
      content: embedding.content,
      documentId: embedding.documentId,
      chunkIndex: embedding.chunkIndex,
      tag1: embedding.tag1,
      tag2: embedding.tag2,
      tag3: embedding.tag3,
      tag4: embedding.tag4,
      tag5: embedding.tag5,
      tag6: embedding.tag6,
      tag7: embedding.tag7,
      distance:
        sql<number>`${embedding.embedding} <=> ${queryVector}::vector`.as(
          "distance"
        ),
      knowledgeBaseId: embedding.knowledgeBaseId,
    })
    .from(embedding)
    .where(
      and(
        inArray(embedding.id, embeddingIds),
        sql`${embedding.embedding} <=> ${queryVector}::vector < ${distanceThreshold}`
      )
    )
    .orderBy(sql`${embedding.embedding} <=> ${queryVector}::vector`)
    .limit(topK);
}

export async function handleTagOnlySearch(
  params: SearchParams
): Promise<SearchResult[]> {
  const { knowledgeBaseIds, topK, filters } = params;

  if (!filters || Object.keys(filters).length === 0) {
    throw new Error("Tag filters are required for tag-only search");
  }

  logger.debug(
    `[handleTagOnlySearch] Executing tag-only search with filters:`,
    filters
  );

  const strategy = getQueryStrategy(knowledgeBaseIds.length, topK);

  if (strategy.useParallel) {
    // Parallel approach for many KBs
    const parallelLimit = Math.ceil(topK / knowledgeBaseIds.length) + 5;

    const queryPromises = knowledgeBaseIds.map(async (kbId) => {
      return await db
        .select({
          id: embedding.id,
          content: embedding.content,
          documentId: embedding.documentId,
          chunkIndex: embedding.chunkIndex,
          tag1: embedding.tag1,
          tag2: embedding.tag2,
          tag3: embedding.tag3,
          tag4: embedding.tag4,
          tag5: embedding.tag5,
          tag6: embedding.tag6,
          tag7: embedding.tag7,
          distance: sql<number>`0`.as("distance"), // No distance for tag-only searches
          knowledgeBaseId: embedding.knowledgeBaseId,
        })
        .from(embedding)
        .where(
          and(
            eq(embedding.knowledgeBaseId, kbId),
            eq(embedding.enabled, true),
            ...getTagFilters(filters, embedding)
          )
        )
        .limit(parallelLimit);
    });

    const parallelResults = await Promise.all(queryPromises);
    return parallelResults.flat().slice(0, topK);
  }
  // Single query for fewer KBs
  return await db
    .select({
      id: embedding.id,
      content: embedding.content,
      documentId: embedding.documentId,
      chunkIndex: embedding.chunkIndex,
      tag1: embedding.tag1,
      tag2: embedding.tag2,
      tag3: embedding.tag3,
      tag4: embedding.tag4,
      tag5: embedding.tag5,
      tag6: embedding.tag6,
      tag7: embedding.tag7,
      distance: sql<number>`0`.as("distance"), // No distance for tag-only searches
      knowledgeBaseId: embedding.knowledgeBaseId,
    })
    .from(embedding)
    .where(
      and(
        inArray(embedding.knowledgeBaseId, knowledgeBaseIds),
        eq(embedding.enabled, true),
        ...getTagFilters(filters, embedding)
      )
    )
    .limit(topK);
}

export async function handleVectorOnlySearch(
  params: SearchParams
): Promise<SearchResult[]> {
  const { knowledgeBaseIds, topK, queryVector, distanceThreshold } = params;

  if (!queryVector || !distanceThreshold) {
    throw new Error(
      "Query vector and distance threshold are required for vector-only search"
    );
  }

  logger.debug(`[handleVectorOnlySearch] Executing vector-only search`);

  const strategy = getQueryStrategy(knowledgeBaseIds.length, topK);

  if (strategy.useParallel) {
    // Parallel approach for many KBs
    const parallelLimit = Math.ceil(topK / knowledgeBaseIds.length) + 5;

    const queryPromises = knowledgeBaseIds.map(async (kbId) => {
      return await db
        .select({
          id: embedding.id,
          content: embedding.content,
          documentId: embedding.documentId,
          chunkIndex: embedding.chunkIndex,
          tag1: embedding.tag1,
          tag2: embedding.tag2,
          tag3: embedding.tag3,
          tag4: embedding.tag4,
          tag5: embedding.tag5,
          tag6: embedding.tag6,
          tag7: embedding.tag7,
          distance:
            sql<number>`${embedding.embedding} <=> ${queryVector}::vector`.as(
              "distance"
            ),
          knowledgeBaseId: embedding.knowledgeBaseId,
        })
        .from(embedding)
        .where(
          and(
            eq(embedding.knowledgeBaseId, kbId),
            eq(embedding.enabled, true),
            sql`${embedding.embedding} <=> ${queryVector}::vector < ${distanceThreshold}`
          )
        )
        .orderBy(sql`${embedding.embedding} <=> ${queryVector}::vector`)
        .limit(parallelLimit);
    });

    const parallelResults = await Promise.all(queryPromises);
    const allResults = parallelResults.flat();
    return allResults.sort((a, b) => a.distance - b.distance).slice(0, topK);
  }
  // Single query for fewer KBs
  return await db
    .select({
      id: embedding.id,
      content: embedding.content,
      documentId: embedding.documentId,
      chunkIndex: embedding.chunkIndex,
      tag1: embedding.tag1,
      tag2: embedding.tag2,
      tag3: embedding.tag3,
      tag4: embedding.tag4,
      tag5: embedding.tag5,
      tag6: embedding.tag6,
      tag7: embedding.tag7,
      distance:
        sql<number>`${embedding.embedding} <=> ${queryVector}::vector`.as(
          "distance"
        ),
      knowledgeBaseId: embedding.knowledgeBaseId,
    })
    .from(embedding)
    .where(
      and(
        inArray(embedding.knowledgeBaseId, knowledgeBaseIds),
        eq(embedding.enabled, true),
        sql`${embedding.embedding} <=> ${queryVector}::vector < ${distanceThreshold}`
      )
    )
    .orderBy(sql`${embedding.embedding} <=> ${queryVector}::vector`)
    .limit(topK);
}

export async function handleTagAndVectorSearch(
  params: SearchParams
): Promise<SearchResult[]> {
  const { knowledgeBaseIds, topK, filters, queryVector, distanceThreshold } =
    params;

  if (!filters || Object.keys(filters).length === 0) {
    throw new Error("Tag filters are required for tag and vector search");
  }
  if (!queryVector || !distanceThreshold) {
    throw new Error(
      "Query vector and distance threshold are required for tag and vector search"
    );
  }

  logger.debug(
    `[handleTagAndVectorSearch] Executing tag + vector search with filters:`,
    filters
  );

  // Step 1: Filter by tags first
  const tagFilteredIds = await executeTagFilterQuery(knowledgeBaseIds, filters);

  if (tagFilteredIds.length === 0) {
    logger.debug(
      `[handleTagAndVectorSearch] No results found after tag filtering`
    );
    return [];
  }

  logger.debug(
    `[handleTagAndVectorSearch] Found ${tagFilteredIds.length} results after tag filtering`
  );

  // Step 2: Perform vector search only on tag-filtered results
  return await executeVectorSearchOnIds(
    tagFilteredIds.map((r) => r.id),
    queryVector,
    topK,
    distanceThreshold
  );
}
