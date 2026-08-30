// background.js - AutoPR Service Worker

const FREE_MONTHLY_LIMIT = 20;

// 安装时初始化
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // 设置默认配置（使用 OpenRouter 免费模型）
    chrome.storage.sync.set({
      apiBase: 'https://openrouter.ai/api/v1',
      apiKey: '',
      model: 'qwen/qwen-2.5-coder-32b-instruct',
      usageCount: 0,
      plan: 'free', // free | pro
      lastResetMonth: new Date().toISOString().slice(0, 7) // 用于每月重置用量
    });
    console.log('[AutoPR] Extension installed with OpenRouter defaults');
  }
});

// 检查使用量限制
function checkUsageLimit(callback) {
  chrome.storage.sync.get(['usageCount', 'plan', 'lastResetMonth'], (data) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    let count = data.usageCount || 0;

    // 每月自动重置用量
    if (data.lastResetMonth !== currentMonth) {
      chrome.storage.sync.set({ usageCount: 0, lastResetMonth: currentMonth });
      count = 0;
    }

    if (data.plan === 'free' && count >= FREE_MONTHLY_LIMIT) {
      callback({ allowed: false, count, limit: FREE_MONTHLY_LIMIT });
    } else {
      callback({ allowed: true, count, limit: FREE_MONTHLY_LIMIT });
    }
  });
}

// 增加使用量计数
function incrementUsage() {
  chrome.storage.sync.get(['usageCount'], (data) => {
    chrome.storage.sync.set({ usageCount: (data.usageCount || 0) + 1 });
  });
}

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getConfig') {
    chrome.storage.sync.get(['apiKey', 'apiBase', 'model'], (data) => {
      sendResponse(data);
    });
    return true; // 异步响应
  }

  if (message.type === 'checkUsage') {
    checkUsageLimit(sendResponse);
    return true;
  }

  if (message.type === 'callAI') {
    // 在后台脚本中调用 AI，避免 CORS 问题
    const { apiKey, apiBase, model } = message.config;
    const prompt = message.prompt;
    
    fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/husanr/auto-pr',
        'X-Title': 'AutoPR Chrome Extension'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: '你是一个专业的软件工程师，擅长编写清晰、专业的 Pull Request 描述和代码审查意见。用中文回答。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })
    .then(resp => {
      console.log('[AutoPR] API response status:', resp.status);
      return resp.json().then(data => ({ status: resp.status, data }));
    })
    .then(({ status, data }) => {
      console.log('[AutoPR] API response data:', JSON.stringify(data).substring(0, 500));
      
      // 兼容多种返回格式
      let content = '';
      
      if (data.choices && data.choices[0]) {
        // OpenAI 兼容格式
        content = data.choices[0].message?.content || data.choices[0]?.message || data.choices[0]?.content || '';
      } else if (data.output && data.output.choices && data.output.choices[0]) {
        // DashScope 格式
        content = data.output.choices[0].message?.content || '';
      } else if (data.output && data.output.text) {
        // 另一种格式
        content = data.output.text;
      } else if (data.content) {
        content = data.content;
      }
      
      if (!content) {
        throw new Error(`API 返回格式未知: ${JSON.stringify(data).substring(0, 200)}`);
      }
      
      sendResponse({ success: true, result: content });
      incrementUsage();
    })
    .catch(err => {
      console.error('[AutoPR] AI call failed:', err);
      sendResponse({ success: false, error: err.message });
    });
    
    return true; // 异步响应
  }
});
