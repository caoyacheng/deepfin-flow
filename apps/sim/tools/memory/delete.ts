import type { MemoryResponse } from "@/tools/memory/types";
import type { ToolConfig } from "@/tools/types";

export const memoryDeleteTool: ToolConfig<any, MemoryResponse> = {
  id: "memory_delete",
  name: "Delete Memory",
  description: "Delete a specific memory by its ID",
  version: "1.0.0",
  params: {
    id: {
      type: "string",
      required: true,
      description: "Identifier for the memory to delete",
    },
  },
  outputs: {
    success: {
      type: "boolean",
      description: "Whether the memory was deleted successfully",
    },
    message: { type: "string", description: "Success or error message" },
    error: { type: "string", description: "Error message if operation failed" },
  },
  request: {
    url: (params): any => {
      // Get workflowId from context (set by workflow execution)
      const workflowId = params._context?.workflowId;

      if (!workflowId) {
        return {
          _errorResponse: {
            status: 400,
            data: {
              success: false,
              error: {
                message:
                  "workflowId is required and must be provided in execution context",
              },
            },
          },
        };
      }

      // Append workflowId as query parameter
      return `/api/memory/${encodeURIComponent(params.id)}?workflowId=${encodeURIComponent(workflowId)}`;
    },
    method: "DELETE",
    headers: () => ({
      "Content-Type": "application/json",
    }),
    isInternalRoute: true,
  },
  transformResponse: async (response): Promise<MemoryResponse> => {
    try {
      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error?.message || "记忆删除失败";
        throw new Error(errorMessage);
      }

      return {
        success: true,
        output: {
          message: "记忆删除成功。",
        },
      };
    } catch (error: any) {
      return {
        success: false,
        output: {
          message: `记忆删除失败: ${error.message || "未知错误"}`,
        },
        error: `记忆删除失败: ${error.message || "未知错误"}`,
      };
    }
  },
  transformError: async (error): Promise<MemoryResponse> => {
    const errorMessage = `记忆删除失败: ${error.message || "未知错误"}`;
    return {
      success: false,
      output: {
        message: errorMessage,
      },
      error: errorMessage,
    };
  },
};
