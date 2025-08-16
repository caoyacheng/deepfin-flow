# Vision Tool

Vision Tool 是一个强大的图像分析工具，支持多种视觉模型来分析图片内容。

## 支持的模型

### 1. OpenAI 模型

- **gpt-4o** - OpenAI的GPT-4 Vision模型，强大的图像理解能力

### 2. Anthropic 模型

- **claude-3-opus-20240229** - Claude 3 Opus视觉模型
- **claude-3-sonnet-20240229** - Claude 3 Sonnet视觉模型

### 3. 阿里云 Qwen 模型

- **qwen-vl-plus** - 阿里云通义千问视觉语言模型，支持中文图像理解

## 使用方法

### 基本参数

- **apiKey**: 对应模型提供商的API密钥
- **imageUrl**: 公开可访问的图片链接
- **model**: 选择要使用的视觉模型
- **prompt**: 自定义分析提示词

### 使用示例

#### 使用 qwen-vl-plus 模型

```typescript
const params = {
  apiKey: "your-dashscope-api-key",
  imageUrl: "https://example.com/image.jpg",
  model: "qwen-vl-plus",
  prompt: "请分析这张图片中有什么内容？",
};
```

#### 使用 GPT-4 Vision 模型

```typescript
const params = {
  apiKey: "your-openai-api-key",
  imageUrl: "https://example.com/image.jpg",
  model: "gpt-4o",
  prompt: "What do you see in this image?",
};
```

#### 使用 Claude 3 Vision 模型

```typescript
const params = {
  apiKey: "your-anthropic-api-key",
  imageUrl: "https://example.com/image.jpg",
  model: "claude-3-opus-20240229",
  prompt: "Describe the content of this image",
};
```

## API 端点

- **OpenAI**: `https://api.openai.com/v1/chat/completions`
- **Anthropic**: `https://api.anthropic.com/v1/messages`
- **Qwen**: `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`

## 模型特性

### qwen-vl-plus

- **提供商**: 阿里云
- **API**: DashScope API
- **特点**:
  - 支持中文图像理解
  - 价格实惠
  - 响应速度快
  - 支持温度控制 (0-2)
  - 支持工具调用

### 价格信息

- **输入tokens**: $1.0 per 1M tokens
- **输出tokens**: $2.0 per 1M tokens

## 注意事项

1. **API密钥**: 确保使用正确的API密钥格式
2. **图片URL**: 图片必须是公开可访问的
3. **模型兼容性**: 不同模型对图片格式和大小有不同的要求
4. **速率限制**: 注意各提供商的API调用限制

## 错误处理

工具包含完善的错误处理机制，会返回详细的错误信息和状态码，便于调试和问题排查。

## 更多信息

- [阿里云DashScope API文档](https://help.aliyun.com/zh/dashscope/)
- [OpenAI Vision API文档](https://platform.openai.com/docs/guides/vision)
- [Anthropic Claude API文档](https://docs.anthropic.com/claude/docs)
