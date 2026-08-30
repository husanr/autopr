// popup.js - AutoPR Chrome Extension

const PROVIDER_CONFIG = {
  openrouter: {
    apiBase: 'https://openrouter.ai/api/v1',
    helpText: 'OpenRouter 免费注册获取 Key: openrouter.ai'
  },
  openai: {
    apiBase: 'https://api.openai.com/v1',
    helpText: 'OpenAI API Key: platform.openai.com'
  },
  deepseek: {
    apiBase: 'https://api.deepseek.com/v1',
    helpText: 'DeepSeek API Key: platform.deepseek.com'
  },
  custom: {
    apiBase: '',
    helpText: '支持任何 OpenAI 兼容 API'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const apiKey = document.getElementById('apiKey');
  const apiKeyHelp = document.getElementById('apiKeyHelp');
  const apiBase = document.getElementById('apiBase');
  const provider = document.getElementById('provider');
  const model = document.getElementById('model');
  const customModel = document.getElementById('customModel');
  const customModelGroup = document.getElementById('customModelGroup');
  const saveBtn = document.getElementById('saveBtn');
  const status = document.getElementById('toast');

  // Load saved config
  chrome.storage.sync.get(['apiKey', 'apiBase', 'model', 'customModel', 'usageCount', 'plan', 'provider'], (data) => {
    if (data.provider) {
      provider.value = data.provider;
    } else if (data.apiBase?.includes('openrouter')) {
      provider.value = 'openrouter';
    } else if (data.apiBase?.includes('deepseek')) {
      provider.value = 'deepseek';
    } else if (data.apiBase?.includes('openai')) {
      provider.value = 'openai';
    }

    if (data.apiKey) apiKey.value = data.apiKey;
    if (data.apiBase && data.apiBase !== 'https://api.openai.com/v1') {
      apiBase.value = data.apiBase;
    }
    if (data.model) model.value = data.model;
    if (data.customModel) customModel.value = data.customModel;

    updateProviderUI();
    updateCustomModelVisibility();
    updateStatusBadge(!!data.apiKey);

    // Usage - fetch real count from background
    refreshUsage();
  });

  provider.addEventListener('change', updateProviderUI);
  model.addEventListener('change', updateCustomModelVisibility);

  function updateProviderUI() {
    const config = PROVIDER_CONFIG[provider.value] || PROVIDER_CONFIG.custom;
    apiBase.placeholder = config.apiBase || 'https://your-api.com/v1';
    apiKeyHelp.textContent = config.helpText;

    if (!apiBase.value) {
      apiBase.value = config.apiBase;
    }
  }

  function updateCustomModelVisibility() {
    customModelGroup.style.display = model.value === 'custom' ? 'block' : 'none';
  }

  function refreshUsage() {
    chrome.runtime.sendMessage({ type: 'checkUsage' }, (usage) => {
      if (usage) {
        const pct = Math.min((usage.count / usage.limit) * 100, 100);
        document.getElementById('usageFill').style.width = pct + '%';
        document.getElementById('usageCurrent').textContent = usage.count;
        document.getElementById('usageLimit').textContent = usage.limit;
      }
    });
  }

  saveBtn.addEventListener('click', () => {
    const config = {
      provider: provider.value,
      apiKey: apiKey.value.trim(),
      apiBase: apiBase.value.trim() || PROVIDER_CONFIG[provider.value]?.apiBase || 'https://openrouter.ai/api/v1',
      model: model.value === 'custom' ? customModel.value.trim() : model.value,
      customModel: customModel.value.trim()
    };

    chrome.storage.sync.set(config, () => {
      showStatus('✅ 配置已保存', 'success');
      // Notify content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.url?.includes('github.com')) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'configUpdated', config });
        }
      });
    });
  });

  function showStatus(msg, type) {
    status.textContent = msg;
    status.className = 'toast ' + type;
    setTimeout(() => { status.className = 'toast'; }, 3000);
  }

  function updateStatusBadge(configured) {
    const badge = document.getElementById('statusBadge');
    if (!badge) return;
    if (configured) {
      badge.textContent = '● Ready';
      badge.className = 'status-badge';
    } else {
      badge.textContent = '● Not Configured';
      badge.className = 'status-badge offline';
    }
  }
});
