<p align="center">
  <img src="extension/icons/icon128.png" width="96" alt="AutoPR logo">
</p>

<h1 align="center">AutoPR 🤖</h1>

<p align="center">
  AI 驱动的 Pull Request 助手 —— <b>Chrome 扩展</b> + <b>CLI</b> 双入口，一键生成 PR 描述、智能代码审查。
</p>

<p align="center">
  <a href="https://github.com/husanr/autopr/actions"><img src="https://img.shields.io/github/actions/workflow/status/husanr/autopr/ci.yml?branch=main&label=CI" alt="CI status"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License"></a>
  <a href="https://github.com/husanr/autopr/issues"><img src="https://img.shields.io/github/issues/husanr/autopr" alt="Issues"></a>
  <img src="https://img.shields.io/badge/chrome--extension-v1.2.0-brightgreen" alt="Extension v1.2.0">
</p>

<p align="center">
  <a href="README.md">English</a> • <a href="README.zh-CN.md">中文</a>
</p>

---

## ✨ 功能

- 🧩 **Chrome 扩展** — 每个 GitHub PR 页面自动注入 AutoPR 面板，一键生成专业 PR 描述、执行 AI 代码审查
- ⌨️ **CLI** — diff 分析、PR 描述生成、复杂度评分、项目统计与基准测试，可接入脚本与 CI
- 🔌 **兼容任意 OpenAI 格式 API** — OpenAI、DeepSeek、OpenRouter（免费模型）、DashScope/通义千问、vLLM、Ollama……配一次全通用
- 📦 **零服务器** — API Key 只存在浏览器本地/环境变量，所有请求从您的浏览器或终端直发
- 🆓 **免费可用** — 开箱即用 OpenRouter 免费模型

## 🚀 快速开始

### 🧩 Chrome 扩展（推荐）

1. 克隆仓库：`git clone https://github.com/husanr/autopr.git`
2. 打开 `chrome://extensions/`，开启「开发者模式」
3. 点击「加载已解压的扩展程序」→ 选择 `extension/` 目录
4. 点击扩展图标 → 填入 API Key（见 [AI 配置](#-ai-配置)）
5. 打开任意 GitHub PR 页面，使用顶部面板

### ⌨️ CLI

```bash
cd cli
npm install
npm run build

# 分析 diff 文件
node dist/cli/index.js analyze -d test/sample.diff

# 生成 PR 描述（配置 AUTO_PR_AI_API_KEY 后走真实 AI）
node dist/cli/index.js pr-description -d test/sample.diff

# 审查 PR 并把结果发布为评论
node dist/cli/index.js review -p 42 -o husanr -r autopr --post
```

## 🤖 AI 配置

| 环境变量 | 说明 | 默认 |
|---|---|---|
| `AUTO_PR_AI_API_KEY` | API Key（兼容 `OPENAI_API_KEY`） | — |
| `AUTO_PR_AI_BASE_URL` | 任意 OpenAI 兼容端点 | `https://api.openai.com/v1` |
| `AUTO_PR_AI_MODEL` | 模型名 | `gpt-4o-mini` |

未配置 Key 时，CLI 会优雅降级为内置规则模板输出。

## 📸 截图

| 扩展面板 | CLI 输出 |
|---|---|
| _即将补充_ | _即将补充_ |

## 📁 项目结构

```
autopr/
├── extension/   # Chrome 扩展（Manifest V3，原生 JS）
│   ├── background.js   # service worker：AI 调用、用量限制
│   ├── content.js      # GitHub PR 页面注入
│   ├── popup.html/js   # 设置界面（API Key、服务商、模型）
│   └── store-assets/   # Chrome Web Store 上架材料
├── cli/         # CLI 工具（TypeScript + Commander）
│   ├── src/core/       # diff 解析、规则引擎、质量检查
│   ├── src/ai/         # LLM 接入（OpenAI 兼容）
│   ├── src/github/     # GitHub API 客户端
│   └── test/           # Vitest 单测 + diff fixtures
└── .github/workflows/  # CI：构建、测试、清单校验
```

## 🤝 贡献

见 [CONTRIBUTING.md](CONTRIBUTING.md) —— 欢迎 Issue 和 PR！

## 📄 License

[MIT](LICENSE) © 2026 husanr