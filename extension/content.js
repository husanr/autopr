// content.js - AutoPR GitHub PR 页面注入脚本

(function() {
  'use strict';

  // 防止重复注入
  if (window.__autopr_loaded) return;
  window.__autopr_loaded = true;

  let config = { apiKey: '', apiBase: 'https://api.openai.com/v1', model: 'gpt-4o-mini' };

  // 加载配置
  function loadConfig() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['apiKey', 'apiBase', 'model'], (data) => {
        config = {
          apiKey: data.apiKey || '',
          apiBase: data.apiBase || 'https://api.openai.com/v1',
          model: data.model || 'gpt-4o-mini'
        };
        resolve(config);
      });
    });
  }

  // 监听配置更新
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'configUpdated') {
      config = msg.config;
    }
  });

  // 获取 PR 信息
  function getPRInfo() {
    const match = window.location.pathname.match(/^\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
    if (!match) return null;
    return { owner: match[1], repo: match[2], number: match[3] };
  }

  // 获取 diff 内容 - 使用 GitHub API
  async function getPRDiff(prInfo) {
    console.log('[AutoPR] Getting diff from GitHub API...');
    
    try {
      // 调用 GitHub API 获取 PR files
      const apiUrl = `https://api.github.com/repos/${prInfo.owner}/${prInfo.repo}/pulls/${prInfo.number}/files?per_page=100`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const files = await response.json();
      console.log('[AutoPR] API returned files:', files.length);
      
      let diff = '';
      
      for (const file of files) {
        const filename = file.filename;
        const status = file.status; // added, removed, modified, renamed
        
        diff += `diff --git a/${filename} b/${filename}\n`;
        diff += `index ${file.sha?.substring(0, 7)}..${file.contents_url?.split('/').pop() || '0000000'} 100644\n`;
        
        if (status === 'added') {
          diff += `--- /dev/null\n`;
          diff += `+++ b/${filename}\n`;
        } else if (status === 'removed') {
          diff += `--- a/${filename}\n`;
          diff += `+++ /dev/null\n`;
        } else {
          diff += `--- a/${filename}\n`;
          diff += `+++ b/${filename}\n`;
        }
        
        // 处理 patch（包含具体的行变更）
        if (file.patch) {
          diff += file.patch + '\n';
        }
      }
      
      if (!diff || diff.length < 20) {
        throw new Error('未获取到变更内容');
      }
      
      console.log('[AutoPR] Got diff from API:', diff.length, 'chars');
      return diff;
      
    } catch (error) {
      console.error('[AutoPR] API failed:', error);
      // 如果 API 失败，回退到页面提取
      console.log('[AutoPR] Falling back to page extraction...');
      return extractDiffFromPage();
    }
  }
  
  // 从页面的 DOM 提取 diff
  function extractDiffFromPage() {
    let diff = '';
    
    // 尝试多种选择器匹配新版 GitHub UI
    let files = document.querySelectorAll('[data-file-name], .file, .js-file-content');
    
    console.log('[AutoPR] Found files:', files.length);
    console.log('[AutoPR] Page URL:', window.location.href);
    
    // 如果没找到，尝试更通用的选择器
    if (files.length === 0) {
      console.log('[AutoPR] Trying alternative selectors...');
      // 新版 GitHub 使用 .react-container 和 data-file-name
      files = document.querySelectorAll('[data-hpc], .react-container [data-file-name]');
      console.log('[AutoPR] Alternative files:', files.length);
    }
    
    // 打印页面主要元素帮助调试
    if (files.length === 0) {
      const bodyClasses = document.body.className;
      console.log('[AutoPR] Body classes:', bodyClasses);
      const mainContent = document.querySelector('#files')
      console.log('[AutoPR] #files exists:', !!mainContent);
    }
    
    if (files.length === 0) {
      return '';
    }
    
    files.forEach((file, i) => {
      // 获取文件名 - 尝试多种方式
      let filename = file.getAttribute('data-file-name');
      if (!filename) {
        const titleEl = file.querySelector('[data-file-name], .file-header__title, .file-info-title, .file-title');
        filename = titleEl?.textContent?.trim()?.split('\n')[0] || `file${i}`;
      }
      
      // 清理文件名（去掉路径前缀显示）
      if (filename.includes(' → ')) {
        filename = filename.split(' → ')[1] || filename;
      }
      
      // 获取文件状态
      const fileInfo = file.querySelector('.file-header__info, .file-info, [data-file-display], [data-file-status]');
      const status = fileInfo?.textContent?.trim() || '';
      
      diff += `diff --git a/${filename} b/${filename}\n`;
      if (status) diff += status + '\n';
      diff += '--- a/' + filename + '\n';
      diff += '+++ b/' + filename + '\n';
      
      // 获取代码行 - 使用更通用的选择器
      const codeRows = file.querySelectorAll('tbody tr, .blob-code, .js-file-line, .line');
      
      codeRows.forEach(row => {
        const text = row.textContent || '';
        const trimmed = text.trim();
        
        // 跳过行号和空行
        if (!trimmed || /^\d+$/.test(trimmed)) return;
        
        // 根据 class 或内容判断行类型
        const classList = row.classList || [];
        const isAddition = classList.contains('blob-code-addition') || 
                          classList.contains('addition') || 
                          text.startsWith('+');
        const isDeletion = classList.contains('blob-code-deletion') || 
                          classList.contains('deletion') || 
                          text.startsWith('-');
        
        if (isAddition) {
          diff += text + '\n';
        } else if (isDeletion) {
          diff += text + '\n';
        } else if (!text.match(/^\d+/)) { // 跳过纯数字（行号）
          diff += ' ' + text + '\n';
        }
      });
      diff += '\n';
    });
    
    console.log('[AutoPR] Extracted diff length:', diff.length);
    return diff;
  }

  // 获取 PR 标题和已有描述
  function getPRExistingInfo() {
    const titleEl = document.querySelector('.js-issue-title, .gh-header-title .markdown-title, h1.gh-header-title span');
    const title = titleEl ? titleEl.textContent.trim() : '';
    const descEl = document.querySelector('.comment-body[data-body-type="issue"]');
    const desc = descEl ? descEl.textContent.trim() : '';
    return { title, desc };
  }

  // 调用 AI - 通过后台脚本避免 CORS
  async function callAI(prompt) {
    if (!config.apiKey) {
      throw new Error('请先在插件中配置 API Key（点击插件图标设置）');
    }

    // 检查用量限制
    const usageOk = await new Promise(resolve => {
      chrome.runtime.sendMessage({ type: 'checkUsage' }, resolve);
    });
    if (usageOk && !usageOk.allowed) {
      throw new Error(`免费额度已用完（${usageOk.count}/${usageOk.limit} 次/月），请升级 Pro 或下月重置`);
    }

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        type: 'callAI',
        config: {
          apiKey: config.apiKey,
          apiBase: config.apiBase,
          model: config.model
        },
        prompt: prompt
      }, (response) => {
        if (response && response.success) {
          resolve(response.result);
        } else {
          reject(new Error(response?.error || 'AI 调用失败'));
        }
      });
    });
  }

  // 显示手动粘贴 diff 的 UI
  function showManualDiffUI(output, onsubmit) {
    output.style.display = 'block';
    output.innerHTML = `
      <div class="autopr-error">
        ⚠️ 无法自动获取 diff，请手动粘贴 git diff 内容：
        <textarea id="autopr-manual-diff" class="autopr-textarea" placeholder="在终端运行 git diff 获取内容并粘贴到这里..."></textarea>
        <button class="autopr-btn autopr-primary" id="autopr-use-manual">🚀 提交</button>
      </div>
    `;
    document.getElementById('autopr-use-manual').addEventListener('click', () => {
      const val = document.getElementById('autopr-manual-diff').value;
      if (val) onsubmit(val);
    });
  }

  // 生成 PR 描述
  async function generatePRDescription() {
    const prInfo = getPRInfo();
    if (!prInfo) return;

    const btn = document.getElementById('autopr-gen-desc');
    const output = document.getElementById('autopr-output');

    btn.disabled = true;
    btn.textContent = '⏳ 生成中...';
    output.style.display = 'block';
    output.innerHTML = '<div class="autopr-loading">AI 正在分析代码变更...</div>';

    try {
      let diff;
      try {
        diff = await getPRDiff(prInfo);
      } catch (e) {
        console.log('[AutoPR] Auto fetch failed:', e.message);
        showManualDiffUI(output, (manualDiff) => generateWithDiff(manualDiff, getPRExistingInfo(), btn, output));
        btn.disabled = false;
        btn.textContent = '📝 生成 PR 描述';
        return;
      }

      await generateWithDiff(diff, getPRExistingInfo(), btn, output);
    } catch (e) {
      output.innerHTML = `<div class="autopr-error">❌ ${escapeHtml(e.message)}</div>`;
      btn.disabled = false;
      btn.textContent = '📝 生成 PR 描述';
    }
  }

  // 用 diff 生成描述
  async function generateWithDiff(diff, existingInfo, btn, output) {
    output.innerHTML = '<div class="autopr-loading">AI 正在分析代码变更...</div>';

    try {
      const truncatedDiff = diff.length > 15000 ? diff.substring(0, 15000) + '\n... (已截断)' : diff;

      const prompt = `请为以下 Pull Request 生成一份专业的 PR 描述。

PR 标题：${existingInfo.title || '（无）'}
已有描述：${existingInfo.desc || '（无）'}

代码变更（diff）：
\`\`\`diff
${truncatedDiff}
\`\`\`

请按以下格式输出：
## 变更说明
（简要说明这次变更的目的和内容）

## 变更内容
- （列出主要变更点）

## 测试建议
- （建议的测试方法）

请简洁专业，不要废话。`;

      const result = await callAI(prompt);

      output.innerHTML = `<div class="autopr-result"><pre>${escapeHtml(result)}</pre></div>
        <button class="autopr-btn autopr-copy" id="autopr-copy">📋 复制</button>`;

      document.getElementById('autopr-copy').addEventListener('click', () => {
        navigator.clipboard.writeText(result);
        document.getElementById('autopr-copy').textContent = '✅ 已复制';
        setTimeout(() => { document.getElementById('autopr-copy').textContent = '📋 复制'; }, 2000);
      });

    } catch (e) {
      output.innerHTML = `<div class="autopr-error">❌ ${escapeHtml(e.message)}</div>`;
    } finally {
      btn.disabled = false;
      btn.textContent = '📝 生成 PR 描述';
    }
  }

  // 代码审查
  async function reviewCode() {
    const prInfo = getPRInfo();
    if (!prInfo) return;

    const btn = document.getElementById('autopr-review');
    const output = document.getElementById('autopr-output');

    btn.disabled = true;
    btn.textContent = '⏳ 审查中...';
    output.style.display = 'block';
    output.innerHTML = '<div class="autopr-loading">AI 正在审查代码...</div>';

    try {
      let diff;
      try {
        diff = await getPRDiff(prInfo);
      } catch (e) {
        console.log('[AutoPR] Auto fetch failed:', e.message);
        showManualDiffUI(output, (manualDiff) => doReview(manualDiff, btn, output));
        btn.disabled = false;
        btn.textContent = '🔍 AI 代码审查';
        return;
      }

      await doReview(diff, btn, output);
    } catch (e) {
      output.innerHTML = `<div class="autopr-error">❌ ${escapeHtml(e.message)}</div>`;
      btn.disabled = false;
      btn.textContent = '🔍 AI 代码审查';
    }
  }

  // 执行代码审查
  async function doReview(diff, btn, output) {
    output.innerHTML = '<div class="autopr-loading">AI 正在审查代码...</div>';

    try {
      const truncatedDiff = diff.length > 15000 ? diff.substring(0, 15000) + '\n... (已截断)' : diff;

      const prompt = `请对以下 Pull Request 进行代码审查，给出专业意见。

代码变更（diff）：
\`\`\`diff
${truncatedDiff}
\`\`\`

请从以下角度审查：
1. 🐛 潜在 Bug
2. 🔒 安全问题
3. ⚡ 性能问题
4. 📖 代码可读性
5. 💡 改进建议

请简洁专业。`;

      const result = await callAI(prompt);

      output.innerHTML = `<div class="autopr-result"><pre>${escapeHtml(result)}</pre></div>
        <button class="autopr-btn autopr-copy" id="autopr-copy">📋 复制</button>`;

      document.getElementById('autopr-copy').addEventListener('click', () => {
        navigator.clipboard.writeText(result);
        document.getElementById('autopr-copy').textContent = '✅ 已复制';
        setTimeout(() => { document.getElementById('autopr-copy').textContent = '📋 复制'; }, 2000);
      });

    } catch (e) {
      output.innerHTML = `<div class="autopr-error">❌ ${escapeHtml(e.message)}</div>`;
    } finally {
      btn.disabled = false;
      btn.textContent = '🔍 AI 代码审查';
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // 注入 UI
  function injectUI() {
    if (document.getElementById('autopr-panel')) return;
    if (!window.location.pathname.match(/\/pull\/\d+/)) return;

    // 找插入位置
    const target = document.querySelector(
      '#issuebody, [data-testid="issue-body"], .js-discussion, #discussion_bucket, main'
    );

    if (!target) {
      console.log('[AutoPR] Waiting for page...');
      setTimeout(injectUI, 1500);
      return;
    }

    console.log('[AutoPR] Injecting UI...');

    const panel = document.createElement('div');
    panel.id = 'autopr-panel';
    panel.innerHTML = `
      <div class="autopr-header">
        <span class="autopr-logo">🤖</span>
        <span class="autopr-title">Auto<span>PR</span></span>
        <span class="autopr-badge" id="autopr-status">● Ready</span>
      </div>
      <div class="autopr-section-label">⚡ Actions</div>
      <div class="autopr-actions">
        <button class="autopr-btn autopr-primary" id="autopr-gen-desc">📝 生成 PR 描述</button>
        <button class="autopr-btn autopr-secondary" id="autopr-review">🔍 AI 代码审查</button>
      </div>
      <div class="autopr-divider"></div>
      <div id="autopr-usage-bar" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <span style="font-size:11px;color:#94A3B8;">📊 Monthly Usage</span>
        <span style="font-size:12px;color:#94A3B8;"><strong id="autopr-usage-count" style="color:#06B6D4;font-weight:700;">-</strong> / <span id="autopr-usage-limit">20</span></span>
      </div>
      <div style="height:6px;background:#1E2540;border-radius:99px;overflow:hidden;margin-bottom:4px;">
        <div id="autopr-usage-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#7C3AED,#06B6D4);border-radius:99px;transition:width 0.4s ease;"></div>
      </div>
      <div class="autopr-output" id="autopr-output" style="display:none"></div>
    `;

    target.insertBefore(panel, target.firstChild);

    document.getElementById('autopr-gen-desc').addEventListener('click', generatePRDescription);
    document.getElementById('autopr-review').addEventListener('click', reviewCode);

    // 加载用量
    chrome.runtime.sendMessage({ type: 'checkUsage' }, (usage) => {
      if (usage) {
        const pct = Math.min((usage.count / usage.limit) * 100, 100);
        const fill = document.getElementById('autopr-usage-fill');
        const count = document.getElementById('autopr-usage-count');
        const limit = document.getElementById('autopr-usage-limit');
        if (fill) fill.style.width = pct + '%';
        if (count) count.textContent = usage.count;
        if (limit) limit.textContent = usage.limit;
      }
    });

    // 更新状态指示
    if (!config.apiKey) {
      const badge = document.getElementById('autopr-status');
      if (badge) {
        badge.textContent = '● Not Configured';
        badge.style.background = 'rgba(245,158,11,0.15)';
        badge.style.color = '#F59E0B';
      }
    }

    console.log('[AutoPR] ✅ UI injected!');
  }

  // 初始化
  loadConfig().then(() => {
    console.log('[AutoPR] Loaded on:', window.location.href);
    injectUI();
    setTimeout(injectUI, 2000);
    setTimeout(injectUI, 5000);
  });

  // SPA 导航监听
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      if (location.href.includes('/pull/')) {
        setTimeout(injectUI, 1000);
      }
    }
  }).observe(document.body, { childList: true, subtree: true });

})();
