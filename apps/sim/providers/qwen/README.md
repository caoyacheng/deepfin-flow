# Qwen Provider

This provider integrates Alibaba Cloud's Qwen models into the deepfin-flow platform.

## Supported Models

- `qwen-turbo` - Fast and cost-effective model for general tasks
- `qwen-plus` - Balanced performance and cost for most use cases
- `qwen-max` - High-performance model for complex tasks
- `qwen-max-longcontext` - High-performance model with extended context support

## Configuration

The Qwen provider uses the DashScope API endpoint: `https://dashscope.aliyuncs.com/compatible-mode/v1`

## Features

- ✅ Streaming responses
- ✅ Tool/function calling
- ✅ Temperature control (0-2)
- ✅ JSON schema response formatting
- ✅ Token usage tracking
- ✅ Cost calculation

## Usage

To use the Qwen provider, you need to:

1. Set your DashScope API key in the environment
2. Select 'qwen' as the provider
3. Choose one of the supported models

## API Compatibility

The Qwen provider is compatible with OpenAI's API format, making it easy to integrate with existing OpenAI-based applications.

## Pricing

Pricing is based on token usage:

- Input tokens: $0.0005 - $0.002 per 1M tokens
- Output tokens: $0.0015 - $0.004 per 1M tokens

For the most up-to-date pricing, please refer to the [Alibaba Cloud DashScope pricing page](https://help.aliyun.com/zh/dashscope/developer-reference/api-details).

## Error Handling

The provider includes comprehensive error handling with timing information and detailed logging for debugging purposes.
