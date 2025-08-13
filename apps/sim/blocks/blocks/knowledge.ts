import type { BlockConfig } from "@/blocks/types";
import { PackageSearchIcon } from "@/components/icons";

export const KnowledgeBlock: BlockConfig = {
  type: "knowledge",
  name: "知识库",
  description: "Use vector search",
  longDescription:
    "在知识库中执行语义向量搜索，可将文本内容作为分块上传到已有文档，或创建新文档。利用先进的 AI 向量嵌入理解语义和上下文，实现高效搜索操作。",
  bgColor: "#00B0B0",
  icon: PackageSearchIcon,
  category: "blocks",
  docsLink: "https://docs.sim.ai/blocks/knowledge",
  subBlocks: [
    {
      id: "operation",
      title: "操作",
      type: "dropdown",
      layout: "full",
      options: [
        { label: "搜索", id: "search" },
        { label: "上传分块", id: "upload_chunk" },
        { label: "创建文档", id: "create_document" },
      ],
      value: () => "search",
    },
    {
      id: "knowledgeBaseId",
      title: "知识库",
      type: "knowledge-base-selector",
      layout: "full",
      placeholder: "请选择知识库（必填）",
      multiSelect: false,
      required: true,
      condition: {
        field: "operation",
        value: ["search", "upload_chunk", "create_document"],
      },
    },
    {
      id: "query",
      title: "搜索查询",
      type: "short-input",
      layout: "full",
      placeholder: "请输入搜索查询（可选，使用标签过滤时）",
      required: false,
      condition: { field: "operation", value: "search" },
    },
    {
      id: "topK",
      title: "返回结果数量",
      type: "short-input",
      layout: "full",
      placeholder: "请输入要返回的结果数量（默认：10）",
      condition: { field: "operation", value: "search" },
    },
    {
      id: "tagFilters",
      title: "标签过滤",
      type: "knowledge-tag-filters",
      layout: "full",
      placeholder: "请添加标签过滤条件",
      condition: { field: "operation", value: "search" },
      mode: "advanced",
    },
    {
      id: "documentId",
      title: "文档",
      type: "document-selector",
      layout: "full",
      placeholder: "请选择文档（必填）",
      required: true,
      condition: { field: "operation", value: "upload_chunk" },
    },
    {
      id: "content",
      title: "分块内容",
      type: "long-input",
      layout: "full",
      placeholder: "请输入要上传的分块内容（必填）",
      rows: 6,
      required: true,
      condition: { field: "operation", value: "upload_chunk" },
    },
    {
      id: "name",
      title: "文档名称",
      type: "short-input",
      layout: "full",
      placeholder: "请输入文档名称（必填）",
      required: true,
      condition: { field: "operation", value: ["create_document"] },
    },
    {
      id: "content",
      title: "文档内容",
      type: "long-input",
      layout: "full",
      placeholder: "请输入文档内容（必填）",
      rows: 6,
      required: true,
      condition: { field: "operation", value: ["create_document"] },
    },
    // Dynamic tag entry for Create Document
    {
      id: "documentTags",
      title: "文档标签",
      type: "document-tag-entry",
      layout: "full",
      condition: { field: "operation", value: "create_document" },
    },
  ],
  tools: {
    access: [
      "knowledge_search",
      "knowledge_upload_chunk",
      "knowledge_create_document",
    ],
    config: {
      tool: (params) => {
        switch (params.operation) {
          case "search":
            return "knowledge_search";
          case "upload_chunk":
            return "knowledge_upload_chunk";
          case "create_document":
            return "knowledge_create_document";
          default:
            return "knowledge_search";
        }
      },
      params: (params) => {
        // Validate required fields for each operation
        if (params.operation === "search" && !params.knowledgeBaseId) {
          throw new Error("搜索操作需要知识库ID");
        }
        if (
          (params.operation === "upload_chunk" ||
            params.operation === "create_document") &&
          !params.knowledgeBaseId
        ) {
          throw new Error("上传分块和创建文档操作需要知识库ID");
        }
        if (params.operation === "upload_chunk" && !params.documentId) {
          throw new Error("上传分块操作需要文档ID");
        }

        return params;
      },
    },
  },
  inputs: {
    operation: { type: "string", description: "执行的操作" },
    knowledgeBaseId: {
      type: "string",
      description: "知识库标识符",
    },
    query: { type: "string", description: "搜索查询" },
    topK: { type: "number", description: "返回结果数量" },
    documentId: { type: "string", description: "文档标识符" },
    content: { type: "string", description: "内容数据" },
    name: { type: "string", description: "文档名称" },
    // Dynamic tag filters for search
    tagFilters: { type: "string", description: "标签过滤条件" },
    // Document tags for create document (JSON string of tag objects)
    documentTags: { type: "string", description: "文档标签" },
  },
  outputs: {
    results: { type: "json", description: "搜索结果" },
    query: { type: "string", description: "使用的查询" },
    totalResults: { type: "number", description: "总结果数量" },
  },
};
