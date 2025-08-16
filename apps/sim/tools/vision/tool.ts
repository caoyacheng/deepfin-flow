import type { ToolConfig } from "@/tools/types";
import type { VisionParams, VisionResponse } from "@/tools/vision/types";

export const visionTool: ToolConfig<VisionParams, VisionResponse> = {
  id: "vision_tool",
  name: "Vision Tool",
  description:
    "Process and analyze images using advanced vision models. Capable of understanding image content, extracting text, identifying objects, and providing detailed visual descriptions.",
  version: "1.0.0",

  params: {
    apiKey: {
      type: "string",
      required: true,
      visibility: "user-only",
      description: "API key for the selected model provider",
    },
    imageUrl: {
      type: "string",
      required: true,
      visibility: "user-only",
      description: "Publicly accessible image URL",
    },
    model: {
      type: "string",
      required: false,
      visibility: "user-only",
      description:
        "Vision model to use (gpt-4o, claude-3-opus-20240229, qwen-vl-plus, etc)",
    },
    prompt: {
      type: "string",
      required: false,
      visibility: "user-or-llm",
      description: "Custom prompt for image analysis",
    },
  },

  outputs: {
    content: {
      type: "string",
      description: "The analyzed content and description of the image",
    },
    model: {
      type: "string",
      description: "The vision model that was used for analysis",
      optional: true,
    },
    tokens: {
      type: "number",
      description: "Total tokens used for the analysis",
      optional: true,
    },
    usage: {
      type: "object",
      description: "Detailed token usage breakdown",
      optional: true,
      properties: {
        input_tokens: {
          type: "number",
          description: "Tokens used for input processing",
        },
        output_tokens: {
          type: "number",
          description: "Tokens used for response generation",
        },
        total_tokens: { type: "number", description: "Total tokens consumed" },
      },
    },
  },

  request: {
    method: "POST",
    url: (params) => {
      if (params.model?.startsWith("claude-3")) {
        return "https://api.anthropic.com/v1/messages";
      }
      if (params.model?.startsWith("qwen-vl")) {
        return "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
      }
      return "https://api.openai.com/v1/chat/completions";
    },
    headers: (params) => {
      const headers = {
        "Content-Type": "application/json",
      };

      if (params.model?.startsWith("claude-3")) {
        return {
          ...headers,
          "x-api-key": params.apiKey,
          "anthropic-version": "2023-06-01",
        };
      }

      if (params.model?.startsWith("qwen-vl")) {
        return {
          ...headers,
          Authorization: `Bearer ${params.apiKey}`,
        };
      }

      return {
        ...headers,
        Authorization: `Bearer ${params.apiKey}`,
      };
    },
    body: (params) => {
      const defaultPrompt =
        "Please analyze this image and describe what you see in detail.";
      const prompt = params.prompt || defaultPrompt;

      if (params.model?.startsWith("claude-3")) {
        return {
          model: params.model,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image",
                  source: { type: "url", url: params.imageUrl },
                },
              ],
            },
          ],
        };
      }

      if (params.model?.startsWith("qwen-vl")) {
        return {
          model: params.model,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: {
                    url: params.imageUrl,
                  },
                },
              ],
            },
          ],
          max_tokens: 1000,
        };
      }

      return {
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: params.imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      };
    },
  },

  transformResponse: async (response: Response) => {
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || "Unknown error occurred");
    }

    const result =
      data.content?.[0]?.text || data.choices?.[0]?.message?.content;
    if (!result) {
      throw new Error("No output content in response");
    }

    return {
      success: true,
      output: {
        content: result,
        model: data.model,
        tokens: data.content
          ? data.usage?.input_tokens + data.usage?.output_tokens
          : data.usage?.total_tokens,
        usage: data.usage
          ? {
              input_tokens: data.usage.input_tokens,
              output_tokens: data.usage.output_tokens,
              total_tokens:
                data.usage.total_tokens ||
                data.usage.input_tokens + data.usage.output_tokens,
            }
          : undefined,
      },
    };
  },

  transformError: (error) => {
    const message = error.error?.message || error.message;
    const code = error.error?.type || error.code;
    return `${message} (${code})`;
  },
};
