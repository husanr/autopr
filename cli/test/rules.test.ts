import { describe, it, expect } from 'vitest';
import { RulesEngine, checkCode } from '../src/core/rules.js';

describe('RulesEngine', () => {
  const engine = new RulesEngine();

  it('加载默认规则：各类型均非空', () => {
    const stats = engine.getStats();
    expect(stats.total).toBeGreaterThan(0);
    expect(stats.security).toBeGreaterThan(0);
    expect(stats.performance).toBeGreaterThan(0);
    expect(stats.style).toBeGreaterThan(0);
    expect(stats['best-practices']).toBeGreaterThan(0);
  });

  it('检测硬编码密码 (SEC001)', () => {
    const issues = checkCode("const password = 'hunter2';", engine);
    expect(issues.some(i => i.rule.id === 'SEC001')).toBe(true);
  });

  it('检测硬编码 API Key (SEC002)', () => {
    const issues = checkCode('const api_key = "sk-123456789";', engine);
    expect(issues.some(i => i.rule.id === 'SEC002')).toBe(true);
  });

  it('检测 eval (SEC003)', () => {
    const issues = checkCode('eval(userInput);', engine);
    expect(issues.some(i => i.rule.id === 'SEC003')).toBe(true);
  });

  it('检测 console.log (SEC004)', () => {
    const issues = checkCode('console.log("debug");', engine);
    expect(issues.some(i => i.rule.id === 'SEC004')).toBe(true);
  });

  it('检测 var 声明 (STYLE001)', () => {
    const issues = checkCode('var count = 1;', engine);
    expect(issues.some(i => i.rule.id === 'STYLE001')).toBe(true);
  });

  it('按类型过滤', () => {
    const rules = engine.getRulesByType('security');
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.every(r => r.type === 'security')).toBe(true);
  });

  it('按严重程度过滤', () => {
    const rules = engine.getRulesBySeverity('critical');
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.every(r => r.severity === 'critical')).toBe(true);
  });

  it('支持添加自定义规则', () => {
    const custom = new RulesEngine();
    custom.addRule({
      id: 'CUSTOM001',
      name: 'Custom Rule',
      description: '自定义规则',
      type: 'style',
      severity: 'low',
      pattern: /customMarker/
    });
    const issues = checkCode('customMarker here', custom);
    expect(issues.some(i => i.rule.id === 'CUSTOM001')).toBe(true);
  });
});