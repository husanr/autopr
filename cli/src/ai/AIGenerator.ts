/**
 * AI integration module for AutoPR
 * Handles LLM calls to generate PR descriptions and reviews
 */

import { DiffAnalysis } from '../core/DiffAnalyzer';

export interface AIGeneratorConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

export interface GeneratedContent {
  description: string;
  reviewComments: string[];
  changelogEntry?: string;
}

export class AIGenerator {
  private readonly config: AIGeneratorConfig;
  private readonly DEFAULT_MODEL = 'gpt-4';

  constructor(config: AIGeneratorConfig) {
    this.config = {
      ...config,
      model: config.model || this.DEFAULT_MODEL
    };
  }

  async generatePRDescription(diffAnalysis: DiffAnalysis): Promise<string> {
    const prompt = this.createPRDescriptionPrompt(diffAnalysis);
    return await this.callLLM(prompt);
  }

  async generateCodeReview(diffAnalysis: DiffAnalysis, diffContent: string): Promise<string[]> {
    const prompt = this.createCodeReviewPrompt(diffAnalysis, diffContent);
    const response = await this.callLLM(prompt);
    // Split response into individual comments
    return response.split('\n').filter(line => line.trim() !== '');
  }

  async generateChangelogEntry(diffAnalysis: DiffAnalysis): Promise<string> {
    const prompt = this.createChangelogPrompt(diffAnalysis);
    return await this.callLLM(prompt);
  }

  async generateCompleteContent(diffAnalysis: DiffAnalysis, diffContent: string): Promise<GeneratedContent> {
    const [description, reviewComments, changelogEntry] = await Promise.all([
      this.generatePRDescription(diffAnalysis),
      this.generateCodeReview(diffAnalysis, diffContent),
      this.generateChangelogEntry(diffAnalysis)
    ]);

    return {
      description,
      reviewComments,
      changelogEntry
    };
  }

  private createPRDescriptionPrompt(diffAnalysis: DiffAnalysis): string {
    return `You are an expert software engineer creating pull request descriptions.
    
Based on the following code changes analysis:
- Files changed: ${diffAnalysis.filesChanged}
- Additions: ${diffAnalysis.additions}
- Deletions: ${diffAnalysis.deletions}
- Key changes: ${diffAnalysis.keyChanges.join('; ')}
- Languages: ${Object.entries(diffAnalysis.languageBreakdown)
  .map(([lang, lines]) => `${lang}: ${lines} lines`)
  .join(', ')}

Write a clear, concise, and professional pull request description that:
1. Summarizes what this PR does in 1-2 sentences
2. Explains the motivation behind the changes
3. Highlights any breaking changes or important notes
4. Uses proper markdown formatting

Keep it professional but friendly. Focus on the value delivered.`;
  }

  private createCodeReviewPrompt(diffAnalysis: DiffAnalysis, diffContent: string): string {
    return `You are an expert code reviewer performing a thorough code review.
    
Analyze the following git diff and provide constructive feedback:

${diffContent}

Context about these changes:
- Total changes: ${diffAnalysis.additions + diffAnalysis.deletions} lines
- Files changed: ${diffAnalysis.filesChanged}
- Primary languages: ${Object.keys(diffAnalysis.languageBreakdown).join(', ')}

Provide specific, actionable feedback focusing on:
1. Security vulnerabilities or potential exploits
2. Performance issues or bottlenecks  
3. Code quality and maintainability concerns
4. Style violations or inconsistencies
5. Missing error handling or edge cases
6. Potential bugs or logic errors

Format each comment as a separate line starting with "- ". Be constructive and helpful, not critical.`;
  }

  private createChangelogPrompt(diffAnalysis: DiffAnalysis): string {
    return `You are creating a changelog entry for a software release.
    
Based on these code changes:
- Files changed: ${diffAnalysis.filesChanged}
- Additions: ${diffAnalysis.additions}
- Deletions: ${diffAnalysis.deletions}
- Key changes: ${diffAnalysis.keyChanges.join('; ')}
- Languages: ${Object.keys(diffAnalysis.languageBreakdown).join(', ')}

Write a concise changelog entry in the format:
"- [Added/Fixed/Changed/Removed] Brief description of the change"

Focus on user-facing changes and significant internal improvements. Keep it to one line if possible.`;
  }

  private async callLLM(prompt: string): Promise<string> {
    // TODO: Implement actual LLM API call
    // For now, return a placeholder
    console.log('LLM Prompt:', prompt);
    return 'Auto-generated content based on the provided prompt.';
  }
}