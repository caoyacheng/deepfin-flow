import type { BlockConfig } from "@/blocks/types";
import { BrainIcon } from "@/components/icons";

export const MemoryBlock: BlockConfig = {
  type: "memory",
  name: "记忆",
  description: "添加记忆存储",
  longDescription:
    "创建持久化存储，用于存储需要在多个工作流步骤中访问的数据。在工作流执行过程中存储和检索信息，以维护上下文和状态。",
  bgColor: "#FFA500",
  icon: BrainIcon,
  category: "blocks",
  docsLink: "https://docs.sim.ai/tools/memory",
  subBlocks: [
    {
      id: "operation",
      title: "操作",
      type: "dropdown",
      layout: "full",
      options: [
        { label: "添加记忆", id: "add" },
        { label: "获取所有记忆", id: "getAll" },
        { label: "获取记忆", id: "get" },
        { label: "删除记忆", id: "delete" },
      ],
      placeholder: "选择操作",
      value: () => "add",
    },
    {
      id: "id",
      title: "ID",
      type: "short-input",
      layout: "full",
      placeholder: "输入要添加的记忆标识符",
      condition: {
        field: "operation",
        value: "add",
      },
      required: true,
    },
    {
      id: "id",
      title: "ID",
      type: "short-input",
      layout: "full",
      placeholder: "输入要获取的记忆标识符",
      condition: {
        field: "operation",
        value: "get",
      },
      required: true,
    },
    {
      id: "id",
      title: "ID",
      type: "short-input",
      layout: "full",
      placeholder: "输入要删除的记忆标识符",
      condition: {
        field: "operation",
        value: "delete",
      },
      required: true,
    },
    {
      id: "role",
      title: "角色",
      type: "dropdown",
      layout: "full",
      options: [
        { label: "User", id: "user" },
        { label: "Assistant", id: "assistant" },
        { label: "System", id: "system" },
      ],
      placeholder: "选择角色",
      condition: {
        field: "operation",
        value: "add",
      },
      required: true,
    },
    {
      id: "content",
      title: "内容",
      type: "short-input",
      layout: "full",
      placeholder: "输入消息内容",
      condition: {
        field: "operation",
        value: "add",
      },
      required: true,
    },
  ],
  tools: {
    access: ["memory_add", "memory_get", "memory_get_all", "memory_delete"],
    config: {
      tool: (params: Record<string, any>) => {
        const operation = params.operation || "add";
        switch (operation) {
          case "add":
            return "memory_add";
          case "get":
            return "memory_get";
          case "getAll":
            return "memory_get_all";
          case "delete":
            return "memory_delete";
          default:
            return "memory_add";
        }
      },
      params: (params: Record<string, any>) => {
        // Create detailed error information for any missing required fields
        const errors: string[] = [];

        if (!params.operation) {
          errors.push("Operation is required");
        }

        if (
          params.operation === "add" ||
          params.operation === "get" ||
          params.operation === "delete"
        ) {
          if (!params.id) {
            errors.push(
              `Memory ID is required for ${params.operation} operation`
            );
          }
        }

        if (params.operation === "add") {
          if (!params.role) {
            errors.push("Role is required for agent memory");
          }
          if (!params.content) {
            errors.push("Content is required for agent memory");
          }
        }

        // Throw error if any required fields are missing
        if (errors.length > 0) {
          throw new Error(`Memory Block Error: ${errors.join(", ")}`);
        }

        // Base result object
        const baseResult: Record<string, any> = {};

        // For add operation
        if (params.operation === "add") {
          const result: Record<string, any> = {
            ...baseResult,
            id: params.id,
            type: "agent", // Always agent type
            role: params.role,
            content: params.content,
          };

          return result;
        }

        // For get operation
        if (params.operation === "get") {
          return {
            ...baseResult,
            id: params.id,
          };
        }

        // For delete operation
        if (params.operation === "delete") {
          return {
            ...baseResult,
            id: params.id,
          };
        }

        // For getAll operation
        return baseResult;
      },
    },
  },
  inputs: {
    operation: { type: "string", description: "Operation to perform" },
    id: { type: "string", description: "Memory identifier" },
    role: { type: "string", description: "Agent role" },
    content: { type: "string", description: "Memory content" },
  },
  outputs: {
    memories: { type: "json", description: "Memory data" },
    id: { type: "string", description: "Memory identifier" },
  },
};
