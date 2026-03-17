/**
 * AI integration module for AutoPR
 * Generates PR descriptions based on diff analysis
 */

import { DiffAnalysis } from '../core/DiffAnalyzer.js';

/**
 * 生成 PR 描述 - 完整版
 * @param analysis - Diff 分析结果
 */
export async function generatePRDescription(analysis: DiffAnalysis, options?: {
  includeTestChanges?: boolean;
  includeBreakingChanges?: boolean;
}): Promise<string> {
  const { summary, filesChanged, additions, deletions, keyChanges, languageBreakdown } = analysis;
  const { includeTestChanges = true, includeBreakingChanges = true } = options || {};

  // 构建 PR 标题
  const title = generatePRTitle(analysis);

  // 构建 PR 正文
  const parts: string[] = [];

  // 摘要部分
  parts.push(`## 📝 PR 摘要\n\n${summary}\n`);

  // 变更统计
  parts.push(`\n## 📊 变更统计\n`);
  parts.push(`| 项目 | 数量 |\n`);
  parts.push(`|------|------|\n`);
  parts.push(`| 变更文件 | ${filesChanged} |\n`);
  parts.push(`| 新增代码 | +${additions} |\n`);
  parts.push(`| 删除代码 | -${deletions} |\n`);
  parts.push(`| 净增代码 | ${additions - deletions > 0 ? '+' : ''}${additions - deletions} |\n`);

  // 语言分布
  const languages = Object.entries(languageBreakdown).filter(([_, lines]) => lines > 0);
  if (languages.length > 0) {
    parts.push(`\n## 🌍 语言分布\n`);
    parts.push(`| 语言 | 行数变化 |\n`);
    parts.push(`|------|----------|\n`);
    languages.forEach(([lang, lines]) => {
      parts.push(`| ${lang} | ${lines > 0 ? '+' : ''}${lines} |\n`);
    });
  }

  // 关键变更
  if (keyChanges.length > 0) {
    parts.push(`\n## ✨ 主要变更\n`);
    keyChanges.forEach((change: string, i: number) => {
      parts.push(`${i + 1}. ${change}\n`);
    });
  }

  // 变更细节（如果有测试变更）
  if (includeTestChanges && keyChanges.some(k => /test/i.test(k))) {
    parts.push(`\n## 🧪 测试变更\n`);
    parts.push(`- 更新了测试用例\n`);
    parts.push(`- 请确认测试通过\n`);
  }

  // 破坏性变更
  if (includeBreakingChanges && keyChanges.some(k => /breaking|breaking change/i.test(k))) {
    parts.push(`\n## ⚠️ 破坏性变更\n`);
    parts.push(`- 本次包含破坏性变更\n`);
    parts.push(`- 请升级版本号（MAJOR）\n`);
  }

  // 文件清单
  parts.push(`\n## 📁 变更文件清单\n`);
  if (keyChanges.length > 0) {
    keyChanges.forEach(change => {
      parts.push(`- \`${change.split(' (+')[0].trim()}\`\n`);
    });
  } else {
    parts.push(`- 查看 diff 了解详细变更\n`);
  }

  // 代码审核建议
  parts.push(`\n## 🔍 代码审核建议\n`);
  parts.push(`1. ✅ 确认功能符合需求\n`);
  parts.push(`2. ✅ 确认测试用例覆盖\n`);
  parts.push(`3. ✅ 确认代码规范符合项目标准\n`);
  parts.push(`4. ✅ 确认文档已更新\n`);

  return `# ${title}\n\n${parts.join('')}`;
}

/**
 * 生成 PR 标题
 * @param analysis - Diff 分析结果
 */
function generatePRTitle(analysis: DiffAnalysis): string {
  const { filesChanged, additions, deletions, keyChanges } = analysis;

  // 标题前缀
  let prefix = '';
  
  // 根据变更类型生成合适标题
  const isBugFix = keyChanges.some(k => 
    /fix|bug|error|fixme/i.test(k) || 
    (deletions > additions && ['delete', 'remove', 'drop'].some(w => 
      keyChanges.some(kc => kc.toLowerCase().includes(w))
    ))
  );

  const isFeature = keyChanges.some(k => 
    /feat|feature|add|new|create/i.test(k)
  );

  const isRefactor = keyChanges.some(k => 
    /refactor|restructure|reorganize/i.test(k)
  );

  const isDocs = keyChanges.some(k => /readme|docs|document/i.test(k));
  
  const isConfig = keyChanges.some(k => /config|package\.json|tsconfig/i.test(k));
  
  const isWorkflow = keyChanges.some(k => /github|workflow|ci|cd/i.test(k));

  if (isBugFix) {
    prefix = 'fix';
  } else if (isFeature) {
    prefix = 'feat';
  } else if (isRefactor) {
    prefix = 'refactor';
  } else if (isDocs) {
    prefix = 'docs';
  } else if (isConfig) {
    prefix = 'chore(config)';
  } else if (isWorkflow) {
    prefix = 'chore(workflow)';
  } else {
    prefix = 'chore';
  }

  return `${prefix}: ${filesChanged} 个文件变更`;
}

/**
 * 检测破坏性变更
 * @param keyChanges - 关键变更列表
 */
export function hasBreakingChanges(keyChanges: string[]): boolean {
  return keyChanges.some(k => 
    /breaking|breaking change|major|api breaking/i.test(k)
  );
}

/**
 * 检测测试相关变更
 * @param keyChanges - 关键变更列表
 */
export function hasTestChanges(keyChanges: string[]): boolean {
  return keyChanges.some(k => /test|spec/i.test(k));
}

/**
 * 计算复杂度分数
 * @param analysis - Diff 分析结果
 */
export function calculateComplexityScore(analysis: DiffAnalysis): number {
  const { filesChanged, additions, deletions, keyChanges } = analysis;
  
  // 基础分数
  let score = filesChanged * 2;           // 文件数量
  score += additions * 0.5;               // 新增行数
  score += deletions * 0.3;               // 删除行数
  score += keyChanges.length * 1;         // 关键变更数量
  
  return Math.round(score * 10) / 10;
}

/**
 * 获取复杂度等级
 * @param score - 复杂度分数
 */
export function getComplexityLevel(score: number): '简单' | '中等' | '复杂' | '非常复杂' {
  if (score < 5) return '简单';
  if (score < 15) return '中等';
  if (score < 30) return '复杂';
  return '非常复杂';
}