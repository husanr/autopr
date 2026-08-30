# Chrome Web Store 上架材料

## 📋 上架清单

- [x] manifest.json（已配置）
- [x] 图标（16/48/128px）
- [ ] 商店图标 440x280px（marquee image）
- [ ] 截图（至少 1 张，推荐 3-5 张）
- [x] 商店描述文案
- [x] 隐私政策
- [ ] 上架提交

---

## 📝 商店信息

### 短描述（132 字符以内）
AI 驱动的 GitHub PR 助手，一键生成 PR 描述 + 智能代码审查，让写 PR 不再痛苦。

### 详细描述
```
🤖 AutoPR - AI Pull Request Assistant

一键生成专业的 GitHub PR 描述 + AI 智能代码审查，让写 PR 不再痛苦。

✨ 核心功能
• 📝 一键生成 PR 描述 — AI 自动分析代码变更，生成专业的 PR 说明文档
• 🔍 AI 代码审查 — 自动检测 Bug、安全问题、性能问题和代码可读性
• 🎯 智能上下文感知 — 自动识别 GitHub PR 页面，一键注入工具面板
• 💰 免费使用 — 支持 OpenRouter 免费模型，每月 20 次免费额度

🚀 如何使用
1. 打开任意 GitHub PR 页面（/pull/xxx）
2. 页面顶部会出现 AutoPR 面板
3. 点击「生成 PR 描述」或「AI 代码审查」
4. 等待 AI 分析完成，复制结果即可

💡 支持的 AI 服务商
• OpenRouter — 免费模型（Qwen、Gemma、Llama、Mistral）
• OpenAI — GPT-4o / GPT-4o-mini
• DeepSeek — DeepSeek Chat
• 自定义 — 任何 OpenAI 兼容 API

🔐 隐私与安全
• API Key 仅存储在浏览器本地（chrome.storage.sync）
• 所有 AI 请求直接从你的浏览器发出，不经过第三方服务器
• 不收集任何用户数据
• 开源代码，可随时审查

📁 开源
GitHub: https://github.com/husanr/auto-pr

---
作者：husanr
版本：1.2.0
```

---

## 🖼️ 需要准备的图片

### 1. 商店图标（Marquee Image）
- 尺寸：440 × 280 px（或更大比例相同）
- 格式：PNG 或 JPEG
- 建议：用 AutoPR logo + 紫色渐变背景

### 2. 截图（Screenshots）
至少 1 张，推荐 3-5 张：

**截图 1：PR 页面主面板**
- 打开任意 GitHub PR 页面
- 展示 AutoPR 面板（含生成 PR 描述按钮）
- 分辨率：1280 × 800（推荐）

**截图 2：PR 描述生成结果**
- 点击「生成 PR 描述」后的结果页面
- 展示 AI 生成的 PR 描述内容

**截图 3：AI 代码审查结果**
- 点击「AI 代码审查」后的审查结果
- 展示 Bug/安全/性能等审查维度

**截图 4：设置弹窗**
- 点击插件图标打开的 Settings 页面
- 展示 API 配置、模型选择、用量统计

---

## 📄 隐私政策

内容见 `privacy-policy.html`，需要部署到一个可访问的 URL（如 GitHub Pages）

---

## 🏷️ 分类信息

- **分类**：Developer Tools
- **功能类型**：Productivity

---

## 💰 定价

- **免费版**：每月 20 次 AI 调用
- **Pro 版**：待定（可在插件内升级页面引导）

---

## 🔗 上架链接

Chrome Web Store Developer Dashboard:
https://chrome.google.com/webstore/developer/dashboard
