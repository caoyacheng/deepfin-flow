import { env } from "@/lib/env";
import { createLogger } from "@/lib/logs/console/logger";
import { unstable_noStore as noStore } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";
export const runtime = "edge";
export const maxDuration = 60;

const logger = createLogger("WandGenerateAPI");

// Initialize OpenRouter client (OpenAI-compatible API)
const openrouter = env.OPENROUTER_API_KEY
  ? new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: env.OPENROUTER_API_KEY,
      // 移除 defaultHeaders，使用 extra_headers 在调用时传递
    })
  : null;

// Fallback to OpenAI if OpenRouter is not configured
const openai = env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    })
  : null;

// Use OpenRouter as primary, OpenAI as fallback
const client = openrouter || openai;

if (!env.OPENROUTER_API_KEY && !env.OPENAI_API_KEY) {
  logger.warn(
    "Neither OPENROUTER_API_KEY nor OPENAI_API_KEY found. Wand generation API will not function."
  );
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RequestBody {
  prompt: string;
  systemPrompt?: string;
  stream?: boolean;
  history?: ChatMessage[];
}

// The endpoint is now generic - system prompts come from wand configs

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8);
  logger.info(`[${requestId}] Received wand generation request`);

  if (!client) {
    logger.error(`[${requestId}] AI client not initialized. Missing API key.`);
    return NextResponse.json(
      { success: false, error: "Wand generation service is not configured." },
      { status: 503 }
    );
  }

  try {
    noStore();
    const body = (await req.json()) as RequestBody;

    const { prompt, systemPrompt, stream = false, history = [] } = body;

    if (!prompt) {
      logger.warn(`[${requestId}] Invalid request: Missing prompt.`);
      return NextResponse.json(
        { success: false, error: "Missing required field: prompt." },
        { status: 400 }
      );
    }

    // Use provided system prompt or default
    const finalSystemPrompt =
      systemPrompt ||
      "You are a helpful AI assistant. Generate content exactly as requested by the user.";

    // Prepare messages for OpenAI API
    const messages: ChatMessage[] = [
      { role: "system", content: finalSystemPrompt },
    ];

    // Add previous messages from history
    messages.push(...history.filter((msg) => msg.role !== "system"));

    // Add the current user prompt
    messages.push({ role: "user", content: prompt });

    logger.debug(`[${requestId}] Calling OpenAI API for wand generation`, {
      stream,
      historyLength: history.length,
    });

    // For streaming responses
    if (stream) {
      try {
        // 使用fetch直接调用OpenRouter API来避免TypeScript类型问题
        // 使用不受地区限制的模型
        const model = "anthropic/claude-3-5-sonnet"; // 切换到 Claude 模型

        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: model,
              messages: messages,
              temperature: 0.3,
              max_tokens: 10000,
              stream: true,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `OpenRouter API error: ${response.status} - ${errorText}`
          );
        }

        if (!response.body) {
          throw new Error("OpenRouter API returned no response body");
        }

        return new Response(
          new ReadableStream({
            async start(controller) {
              const encoder = new TextEncoder();
              const reader = response.body!.getReader();

              try {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  // 解析SSE格式的响应
                  const chunk = new TextDecoder().decode(value);
                  const lines = chunk.split("\n");

                  for (const line of lines) {
                    if (line.startsWith("data: ")) {
                      const data = line.slice(6);
                      if (data === "[DONE]") {
                        controller.enqueue(
                          encoder.encode(
                            `${JSON.stringify({ chunk: "", done: true })}\n`
                          )
                        );
                        controller.close();
                        return;
                      }

                      try {
                        const parsed = JSON.parse(data);
                        const content =
                          parsed.choices?.[0]?.delta?.content || "";
                        if (content) {
                          controller.enqueue(
                            encoder.encode(
                              `${JSON.stringify({ chunk: content, done: false })}\n`
                            )
                          );
                        }
                      } catch (parseError) {
                        // 忽略解析错误，继续处理下一行
                      }
                    }
                  }
                }

                // 发送完成信号
                controller.enqueue(
                  encoder.encode(
                    `${JSON.stringify({ chunk: "", done: true })}\n`
                  )
                );
                controller.close();
                logger.info(
                  `[${requestId}] Wand generation streaming completed`
                );
              } catch (streamError: any) {
                logger.error(`[${requestId}] Streaming error`, {
                  error: streamError.message,
                });
                controller.enqueue(
                  encoder.encode(
                    `${JSON.stringify({ error: "Streaming failed", done: true })}\n`
                  )
                );
                controller.close();
              } finally {
                reader.releaseLock();
              }
            },
          }),
          {
            headers: {
              "Content-Type": "text/plain",
              "Cache-Control": "no-cache, no-transform",
              Connection: "keep-alive",
            },
          }
        );
      } catch (error: any) {
        logger.error(`[${requestId}] Streaming error`, {
          error: error.message || "Unknown error",
          stack: error.stack,
        });

        return NextResponse.json(
          {
            success: false,
            error: "An error occurred during wand generation streaming.",
          },
          { status: 500 }
        );
      }
    }

    // For non-streaming responses
    // 使用不受地区限制的模型
    const model = "anthropic/claude-3-5-sonnet"; // 切换到 Claude 模型

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: 0.3,
          max_tokens: 10000,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenRouter API error: ${response.status} - ${errorText}`
      );
    }

    const completion = await response.json();
    const generatedContent = completion.choices?.[0]?.message?.content?.trim();

    if (!generatedContent) {
      logger.error(`[${requestId}] OpenRouter response was empty or invalid.`);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate content. OpenRouter response was empty.",
        },
        { status: 500 }
      );
    }

    logger.info(`[${requestId}] Wand generation successful`);
    return NextResponse.json({ success: true, content: generatedContent });
  } catch (error: any) {
    logger.error(`[${requestId}] Wand generation failed`, {
      error: error.message || "Unknown error",
      stack: error.stack,
    });

    let clientErrorMessage = "Wand generation failed. Please try again later.";
    let status = 500;

    if (error instanceof OpenAI.APIError) {
      status = error.status || 500;
      logger.error(
        `[${requestId}] OpenRouter API Error: ${status} - ${error.message}`
      );

      if (status === 401) {
        clientErrorMessage =
          "Authentication failed. Please check your OpenRouter API key configuration.";
      } else if (status === 429) {
        clientErrorMessage = "Rate limit exceeded. Please try again later.";
      } else if (status >= 500) {
        clientErrorMessage =
          "The wand generation service is currently unavailable. Please try again later.";
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: clientErrorMessage,
      },
      { status }
    );
  }
}
