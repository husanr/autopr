/**
 * PR Description command for AutoPR CLI
 */

import { Command } from 'commander';
import { DiffAnalyzer } from '../core/DiffAnalyzer';
import { AIGenerator, AIGeneratorConfig } from '../ai/AIGenerator';
import * as fs from 'fs';

interface PRDescriptionOptions {
  diffFile?: string;
  apiKey: string;
  model?: string;
}

export function setupPRDescriptionCommand(program: Command) {
  program
    .command('pr-description')
    .description('Generate a PR description from a git diff')
    .option('-d, --diff-file <file>', 'Path to git diff file')
    .option('-k, --api-key <key>', 'AI API key (required)')
    .option('-m, --model <model>', 'AI model to use')
    .action(async (options: PRDescriptionOptions) => {
      try {
        if (!options.apiKey) {
          console.error('Error: AI API key is required (-k, --api-key)');
          process.exit(1);
        }

        let diffContent = '';
        
        if (options.diffFile) {
          diffContent = fs.readFileSync(options.diffFile, 'utf8');
        } else {
          // Read from stdin if no file specified
          diffContent = fs.readFileSync(0, 'utf8');
        }

        const analyzer = new DiffAnalyzer();
        const analysis = await analyzer.analyze(diffContent);

        const aiConfig: AIGeneratorConfig = {
          apiKey: options.apiKey,
          model: options.model
        };
        const aiGenerator = new AIGenerator(aiConfig);
        const description = await aiGenerator.generatePRDescription(analysis);
        
        console.log(description);
      } catch (error) {
        console.error('Error generating PR description:', error);
        process.exit(1);
      }
    });
}