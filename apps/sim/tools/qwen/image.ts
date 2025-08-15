import { createLogger } from "@/lib/logs/console/logger";
import type { ToolConfig } from "@/tools/types";

const logger = createLogger("QwenImageTool");

// 轮询任务状态的函数
async function pollTaskStatus(taskId: string, apiKey: string, logger: any) {
  const maxAttempts = 60; // 最多轮询60次
  const interval = 5000; // 每5秒轮询一次

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(
        `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Task status check failed`, {
          status: response.status,
          statusText: response.statusText,
          errorText,
          taskId,
          attempt: attempt + 1,
        });
        throw new Error(
          `Failed to check task status: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      logger.info(`Task status check attempt ${attempt + 1}`, {
        taskId,
        responseStatus: response.status,
        data,
        outputStatus: data.output?.task_status,
        hasOutput: !!data.output,
        outputKeys: data.output ? Object.keys(data.output) : [],
        fullResponseKeys: Object.keys(data),
        responseUrl: response.url,
      });

      if (
        data.output?.task_status === "Succeeded" ||
        data.output?.task_status === "SUCCEEDED"
      ) {
        // 任务成功完成
        const results = data.output?.results || [];
        if (results.length > 0) {
          return { imageUrl: results[0].url };
        }
        throw new Error("No images generated in successful task");
      }

      if (
        data.output?.task_status === "Failed" ||
        data.output?.task_status === "FAILED"
      ) {
        throw new Error(
          `Task failed: ${data.output?.message || "Unknown error"}`
        );
      }

      // 检查其他可能的状态
      if (
        data.output?.task_status === "PENDING" ||
        data.output?.task_status === "RUNNING"
      ) {
        logger.info(
          `Task still in progress: ${data.output?.task_status} (attempt ${attempt + 1}/${maxAttempts})`
        );
      }

      // 记录进度
      if (attempt % 10 === 0) {
        // 每10次轮询记录一次进度
        logger.info(
          `Task polling progress: ${attempt + 1}/${maxAttempts} attempts completed`
        );
      }

      // 任务还在进行中，等待后继续轮询
      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    } catch (error) {
      logger.error(`Error checking task status (attempt ${attempt + 1})`, {
        error,
      });
      if (attempt === maxAttempts - 1) {
        throw error;
      }
    }
  }

  throw new Error(
    `Task polling timeout - task ${taskId} did not complete within ${(maxAttempts * interval) / 1000} seconds (${maxAttempts} attempts)`
  );
}

export const qwenImageTool: ToolConfig = {
  id: "qwen_image",
  name: "通义万相图片生成",
  description: "Generate images using Alibaba Cloud's Qwen Image models",
  version: "1.0.0",
  params: {
    model: {
      type: "string",
      required: true,
      visibility: "user-only",
      description: "The model to use (wan2.2-t2i-flash or wan2.2-t2i-plus)",
    },
    prompt: {
      type: "string",
      required: true,
      visibility: "user-or-llm",
      description: "A text description of the desired image",
    },
    size: {
      type: "string",
      required: false,
      visibility: "user-or-llm",
      description:
        "The size of the generated images (1024*1024, 1024*1792, 1792*1024, 2048*2048)",
    },
    n: {
      type: "number",
      required: false,
      visibility: "hidden",
      description: "The number of images to generate (1-4)",
    },
    apiKey: {
      type: "string",
      required: true,
      visibility: "user-only",
      description: "Your Alibaba Cloud DashScope API key",
    },
  },
  outputs: {
    success: { type: "boolean" },
    output: {
      type: "object",
      description: "Generated image data",
      properties: {
        content: { type: "string", description: "Image URL or identifier" },
        image: { type: "string", description: "Base64 encoded image data" },
        metadata: {
          type: "object",
          description: "Image generation metadata",
          properties: {
            model: {
              type: "string",
              description: "Model used for image generation",
            },
            task_id: {
              type: "string",
              description: "Task ID for the generation",
            },
          },
        },
      },
    },
  },
  request: {
    url: "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis",
    method: "POST",
    headers: (params) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.apiKey}`,
      "X-DashScope-Async": "enable",
    }),
    body: (params) => {
      const body = {
        model: params.model,
        input: {
          prompt: params.prompt,
        },
        parameters: {
          size: params.size || "1024*1024",
          n: params.n || 1,
        },
      };
      return body;
    },
  },
  transformResponse: async (response: Response, params?: any) => {
    const data = await response.json();

    if (!response.ok) {
      logger.error("Qwen image generation failed", {
        status: response.status,
        statusText: response.statusText,
        data,
      });
      throw new Error(
        `Qwen image generation failed: ${data.message || response.statusText}`
      );
    }

    logger.info("Qwen image generation task created", { data });

    // 通义万相使用异步API，返回任务ID
    const taskId = data.output?.task_id || data.output?.taskId;

    if (!taskId) {
      throw new Error("No task ID received from Qwen API");
    }

    // 轮询任务状态直到完成
    const result = await pollTaskStatus(taskId, params?.apiKey || "", logger);

    return {
      success: true,
      output: {
        content: `Successfully generated image using ${data.model}`,
        image: result.imageUrl,
        metadata: {
          model: data.model,
          task_id: taskId,
        },
      },
    };
  },
};
