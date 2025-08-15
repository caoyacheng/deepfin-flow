import type { BlockConfig } from "@/blocks/types";
import { QwenIcon } from "@/components/icons";

export const OpenAIBlock: BlockConfig = {
  type: "openai",
  name: "Embeddings",
  description: "Generate Qwen embeddings",
  longDescription:
    "Convert text into numerical vector representations using Alibaba Cloud Qwen embedding models. Transform text data into embeddings for semantic search, clustering, and other vector-based operations.",
  category: "tools",
  docsLink:
    "https://bailian.console.aliyun.com/?spm=5176.29597918.J__Xz0dtrgG-8e2H7vxPlPy.7.cc757b08HCR3JX&tab=doc#/doc/?type=model&url=2842587",
  bgColor: "#8B5CF6",
  icon: QwenIcon,
  subBlocks: [
    {
      id: "input",
      title: "输入文本",
      type: "long-input",
      layout: "full",
      placeholder: "Enter text to generate embeddings for",
      required: true,
    },
    {
      id: "model",
      title: "模型",
      type: "dropdown",
      layout: "full",
      options: [
        { label: "text-embedding-v3", id: "text-embedding-v3" },
        { label: "text-embedding-v4", id: "text-embedding-v4" },
      ],
      value: () => "text-embedding-v4",
    },
    {
      id: "apiKey",
      title: "API Key",
      type: "short-input",
      layout: "full",
      placeholder: "Enter your Alibaba Cloud API key",
      password: true,
      required: true,
    },
  ],
  tools: {
    access: ["openai_embeddings"],
  },
  inputs: {
    input: { type: "string", description: "Text to embed" },
    model: { type: "string", description: "Embedding model" },
    apiKey: { type: "string", description: "Alibaba Cloud API key" },
  },
  outputs: {
    embeddings: { type: "json", description: "Generated embeddings" },
    model: { type: "string", description: "Model used" },
    usage: { type: "json", description: "Token usage" },
  },
};
