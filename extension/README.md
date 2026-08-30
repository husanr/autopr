# AutoPR - AI Pull Request Assistant 🤖

> 一键生成 PR 描述 + AI 代码审查，让写 PR 不再痛苦

## ✨ 功能

- 📝 **一键生成 PR 描述** — AI 分析 diff，自动生成专业的 PR 描述
- 🔍 **AI 代码审查** — 自动检查 Bug、安全问题、性能问题
- 🎯 **智能上下文感知** — 自动识别 PR 页面，注入工具面板
- 💰 **免费使用** — 支持 OpenRouter 免费模型，每月 20 次免费额度
- 🔌 **多服务商支持** — OpenRouter、OpenAI、DeepSeek、任何兼容 API

## 🚀 安装

### 开发模式
1. 下载本项目
2. 打开 Chrome → `chrome://extensions/`
3. 开启「开发者模式」
4. 点击「加载已解压的扩展程序」→ 选择本目录
5. 配置你的 AI API Key（推荐 OpenRouter 免费模型）

### Chrome Web Store
> 即将上架，敬请期待

## 💡 使用

1. 打开任意 GitHub PR 页面
2. 页面顶部会出现 AutoPR 面板
3. 点击「生成 PR 描述」或「AI 代码审查」
4. 等待 AI 分析完成，复制结果

## 💰 免费版 vs Pro

| 功能 | Free | Pro |
|------|------|-----|
| 月使用次数 | 20 次 | 无限 |
| 可用模型 | 免费模型 | 全部模型 |
| AI 代码审查 | ✅ | ✅ |
| PR 描述生成 | ✅ | ✅ |
| 高级模型 | ❌ | GPT-4o / Claude |

## 🔧 支持的 AI 服务商

### 推荐（免费模型）
- **OpenRouter** — 提供多个免费模型（Qwen、Gemma、Llama、Mistral）
  - 注册：https://openrouter.ai
  - 默认模型：`qwen/qwen-2.5-coder-32b-instruct`

### 付费
- **OpenAI** — GPT-4o / GPT-4o-mini
- **DeepSeek** — DeepSeek Chat（性价比高）
- **自定义** — 任何 OpenAI 兼容 API

## 📁 项目结构

```
auto-pr-chrome/
├── manifest.json      # Chrome Extension 配置 (Manifest V3)
├── popup.html/js      # 设置弹窗（NovaPulse UI 设计）
├── content.js         # GitHub PR 页面注入脚本
├── content.css        # 注入样式（NovaPulse 紫色渐变主题）
├── background.js      # Service Worker（AI 调用、用量管理）
├── icons/             # 扩展图标
├── LICENSE            # MIT 许可证
└── README.md          # 项目说明
```

## 🎨 设计

采用 **NovaPulse** 紫色渐变设计语言：
- 主色调：`#7C3AED` (紫) → `#06B6D4` (青)
- 深色背景：`#0B0F1A`
- 圆角、渐变、微交互动画

预览：打开 `examples/design-md/autopr-preview.html` 查看完整 UI 效果。

## 🔐 隐私与安全

- API Key 仅存储在浏览器本地（chrome.storage.sync）
- 所有 AI 请求直接从你的浏览器发出，不经过第三方服务器
- 不收集任何用户数据
- 开源代码，可随时审查

## 📄 License

MIT
