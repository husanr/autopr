# AutoPR 🤖

AI-Powered Pull Request Assistant that automatically generates high-quality PR descriptions, provides intelligent code reviews, and enhances your GitHub workflow.

[![status](https://img.shields.io/badge/status-in_development-yellow)](https://github.com/openclaw/autopr)
[![Node.js](https://img.shields.io/badge/node->=16.0.0-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)

## ✨ Features

- **Automatic PR Descriptions**: Analyzes your code changes and generates clear, concise PR descriptions in Chinese
- **Intelligent Code Review**: Catches security vulnerabilities, performance issues, and style violations
- **Multi-Language Support**: Works with JavaScript, TypeScript, Python, Go, Rust, Java, C++, C#, Ruby, PHP, HTML, CSS, JSON, Markdown, YAML, and more
- **CLI Tool**: Easy-to-use command-line interface for local development
- **GitHub Actions Integration**: Seamless CI/CD integration for automated PR workflows
- **Changelog Generation**: Automatically creates changelog entries for releases
- **Real-time Analysis**: Processes diffs instantly with detailed statistics

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- GitHub Personal Access Token (with `repo` scope)
- AI API Key (OpenAI, Claude, or other supported providers)

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

#### Basic Diff Analysis

```bash
# From a file
autopr analyze -d /path/to/diff.patch

# Or from stdin
git diff HEAD~1 | autopr analyze
```

#### Generate PR Description with AI

```bash
autopr analyze \
  -d /path/to/diff.patch \
  -k YOUR_AI_API_KEY \
  -m gpt-4
```

#### Create GitHub PR Review

```bash
autopr review \
  -p 42 \
  -t YOUR_GITHUB_TOKEN \
  -o repository-owner \
  -r repository-name \
  -k YOUR_AI_API_KEY
```

### Available Commands

| Command | Description | Options |
|---------|-------------|---------|
| `analyze` | Analyze a git diff and generate content | `-d, --diff-file`, `-k, --api-key`, `-m, --model` |
| `review` | Automated code review for a PR | `-p, --pr-number`, `-t, --token`, `-o, --owner`, `-r, --repo`, `-k, --api-key` |

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
│   └── AIGenerator.ts
└── utils/         # Utility functions
```

### Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run dev` | Watch mode for development |
| `npm test` | Run tests (coming soon) |
| `npm run lint` | Run ESLint |

## 🔧 Configuration

### Environment Variables

```bash
# AI Provider Configuration
AUTO_PR_AI_PROVIDER=openai
AUTO_PR_AI_API_KEY=your-api-key
AUTO_PR_AI_MODEL=gpt-4

# GitHub Configuration  
AUTO_PR_GITHUB_TOKEN=your-github-token
```

### GitHub Actions Workflow

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

## 👥 Team

| Member | Role | Responsibilities |
|--------|------|------------------|
| 三省 | Project Lead & Architecture | Overall direction, architecture decisions, code reviews |
| 龙虾-coder | Core Development | Feature implementation, bug fixes, performance optimization |
| 龙虾-小助手-天天 | QA & Testing | Test case creation, end-to-end testing, documentation |

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [Octokit](https://github.com/octokit/octokit.js) for GitHub API client
- All contributors and users of AutoPR

---

Made with ❤️ by the OpenClaw Team