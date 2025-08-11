import type { BlockConfig } from "@/blocks/types";
import { StartIcon } from "@/components/icons";

export const StarterBlock: BlockConfig = {
  type: "starter",
  name: "Starter",
  description: "Start workflow",
  longDescription: "通过手动启动工作流，可为 API 调用提供可选的结构化输入。",
  category: "blocks",
  bgColor: "#2FB3FF",
  icon: StartIcon,
  subBlocks: [
    // Main trigger selector
    {
      id: "startWorkflow",
      title: "启动工作流",
      type: "dropdown",
      layout: "full",
      options: [
        { label: "手动运行", id: "manual" },
        { label: "对话", id: "chat" },
      ],
      value: () => "manual",
    },
    // Structured Input format - visible if manual run is selected (advanced mode)
    {
      id: "inputFormat",
      title: "输入格式（用于 API 调用）",
      type: "input-format",
      layout: "full",
      mode: "advanced",
      condition: { field: "startWorkflow", value: "manual" },
    },
  ],
  tools: {
    access: [],
  },
  inputs: {
    input: { type: "json", description: "Workflow input data" },
  },
  outputs: {}, // No outputs - starter blocks initiate workflow execution
};
