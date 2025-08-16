import type { BlockConfig } from "@/blocks/types";
import { EyeIcon } from "@/components/icons";
import type { VisionResponse } from "@/tools/vision/types";

export const VisionBlock: BlockConfig<VisionResponse> = {
  type: "vision",
  name: "图片分析",
  description: "使用视觉模型分析图片",
  longDescription:
    "使用自定义提示处理视觉内容，从图片中提取见解和信息。支持GPT-4V、Claude 3 Vision和Qwen VL等模型。",
  docsLink: "https://docs.sim.ai/tools/vision",
  category: "tools",
  bgColor: "#FF69B4",
  icon: EyeIcon,
  subBlocks: [
    {
      id: "imageUrl",
      title: "图片链接",
      type: "short-input",
      layout: "full",
      placeholder: "输入公开可访问的图片链接",
      required: true,
    },
    {
      id: "model",
      title: "视觉理解模型",
      type: "dropdown",
      layout: "half",
      options: [
        // { label: "gpt-4o", id: "gpt-4o" },
        // { label: "claude-3-opus", id: "claude-3-opus-20240229" },
        // { label: "claude-3-sonnet", id: "claude-3-sonnet-20240229" },
        { label: "qwen-vl-plus", id: "qwen-vl-plus" },
      ],
      value: () => "gpt-4o",
    },
    {
      id: "prompt",
      title: "提示词",
      type: "long-input",
      layout: "full",
      placeholder: "输入提示词",
      required: true,
    },
    {
      id: "apiKey",
      title: "API Key",
      type: "short-input",
      layout: "full",
      placeholder: "Enter your API key",
      password: true,
      required: true,
    },
  ],
  tools: {
    access: ["vision_tool"],
  },
  inputs: {
    apiKey: { type: "string", description: "Provider API key" },
    imageUrl: { type: "string", description: "Image URL" },
    model: { type: "string", description: "Vision model" },
    prompt: { type: "string", description: "Analysis prompt" },
  },
  outputs: {
    content: { type: "string", description: "Analysis result" },
    model: { type: "string", description: "Model used" },
    tokens: { type: "number", description: "Token usage" },
  },
};
