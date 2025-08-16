# Qwen VL Plus 视觉模型集成总结

## 🎯 目标

在 deepfin-flow 平台中增加对阿里云通义千问视觉语言模型 `qwen-vl-plus` 的支持，使用户能够使用该模型进行图像分析。

## 📝 修改内容

### 1. 更新 Provider 模型定义

**文件**: `apps/sim/providers/models.ts`

在 qwen provider 的模型列表中添加了 `qwen-vl-plus` 模型：

```typescript
{
  id: "qwen-vl-plus",
  pricing: {
    input: 1.0,
    output: 2.0,
    updatedAt: "2025-01-20",
  },
  capabilities: {
    temperature: { min: 0, max: 2 },
    toolUsageControl: true,
    vision: true,  // 标记为视觉模型
  },
}
```

### 2. 更新 Vision Tool

**文件**: `apps/sim/tools/vision/tool.ts`

#### 2.1 添加 qwen-vl 模型的路由支持

```typescript
url: (params) => {
  if (params.model?.startsWith("claude-3")) {
    return "https://api.anthropic.com/v1/messages";
  }
  if (params.model?.startsWith("qwen-vl")) {
    return "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
  }
  return "https://api.openai.com/v1/chat/completions";
};
```

#### 2.2 添加 qwen-vl 模型的请求头处理

```typescript
if (params.model?.startsWith("qwen-vl")) {
  return {
    ...headers,
    Authorization: `Bearer ${params.apiKey}`,
  };
}
```

#### 2.3 添加 qwen-vl 模型的请求体处理

```typescript
if (params.model?.startsWith("qwen-vl")) {
  return {
    model: params.model,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: params.imageUrl,
            },
          },
        ],
      },
    ],
    max_tokens: 1000,
  };
}
```

#### 2.4 更新模型描述

```typescript
description: "Vision model to use (gpt-4o, claude-3-opus-20240229, qwen-vl-plus, etc)";
```

### 3. 更新 Vision Block

**文件**: `apps/sim/blocks/blocks/vision.ts`

#### 3.1 添加 qwen-vl-plus 模型选项

```typescript
options: [
  { label: "gpt-4o", id: "gpt-4o" },
  { label: "claude-3-opus", id: "claude-3-opus-20240229" },
  { label: "claude-3-sonnet", id: "claude-3-sonnet-20240229" },
  { label: "qwen-vl-plus", id: "qwen-vl-plus" }, // 新增
];
```

#### 3.2 更新标题和描述

- 标题从"视频理解模型"改为"视觉理解模型"
- 长描述增加了对 Qwen VL 等模型的支持说明

### 4. 创建文档

**文件**: `apps/sim/tools/vision/README.md`

创建了详细的 Vision Tool 使用文档，包括：

- 支持的模型列表
- 使用方法示例
- API 端点信息
- 模型特性说明
- 价格信息
- 注意事项

## 🔧 技术实现

### API 兼容性

qwen-vl-plus 模型通过阿里云的 DashScope API 提供服务，该 API 完全兼容 OpenAI 的 API 格式，因此：

- 使用相同的请求结构
- 支持相同的消息格式
- 兼容 image_url 类型的图片输入
- 返回格式与 OpenAI 一致

### 模型识别

通过模型名称前缀 `qwen-vl` 来识别 Qwen 视觉模型，确保：

- 正确的 API 端点
- 正确的认证方式
- 正确的请求格式

### 错误处理

保持了原有的错误处理机制，确保：

- 统一的错误响应格式
- 详细的错误信息
- 便于调试和问题排查

## ✅ 验证结果

通过测试验证了以下功能：

1. **URL 生成**: ✅ 正确生成 DashScope API 端点
2. **Headers 生成**: ✅ 正确设置 Authorization 头
3. **请求体生成**: ✅ 正确构建 OpenAI 兼容的请求格式
4. **模型支持**: ✅ 正确识别和处理 qwen-vl-plus 模型

## 🚀 使用方法

### 1. 在 Vision Block 中选择模型

用户可以在 Vision Block 的下拉菜单中选择 `qwen-vl-plus` 模型。

### 2. 配置 API Key

使用阿里云 DashScope 的 API Key，格式为 `sk-xxx`。

### 3. 提供图片 URL

输入公开可访问的图片链接。

### 4. 设置提示词

使用中文或英文提示词来描述分析需求。

## 💰 价格信息

- **输入 tokens**: $1.0 per 1M tokens
- **输出 tokens**: $2.0 per 1M tokens

相比其他视觉模型，qwen-vl-plus 提供了更具竞争力的价格。

## 🌟 优势特点

1. **中文支持**: 原生支持中文图像理解和分析
2. **价格实惠**: 相比 GPT-4V 等模型价格更低
3. **响应快速**: 阿里云基础设施确保低延迟
4. **完全兼容**: OpenAI API 格式，易于集成
5. **功能完整**: 支持温度控制、工具调用等高级功能

## 📚 参考文档

- [阿里云 DashScope API 文档](https://help.aliyun.com/zh/dashscope/)
- [通义千问模型介绍](https://help.aliyun.com/zh/model-studio/getting-started/models)
- [Vision Tool 使用说明](./tools/vision/README.md)

## 🎉 总结

成功集成了 qwen-vl-plus 视觉模型到 deepfin-flow 平台，为用户提供了：

- 更多的模型选择
- 更具竞争力的价格
- 更好的中文支持
- 完整的视觉分析功能

该集成完全向后兼容，不会影响现有功能，同时扩展了平台的视觉模型能力。
