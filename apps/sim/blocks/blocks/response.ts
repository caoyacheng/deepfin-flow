import type { BlockConfig } from "@/blocks/types";
import { ResponseIcon } from "@/components/icons";
import type { ResponseBlockOutput } from "@/tools/response/types";

export const ResponseBlock: BlockConfig<ResponseBlockOutput> = {
  type: "response",
  name: "响应",
  description: "Send structured API response",
  longDescription:
    "Transform your workflow's variables into a structured HTTP response for API calls. Define response data, status code, and headers. This is the final block in a workflow and cannot have further connections.",
  docsLink: "https://docs.sim.ai/blocks/response",
  category: "blocks",
  bgColor: "#2F55FF",
  icon: ResponseIcon,
  subBlocks: [
    {
      id: "dataMode",
      title: "响应数据模式",
      type: "dropdown",
      layout: "full",
      options: [
        { label: "构建器", id: "structured" },
        { label: "编辑器", id: "json" },
      ],
      value: () => "structured",
      description: "选择如何定义你的响应数据结构",
    },
    {
      id: "builderData",
      title: "响应结构",
      type: "response-format",
      layout: "full",
      condition: { field: "dataMode", value: "structured" },
      description:
        "定义你的响应数据结构。使用<variable.name>在字段名称中引用工作流变量。",
    },
    {
      id: "data",
      title: "响应数据",
      type: "code",
      layout: "full",
      placeholder:
        '{\n  "message": "Hello world",\n  "userId": "<variable.userId>"\n}',
      language: "json",
      condition: { field: "dataMode", value: "json" },
      description:
        "将作为响应体发送的数据。使用<variable.name>引用工作流变量。",
      wandConfig: {
        enabled: true,
        maintainHistory: true,
        prompt: `You are an expert JSON programmer.
Generate ONLY the raw JSON object based on the user's request.
The output MUST be a single, valid JSON object, starting with { and ending with }.

Current response: {context}

Do not include any explanations, markdown formatting, or other text outside the JSON object.

You have access to the following variables you can use to generate the JSON body:
- 'params' (object): Contains input parameters derived from the JSON schema. Access these directly using the parameter name wrapped in angle brackets, e.g., '<paramName>'. Do NOT use 'params.paramName'.
- 'environmentVariables' (object): Contains environment variables. Reference these using the double curly brace syntax: '{{ENV_VAR_NAME}}'. Do NOT use 'environmentVariables.VAR_NAME' or env.

Example:
{
  "name": "<block.agent.response.content>",
  "age": <block.function.output.age>,
  "success": true
}`,
        placeholder: "描述你需要的API响应结构",
        generationType: "json-object",
      },
    },
    {
      id: "status",
      title: "状态码",
      type: "short-input",
      layout: "half",
      placeholder: "200",
      description: "HTTP状态码(默认: 200)",
    },
    {
      id: "headers",
      title: "响应头",
      type: "table",
      layout: "full",
      columns: ["Key", "Value"],
      description: "额外的HTTP头信息",
    },
  ],
  tools: { access: [] },
  inputs: {
    dataMode: {
      type: "string",
      description: "Response data definition mode",
    },
    builderData: {
      type: "json",
      description: "Structured response data",
    },
    data: {
      type: "json",
      description: "JSON response body",
    },
    status: {
      type: "number",
      description: "HTTP status code",
    },
    headers: {
      type: "json",
      description: "Response headers",
    },
  },
  outputs: {
    data: { type: "json", description: "Response data" },
    status: { type: "number", description: "HTTP status code" },
    headers: { type: "json", description: "Response headers" },
  },
};
