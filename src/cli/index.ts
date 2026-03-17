#!/usr/bin/env node
/**
 * CLI entry point for AutoPR
 * Usage: autopr <command> [options]
 */

import { Command } from 'commander';
import { DiffAnalyzer } from '../core/DiffAnalyzer.js';
import { GitHubClient } from '../github/GitHubClient.js';
import { generatePRDescription } from '../ai/index.js';
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
  .action(async (options: { diff: string }) => {
    const diffContent = options.diff.startsWith('/')
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
    console.log('═══════════════════════════════\n');
  });

program
  .command('pr-description')
  .description('Generate PR description from diff')
  .requiredOption('-d, --diff <diff>', 'git diff content or path to diff file')
  .requiredOption('-t, --token <token>', 'GitHub personal access token')
  .requiredOption('-o, --owner <owner>', 'GitHub repository owner')
  .requiredOption('-r, --repo <repo>', 'GitHub repository name')
  .action(async (options: { diff: string; token: string; owner: string; repo: string }) => {
    const diffContent = options.diff.startsWith('/')
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
      
      // Generate description
      const description = await generatePRDescription(analysis);

      console.log('\n🔍 PR Review Results:');
      console.log('═══════════════════════════════');
      console.log(`PR #${options.pr} Analysis:`);
      console.log(`Summary: ${analysis.summary}`);
      console.log(`Files: ${analysis.filesChanged} | +${analysis.additions} -${analysis.deletions}`);
      console.log('\nGenerated Description:');
      console.log(description);
      console.log('═══════════════════════════════\n');
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

program.parse();
