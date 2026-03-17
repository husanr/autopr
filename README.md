# AutoPR 🤖

AI-Powered Pull Request Assistant that automatically generates high-quality PR descriptions, provides intelligent code reviews, and enhances your GitHub workflow.

[![status](https://img.shields.io/badge/status-in_development-yellow)](https://github.com/openclaw/autopr)
[![Node.js](https://img.shields.io/badge/node->=16.0.0-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)

## ✨ Features

- **Automatic PR Descriptions**: Analyzes your code changes and generates clear, concise PR descriptions in Chinese
- **Smart Code Analysis**: Detects file changes, line additions/deletions, and key code modifications
- **Multi-Language Support**: Works with JavaScript, TypeScript, Python, Go, Rust, Java, and more
- **CLI Tool**: Easy-to-use command-line interface for local development
- **GitHub Integration**: Ready for GitHub Actions and webhook automation

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- GitHub Personal Access Token (with `repo` scope)

### Installation

```bash
# Clone the repository
git clone https://github.com/openclaw/autopr.git
cd autopr

# Install dependencies
npm install

# Build the project
npm run build

# Link globally (optional)
npm link
```

### Usage

#### Analyze a Git Diff

```bash
# From a file
autopr analyze -d /path/to/diff.patch

# Or from stdin
git diff HEAD~1 | autopr analyze -d -
```

#### Generate PR Description

```bash
autopr pr-description \
  -d /path/to/diff.patch \
  -t YOUR_GITHUB_TOKEN \
  -o repository-owner \
  -r repository-name
```

#### Review a PR

```bash
autopr review \
  -p 42 \
  -t YOUR_GITHUB_TOKEN \
  -o repository-owner \
  -r repository-name
```

### Available Commands

| Command | Description |
|---------|-------------|
| `analyze` | Analyze a git diff and show statistics |
| `pr-description` | Generate PR description from diff |
| `review` | Automated code review for a PR |

## 🛠️ Development

### Project Structure

```
src/
├── cli/           # CLI entry point
├── core/          # Core analysis logic
│   └── DiffAnalyzer.ts
├── github/        # GitHub API integration
│   └── GitHubClient.ts
├── ai/            # AI integrations
│   └── index.ts
└── utils/         # Utility functions
```

### Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run dev` | Watch mode for development |
| `npm test` | Run tests (coming soon) |
| `npm run lint` | Run ESLint |

## 👥 Team

| Member | Role | GitHub |
|--------|------|--------|
| 三省 | Project Lead & Architecture | - |
| 龙虾-coder | Core Development | - |
| 龙虾-小助手-天天 | QA & Testing | - |

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [Octokit](https://github.com/octokit/octokit.js) for GitHub API client
- All contributors and users of AutoPR

---

Made with ❤️ by the OpenClaw Team
