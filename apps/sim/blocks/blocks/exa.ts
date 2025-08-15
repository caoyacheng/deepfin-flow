import type { BlockConfig } from "@/blocks/types";
import { ExaAIIcon } from "@/components/icons";
import type { ExaResponse } from "@/tools/exa/types";

export const ExaBlock: BlockConfig<ExaResponse> = {
  type: "exa",
  name: "Exa",
  description: "使用 Exa AI 进行搜索",
  longDescription:
    "使用 Exa 强大的 AI 搜索能力进行网页搜索、内容获取、相似链接查找和问题解答。",
  docsLink: "https://docs.sim.ai/tools/exa",
  category: "tools",
  bgColor: "#1F40ED",
  icon: ExaAIIcon,
  subBlocks: [
    {
      id: "operation",
      title: "操作",
      type: "dropdown",
      layout: "full",
      options: [
        { label: "搜索", id: "exa_search" },
        { label: "获取内容", id: "exa_get_contents" },
        { label: "查找相似链接", id: "exa_find_similar_links" },
        { label: "回答", id: "exa_answer" },
        { label: "研究", id: "exa_research" },
      ],
      value: () => "exa_search",
    },
    // Search operation inputs
    {
      id: "query",
      title: "搜索查询",
      type: "long-input",
      layout: "full",
      placeholder: "输入你的搜索查询",
      condition: { field: "operation", value: "exa_search" },
      required: true,
    },
    {
      id: "numResults",
      title: "结果数量",
      type: "short-input",
      layout: "full",
      placeholder: "10",
      condition: { field: "operation", value: "exa_search" },
    },
    {
      id: "useAutoprompt",
      title: "使用自动提示",
      type: "switch",
      layout: "full",
      condition: { field: "operation", value: "exa_search" },
    },
    {
      id: "type",
      title: "搜索类型",
      type: "dropdown",
      layout: "full",
      options: [
        { label: "自动", id: "auto" },
        { label: "神经网络", id: "neural" },
        { label: "关键词", id: "keyword" },
        { label: "快速", id: "fast" },
      ],
      value: () => "auto",
      condition: { field: "operation", value: "exa_search" },
    },
    // Get Contents operation inputs
    {
      id: "urls",
      title: "URLs",
      type: "long-input",
      layout: "full",
      placeholder: "输入要检索内容的URL（英文逗号分隔）",
      condition: { field: "operation", value: "exa_get_contents" },
      required: true,
    },
    {
      id: "text",
      title: "包含文本",
      type: "switch",
      layout: "full",
      condition: { field: "operation", value: "exa_get_contents" },
    },
    {
      id: "summaryQuery",
      title: "摘要查询",
      type: "long-input",
      layout: "full",
      placeholder: "输入一个查询来指导摘要生成",
      condition: { field: "operation", value: "exa_get_contents" },
    },
    // Find Similar Links operation inputs
    {
      id: "url",
      title: "URL",
      type: "long-input",
      layout: "full",
      placeholder: "输入URL以查找相似链接",
      condition: { field: "operation", value: "exa_find_similar_links" },
      required: true,
    },
    {
      id: "numResults",
      title: "结果数量",
      type: "short-input",
      layout: "full",
      placeholder: "10",
      condition: { field: "operation", value: "exa_find_similar_links" },
    },
    {
      id: "text",
      title: "包含文本",
      type: "switch",
      layout: "full",
      condition: { field: "operation", value: "exa_find_similar_links" },
    },
    // Answer operation inputs
    {
      id: "query",
      title: "问题",
      type: "long-input",
      layout: "full",
      placeholder: "输入你的问题",
      condition: { field: "operation", value: "exa_answer" },
      required: true,
    },
    {
      id: "text",
      title: "包含文本",
      type: "switch",
      layout: "full",
      condition: { field: "operation", value: "exa_answer" },
    },
    // Research operation inputs
    {
      id: "query",
      title: "研究查询",
      type: "long-input",
      layout: "full",
      placeholder: "输入你的研究主题或问题",
      condition: { field: "operation", value: "exa_research" },
      required: true,
    },
    {
      id: "includeText",
      title: "包含全文",
      type: "switch",
      layout: "full",
      condition: { field: "operation", value: "exa_research" },
    },
    // API Key (common)
    {
      id: "apiKey",
      title: "API Key",
      type: "short-input",
      layout: "full",
      placeholder: "输入你的Exa API key",
      password: true,
      required: true,
    },
  ],
  tools: {
    access: [
      "exa_search",
      "exa_get_contents",
      "exa_find_similar_links",
      "exa_answer",
      "exa_research",
    ],
    config: {
      tool: (params) => {
        // Convert numResults to a number for operations that use it
        if (params.numResults) {
          params.numResults = Number(params.numResults);
        }

        switch (params.operation) {
          case "exa_search":
            return "exa_search";
          case "exa_get_contents":
            return "exa_get_contents";
          case "exa_find_similar_links":
            return "exa_find_similar_links";
          case "exa_answer":
            return "exa_answer";
          case "exa_research":
            return "exa_research";
          default:
            return "exa_search";
        }
      },
    },
  },
  inputs: {
    operation: { type: "string", description: "操作" },
    apiKey: { type: "string", description: "Exa API key" },
    // Search operation
    query: { type: "string", description: "搜索查询" },
    numResults: { type: "number", description: "结果数量" },
    useAutoprompt: { type: "boolean", description: "使用自动提示" },
    type: { type: "string", description: "搜索类型" },
    // Get Contents operation
    urls: { type: "string", description: "要检索的URLs" },
    text: { type: "boolean", description: "包含文本" },
    summaryQuery: { type: "string", description: "摘要查询指导" },
    // Find Similar Links operation
    url: { type: "string", description: "源URL" },
  },
  outputs: {
    // Search output
    results: { type: "json", description: "搜索结果" },
    // Find Similar Links output
    similarLinks: { type: "json", description: "找到的相似链接" },
    // Answer output
    answer: { type: "string", description: "生成的答案" },
    citations: { type: "json", description: "答案引用" },
    // Research output
    research: { type: "json", description: "研究结果" },
  },
};
