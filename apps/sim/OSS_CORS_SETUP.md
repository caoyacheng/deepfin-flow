# 阿里云OSS CORS配置指南

## 问题描述
当前遇到CORS错误：前端应用无法直接向OSS存储桶上传文件，因为OSS没有配置正确的跨域策略。

## 解决步骤

### 1. 登录阿里云控制台
- 访问 [阿里云控制台](https://oss.console.aliyun.com/)
- 选择对应的存储桶：`ai-crm-recordings`

### 2. 配置CORS规则
在存储桶管理页面：

1. **点击"权限管理" → "跨域设置(CORS)"**
2. **点击"创建规则"**
3. **填写CORS规则：**

```
来源(Origin): 
- http://localhost:3000
- http://localhost:3001
- https://yourdomain.com (生产环境域名)

允许Methods:
- GET
- POST
- PUT
- DELETE
- HEAD

允许Headers:
- *
- Content-Type
- x-oss-meta-*
- Authorization

暴露Headers:
- ETag
- x-oss-request-id

缓存时间: 86400 (24小时)
```

### 3. 规则配置示例
```
来源: http://localhost:3000
允许Methods: GET, POST, PUT, DELETE, HEAD
允许Headers: *
暴露Headers: ETag, x-oss-request-id
缓存时间: 86400
```

### 4. 保存并测试
- 保存CORS规则
- 等待1-2分钟让规则生效
- 重新测试文件上传功能

## 替代方案

如果CORS配置仍有问题，可以考虑：

### 方案1：通过后端代理上传
- 前端先上传到Next.js API
- 后端再上传到OSS
- 避免跨域问题

### 方案2：使用OSS SDK
- 前端集成OSS SDK
- 配置正确的跨域策略

## 注意事项

1. **开发环境**: 确保`localhost:3000`在CORS允许列表中
2. **生产环境**: 添加实际域名到CORS规则
3. **安全性**: 不要设置过于宽松的CORS策略
4. **缓存**: CORS规则修改后需要等待生效

## 验证方法

配置完成后，在浏览器控制台中应该能看到：
- 不再出现CORS错误
- 文件上传成功
- 网络请求状态为200
