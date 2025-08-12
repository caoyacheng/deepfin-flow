import { env } from "@/lib/env";

// Client-safe configuration - no Node.js modules
export const UPLOAD_DIR = "/uploads";

// Check if S3 is configured (has required credentials)
const hasS3Config = !!(env.S3_BUCKET_NAME && env.AWS_REGION);

// Check if Azure Blob is configured (has required credentials)
const hasBlobConfig = !!(
  env.AZURE_STORAGE_CONTAINER_NAME &&
  ((env.AZURE_ACCOUNT_NAME && env.AZURE_ACCOUNT_KEY) ||
    env.AZURE_CONNECTION_STRING)
);

// Check if Aliyun OSS is configured (has required credentials)
const hasOSSConfig = !!(
  env.OSS_ACCESS_KEY_ID &&
  env.OSS_ACCESS_KEY_SECRET &&
  env.OSS_BUCKET_NAME &&
  env.OSS_REGION
);

// Storage configuration flags - auto-detect based on available credentials
// Priority: OSS > Blob > S3 > Local (if multiple are configured, OSS takes priority)
export const USE_OSS_STORAGE = hasOSSConfig;
export const USE_BLOB_STORAGE = hasBlobConfig && !USE_OSS_STORAGE;
export const USE_S3_STORAGE =
  hasS3Config && !USE_OSS_STORAGE && !USE_BLOB_STORAGE;

export const OSS_CONFIG = {
  accessKeyId: env.OSS_ACCESS_KEY_ID || "",
  accessKeySecret: env.OSS_ACCESS_KEY_SECRET || "",
  bucket: env.OSS_BUCKET_NAME || "",
  region: env.OSS_REGION || "",
  endpoint: env.OSS_ENDPOINT || "",
};

export const S3_CONFIG = {
  bucket: env.S3_BUCKET_NAME || "",
  region: env.AWS_REGION || "",
};

export const BLOB_CONFIG = {
  accountName: env.AZURE_ACCOUNT_NAME || "",
  accountKey: env.AZURE_ACCOUNT_KEY || "",
  connectionString: env.AZURE_CONNECTION_STRING || "",
  containerName: env.AZURE_STORAGE_CONTAINER_NAME || "",
};

export const S3_KB_CONFIG = {
  bucket: env.S3_KB_BUCKET_NAME || "",
  region: env.AWS_REGION || "",
};

export const S3_EXECUTION_FILES_CONFIG = {
  bucket: env.S3_EXECUTION_FILES_BUCKET_NAME || "sim-execution-files",
  region: env.AWS_REGION || "",
};

export const BLOB_KB_CONFIG = {
  accountName: env.AZURE_ACCOUNT_NAME || "",
  accountKey: env.AZURE_ACCOUNT_KEY || "",
  connectionString: env.AZURE_CONNECTION_STRING || "",
  containerName: env.AZURE_STORAGE_KB_CONTAINER_NAME || "",
};

export const BLOB_EXECUTION_FILES_CONFIG = {
  accountName: env.AZURE_ACCOUNT_NAME || "",
  accountKey: env.AZURE_ACCOUNT_KEY || "",
  connectionString: env.AZURE_CONNECTION_STRING || "",
  containerName:
    env.AZURE_STORAGE_EXECUTION_FILES_CONTAINER_NAME || "sim-execution-files",
};

export const S3_CHAT_CONFIG = {
  bucket: env.S3_CHAT_BUCKET_NAME || "",
  region: env.AWS_REGION || "",
};

export const BLOB_CHAT_CONFIG = {
  accountName: env.AZURE_ACCOUNT_NAME || "",
  accountKey: env.AZURE_ACCOUNT_KEY || "",
  connectionString: env.AZURE_CONNECTION_STRING || "",
  containerName: env.AZURE_STORAGE_CHAT_CONTAINER_NAME || "",
};

export const OSS_KB_CONFIG = {
  accessKeyId: env.OSS_ACCESS_KEY_ID || "",
  accessKeySecret: env.OSS_ACCESS_KEY_SECRET || "",
  bucket: env.OSS_KB_BUCKET_NAME || env.OSS_BUCKET_NAME || "",
  region: env.OSS_REGION || "",
  endpoint: env.OSS_ENDPOINT || "",
};

export const OSS_EXECUTION_FILES_CONFIG = {
  accessKeyId: env.OSS_ACCESS_KEY_ID || "",
  accessKeySecret: env.OSS_ACCESS_KEY_SECRET || "",
  bucket: env.OSS_EXECUTION_FILES_BUCKET_NAME || env.OSS_BUCKET_NAME || "",
  region: env.OSS_REGION || "",
  endpoint: env.OSS_ENDPOINT || "",
};

export const OSS_CHAT_CONFIG = {
  accessKeyId: env.OSS_ACCESS_KEY_ID || "",
  accessKeySecret: env.OSS_ACCESS_KEY_SECRET || "",
  bucket: env.OSS_CHAT_BUCKET_NAME || env.OSS_BUCKET_NAME || "",
  region: env.OSS_REGION || "",
  endpoint: env.OSS_ENDPOINT || "",
};

export const OSS_COPILOT_CONFIG = {
  accessKeyId: env.OSS_ACCESS_KEY_ID || "",
  accessKeySecret: env.OSS_ACCESS_KEY_SECRET || "",
  bucket: env.OSS_COPILOT_BUCKET_NAME || env.OSS_BUCKET_NAME || "",
  region: env.OSS_REGION || "",
  endpoint: env.OSS_ENDPOINT || "",
};

export const S3_COPILOT_CONFIG = {
  bucket: env.S3_COPILOT_BUCKET_NAME || "",
  region: env.AWS_REGION || "",
};

export const BLOB_COPILOT_CONFIG = {
  accountName: env.AZURE_ACCOUNT_NAME || "",
  accountKey: env.AZURE_ACCOUNT_KEY || "",
  connectionString: env.AZURE_CONNECTION_STRING || "",
  containerName: env.AZURE_STORAGE_COPILOT_CONTAINER_NAME || "",
};

/**
 * Get the current storage provider as a human-readable string
 */
export function getStorageProvider():
  | "Aliyun OSS"
  | "Azure Blob"
  | "S3"
  | "Local" {
  if (USE_OSS_STORAGE) return "Aliyun OSS";
  if (USE_BLOB_STORAGE) return "Azure Blob";
  if (USE_S3_STORAGE) return "S3";
  return "Local";
}

/**
 * Check if we're using any cloud storage (OSS, S3 or Blob)
 */
export function isUsingCloudStorage(): boolean {
  return USE_OSS_STORAGE || USE_S3_STORAGE || USE_BLOB_STORAGE;
}
