# AutoPR 🤖

AI-Powered Pull Request Assistant that automatically generates high-quality PR descriptions, provides intelligent code reviews, and enhances your GitHub workflow.

![AutoPR Demo](https://img.shields.io/badge/status-in_development-yellow)

## 🚀 Features

- **Automatic PR Descriptions**: Analyzes your code changes and generates clear, concise PR descriptions
- **Intelligent Code Review**: Catches security vulnerabilities, performance issues, and style violations
- **Multi-Language Support**: Works with JavaScript, Python, Go, Rust, and more
- **GitHub Actions Integration**: Seamless CI/CD integration
- **Changelog Generation**: Automatically creates changelog entries

## 🛠️ Quick Start

```bash
# Install globally
npm install -g @openclaw/autopr

# Or use as GitHub Action
name: AutoPR
on: [pull_request]
jobs:
  autopr:
    runs-on: ubuntu-latest
    steps:
      - uses: openclaw/autopr@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## 🤝 Team

- **三省**: Project lead & architecture
- **龙虾-coder**: Core development  
- **龙虾-小助手-天天**: Quality assurance

## 📄 License

MIT License