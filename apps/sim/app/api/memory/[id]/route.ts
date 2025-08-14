import { db } from "@/db";
import { memory } from "@/db/schema";
import { createLogger } from "@/lib/logs/console/logger";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

const logger = createLogger("MemoryByIdAPI");

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET handler for retrieving a specific memory by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID().slice(0, 8);
  const { id } = await params;

  try {
    logger.info(`[${requestId}] Processing memory get request for ID: ${id}`);

    // Get workflowId from query parameter (required)
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");

    if (!workflowId) {
      logger.warn(`[${requestId}] Missing required parameter: workflowId`);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "workflowId parameter is required",
          },
        },
        { status: 400 }
      );
    }

    // Query the database for the memory
    const memories = await db
      .select()
      .from(memory)
      .where(and(eq(memory.key, id), eq(memory.workflowId, workflowId)))
      .orderBy(memory.createdAt)
      .limit(1);

    if (memories.length === 0) {
      logger.warn(`[${requestId}] 未找到记忆: ${id}，工作流: ${workflowId}`);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "未找到记忆",
          },
        },
        { status: 404 }
      );
    }

    logger.info(`[${requestId}] 成功获取记忆: ${id}，工作流: ${workflowId}`);
    return NextResponse.json(
      {
        success: true,
        data: memories[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || "获取记忆失败",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for removing a specific memory
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID().slice(0, 8);
  const { id } = await params;

  try {
    logger.info(`[${requestId}] 正在处理删除记忆请求，ID: ${id}`);

    // Get workflowId from query parameter (required)
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");

    if (!workflowId) {
      logger.warn(`[${requestId}] 缺少必需参数: workflowId`);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "workflowId 参数是必需的",
          },
        },
        { status: 400 }
      );
    }

    // Verify memory exists before attempting to delete
    const existingMemory = await db
      .select({ id: memory.id })
      .from(memory)
      .where(and(eq(memory.key, id), eq(memory.workflowId, workflowId)))
      .limit(1);

    if (existingMemory.length === 0) {
      logger.warn(`[${requestId}] 未找到记忆: ${id}，工作流: ${workflowId}`);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "未找到记忆",
          },
        },
        { status: 404 }
      );
    }

    // Hard delete the memory
    await db
      .delete(memory)
      .where(and(eq(memory.key, id), eq(memory.workflowId, workflowId)));

    logger.info(`[${requestId}] 记忆删除成功: ${id}，工作流: ${workflowId}`);
    return NextResponse.json(
      {
        success: true,
        data: { message: "记忆删除成功" },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || "记忆删除失败",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT handler for updating a specific memory
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID().slice(0, 8);
  const { id } = await params;

  try {
    logger.info(`[${requestId}] 正在处理更新记忆请求，ID: ${id}`);

    // Parse request body
    const body = await request.json();
    const { data, workflowId } = body;

    if (!data) {
      logger.warn(`[${requestId}] 缺少必需字段: data`);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "记忆数据为必填项",
          },
        },
        { status: 400 }
      );
    }

    if (!workflowId) {
      logger.warn(`[${requestId}] 缺少必需字段: workflowId`);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "workflowId 为必填项",
          },
        },
        { status: 400 }
      );
    }

    // Verify memory exists before attempting to update
    const existingMemories = await db
      .select()
      .from(memory)
      .where(and(eq(memory.key, id), eq(memory.workflowId, workflowId)))
      .limit(1);

    if (existingMemories.length === 0) {
      logger.warn(`[${requestId}] 未找到记忆: ${id}，工作流: ${workflowId}`);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "未找到记忆",
          },
        },
        { status: 404 }
      );
    }

    const existingMemory = existingMemories[0];

    // Validate memory data based on the existing memory type
    if (existingMemory.type === "agent") {
      if (!data.role || !data.content) {
        logger.warn(`[${requestId}] 缺少必需字段: role 或 content`);
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Agent 记忆需要 role 和 content",
            },
          },
          { status: 400 }
        );
      }

      if (!["user", "assistant", "system"].includes(data.role)) {
        logger.warn(`[${requestId}] 无效的 agent 角色: ${data.role}`);
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Agent 角色必须是 user, assistant, 或 system",
            },
          },
          { status: 400 }
        );
      }
    }

    // Update the memory with new data
    await db
      .delete(memory)
      .where(and(eq(memory.key, id), eq(memory.workflowId, workflowId)));

    // Fetch the updated memory
    const updatedMemories = await db
      .select()
      .from(memory)
      .where(and(eq(memory.key, id), eq(memory.workflowId, workflowId)))
      .limit(1);

    logger.info(`[${requestId}] 记忆更新成功: ${id}，工作流: ${workflowId}`);
    return NextResponse.json(
      {
        success: true,
        data: updatedMemories[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || "记忆更新失败",
        },
      },
      { status: 500 }
    );
  }
}
