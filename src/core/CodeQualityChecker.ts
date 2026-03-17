/**
 * Code Quality Checker module
 * Analyzes code for potential issues, security vulnerabilities, and style violations
 */

import { DiffAnalysis } from '../core/DiffAnalyzer.js';

/**
 * 质量检查结果
 */
export interface QualityCheckResult {
  score: number; // 0-100
  issues: Issue[];
  recommendations: string[];
  breakingChanges: BreakingChange[];
}

/**
 * 问题类型
 */
export interface Issue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'security' | 'performance' | 'style' | 'maintainability';
  message: string;
  file: string;
  line?: number;
  code?: string;
}

/**
 * 破坏性变更
 */
export interface BreakingChange {
  description: string;
  file: string;
  impact: string;
  migration: string;
}

/**
 * 代码质量检查器
 */
export class CodeQualityChecker {
  private issues: Issue[] = [];
  private recommendations: string[] = [];
  private breakingChanges: BreakingChange[] = [];

  /**
   * 执行完整质量检查
   * @param analysis - Diff 分析结果
   */
  async check(analysis: DiffAnalysis, diff: string): Promise<QualityCheckResult> {
    this.issues = [];
    this.recommendations = [];
    this.breakingChanges = [];

    // 执行各种检查
    await this.checkSecurity(analysis, diff);
    await this.checkPerformance(analysis, diff);
    await this.checkStyle(analysis, diff);
    await this.checkMaintainability(analysis, diff);
    await this.detectBreakingChanges(analysis, diff);

    // 计算总分
    const score = this.calculateScore();

    return {
      score,
      issues: this.issues,
      recommendations: this.recommendations,
      breakingChanges: this.breakingChanges
    };
  }

  /**
   * 检查安全问题
   */
  private async checkSecurity(analysis: DiffAnalysis, diff: string): Promise<void> {
    const sensitivePatterns = [
      { pattern: /password|passwd|pwd\s*=/i, name: '硬编码密码' },
      { pattern: /api[_-]?key\s*=/i, name: '硬编码 API Key' },
      { pattern: /secret[_-]?key\s*=/i, name: '硬编码密钥' },
      { pattern: /token\s*=/i, name: '硬编码 Token' },
      { pattern: /\/\/\s*TODO|FIXME|HACK|XXX/i, name: '技术债标记' },
      { pattern: /eval\s*\(/, name: '使用 eval' },
      { pattern: /dangerouslySetInnerHTML/i, name: '危险的 HTML 插入' }
    ];

    for (const line of diff.split('\n')) {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        for (const pattern of sensitivePatterns) {
          if (pattern.pattern.test(line)) {
            this.issues.push({
              severity: 'critical',
              category: 'security',
              message: `发现 ${pattern.name} 的潜在风险`,
              file: 'Unknown',
              code: line.trim()
            });
          }
        }
      }
    }
  }

  /**
   * 检查性能问题
   */
  private async checkPerformance(analysis: DiffAnalysis, diff: string): Promise<void> {
    const performancePatterns = [
      { pattern: /for\s*\(.*\s*in\s*/, name: 'for...in 循环不适用于数组' },
      { pattern: /\.forEach\s*(\(\)\s*=>|function\s*\()/, name: 'forEach 用于大型数组' },
      { pattern: /\.map\s*\(\s*\(\)\s*=>\s*\{\s*return\s+\S+\s*;\s*}/, name: 'map 返回未使用的结果' },
      { pattern: /await\s*forEach|forEach\s*await/i, name: '异步forEach误用' },
      { pattern: /Date\.now\(\)|performance\.now\(\)/, name: '性能计时' }
    ];

    for (const line of diff.split('\n')) {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        for (const pattern of performancePatterns) {
          if (pattern.pattern.test(line)) {
            this.issues.push({
              severity: 'medium',
              category: 'performance',
              message: `发现 ${pattern.name} 的潜在问题`,
              file: 'Unknown',
              code: line.trim()
            });
          }
        }
      }
    }
  }

  /**
   * 检查代码风格
   */
  private async checkStyle(analysis: DiffAnalysis, diff: string): Promise<void> {
    const stylePatterns = [
      { pattern: /console\.(log|error|warn|info)/, name: '调试代码残留', file: 'console.log' },
      { pattern: /export default\s+\w+/, name: '使用默认导出' },
      { pattern: /var\s+\w+\s*=/, name: '使用 var 声明变量' },
      { pattern: /=\s*\[\s*\]/, name: '空数组字面量' },
      { pattern: /=\s*\{\s*\}/, name: '空对象字面量' },
      { pattern: /if\s*\(.*\)\s*\n\s*return\s+true/, name: '冗余的 if-true 返回' }
    ];

    for (const line of diff.split('\n')) {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        for (const pattern of stylePatterns) {
          if (pattern.pattern.test(line)) {
            this.issues.push({
              severity: 'low',
              category: 'style',
              message: `发现 ${pattern.name}`,
              file: 'Unknown',
              code: line.trim()
            });
          }
        }
      }
    }
  }

  /**
   * 检查可维护性问题
   */
  private async checkMaintainability(analysis: DiffAnalysis, diff: string): Promise<void> {
    // 检查大文件
    if (analysis.filesChanged > 10) {
      this.recommendations.push('变更的文件过多，考虑拆分为多个 PR');
    }

    // 检查大变更
    if (analysis.additions > 1000 || analysis.deletions > 1000) {
      this.recommendations.push('变更行数过多，建议分批提交');
    }

    // 检查删除代码比例
    if (analysis.deletions > analysis.additions * 3) {
      this.recommendations.push('删除代码远多于新增，确认是否有误删');
    }

    // 检查测试覆盖率
    if (!analysis.keyChanges.some(k => /test/i.test(k))) {
      this.recommendations.push('未发现测试文件变更，确保新增代码有足够测试');
    }

    // 检查文档
    if (!analysis.keyChanges.some(k => /readme|docs/i.test(k))) {
      this.recommendations.push('建议更新相关文档');
    }
  }

  /**
   * 检测破坏性变更
   */
  private async detectBreakingChanges(analysis: DiffAnalysis, diff: string): Promise<void> {
    const breakingPatterns = [
      { 
        pattern: /import\s+\w+\s+from\s+['"]@deprecated/, 
        impact: '外部包废弃',
        migration: '迁移到新包'
      },
      { 
        pattern: /delete\s+\w+\[ '|`/, 
        impact: '属性删除',
        migration: '使用 undefined'
      },
      { 
        pattern: /Function\.prototype\.call\(|Function\.prototype\.apply\(/, 
        impact: '函数调用',
        migration: '使用 bind'
      }
    ];

    for (const line of diff.split('\n')) {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        for (const pattern of breakingPatterns) {
          if (pattern.pattern.test(line)) {
            this.breakingChanges.push({
              description: `检测到潜在破坏性变更: ${line.trim()}`,
              file: 'Unknown',
              impact: pattern.impact,
              migration: pattern.migration
            });
          }
        }
      }
    }
  }

  /**
   * 计算质量分数
   */
  private calculateScore(): number {
    const issueWeights = {
      critical: 25,
      high: 15,
      medium: 8,
      low: 3
    };

    let deduction = 0;
    for (const issue of this.issues) {
      deduction += issueWeights[issue.severity];
    }

    // 估算分数 (最高 100)
    let score = 100 - deduction;
    if (this.breakingChanges.length > 0) {
      score = Math.max(0, score - this.breakingChanges.length * 5);
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 获取建议列表
   */
  getRecommendations(): string[] {
    return [...this.recommendations];
  }

  /**
   * 获取严重问题
   */
  getCriticalIssues(): Issue[] {
    return this.issues.filter(issue => issue.severity === 'critical');
  }

  /**
   * 检查是否有破坏性变更
   */
  hasBreakingChanges(): boolean {
    return this.breakingChanges.length > 0;
  }

  /**
   * 获取问题数量统计
   */
  getIssueCount(): Record<string, number> {
    const count: Record<string, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };
    for (const issue of this.issues) {
      count[issue.severity]++;
    }
    return count;
  }
}

/**
 * 快速检查函数
 */
export async function quickCheck(
  analysis: DiffAnalysis, 
  diff: string
): Promise<QualityCheckResult> {
  const checker = new CodeQualityChecker();
  return await checker.check(analysis, diff);
}
