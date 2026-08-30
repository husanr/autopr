/**
 * Code Rules Engine
 * Extensible rule system for code analysis
 */

/**
 * 规则类型
 */
export type RuleType = 'security' | 'performance' | 'style' | 'maintainability' | 'best-practices';

/**
 * 规则接口
 */
export interface Rule {
  id: string;
  name: string;
  description: string;
  type: RuleType;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  pattern: RegExp;
  fix?: (match: RegExpMatchArray) => string;
  documentation?: string;
}

/**
 * 代码规则引擎
 */
export class RulesEngine {
  private rules: Rule[] = [];

  constructor() {
    this.loadDefaultRules();
  }

  /**
   * 加载默认规则
   */
  private loadDefaultRows(): void {
    // 安全规则
    this.rules.push(
      {
        id: 'SEC001',
        name: 'Hardcoded Password',
        description: '检测硬编码的密码',
        type: 'security',
        severity: 'critical',
        pattern: /password\s*=\s*['"][^'"]+['"]/i,
        documentation: '不要在代码中硬编码密码，使用环境变量'
      },
      {
        id: 'SEC002',
        name: 'Hardcoded API Key',
        description: '检测硬编码的 API Key',
        type: 'security',
        severity: 'critical',
        pattern: /api[_-]?key\s*=\s*['"][^'"]+['"]/i,
        documentation: 'API Key 应通过环境变量或配置文件管理'
      },
      {
        id: 'SEC003',
        name: 'Dangerous Eval',
        description: '检测 dangerous 的 eval 使用',
        type: 'security',
        severity: 'critical',
        pattern: /eval\s*\(/,
        documentation: 'eval 可能导致代码注入攻击'
      },
      {
        id: 'SEC004',
        name: 'Console in Production',
        description: '检测生产代码中的 console.log',
        type: 'security',
        severity: 'low',
        pattern: /(console\.(log|error|warn|info)|window\. console)/,
        fix: () => '// console.log removed',
        documentation: '生产环境应移除调试日志'
      },
      {
        id: 'SEC005',
        name: 'Debug Code',
        description: '检测调试代码 (TODO, FIXME)',
        type: 'security',
        severity: 'info',
        pattern: /\/\/\s*(TODO|FIXME|HACK|XXX)\b/i
      }
    );

    // 性能规则
    this.rules.push(
      {
        id: 'PERF001',
        name: 'Inefficient Loop',
        description: '检测低效的循环模式',
        type: 'performance',
        severity: 'high',
        pattern: /for\s*\(\s*var\s+\w+\s+in\s+\w+\s*\)/,
        documentation: 'for...in 不应用于数组迭代，使用 for...of 或传统 for 循环'
      },
      {
        id: 'PERF002',
        name: 'Unnecessary Map',
        description: '检测未使用 map 返回值',
        type: 'performance',
        severity: 'medium',
        pattern: /\.map\s*\(\s*[^{]*\{\s*return\s+\S+;\s*\}\s*\)\s*;/,
        documentation: '如果只用于副作用，使用 forEach 替代 map'
      },
      {
        id: 'PERF003',
        name: 'Large Array Iteration',
        description: '检测大型数组的同步迭代',
        type: 'performance',
        severity: 'medium',
        pattern: /\b(0|1|10)\d{2,}\.forEach/,
        documentation: '大型数组迭代应考虑异步或分块处理'
      },
      {
        id: 'PERF004',
        name: 'Missing Memoization',
        description: '检测可能需要缓存的计算',
        type: 'performance',
        severity: 'low',
        pattern: /Math\.(pow|sqrt|sin|cos)\s*\(/,
        documentation: '高频计算应考虑使用缓存'
      },
      {
        id: 'PERF005',
        name: 'Synchronous I/O',
        description: '检测同步 I/O 操作',
        type: 'performance',
        severity: 'high',
        pattern: /\b(fs\.(readFileSync|writeFileSync|statSync))\b/,
        fix: (match) => match[0].replace('Sync', ''),
        documentation: '优先使用异步 I/O 操作'
      }
    );

    // 风格规则
    this.rules.push(
      {
        id: 'STYLE001',
        name: 'Var Usage',
        description: '检测 var 声明',
        type: 'style',
        severity: 'medium',
        pattern: /\bvar\s+\w+\s*=/,
        fix: () => 'let',
        documentation: 'ES6+ 应使用 let/const 而非 var'
      },
      {
        id: 'STYLE002',
        name: 'Default Export',
        description: '检测默认导出',
        type: 'style',
        severity: 'low',
        pattern: /export\s+default\s+\w+/
      },
      {
        id: 'STYLE003',
        name: 'Mixed Quoting',
        description: '检测混用引号',
        type: 'style',
        severity: 'low',
        pattern: /["'][^"']*['"][^']*["'][^"']*['"]/,
        documentation: '保持引号风格一致'
      }
    );

    // 最佳实践规则
    this.rules.push(
      {
        id: 'BP001',
        name: 'Missing Error Handling',
        description: '检测缺失的错误处理',
        type: 'best-practices',
        severity: 'high',
        pattern: /async\s+\w+\s*\([^)]*\)\s*[^{]*=>\s*\{[^}]*\n[^}]*$/m
      },
      {
        id: 'BP002',
        name: 'Missing Test',
        description: '检测缺少测试文件',
        type: 'best-practices',
        severity: 'medium',
        pattern: /\/(src|lib)\/(?!.*\.test\.)/,
        documentation: '新增代码应有对应测试'
      },
      {
        id: 'BP003',
        name: 'Hungarian Notation',
        description: '检测匈牙利命名法',
        type: 'best-practices',
        severity: 'low',
        pattern: /\b[hH][eE][lL][pP]/,
        documentation: '现代代码应避免匈牙利命名法'
      },
      {
        id: 'BP004',
        name: 'Magic Number',
        description: '检测魔法数字',
        type: 'best-practices',
        severity: 'medium',
        pattern: /\b\d{3,}\b/,
        documentation: '使用常量命名魔法数字'
      },
      {
        id: 'BP005',
        name: 'Deep Nesting',
        description: '检测深层嵌套',
        type: 'best-practices',
        severity: 'medium',
        pattern: /\{[^{}]*\{[^{}]*\{[^{}]*\{[^{}]*\{/,
        fix: () => '// refactoring needed',
        documentation: '使用函数提取减少嵌套'
      }
    );
  }

  /**
   * 加载默认规则 (修复拼写)
   */
  private loadDefaultRules(): void {
    this.loadDefaultRows();
  }

  /**
   * 添加自定义规则
   */
  addRule(rule: Rule): void {
    this.rules.push(rule);
  }

  /**
   * 执行规则检查
   */
  check(code: string): RuleIssue[] {
    const issues: RuleIssue[] = [];

    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const rule of this.rules) {
        const match = line.match(rule.pattern);
        if (match) {
          issues.push({
            rule,
            line: i + 1,
            column: match.index || 0,
            code: line.trim(),
            message: `${rule.id}: ${rule.name} - ${rule.description}`
          });
        }
      }
    }

    return issues;
  }

  /**
   * 按类型过滤规则
   */
  getRulesByType(type: RuleType): Rule[] {
    return this.rules.filter(rule => rule.type === type);
  }

  /**
   * 按严重程度过滤规则
   */
  getRulesBySeverity(severity: 'critical' | 'high' | 'medium' | 'low' | 'info'): Rule[] {
    return this.rules.filter(rule => rule.severity === severity);
  }

  /**
   * 获取所有规则统计
   */
  getStats(): Record<string, number> {
    const stats: Record<string, number> = {
      total: this.rules.length,
      security: 0,
      performance: 0,
      style: 0,
      maintainability: 0,
      'best-practices': 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0
    };

    for (const rule of this.rules) {
      stats[rule.type]++;
      stats[rule.severity]++;
    }

    return stats;
  }
}

/**
 * 规则问题
 */
export interface RuleIssue {
  rule: Rule;
  line: number;
  column: number;
  code: string;
  message: string;
}

/**
 * 快速检查函数
 */
export function checkCode(code: string, rulesEngine?: RulesEngine): RuleIssue[] {
  const engine = rulesEngine || new RulesEngine();
  return engine.check(code);
}
