import { describe, it, expect, beforeEach } from 'vitest';
import {
  generatePRDescription,
  calculateComplexityScore,
  getComplexityLevel,
  hasBreakingChanges,
  hasTestChanges
} from '../src/ai/index.js';
import type { DiffAnalysis } from '../src/core/DiffAnalyzer.js';

const sample: DiffAnalysis = {
  summary: 'This PR contains 60 lines of changes across TypeScript (50 additions, 10 deletions).',
  filesChanged: 2,
  additions: 50,
  deletions: 10,
  keyChanges: ['src/a.ts (+30, -5)', 'src/b.test.ts (+20, -5)'],
  languageBreakdown: { TypeScript: 60 }
};

describe('generatePRDescription（无 AI key 时的模板路径）', () => {
  beforeEach(() => {
    delete process.env.AUTO_PR_AI_API_KEY;
    delete process.env.OPENAI_API_KEY;
  });

  it('输出包含核心章节', async () => {
    const desc = await generatePRDescription(sample);
    expect(desc).toContain('PR 摘要');
    expect(desc).toContain('变更统计');
    expect(desc).toContain('60');
  });

  it('标题包含变更文件数', async () => {
    const desc = await generatePRDescription(sample);
    expect(desc.startsWith('# ')).toBe(true);
    expect(desc).toContain('2 个文件变更');
  });
});

describe('复杂度计算', () => {
  it('分数 = 文件*2 + 新增*0.5 + 删除*0.3 + 关键变更*1', () => {
    expect(calculateComplexityScore(sample)).toBe(34);
  });

  it('等级边界：<5 简单, <15 中等, <30 复杂, >=30 非常复杂', () => {
    expect(getComplexityLevel(4.9)).toBe('简单');
    expect(getComplexityLevel(5)).toBe('中等');
    expect(getComplexityLevel(14.9)).toBe('中等');
    expect(getComplexityLevel(15)).toBe('复杂');
    expect(getComplexityLevel(29.9)).toBe('复杂');
    expect(getComplexityLevel(30)).toBe('非常复杂');
  });
});

describe('变更检测', () => {
  it('破坏性变更关键词', () => {
    expect(hasBreakingChanges(['breaking change in API'])).toBe(true);
    expect(hasBreakingChanges(['add feature X'])).toBe(false);
  });

  it('测试变更关键词', () => {
    expect(hasTestChanges(['update src/a.test.ts'])).toBe(true);
    expect(hasTestChanges(['fix typo'])).toBe(false);
  });
});