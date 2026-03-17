/**
 * AI integration module for AutoPR
 * Generates PR descriptions based on diff analysis
 */

import { DiffAnalysis } from '../core/DiffAnalyzer.js';

/**
 * 生成 PR 描述
 * @param analysis - Diff 分析结果
 */
export async function generatePRDescription(analysis: DiffAnalysis): Promise<string> {
  const { summary, filesChanged, additions, deletions, keyChanges, languageBreakdown } = analysis;

  // 构建 PR 标题
  const title = generatePRTitle(analysis);

  // 构建 PR 正文
  const parts: string[] = [];

  // 摘要部分
  parts.push(`**${summary}**\n`);

  // 变更统计
  parts.push(`📊 **Change Statistics**\n`);
  parts.push(`- Files changed: ${filesChanged}\n`);
  parts.push(`- Additions: +${additions}\n`);
  parts.push(`- Deletions: -${deletions}\n`);
  parts.push(`- Net: ${additions - deletions > 0 ? '+' : ''}${additions - deletions} lines\n`);

  // 语言分布
  const languages = Object.entries(languageBreakdown);
  if (languages.length > 0) {
    parts.push(`\n🌍 **Languages**\n`);
    languages.forEach(([lang, lines]) => {
      parts.push(`- ${lang}: ${lines > 0 ? '+' : ''}${lines} lines\n`);
    });
  }

  // 关键变更
  if (keyChanges.length > 0) {
    parts.push(`\n✨ **Key Changes**\n`);
    keyChanges.forEach((change, i) => {
      parts.push(`1. ${change}\n`);
    });
  }

  // TODO: 调用 LLM 生成更完善的描述（未来版本）
  // const llmDescription = await callLLMForPRDescription(analysis);
  // if (llmDescription) {
  //   parts.push(`\n🤖 **AI Summary**\n${llmDescription}\n`);
  // }

  return `${title}\n\n${parts.join('')}`;
}

/**
 * 生成 PR 标题
 * @param analysis - Diff 分析结果
 */
function generatePRTitle(analysis: DiffAnalysis): string {
  const { filesChanged, additions, deletions, keyChanges } = analysis;

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

  if (isBugFix) {
    return `fix: 修复 ${filesChanged} 个文件中的问题`;
  } else if (isFeature) {
    return `feat: 新增 ${filesChanged} 个功能`;
  } else if (isRefactor) {
    return `refactor: 重构 ${filesChanged} 个文件`;
  } else {
    return `chore: 更新 ${filesChanged} 个文件`;
  }
}
