# Kimi Provider

Kimi 提供者集成，支持 Moonshot AI 的 Kimi 模型。

## 支持的模型

- **moonshot-v1-8k** - 8K 上下文窗口模型
- **moonshot-v1-32k** - 32K 上下文窗口模型
- **moonshot-v1-128k** - 128K 上下文窗口模型
- **kimi-k2-0711-preview** - K2 0711 预览模型
- **kimi-k2-turbo-preview** - K2 Turbo 预览模型

## 配置

### API 端点

- **Base URL**: `https://api.moonshot.cn/v1`
- **API 格式**: OpenAI 兼容

### 定价

- **moonshot-v1-8k/32k/128k**: $0.12/$0.12 每百万令牌（输入/输出）
- **kimi-k2-0711-preview**: $0.15/$0.15 每百万令牌（输入/输出）
- **kimi-k2-turbo-preview**: $0.08/$0.08 每百万令牌（输入/输出）
- **更新时间**: 2025-01-20

## 功能特性

### ✅ 支持的功能

- 流式响应
- 工具调用 (Function Calling)
- 温度控制 (0-2)
- 结构化输出 (JSON Schema)
- 上下文管理
- 令牌使用统计
- 成本计算

### 🔧 技术特性

- OpenAI API 兼容
- 动态导入避免循环依赖
- 完整的错误处理
- 详细的时序统计
- 工具执行循环支持

## 使用方法

### 1. 选择提供者

在 deepfin-flow 平台中选择 "kimi" 作为 LLM 提供者。

### 2. 配置 API 密钥

设置您的 Moonshot API 密钥。

### 3. 选择模型

根据需要选择合适的模型：

- **moonshot-v1-8k**: 适合一般对话和任务
- **moonshot-v1-32k**: 适合长文档处理
- **moonshot-v1-128k**: 适合超长上下文任务
- **kimi-k2-0711-preview**: 适合高级对话和复杂任务
- **kimi-k2-turbo-preview**: 适合快速响应和轻量级任务

## API 兼容性

Kimi 提供者完全兼容 OpenAI API 格式，支持：

- 消息格式
- 工具定义
- 流式响应
- 温度控制
- 最大令牌限制
- 响应格式控制

## 示例

### 基本对话

```typescript
const response = await kimiProvider.executeRequest({
  model: "moonshot-v1-8k",
  messages: [{ role: "user", content: "你好，请介绍一下自己" }],
  temperature: 0.7,
});
```

### 工具调用

```typescript
const response = await kimiProvider.executeRequest({
  model: "moonshot-v1-8k",
  messages: [{ role: "user", content: "查询今天的天气" }],
  tools: [
    {
      name: "get_weather",
      description: "获取天气信息",
      parameters: {
        /* ... */
      },
    },
  ],
});
```

## 注意事项

1. **API 密钥**: 确保您的 Moonshot API 密钥有效且有足够配额
2. **模型选择**: 根据任务复杂度选择合适的模型
3. **上下文长度**: 注意不同模型的上下文窗口限制
4. **成本控制**: 监控令牌使用量和成本

## 技术支持

如有问题，请参考：

- [Moonshot 官方文档](https://platform.moonshot.cn/docs/api/chat)
- deepfin-flow 平台文档
- 项目 GitHub Issues
