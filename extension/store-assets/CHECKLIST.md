# Chrome Web Store 上架材料清单

## 📋 上架需要的所有材料

### 1. 扩展程序包文件 ✅
- 位置：`~/Projects/auto-pr-chrome/`
- 已准备好 manifest.json v1.2.0

### 2. 商店图标（Marquee Image）❌ 需要你准备
- **尺寸**：440 × 280 px（或更大，但保持 440:280 比例）
- **格式**：PNG 或 JPEG
- **建议设计**：紫色渐变背景 + AutoPR Logo + 简短标语
- 可以用 Figma / Canva 做

### 3. 截图（Screenshots）❌ 需要你准备
至少 1 张，推荐 3-5 张：

| # | 截图内容 | 推荐尺寸 |
|---|---------|---------|
| 1 | PR 页面上的 AutoPR 面板 | 1280×800 |
| 2 | 生成 PR 描述的结果展示 | 1280×800 |
| 3 | AI 代码审查结果 | 1280×800 |
| 4 | 插件设置页面（Settings） | 380×600 |

**截图步骤**：
1. 打开 Chrome 的开发者工具（F12）
2. 切换到设备模式，选择 1280×800
3. 打开 GitHub PR 页面
4. Cmd+Shift+P → 输入 "Capture screenshot" → 回车
5. 截图会自动下载

### 4. 商店描述文案 ✅ 已准备好

**短描述（132 字符以内）**：
```
AI 驱动的 GitHub PR 助手，一键生成 PR 描述 + 智能代码审查
```

**详细描述**（见下方）

### 5. 隐私政策 ✅ 已准备好
- 文件：`store-assets/privacy-policy.html`
- 需要部署到一个公开 URL

---

## 🚀 上架步骤

### Step 1: 压缩扩展程序包
```bash
cd ~/Projects
# 压缩为 zip 文件（Chrome Web Store 需要 zip 格式）
zip -r auto-pr-chrome-v1.2.0.zip auto-pr-chrome/ \
  -x "*.DS_Store" -x "__MACOSX/*" -x "store-assets/*" -x "*.bak.*"
```

### Step 2: 部署隐私政策
把 `store-assets/privacy-policy.html` 部署到一个公开 URL：
- **选项 A**：GitHub Pages（免费）
  - 新建 repo：`husanr/auto-pr-privacy`
  - 上传 HTML 文件
  - 启用 GitHub Pages
  - 获得 URL：`https://husanr.github.io/auto-pr-privacy/`
- **选项 B**：用你现有的网站
- **选项 C**：先放到 GitHub README 里也行

### Step 3: 登录 Chrome Web Store Developer Dashboard
1. 访问 https://chrome.google.com/webstore/developer/dashboard
2. 登录你的 Google 账号（husanr@gmail.com?）
3. 首次上架需要支付 **$5 开发者费用**（一次性）

### Step 4: 创建新扩展程序
1. 点击 "+ New item"
2. 上传 `auto-pr-chrome-v1.2.0.zip`
3. 填写以下信息：

---

## 📝 商店填写信息

### 基本信息

| 字段 | 内容 |
|------|------|
| **名称** | AutoPR - AI Pull Request Assistant |
| **短描述** | AI 驱动的 GitHub PR 助手，一键生成 PR 描述 + 智能代码审查 |
| **分类** | Developer Tools |
| **语言** | 中文（简体） |

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

### 其他信息

| 字段 | 内容 |
|------|------|
| **网站** | https://github.com/husanr/auto-pr |
| **隐私政策 URL** | （部署后填入） |
| **支持邮箱** | （你的邮箱） |
| **开源协议** | MIT |

---

## 📸 截图建议

### 截图 1：PR 面板主界面
- 打开一个真实的 GitHub PR
- 展示 AutoPR 面板（紫色渐变设计）
- 确保按钮文字清晰可见

### 截图 2：PR 描述生成结果
- 点击「生成 PR 描述」后的结果
- 展示 AI 生成的内容

### 截图 3：AI 代码审查
- 点击「AI 代码审查」后的结果
- 展示审查维度（Bug、安全、性能等）

### 截图 4：设置页面
- 点击 Chrome 扩展图标打开的 Settings
- 展示 API 配置界面

---

## ✅ 上架检查清单

- [ ] 压缩扩展程序为 zip
- [ ] 准备商店图标（440×280）
- [ ] 准备至少 1 张截图
- [ ] 部署隐私政策到公开 URL
- [ ] 支付 $5 开发者费用
- [ ] 填写所有商店信息
- [ ] 提交审核

---

## 📊 审核时间

- 首次提交：**3-5 个工作日**
- 后续更新：**1-3 个工作日**
- 审核通过率：>95%（只要没有明显问题）

---

## 💡 优化建议

1. **截图质量**：用真实的 PR 页面截图，不要用 demo
2. **描述关键词**：确保包含 GitHub, PR, AI, Code Review 等关键词
3. **版本更新**：每次更新都要写 changelog
4. **用户评价**：上线后主动回复评价，保持良好形象
