# Contributing to AutoPR 🤝

感谢您想为 AutoPR 贡献代码！本项目由两部分组成：

- `extension/` — Chrome 扩展（原生 JavaScript，Manifest V3）
- `cli/` — CLI 工具（TypeScript + Commander + Vitest）

## 开发环境

```bash
# CLI
cd cli
npm install
npm run build
npm test

# 扩展（无需构建）
# chrome://extensions → 开发者模式 → 加载已解压的扩展程序 → 选择 extension/
```

## 提交规范

- 遵循 [Conventional Commits](https://www.conventionalcommits.org/)：`feat:` / `fix:` / `docs:` / `chore:` / `refactor:`
- CLI 改动必须通过 `npm test`（Vitest）
- 扩展改动请手动验证：加载扩展 → 打开一个 GitHub PR 页面 → 功能正常

## 提 PR 前自查

- [ ] `cd cli && npm run build && npm test` 全部通过
- [ ] 扩展 `node --check` 语法通过
- [ ] README（如涉及用法）已同步更新
- [ ] commit 信息清晰，一条一个逻辑

## 问题反馈

- Bug / 建议请开 [Issue](https://github.com/husanr/autopr/issues)，描述：复现步骤 + 期望行为 + 实际行为