# Qwen3-Embedding 集成配置指南

## 概述

本项目已成功集成阿里云百炼的Qwen3-Embedding模型，用于生成文本向量嵌入。相比之前的OpenAI embeddings，Qwen3-Embedding提供了更好的中文支持和性能。

## 环境变量配置

在`.env`文件中添加以下配置：

```bash
# Aliyun DashScope API Key (for Qwen models)
DASHSCOPE_API_KEY=your_dashscope_api_key_here
```

## 获取API密钥

1. 访问 [阿里云百炼控制台](https://bailian.console.aliyun.com/)
2. 登录您的阿里云账号
3. 在左侧菜单中找到"API密钥管理"
4. 创建新的API密钥或使用现有密钥
5. 复制API密钥到`.env`文件中

## 模型信息

- **模型名称**: `text-embedding-v4`
- **向量维度**: 1536
- **支持语言**: 中文、英文等多语言
- **API端点**: `https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding-v4/text-embedding`

## 代码变更

### 1. 环境变量配置

- 添加了 `DASHSCOPE_API_KEY` 环境变量

### 2. generateEmbeddings函数

- 从OpenAI API改为阿里云Qwen3-Embedding API
- 更新了API端点和请求格式
- 修改了响应解析逻辑

### 3. 数据库Schema

- 更新了默认embedding模型为 `text-embedding-v4`
- 保持了1536维度的向量存储

## 测试集成

运行测试脚本验证API集成：

```bash
node test-qwen-embeddings.js
```

## API请求格式

```javascript
const response = await fetch(
  "https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding-v4/text-embedding",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${dashscopeApiKey}`,
      "Content-Type": "application/json",
      "X-DashScope-SSE": "disable",
    },
    body: JSON.stringify({
      model: "text-embedding-v4",
      input: texts,
      parameters: {
        text_type: "query",
        truncation: "NONE",
      },
    }),
  }
);
```

## 响应格式

```javascript
{
  output: {
    embeddings: [
      {
        embedding: [0.1, 0.2, ...], // 1536维向量
        text_index: 0
      }
    ]
  },
  usage: {
    total_tokens: 10
  }
}
```

## 优势

1. **中文支持**: 对中文文本有更好的理解
2. **成本效益**: 相比OpenAI更经济实惠
3. **本地化**: 阿里云服务，访问速度更快
4. **稳定性**: 企业级服务，稳定性更高

## 注意事项

1. 确保API密钥有足够的配额
2. 注意API调用频率限制
3. 监控API使用量和成本
4. 在生产环境中使用前充分测试

## 故障排除

### 常见错误

1. **"DASHSCOPE_API_KEY not configured"**

   - 检查`.env`文件中的API密钥配置
   - 确保环境变量已正确加载

2. **API认证失败**

   - 验证API密钥是否正确
   - 检查API密钥是否有效

3. **请求超时**
   - 检查网络连接
   - 调整超时设置

## 支持

如有问题，请参考：

- [阿里云百炼官方文档](https://bailian.console.aliyun.com/)
- [DashScope API文档](https://help.aliyun.com/zh/dashscope/)
- 项目日志文件
