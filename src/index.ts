// AutoPR main entry point
export { DiffAnalyzer, type DiffAnalysis } from './core/DiffAnalyzer.js';
export { GitHubClient, type GitHubClientConfig } from './github/GitHubClient.js';
export { CodeQualityChecker, quickCheck, type QualityCheckResult, type Issue, type BreakingChange } from './core/CodeQualityChecker.js';
export { RulesEngine, checkCode, type Rule, type RuleIssue, type RuleType } from './core/rules.js';
export { 
  generatePRDescription, 
  hasBreakingChanges,
  hasTestChanges,
  calculateComplexityScore,
  getComplexityLevel
} from './ai/index.js';
