# AutoPR CLI ⌨️

AI-powered pull request assistant for the terminal: diff analysis, PR description generation, and code quality review.

> The full product (Chrome extension + CLI) lives in the [AutoPR](https://github.com/husanr/autopr) repository.

## Install

```bash
npm install
npm run build
npm link   # optional: expose `autopr` command globally
```

## Usage

```bash
# Analyze a diff (file path or inline content)
autopr analyze -d path/to/change.diff
autopr analyze -d path/to/change.diff --json   # machine-readable output

# Generate a PR description
autopr pr-description -d path/to/change.diff

# Complexity score
autopr complexity -d path/to/change.diff

# Review an open PR (prints analysis; --post publishes it as a PR comment)
autopr review -p 42 -o husanr -r autopr -t $GITHUB_TOKEN --post

# Project statistics from git history
autopr stats

# Performance benchmark
autopr benchmark
```

## AI Configuration

Set these environment variables to enable real LLM generation (falls back to rule templates without a key):

| Env var | Description | Default |
|---|---|---|
| `AUTO_PR_AI_API_KEY` | API key (fallback: `OPENAI_API_KEY`) | — |
| `AUTO_PR_AI_BASE_URL` | Any OpenAI-compatible endpoint | `https://api.openai.com/v1` |
| `AUTO_PR_AI_MODEL` | Model name | `gpt-4o-mini` |

```bash
export AUTO_PR_AI_API_KEY=sk-...
export AUTO_PR_AI_BASE_URL=https://api.deepseek.com/v1   # DeepSeek, OpenRouter, ...
export AUTO_PR_AI_MODEL=deepseek-chat
autopr pr-description -d test/sample.diff
```

## Development

```bash
npm test        # Vitest unit tests
npm run build   # TypeScript compile
```