import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { DiffAnalyzer } from '../src/core/DiffAnalyzer.js';

const load = (name: string): string => readFileSync(join(__dirname, name), 'utf-8');

describe('DiffAnalyzer', () => {
  const analyzer = new DiffAnalyzer();

  it('解析 sample.diff：单文件、行数统计正确', async () => {
    const analysis = await analyzer.analyze(load('sample.diff'));
    expect(analysis.filesChanged).toBe(1);
    expect(analysis.additions).toBe(12);
    expect(analysis.deletions).toBe(1);
    expect(analysis.languageBreakdown.TypeScript).toBe(13);
    expect(analysis.keyChanges.length).toBeGreaterThan(0);
  });

  it('解析 complex.diff：多文件', async () => {
    const analysis = await analyzer.analyze(load('complex.diff'));
    expect(analysis.filesChanged).toBeGreaterThan(1);
    expect(analysis.additions + analysis.deletions).toBeGreaterThan(0);
  });

  it('解析 simple.diff', async () => {
    const analysis = await analyzer.analyze(load('simple.diff'));
    expect(analysis.filesChanged).toBe(1);
  });

  it('空 diff 返回 No changes detected', async () => {
    const analysis = await analyzer.analyze('');
    expect(analysis.filesChanged).toBe(0);
    expect(analysis.summary).toBe('No changes detected');
  });

  it('空白 diff 也被视为无变更', async () => {
    const analysis = await analyzer.analyze('   \n  \n');
    expect(analysis.filesChanged).toBe(0);
  });
});