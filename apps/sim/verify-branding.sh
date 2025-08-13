#!/bin/bash

# ========================================
# DeepFin Flow 品牌配置验证脚本
# ========================================

echo "🔍 开始验证品牌配置..."

# 检查环境变量文件
env_files=(".env" ".env.local" ".env.development" ".env.production")
found_env_file=""

for file in "${env_files[@]}"; do
    if [ -f "$file" ]; then
        found_env_file="$file"
        echo "✅ 找到环境变量文件: $file"
        break
    fi
done

if [ -z "$found_env_file" ]; then
    echo "❌ 未找到环境变量配置文件"
    echo "请创建 .env 或 .env.local 文件"
    exit 1
fi

# 检查品牌相关的环境变量
echo ""
echo "📋 当前品牌配置:"
echo "=================="

# 品牌名称
brand_name=$(grep "^NEXT_PUBLIC_BRAND_NAME=" "$found_env_file" | cut -d'=' -f2 | tr -d '"')
if [ -n "$brand_name" ]; then
    echo "✅ 品牌名称: $brand_name"
else
    echo "❌ 品牌名称: 未设置 (使用默认值: Sim)"
fi

# 品牌 Logo
brand_logo=$(grep "^NEXT_PUBLIC_BRAND_LOGO_URL=" "$found_env_file" | cut -d'=' -f2 | tr -d '"')
if [ -n "$brand_logo" ]; then
    echo "✅ 品牌 Logo: $brand_logo"
else
    echo "ℹ️  品牌 Logo: 未设置 (使用默认 Logo)"
fi

# 品牌 Favicon
brand_favicon=$(grep "^NEXT_PUBLIC_BRAND_FAVICON_URL=" "$found_env_file" | cut -d'=' -f2 | tr -d '"')
if [ -n "$brand_favicon" ]; then
    echo "✅ 品牌 Favicon: $brand_favicon"
else
    echo "ℹ️  品牌 Favicon: 未设置 (使用默认图标)"
fi

# 主色调
primary_color=$(grep "^NEXT_PUBLIC_BRAND_PRIMARY_COLOR=" "$found_env_file" | cut -d'=' -f2 | tr -d '"')
if [ -n "$primary_color" ]; then
    echo "✅ 主色调: $primary_color"
else
    echo "ℹ️  主色调: 未设置 (使用默认值: #000000)"
fi

# 次要色调
secondary_color=$(grep "^NEXT_PUBLIC_BRAND_SECONDARY_COLOR=" "$found_env_file" | cut -d'=' -f2 | tr -d '"')
if [ -n "$secondary_color" ]; then
    echo "✅ 次要色调: $secondary_color"
else
    echo "ℹ️  次要色调: 未设置 (使用默认值: #6366f1)"
fi

# 强调色调
accent_color=$(grep "^NEXT_PUBLIC_BRAND_ACCENT_COLOR=" "$found_env_file" | cut -d'=' -f2 | tr -d '"')
if [ -n "$accent_color" ]; then
    echo "✅ 强调色调: $accent_color"
else
    echo "ℹ️  强调色调: 未设置 (使用默认值: #f59e0b)"
fi

# 隐藏品牌标识
hide_branding=$(grep "^NEXT_PUBLIC_HIDE_BRANDING=" "$found_env_file" | cut -d'=' -f2 | tr -d '"')
if [ -n "$hide_branding" ]; then
    echo "✅ 隐藏品牌标识: $hide_branding"
else
    echo "ℹ️  隐藏品牌标识: 未设置 (默认显示)"
fi

# 自定义页脚
custom_footer=$(grep "^NEXT_PUBLIC_CUSTOM_FOOTER_TEXT=" "$found_env_file" | cut -d'=' -f2 | tr -d '"')
if [ -n "$custom_footer" ]; then
    echo "✅ 自定义页脚: $custom_footer"
else
    echo "ℹ️  自定义页脚: 未设置 (使用默认页脚)"
fi

# 支持邮箱
support_email=$(grep "^NEXT_PUBLIC_SUPPORT_EMAIL=" "$found_env_file" | cut -d'=' -f2 | tr -d '"')
if [ -n "$support_email" ]; then
    echo "✅ 支持邮箱: $support_email"
else
    echo "ℹ️  支持邮箱: 未设置 (使用默认值: help@sim.ai)"
fi

echo ""
echo "🔧 验证结果:"

# 检查是否有任何品牌配置
brand_configs=$(grep -c "^NEXT_PUBLIC_BRAND" "$found_env_file")
if [ "$brand_configs" -gt 0 ]; then
    echo "✅ 发现 $brand_configs 个品牌配置项"
    echo ""
    echo "📝 下一步操作:"
    echo "1. 重启开发服务器: bun run dev"
    echo "2. 刷新浏览器页面"
    echo "3. 检查浏览器标题、页面样式等是否已更新"
else
    echo "❌ 未发现任何品牌配置项"
    echo ""
    echo "💡 建议:"
    echo "1. 参考 branding-config.example.env 文件"
    echo "2. 添加品牌相关的环境变量"
    echo "3. 重新运行此脚本验证"
fi

echo ""
echo "🎯 要应用配置，请执行:"
echo "   bun run dev"
echo ""
echo "🌐 在浏览器中访问: http://localhost:3000"
echo "   查看品牌配置是否生效"
