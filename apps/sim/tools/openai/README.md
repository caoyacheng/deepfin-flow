# Qwen Embeddings Tool - 修复版本

## 概述

此工具已从OpenAI Embeddings迁移到阿里云通义千问(Qwen) Embedding模型。工具保持了相同的接口，但底层API调用已更改为使用阿里云DashScope兼容模式API。

## 主要修复

### 1. API端点 - 关键修复
- **之前错误的端点**: `https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding-v1/text-embedding`
- **现在正确的端点**: `https://dashscope.aliyuncs.com/compatible-mode/v1/embeddings`

### 2. 请求格式
- **之前**: 使用服务模式API格式
- **现在**: 使用兼容模式API格式，与OpenAI API格式一致

### 3. 支持的模型
- text-embedding-v1
- text-embedding-v2  
- text-embedding-v1.5
- text-embedding-v3
- text-embedding-v4 (默认)

### 4. 新增参数
- `dimensions`: 1024 (向量维度)
- `encoding_format`: float (编码格式)

## 使用方法

### 获取API密钥
1. 访问[阿里云通义千问控制台](https://bailian.console.aliyun.com/)
2. 创建或获取DashScope API密钥
3. 在工具配置中输入API密钥

### 配置参数
- **input**: 需要转换为向量的文本（支持单个字符串或字符串数组）
- **model**: 选择embedding模型版本（推荐使用text-embedding-v4）
- **apiKey**: 阿里云DashScope API密钥

## 响应格式

工具返回标准化的响应格式：
```json
{
  "success": true,
  "output": {
    "embeddings": [[0.1, 0.2, ...], ...],
    "model": "text-embedding-v4",
    "usage": {
      "prompt_tokens": 10,
      "total_tokens": 10
    }
  }
}
```

## 注意事项

1. **API密钥**: 请确保使用有效的阿里云DashScope API密钥
2. **模型选择**: 推荐使用text-embedding-v4，支持1024维向量
3. **兼容性**: 使用兼容模式API，与OpenAI API格式保持一致
4. **计费**: 按照阿里云DashScope的计费标准收费

## 官方文档

更多详细信息请参考[阿里云通义千问官方文档](https://bailian.console.aliyun.com/?spm=5176.29597918.J__Xz0dtrgG-8e2H7vxPlPy.7.cc757b08HCR3JX&tab=doc#/doc/?type=model&url=2842587)

## 故障排除

如果遇到url error错误，请确保：
1. 使用正确的兼容模式API端点
2. API密钥有效且有足够权限
3. 模型名称正确
