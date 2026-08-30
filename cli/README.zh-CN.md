<p align="center">
  <a href="https://github.com/husanr/autopr">
    <img src="https://img.shields.io/badge/GitHub-Repo-181717?logo=github" alt="GitHub Repository">
  </a>
  <a href="https://github.com/husanr/autopr/issues">
    <img src="https://img.shields.io/github/issues/husanr/autopr?logo=github" alt="Issues">
  </a>
  <a href="https://github.com/husanr/autopr/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/husanr/autopr?logo=github" alt="Contributors">
  </a>
</p>

<p align="center">
  <a href="README.md">English</a> • 
  <a href="README.zh-CN.md">中文</a>
</p>

# AutoPR 🤖

AI 驱动的 Pull Request 助手，自动生高质量的 PR 描述，提供智能代码评审，提升你的 GitHub 工作流。

[![status](https://img.shields.io/badge/status-开发中-yellow)](https://github.com/husanr/autopr)
[![Node.js](https://img.shields.io/badge/node->=16.0.0-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)

## ✨ 功能特性

- **自动生成 PR 描述**: 分析代码变更，自动生成清晰简洁的中文 PR 描述
- **智能代码评审**: 捕获安全漏洞、性能问题和风格违规
- **多语言支持**: 支持 JavaScript、TypeScript、Python、Go、Rust、Java、C++、C#、Ruby、PHP、HTML、CSS、JSON、Markdown、YAML 等语言
- **CLI 工具**: 为本地开发提供易用的命令行界面
- **GitHub Actions 集成**: 无缝集成 CI/CD，实现自动化的 PR 工作流
- **变更日志生成**: 自动为发布创建变更日志条目
- **实时分析**: 快速处理 diff 并提供详细统计信息

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm 或 yarn
- GitHub Personal Access Token (需要 `repo` scope)
- AI API Key (支持 OpenAI、Claude 或其他兼容提供商)

### 安装

```bash
# 克隆仓库
git clone https://github.com/husanr/autopr.git
cd autopr

# 安装依赖
npm install

# 构建项目
npm run build

# 全局链接 (可选)
npm link
```

### 使用方法

#### 基础 Diff 分析

```bash
# 从文件读取
autopr analyze -d /path/to/diff.patch

# 或从 stdin 读取
git diff HEAD~1 | autopr analyze
```

#### 使用 AI 生成 PR 描述

```bash
autopr analyze \
  -d /path/to/diff.patch \
  -k YOUR_AI_API_KEY \
  -m gpt-4
```

#### 创建 GitHub PR 评审

```bash
autopr review \
  -p 42 \
  -t YOUR_GITHUB_TOKEN \
  -o repository-owner \
  -r repository-name \
  -k YOUR_AI_API_KEY
```

### 可用命令

| 命令 | 描述 | 参数 |
|------|------|------|
| `analyze` | 分析 git diff 并生成内容 | `-d, --diff-file`, `-k, --api-key`, `-m, --model` |
| `review` | 自动化 PR 代码评审 | `-p, --pr-number`, `-t, --token`, `-o, --owner`, `-r, --repo`, `-k, --api-key` |

## 🛠️ 开发

### 项目结构

```
src/
├── cli/           # CLI 入口点
├── core/          # 核心分析逻辑
│   └── DiffAnalyzer.ts
├── github/        # GitHub API 集成
│   └── GitHubClient.ts
├── ai/            # AI 集成
│   └── AIGenerator.ts
└── utils/         # 工具函数
```

### 脚本命令

| 脚本 | 描述 |
|------|------|
| `npm run build` | 编译 TypeScript 为 JavaScript |
| `npm run dev` | 开发模式（监听文件变化） |
| `npm test` | 运行测试 (即将推出) |
| `npm run lint` | 运行 ESLint |

## 🔧 配置

### 环境变量

```bash
# AI 服务提供商配置
AUTO_PR_AI_PROVIDER=openai
AUTO_PR_AI_API_KEY=your-api-key
AUTO_PR_AI_MODEL=gpt-4

# GitHub 配置  
AUTO_PR_GITHUB_TOKEN=your-github-token
```

### GitHub Actions 工作流

```yaml
name: AutoPR
on: [pull_request]
jobs:
  autopr:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install AutoPR
        run: npm install -g @openclaw/autopr
      - name: Run AutoPR Analysis
        run: autopr analyze -k ${{ secrets.AI_API_KEY }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 👥 团队成员

| 成员 | 角色 | 职责 |
|------|------|------|
| 三省 | 项目负责人 & 架构师 | 项目整体方向、架构决策、代码审查 |
| 龙虾-coder | 核心开发 | 功能实现、bug 修复、性能优化 |
| 龙虾-小助手-天天 | 质量保障 & 测试 | 测试用例创建、端到端测试、文档编写 |
| San Hu (大虎) | 技术支持 | 基础设施搭建、测试、文档 🛠️ |

## 📄 许可证

MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- [Octokit](https://github.com/octokit/octokit.js) - GitHub API 客户端
- AutoPR 的所有贡献者和用户

---

由 SanHu 的 Claw 团队 ❤️ 制作

**最后更新**: 2026-03-18
