import type { BlockConfig } from "@/blocks/types";
import { ImageIcon } from "@/components/icons";
import type { DalleResponse } from "@/tools/openai/types";

export const ImageGeneratorBlock: BlockConfig<DalleResponse> = {
  type: "image_generator",
  name: "图片生成",
  description: "Generate images",
  longDescription:
    "Create high-quality images using OpenAI's DALL-E and GPT Image models, or Alibaba Cloud's Qwen Image models. Configure resolution, quality, style, and other parameters to get exactly the image you need.",
  docsLink: "https://docs.sim.ai/tools/image_generator",
  category: "tools",
  bgColor: "#5A4DFF",
  icon: ImageIcon,
  subBlocks: [
    {
      id: "model",
      title: "模型",
      type: "dropdown",
      layout: "half",
      options: [
        // { label: "DALL-E 3", id: "dall-e-3" },
        // { label: "GPT Image", id: "gpt-image-1" },
        { label: "通义万相 Flash", id: "wan2.2-t2i-flash" },
        { label: "通义万相 Plus", id: "wan2.2-t2i-plus" },
      ],
      value: () => "dall-e-3",
    },
    {
      id: "prompt",
      title: "提示词",
      type: "long-input",
      layout: "full",
      required: true,
      placeholder: "描述你想生成的图片",
    },
    {
      id: "size",
      title: "尺寸",
      type: "dropdown",
      layout: "half",
      options: [
        { label: "1024x1024", id: "1024x1024" },
        { label: "1024x1792", id: "1024x1792" },
        { label: "1792x1024", id: "1792x1024" },
      ],
      value: () => "1024x1024",
      condition: { field: "model", value: "dall-e-3" },
    },
    {
      id: "size",
      title: "尺寸",
      type: "dropdown",
      layout: "half",
      options: [
        { label: "Auto", id: "auto" },
        { label: "1024x1024", id: "1024x1024" },
        { label: "1536x1024", id: "1536x1024" },
        { label: "1024x1536", id: "1024x1536" },
      ],
      value: () => "auto",
      condition: { field: "model", value: "gpt-image-1" },
    },
    {
      id: "quality",
      title: "Quality",
      type: "dropdown",
      layout: "half",
      options: [
        { label: "Standard", id: "standard" },
        { label: "HD", id: "hd" },
      ],
      value: () => "standard",
      condition: { field: "model", value: "dall-e-3" },
    },
    {
      id: "style",
      title: "Style",
      type: "dropdown",
      layout: "half",
      options: [
        { label: "Vivid", id: "vivid" },
        { label: "Natural", id: "natural" },
      ],
      value: () => "vivid",
      condition: { field: "model", value: "dall-e-3" },
    },
    {
      id: "background",
      title: "Background",
      type: "dropdown",
      layout: "half",
      options: [
        { label: "Auto", id: "auto" },
        { label: "Transparent", id: "transparent" },
        { label: "Opaque", id: "opaque" },
      ],
      value: () => "auto",
      condition: { field: "model", value: "gpt-image-1" },
    },
    {
      id: "size",
      title: "尺寸",
      type: "dropdown",
      layout: "half",
      options: [
        { label: "1024*1024", id: "1024*1024" },
        { label: "1024*1792", id: "1024*1792" },
        { label: "1792*1024", id: "1792*1024" },
        { label: "2048*2048", id: "2048*2048" },
      ],
      value: () => "1024*1024",
      condition: { field: "model", value: "wan2.2-t2i-flash" },
    },
    {
      id: "size",
      title: "尺寸",
      type: "dropdown",
      layout: "half",
      options: [
        { label: "1024*1024", id: "1024*1024" },
        { label: "1024*1792", id: "1024*1792" },
        { label: "1792*1024", id: "1792*1024" },
        { label: "2048*2048", id: "2048*2048" },
      ],
      value: () => "1024*1024",
      condition: { field: "model", value: "wan2.2-t2i-plus" },
    },
    {
      id: "apiKey",
      title: "API Key",
      type: "short-input",
      layout: "full",
      required: true,
      placeholder: "Enter your API key (OpenAI or Alibaba Cloud DashScope)",
      password: true,
      connectionDroppable: false,
    },
  ],
  tools: {
    access: ["openai_image", "qwen_image"],
    config: {
      tool: (params) => {
        if (
          params.model === "wan2.2-t2i-flash" ||
          params.model === "wan2.2-t2i-plus"
        ) {
          return "qwen_image";
        }
        return "openai_image";
      },
      params: (params) => {
        if (!params.apiKey) {
          throw new Error("API key is required");
        }
        if (!params.prompt) {
          throw new Error("Prompt is required");
        }

        // Base parameters for all models
        const baseParams = {
          prompt: params.prompt,
          model: params.model || "dall-e-3",
          size: params.size || "1024*1024",
          apiKey: params.apiKey,
        };

        if (params.model === "dall-e-3") {
          return {
            ...baseParams,
            quality: params.quality || "standard",
            style: params.style || "vivid",
          };
        }
        if (params.model === "gpt-image-1") {
          return {
            ...baseParams,
            ...(params.background && { background: params.background }),
          };
        }
        if (
          params.model === "wan2.2-t2i-flash" ||
          params.model === "wan2.2-t2i-plus"
        ) {
          return {
            ...baseParams,
            model: params.model,
          };
        }

        return baseParams;
      },
    },
  },
  inputs: {
    prompt: { type: "string", description: "Image description prompt" },
    model: { type: "string", description: "Image generation model" },
    size: { type: "string", description: "Image dimensions" },
    quality: { type: "string", description: "Image quality level" },
    style: { type: "string", description: "Image style" },
    background: { type: "string", description: "Background type" },
    apiKey: {
      type: "string",
      description: "API key (OpenAI or Alibaba Cloud DashScope)",
    },
  },
  outputs: {
    content: { type: "string", description: "Generation response" },
    image: { type: "string", description: "Generated image URL" },
    metadata: { type: "json", description: "Generation metadata" },
  },
};
