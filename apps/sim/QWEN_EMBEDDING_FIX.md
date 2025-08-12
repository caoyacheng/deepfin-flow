# Qwen3-Embedding API 问题修复说明

## 问题描述

在使用阿里云Qwen3-Embedding API时，遇到了以下错误：

```
"Qwen3-Embedding API error: 400 Bad Request - The input parameter requires json format"
```

## 问题分析

### 根本原因

1. **文本长度超限**: 阿里云Qwen3-Embedding API对单个文本块的长度有限制
2. **特殊字符问题**: 包含换行符、等号、空格等特殊字符可能导致JSON解析问题
3. **API格式要求**: "The input parameter requires json format" 提示输入格式不正确

### 具体表现

从日志可以看到，发送给API的文本内容非常长且复杂：

- Excel表格内容：包含了整个"劳动用工情况统计表"的完整内容
- 文本过长：单个文本块包含了大量数据
- 特殊字符：包含换行符、等号、空格、数字等

## 修复方案

### 1. 文本清理和长度限制

```typescript
// Clean the text: remove null bytes, normalize whitespace, limit length
let cleaned = text
  .replace(/\0/g, "") // Remove null bytes
  .replace(/\r\n/g, "\n") // Normalize line endings
  .replace(/\r/g, "\n") // Normalize line endings
  .trim();

// Limit text length to 8000 characters (Qwen API limit)
if (cleaned.length > 8000) {
  logger.warn(
    `Text too long (${cleaned.length} chars), truncating to 8000 chars`
  );
  cleaned = cleaned.substring(0, 8000) + "...";
}
```

### 2. 增强的错误日志

```typescript
logger.error("Qwen3-Embedding API error response:", {
  status: response.status,
  statusText: response.statusText,
  errorText,
  requestBody: {
    model: embeddingModel,
    input: cleanedBatch,
  },
  // Add more debugging info
  inputLengths: cleanedBatch.map((text, i) => ({
    index: i,
    length: text.length,
  })),
  totalChars: cleanedBatch.reduce((sum, t) => sum + t.length, 0),
  sampleText: cleanedBatch[0]?.substring(0, 200) + "...",
});
```

### 3. JSON序列化验证

```typescript
// Validate that the request body can be properly serialized
let requestBodyJson;
try {
  requestBodyJson = JSON.stringify(requestBody);
  logger.debug(`Request body JSON length: ${requestBodyJson.length} chars`);
} catch (jsonError) {
  const errorMessage =
    jsonError instanceof Error ? jsonError.message : String(jsonError);
  logger.error("Failed to serialize request body to JSON:", jsonError);
  throw new Error(`Failed to serialize request body: ${errorMessage}`);
}
```

## 修复效果

### 解决的问题

1. ✅ **文本长度限制**: 自动截断超过8000字符的文本
2. ✅ **特殊字符处理**: 清理和标准化换行符等特殊字符
3. ✅ **JSON验证**: 确保请求体可以正确序列化
4. ✅ **错误诊断**: 提供详细的调试信息

### 预期结果

- 长文本会自动截断，避免API错误
- 特殊字符会被正确处理
- 提供更好的错误诊断信息
- 提高API调用的成功率

## 测试验证

### 运行测试脚本

```bash
node test-qwen-embeddings-fixed.js
```

### 测试内容

1. **短文本**: 正常长度的文本
2. **中等文本**: 中等长度的文本
3. **长文本**: 超过8000字符的文本（会被截断）
4. **特殊字符**: 包含换行符、等号等的文本

## 注意事项

### 1. 文本截断

- 超过8000字符的文本会被截断，并添加"..."
- 这可能会影响某些长文档的完整性
- 建议在文档分块阶段就控制chunk大小

### 2. 性能影响

- 文本清理会增加少量处理时间
- JSON验证会确保请求的可靠性
- 总体性能影响很小

### 3. 监控建议

- 关注日志中的文本截断警告
- 监控API调用的成功率
- 定期检查错误日志

## 后续优化建议

### 1. 文档分块优化

在文档处理阶段就控制chunk大小，避免生成过长的文本块：

```typescript
// 建议的chunk大小
const recommendedChunkSize = 4000; // 字符数
const recommendedChunkOverlap = 200; // 字符数
```

### 2. 文本预处理

在发送到API之前，对文本进行更智能的预处理：

```typescript
// 智能文本分割
const smartSplit = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return [text];

  // 按句子或段落分割
  const sentences = text.split(/[.!?。！？]/);
  const chunks = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
};
```

### 3. 错误重试策略

对于400错误，可以考虑不同的重试策略：

```typescript
// 智能重试策略
if (response.status === 400 && errorText.includes("text too long")) {
  // 尝试分割文本后重试
  return await retryWithShorterTexts(texts);
}
```

## 总结

通过这次修复，我们解决了Qwen3-Embedding API的主要问题：

1. **文本长度限制**: 自动截断超长文本
2. **特殊字符处理**: 清理和标准化文本格式
3. **错误诊断**: 提供详细的调试信息
4. **可靠性提升**: JSON验证和错误处理

这些修复应该能显著提高API调用的成功率，并为后续的问题诊断提供更好的支持。
