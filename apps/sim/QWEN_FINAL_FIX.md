# Qwen3-Embedding API 最终修复说明

## 问题总结

我们遇到了两个主要问题：

### 1. **API调用错误**

- ❌ 代码仍在调用OpenAI API而不是Qwen3-Embedding API
- ❌ 错误信息："OpenAI API error: 404 Not Found"

### 2. **向量维度不匹配**

- ❌ Qwen3-Embedding API返回1024维向量
- ❌ 数据库期望1536维向量
- ❌ 错误信息："expected 1536 dimensions, not 1024"

## 修复内容

### 1. **完全替换API调用逻辑**

- ✅ 将`env.OPENAI_API_KEY`改为`env.DASHSCOPE_API_KEY`
- ✅ 将OpenAI API端点改为Qwen3-Embedding API端点
- ✅ 更新错误消息和日志信息
- ✅ 修改响应解析逻辑

### 2. **更新数据库Schema**

- ✅ 将向量维度从1536改为1024
- ✅ 更新两个表的向量列定义
- ✅ 创建数据库迁移脚本

### 3. **增强的文本处理**

- ✅ 文本清理和验证
- ✅ 长度限制和智能截断
- ✅ JSON序列化验证
- ✅ 详细的错误日志

## 修复后的代码结构

### **API配置**

```typescript
const dashscopeApiKey = env.DASHSCOPE_API_KEY;
if (!dashscopeApiKey) {
  throw new Error("DASHSCOPE_API_KEY not configured");
}
```

### **API端点**

```typescript
const response = await fetch(
  "https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding-v4/text-embedding",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${dashscopeApiKey}`,
      "Content-Type": "application/json",
      "X-DashScope-SSE": "disable",
    },
    body: finalRequestBodyJson,
    signal: controller.signal,
  }
);
```

### **响应解析**

```typescript
const data: QwenEmbeddingResponse = await response.json();
return data.output.embeddings.map((item) => item.embedding);
```

## 数据库更新

### **Schema变更**

```sql
-- 从1536维改为1024维
embedding: vector("embedding", { dimensions: 1024 })
```

### **迁移脚本**

- 文件：`db/migrations/0072_update_embedding_dimensions.sql`
- 自动更新现有向量列
- 重建HNSW索引

## 环境变量配置

确保`.env`文件包含：

```bash
# Aliyun DashScope API Key (for Qwen models)
DASHSCOPE_API_KEY=your_dashscope_api_key_here
```

## 测试步骤

### 1. **重启应用**

```bash
# 停止当前应用
# 重新启动
npm run dev
# 或
bun run dev
```

### 2. **运行数据库迁移**

```bash
# 如果使用drizzle-kit
npx drizzle-kit push

# 或者手动执行SQL
psql -d your_database -f db/migrations/0072_update_embedding_dimensions.sql
```

### 3. **测试文件上传**

- 上传一个文档
- 检查日志中的API调用信息
- 验证向量生成是否成功

## 预期结果

### **成功指标**

- ✅ 不再出现"OpenAI API error"
- ✅ 成功调用Qwen3-Embedding API
- ✅ 生成1024维向量
- ✅ 成功存储到数据库

### **日志示例**

```
[INFO] Generating embeddings for batch 1 (3 texts) using Qwen3-Embedding
[INFO] Sending 3 texts to Qwen3-Embedding API (total chars: 1500)
[INFO] Standard API endpoint successful
```

## 故障排除

### **如果仍然出现OpenAI错误**

- 检查应用是否已重启
- 确认代码更改已保存
- 查看是否有缓存问题

### **如果出现维度错误**

- 确认数据库迁移已执行
- 检查向量列是否已更新
- 验证索引是否已重建

### **如果API调用失败**

- 检查`DASHSCOPE_API_KEY`配置
- 验证API密钥权限
- 查看网络连接状态

## 总结

这次修复解决了根本问题：

1. **完全替换了API调用逻辑** - 从OpenAI改为Qwen3-Embedding
2. **更新了数据库结构** - 匹配新的向量维度
3. **增强了错误处理** - 提供详细的调试信息
4. **优化了文本处理** - 确保API调用的可靠性

现在系统应该能够：

- 正确调用Qwen3-Embedding API
- 生成1024维向量
- 成功存储和处理文档
- 提供详细的错误诊断信息
