import type { BlockConfig } from "@/blocks/types";
import { WorkflowIcon } from "@/components/icons";
import { createLogger } from "@/lib/logs/console/logger";
import { useWorkflowRegistry } from "@/stores/workflows/registry/store";
import type { ToolResponse } from "@/tools/types";

const logger = createLogger("WorkflowBlock");

interface WorkflowResponse extends ToolResponse {
  output: {
    success: boolean;
    childWorkflowName: string;
    result: any;
    error?: string;
  };
}

// Helper function to get available workflows for the dropdown
const getAvailableWorkflows = (): Array<{ label: string; id: string }> => {
  try {
    const { workflows, activeWorkflowId } = useWorkflowRegistry.getState();

    // Filter out the current workflow to prevent recursion
    const availableWorkflows = Object.entries(workflows)
      .filter(([id]) => id !== activeWorkflowId)
      .map(([id, workflow]) => ({
        label: workflow.name || `Workflow ${id.slice(0, 8)}`,
        id: id,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return availableWorkflows;
  } catch (error) {
    logger.error("Error getting available workflows:", error);
    return [];
  }
};

export const WorkflowBlock: BlockConfig = {
  type: "workflow",
  name: "子工作流",
  description: "Execute another workflow",
  category: "blocks",
  bgColor: "#705335",
  icon: WorkflowIcon,
  subBlocks: [
    {
      id: "workflowId",
      title: "选择工作流",
      type: "dropdown",
      options: getAvailableWorkflows,
      required: true,
    },
    {
      id: "input",
      title: "输入变量 (可选)",
      type: "short-input",
      placeholder: "选择一个变量传递给子工作流",
      description: "这个变量将在子工作流中作为 start.input 可用",
      required: false,
    },
  ],
  tools: {
    access: ["workflow_executor"],
  },
  inputs: {
    workflowId: {
      type: "string",
      description: "ID of the workflow to execute",
    },
    input: {
      type: "string",
      description: "Variable reference to pass to the child workflow",
    },
  },
  outputs: {
    success: { type: "boolean", description: "Execution success status" },
    childWorkflowName: { type: "string", description: "Child workflow name" },
    result: { type: "json", description: "Workflow execution result" },
    error: { type: "string", description: "Error message" },
  },
};
