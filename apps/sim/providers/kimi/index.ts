import type { StreamingExecution } from "@/executor/types";
import { createLogger } from "@/lib/logs/console/logger";
import { getProviderDefaultModel, getProviderModels } from "@/providers/models";
import type {
  ProviderConfig,
  ProviderRequest,
  ProviderResponse,
  TimeSegment,
} from "@/providers/types";
import {
  prepareToolExecution,
  prepareToolsWithUsageControl,
} from "@/providers/utils";
import OpenAI from "openai";

const logger = createLogger("KimiProvider");

/**
 * Helper function to convert a Kimi stream to a standard ReadableStream
 * and collect completion metrics
 */
function createReadableStreamFromKimiStream(
  kimiStream: any,
  onComplete?: (content: string, usage?: any) => void
): ReadableStream {
  let fullContent = "";
  let usageData: any = null;

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of kimiStream) {
          // Check for usage data in the final chunk
          if (chunk.usage) {
            usageData = chunk.usage;
          }

          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            fullContent += content;
            controller.enqueue(new TextEncoder().encode(content));
          }
        }

        // Once stream is complete, call the completion callback with the final content and usage
        if (onComplete) {
          onComplete(fullContent, usageData);
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

/**
 * Kimi provider configuration
 */
export const kimiProvider: ProviderConfig = {
  id: "kimi",
  name: "Kimi",
  description: "Moonshot AI's Kimi models",
  version: "1.0.0",
  models: getProviderModels("kimi"),
  defaultModel: getProviderDefaultModel("kimi"),

  executeRequest: async (
    request: ProviderRequest
  ): Promise<ProviderResponse | StreamingExecution> => {
    logger.info("Preparing Kimi request", {
      model: request.model || "moonshot-v1-8k",
      hasSystemPrompt: !!request.systemPrompt,
      hasMessages: !!request.messages?.length,
      hasTools: !!request.tools?.length,
      toolCount: request.tools?.length || 0,
      hasResponseFormat: !!request.responseFormat,
      stream: !!request.stream,
    });

    // API key is now handled server-side before this function is called
    const kimi = new OpenAI({
      apiKey: request.apiKey,
      baseURL: "https://api.moonshot.cn/v1",
    });

    // Start with an empty array for all messages
    const allMessages = [];

    // Add system prompt if present
    if (request.systemPrompt) {
      allMessages.push({
        role: "system",
        content: request.systemPrompt,
      });
    }

    // Add context if present
    if (request.context) {
      allMessages.push({
        role: "user",
        content: request.context,
      });
    }

    // Add user messages
    if (request.messages) {
      allMessages.push(...request.messages);
    }

    // Transform tools to OpenAI format if present
    let tools = undefined;
    let toolChoice = undefined;

    if (request.tools && request.tools.length > 0) {
      tools = request.tools.map((tool) => ({
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        },
      }));

      // Handle tool usage control
      if (request.toolUsageControl) {
        const { tools: controlledTools, toolChoice: controlledToolChoice } =
          prepareToolsWithUsageControl(request.tools, request.toolUsageControl);
        tools = controlledTools;
        toolChoice = controlledToolChoice;
      }
    }

    // Build the payload
    const payload: any = {
      model: request.model || "moonshot-v1-8k",
      messages: allMessages,
      temperature: request.temperature || 0.7,
      max_tokens: request.maxTokens || 4000,
    };

    if (tools) {
      payload.tools = tools;
      if (toolChoice) {
        payload.tool_choice = toolChoice;
      }
    }

    if (request.responseFormat) {
      payload.response_format = request.responseFormat;
    }

    if (request.stream) {
      // Handle streaming
      const startTime = Date.now();
      let modelTime = 0;
      let toolsTime = 0;
      let iterations = 0;
      let timeSegments: TimeSegment[] = [];

      try {
        const stream = await kimi.chat.completions.create({
          ...payload,
          stream: true,
        });

        // Create a readable stream from the Kimi stream
        const readableStream = createReadableStreamFromKimiStream(
          stream,
          (content, usage) => {
            logger.info("Kimi stream completed", {
              contentLength: content.length,
              usage,
              duration: Date.now() - startTime,
            });
          }
        );

        return {
          type: "streaming",
          stream: readableStream,
          model: request.model || "moonshot-v1-8k",
          timing: {
            startTime: new Date(startTime).toISOString(),
            endTime: new Date().toISOString(),
            duration: Date.now() - startTime,
            modelTime,
            toolsTime,
            iterations,
            timeSegments,
          },
        };
      } catch (error) {
        logger.error("Error in Kimi streaming request", {
          error: error instanceof Error ? error.message : "Unknown error",
          duration: Date.now() - startTime,
        });
        throw error;
      }
    } else {
      // Handle non-streaming requests
      const startTime = Date.now();
      let modelTime = 0;
      let toolsTime = 0;
      let iterations = 0;
      let timeSegments: TimeSegment[] = [];

      try {
        // Initial model call
        const modelStartTime = Date.now();
        const response = await kimi.chat.completions.create(payload);
        modelTime = Date.now() - modelStartTime;

        let content = response.choices[0]?.message?.content || "";
        let toolCalls = response.choices[0]?.message?.tool_calls;
        let toolResults: any[] = [];

        // Handle tool calls if present
        if (toolCalls && toolCalls.length > 0) {
          const toolsStartTime = Date.now();
          const { results, newMessages } = await prepareToolExecution(
            toolCalls,
            request.tools || []
          );

          toolResults = results;
          allMessages.push(...newMessages);

          // Add tool results to messages
          if (results.length > 0) {
            allMessages.push({
              role: "tool",
              tool_call_id: toolCalls[0].id,
              content: JSON.stringify(results[0].result),
            });
          }

          toolsTime = Date.now() - toolsStartTime;
          iterations++;

          // Continue conversation with tool results
          if (results.length > 0) {
            const followUpResponse = await kimi.chat.completions.create({
              ...payload,
              messages: allMessages,
            });

            content = followUpResponse.choices[0]?.message?.content || "";
            modelTime += Date.now() - modelStartTime;
          }
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        // Calculate costs
        const inputTokens = response.usage?.prompt_tokens || 0;
        const outputTokens = response.usage?.completion_tokens || 0;

        // Get pricing for the model
        const modelPricing = await import("../models").then((m) =>
          m.getModelPricing(request.model || "moonshot-v1-8k")
        );

        let cost = undefined;
        if (modelPricing) {
          const inputCost = (inputTokens / 1000000) * modelPricing.input;
          const outputCost = (outputTokens / 1000000) * modelPricing.output;
          cost = {
            input: inputCost,
            output: outputCost,
            total: inputCost + outputCost,
            pricing: modelPricing,
          };
        }

        return {
          content,
          model: request.model || "moonshot-v1-8k",
          tokens: {
            prompt: inputTokens,
            completion: outputTokens,
            total: inputTokens + outputTokens,
          },
          toolCalls: toolCalls?.map((tc) => ({
            name: tc.function.name,
            arguments: JSON.parse(tc.function.arguments),
          })),
          toolResults,
          timing: {
            startTime: new Date(startTime).toISOString(),
            endTime: new Date(endTime).toISOString(),
            duration,
            modelTime,
            toolsTime,
            iterations,
            timeSegments,
          },
          cost,
        };
      } catch (error) {
        const endTime = Date.now();
        logger.error("Error in Kimi request", {
          error: error instanceof Error ? error.message : "Unknown error",
          duration: endTime - startTime,
        });
        throw error;
      }
    }
  },
};
