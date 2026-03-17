#!/usr/bin/env node
/**
 * CLI entry point for AutoPR
 * Usage: autopr <command> [options]
 */

import { Command } from 'commander';
import { DiffAnalyzer } from '../core/DiffAnalyzer.js';
import { GitHubClient } from '../github/GitHubClient.js';
import { 
  generatePRDescription, 
  hasBreakingChanges,
  hasTestChanges,
  calculateComplexityScore,
  getComplexityLevel
} from '../ai/index.js';
import * as fs from 'fs';

const program = new Command();

program
  .name('autopr')
  .description('AI-Powered Pull Request Assistant')
  .version('0.1.0');

program
  .command('analyze')
  .description('Analyze a git diff')
  .requiredOption('-d, --diff <diff>', 'git diff content or path to diff file')
  .option('-v, --verbose', 'show detailed analysis', false)
  .action(async (options: { diff: string; verbose: boolean }) => {
    const diffContent = fs.existsSync(options.diff)
      ? fs.readFileSync(options.diff, 'utf-8')
      : options.diff;

    const analyzer = new DiffAnalyzer();
    const analysis = await analyzer.analyze(diffContent);

    console.log('\n📊 Diff Analysis Results:');
    console.log('═══════════════════════════════');
    console.log(`Summary: ${analysis.summary}`);
    console.log(`Files changed: ${analysis.filesChanged}`);
    console.log(`Additions: +${analysis.additions}`);
    console.log(`Deletions: -${analysis.deletions}`);
    console.log(`Net change: ${analysis.additions - analysis.deletions} lines`);
    
    // 复杂度分析
    const complexity = calculateComplexityScore(analysis);
    const level = getComplexityLevel(complexity);
    console.log(`\n💡 复杂度分数: ${complexity} (${level})`);
    
    // 变更检测
    if (hasBreakingChanges(analysis.keyChanges)) {
      console.log('\n⚠️  检测到破坏性变更!');
    }
    if (hasTestChanges(analysis.keyChanges)) {
      console.log('\n🧪 检测到测试变更');
    }
    
    // 详细输出
    if (options.verbose || analysis.keyChanges.length > 0) {
      console.log('\nLanguages affected:');
      for (const [lang, lines] of Object.entries(analysis.languageBreakdown)) {
        console.log(`  - ${lang}: ${lines > 0 ? '+' : ''}${lines} lines`);
      }
      if (analysis.keyChanges.length > 0) {
        console.log('\nKey changes:');
        analysis.keyChanges.forEach((change: string, i: number) => {
          console.log(`  ${i + 1}. ${change}`);
        });
      }
    }
    console.log('═══════════════════════════════\n');
  });

program
  .command('pr-description')
  .description('Generate PR description from diff')
  .requiredOption('-d, --diff <diff>', 'git diff content or path to diff file')
  .option('--title-only', 'only generate title', false)
  .action(async (options: { diff: string; titleOnly: boolean }) => {
    const diffContent = fs.existsSync(options.diff)
      ? fs.readFileSync(options.diff, 'utf-8')
      : options.diff;

    // Analyze diff
    const analyzer = new DiffAnalyzer();
    const analysis = await analyzer.analyze(diffContent);

    // Generate AI-powered description
    const description = await generatePRDescription(analysis);

    // Output results
    console.log('\n📝 Generated PR Description:');
    console.log('═══════════════════════════════');
    console.log(description);
    console.log('═══════════════════════════════\n');
  });

program
  .command('complexity')
  .description('Calculate complexity score for a diff')
  .requiredOption('-d, --diff <diff>', 'git diff content or path to diff file')
  .action(async (options: { diff: string }) => {
    const diffContent = fs.existsSync(options.diff)
      ? fs.readFileSync(options.diff, 'utf-8')
      : options.diff;

    const analyzer = new DiffAnalyzer();
    const analysis = await analyzer.analyze(diffContent);
    
    const complexity = calculateComplexityScore(analysis);
    const level = getComplexityLevel(complexity);
    
    console.log('\n📈 Complexity Analysis:');
    console.log('═══════════════════════════════');
    console.log(`Files changed: ${analysis.filesChanged}`);
    console.log(`Net lines: ${analysis.additions - analysis.deletions}`);
    console.log(`Complexity score: ${complexity}`);
    console.log(`Level: ${level}`);
    
    // 建议
    if (level === '复杂' || level === '非常复杂') {
      console.log('\n💡 建议:');
      console.log('- 将多个变更拆分为多个 PR');
      console.log('- 确保每个变更都有充分的测试');
      console.log('- 要求更多代码审查');
    }
    console.log('═══════════════════════════════\n');
  });

program
  .command('review')
  .description('Automated code review for a PR')
  .requiredOption('-p, --pr <number>', 'Pull Request number')
  .requiredOption('-t, --token <token>', 'GitHub personal access token')
  .requiredOption('-o, --owner <owner>', 'GitHub repository owner')
  .requiredOption('-r, --repo <repo>', 'GitHub repository name')
  .action(async (options: { pr: string; token: string; owner: string; repo: string }) => {
    const client = new GitHubClient({
      token: options.token,
      owner: options.owner,
      repo: options.repo
    });

    try {
      // Get PR diff
      const diff = await client.getPullRequestDiff(parseInt(options.pr));
      
      // Analyze
      const analyzer = new DiffAnalyzer();
      const analysis = await analyzer.analyze(diff);
      
      // Calculate complexity
      const complexity = calculateComplexityScore(analysis);
      const level = getComplexityLevel(complexity);
      
      // Generate description
      const description = await generatePRDescription(analysis);

      console.log('\n🔍 PR Review Results:');
      console.log('═══════════════════════════════');
      console.log(`PR #${options.pr} Analysis:`);
      console.log(`Summary: ${analysis.summary}`);
      console.log(`Files: ${analysis.filesChanged} | +${analysis.additions} -${analysis.deletions}`);
      console.log(`Complexity: ${complexity} (${level})`);
      
      // 检测问题
      const issues: string[] = [];
      if (hasBreakingChanges(analysis.keyChanges)) {
        issues.push('⚠️  检测到破坏性变更');
      }
      if (hasTestChanges(analysis.keyChanges)) {
        issues.push('🧪 测试变更已检测');
      }
      
      if (issues.length > 0) {
        console.log('\nDetected Issues:');
        issues.forEach(issue => console.log(`- ${issue}`));
      }
      
      console.log('\nGenerated Description:');
      console.log(description);
      console.log('═══════════════════════════════\n');
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

program
  .command('benchmark')
  .description('Benchmark performance')
  .action(() => {
    const analyzer = new DiffAnalyzer();
    
    // 生成一个大的 diff 进行测试
    let largeDiff = '';
    for (let i = 0; i < 100; i++) {
      largeDiff += `diff --git a/file${i}.ts b/file${i}.ts\n`;
      largeDiff += `index 1234567..abcdefg 100644\n`;
      largeDiff += `--- a/file${i}.ts\n`;
      largeDiff += `+++ b/file${i}.ts\n`;
      for (let j = 0; j < 10; j++) {
        largeDiff += `+ console.log('line ${j}');\n`;
      }
    }
    
    const start = Date.now();
    const analysis = analyzer.analyze(largeDiff);
    const end = Date.now();
    
    console.log('\n⚡ Performance Benchmark:');
    console.log('═══════════════════════════════');
    console.log(`Files analyzed: 100`);
    console.log(`Total lines: 1100`);
    console.log(`Time: ${end - start}ms`);
    console.log(`Speed: ${(100 / (end - start)).toFixed(2)} files/ms`);
    console.log('═══════════════════════════════\n');
  });

program.parse();