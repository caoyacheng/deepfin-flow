import { createLogger } from "@/lib/logs/console/logger";
import { OSS_CONFIG } from "@/lib/uploads/setup";
import OSS from "ali-oss";
import type { CustomOSSConfig } from "./types";

const logger = createLogger("OSSClient");

// Lazily create a single OSS client instance.
let _ossClient: OSS | null = null;

export function getOSSClient(): OSS {
  if (_ossClient) return _ossClient;

  const { accessKeyId, accessKeySecret, bucket, region, endpoint } = OSS_CONFIG;

  if (!accessKeyId || !accessKeySecret || !bucket || !region) {
    throw new Error(
      "Aliyun OSS credentials are missing – set OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET, OSS_BUCKET_NAME, and OSS_REGION in your environment."
    );
  }

  _ossClient = new OSS({
    accessKeyId,
    accessKeySecret,
    bucket,
    region,
    endpoint: endpoint || `https://${region}.aliyuncs.com`,
  });

  return _ossClient;
}

export function getOSSClientWithConfig(config: CustomOSSConfig): OSS {
  return new OSS({
    accessKeyId: config.accessKeyId!,
    accessKeySecret: config.accessKeySecret!,
    bucket: config.bucket!,
    region: config.region!,
    endpoint:
      config.endpoint ||
      `https://${config.bucket}.${config.region}.aliyuncs.com`,
  });
}

/**
 * Upload a file to OSS
 */
export async function uploadToOSS(
  file: Buffer,
  fileName: string,
  contentType: string,
  config?: CustomOSSConfig,
  size?: number
): Promise<{ key: string; url: string }> {
  try {
    const client = config ? getOSSClientWithConfig(config) : getOSSClient();
    const key = `${Date.now()}-${fileName.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    logger.info(`Uploading file to OSS: ${fileName} -> ${key}`);

    const result = await client.put(key, file, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": size || file.length,
      },
      meta: {
        originalName: fileName,
        uploadedAt: new Date().toISOString(),
      },
    });

    logger.info(`Successfully uploaded to OSS: ${key}`);
    return {
      key: result.name,
      url: result.url,
    };
  } catch (error) {
    logger.error(`Failed to upload to OSS: ${fileName}`, error);
    throw new Error(
      `OSS upload failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Download a file from OSS
 */
export async function downloadFromOSS(
  key: string,
  config?: CustomOSSConfig
): Promise<Buffer> {
  try {
    const client = config ? getOSSClientWithConfig(config) : getOSSClient();
    logger.info(`Downloading file from OSS: ${key}`);

    const result = await client.get(key);
    return Buffer.from(result.content);
  } catch (error) {
    logger.error(`Failed to download from OSS: ${key}`, error);
    throw new Error(
      `OSS download failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Delete a file from OSS
 */
export async function deleteFromOSS(
  key: string,
  config?: CustomOSSConfig
): Promise<void> {
  try {
    const client = config ? getOSSClientWithConfig(config) : getOSSClient();
    logger.info(`Deleting file from OSS: ${key}`);

    await client.delete(key);
    logger.info(`Successfully deleted from OSS: ${key}`);
  } catch (error) {
    logger.error(`Failed to delete from OSS: ${key}`, error);
    throw new Error(
      `OSS delete failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Generate a presigned URL for OSS
 */
export async function getOSSPresignedUrl(
  key: string,
  expiresIn = 3600,
  config?: CustomOSSConfig
): Promise<string> {
  try {
    const client = config ? getOSSClientWithConfig(config) : getOSSClient();
    logger.info(
      `Generating presigned URL for OSS: ${key}, expires in ${expiresIn}s`
    );

    const url = client.signatureUrl(key, {
      method: "GET",
      expires: expiresIn,
    });

    logger.info(`Generated presigned URL for OSS: ${key}`);
    return url;
  } catch (error) {
    logger.error(`Failed to generate presigned URL for OSS: ${key}`, error);
    throw new Error(
      `OSS presigned URL generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Generate a presigned URL for upload to OSS
 */
export async function getOSSUploadPresignedUrl(
  key: string,
  contentType: string,
  expiresIn = 3600,
  config?: CustomOSSConfig
): Promise<string> {
  try {
    const client = config ? getOSSClientWithConfig(config) : getOSSClient();
    logger.info(
      `Generating upload presigned URL for OSS: ${key}, expires in ${expiresIn}s`
    );

    const url = client.signatureUrl(key, {
      method: "PUT",
      expires: expiresIn,
      "Content-Type": contentType,
    });

    logger.info(`Generated upload presigned URL for OSS: ${key}`);
    return url;
  } catch (error) {
    logger.error(
      `Failed to generate upload presigned URL for OSS: ${key}`,
      error
    );
    throw new Error(
      `OSS upload presigned URL generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
