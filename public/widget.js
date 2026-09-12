(function () {
  if (window.ResolveWidgetLoaded) return;
  window.ResolveWidgetLoaded = true;

  // Find script element to extract config attributes
  const currentScript = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  const workspaceId = currentScript ? currentScript.getAttribute('data-workspace-id') : null;
  const baseUrl = currentScript ? new URL(currentScript.src).origin : window.location.origin;

  let state = {
    isOpen: false,
    conversationId: null,
    messages: [],
    agentName: 'Resolve AI',
    welcomeMessage: 'Hello! How can we help you today?',
    isLoading: false,
    isEscalated: false,
  };

  // Inject Styles
  const style = document.createElement('style');
  style.innerHTML = `
    .resolve-widget-launcher {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 56px;
      height: 56px;
      border-radius: 28px;
      background: #0284c7;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(0,0,0,0.16);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 999999;
      transition: transform 0.2s ease, background-color 0.2s ease;
      border: none;
      outline: none;
    }
    .resolve-widget-launcher:hover {
      transform: scale(1.05);
      background: #0369a1;
    }
    .resolve-widget-container {
      position: fixed;
      bottom: 86px;
      right: 20px;
      width: 380px;
      max-width: calc(100vw - 40px);
      height: 580px;
      max-height: calc(100vh - 120px);
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05);
      display: flex;
      flex-direction: column;
      z-index: 999999;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .resolve-widget-header {
      background: #0f172a;
      color: #ffffff;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .resolve-widget-header-title {
      font-weight: 600;
      font-size: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .resolve-widget-status-dot {
      width: 8px;
      height: 8px;
      border-radius: 4px;
      background: #22c55e;
    }
    .resolve-widget-close-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 18px;
      padding: 4px;
      line-height: 1;
    }
    .resolve-widget-close-btn:hover {
      color: #ffffff;
    }
    .resolve-widget-body {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #f8fafc;
    }
    .resolve-msg {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 14px;
      line-height: 1.45;
      white-space: pre-wrap;
    }
    .resolve-msg-ai, .resolve-msg-human {
      align-self: flex-start;
      background: #ffffff;
      color: #1e293b;
      border: 1px solid #e2e8f0;
      border-top-left-radius: 2px;
    }
    .resolve-msg-customer {
      align-self: flex-end;
      background: #0284c7;
      color: #ffffff;
      border-top-right-radius: 2px;
    }
    .resolve-msg-source {
      font-size: 11px;
      color: #64748b;
      margin-top: 6px;
      padding-top: 4px;
      border-top: 1px dashed #cbd5e1;
    }
    .resolve-widget-footer {
      padding: 12px;
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 8px;
    }
    .resolve-widget-input {
      flex: 1;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 14px;
      outline: none;
    }
    .resolve-widget-input:focus {
      border-color: #0284c7;
    }
    .resolve-widget-send-btn {
      background: #0f172a;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      padding: 8px 14px;
      font-weight: 500;
      cursor: pointer;
      font-size: 13px;
    }
    .resolve-widget-escalate-bar {
      padding: 8px 16px;
      background: #fef2f2;
      border-top: 1px solid #fecaca;
      font-size: 12px;
      color: #991b1b;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .resolve-escalate-btn {
      background: #dc2626;
      color: #fff;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  // Render Widget UI DOM
  const launcher = document.createElement('button');
  launcher.className = 'resolve-widget-launcher';
  launcher.innerHTML = `💬`;
  launcher.setAttribute('aria-label', 'Open support chat');

  const container = document.createElement('div');
  container.className = 'resolve-widget-container';
  container.style.display = 'none';

  container.innerHTML = `
    <div class="resolve-widget-header">
      <div class="resolve-widget-header-title">
        <span class="resolve-widget-status-dot"></span>
        <span id="resolve-agent-name">Resolve AI</span>
      </div>
      <button class="resolve-widget-close-btn" id="resolve-close-btn">&times;</button>
    </div>
    <div class="resolve-widget-body" id="resolve-body"></div>
    <div class="resolve-widget-escalate-bar" id="resolve-escalate-bar" style="display:none;">
      <span>Need human help?</span>
      <button class="resolve-escalate-btn" id="resolve-escalate-btn">Talk to Human</button>
    </div>
    <div class="resolve-widget-footer">
      <input type="text" class="resolve-widget-input" id="resolve-input" placeholder="Type a question..." />
      <button class="resolve-widget-send-btn" id="resolve-send-btn">Send</button>
    </div>
  `;

  document.body.appendChild(launcher);
  document.body.appendChild(container);

  const bodyEl = document.getElementById('resolve-body');
  const inputEl = document.getElementById('resolve-input');
  const sendBtn = document.getElementById('resolve-send-btn');
  const closeBtn = document.getElementById('resolve-close-btn');
  const escalateBar = document.getElementById('resolve-escalate-bar');
  const escalateBtn = document.getElementById('resolve-escalate-btn');

  // Load config
  if (workspaceId) {
    fetch(`${baseUrl}/api/v1/widget/config?workspaceId=${workspaceId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.agent) {
          state.agentName = data.agent.name;
          state.welcomeMessage = data.agent.welcomeMessage;
          document.getElementById('resolve-agent-name').innerText = state.agentName;
          renderMessages();
        }
      })
      .catch(() => {});
  }

  function toggleWidget() {
    state.isOpen = !state.isOpen;
    container.style.display = state.isOpen ? 'flex' : 'none';
    if (state.isOpen && state.messages.length === 0) {
      state.messages.push({
        senderType: 'AI',
        content: state.welcomeMessage,
      });
      renderMessages();
    }
  }

  function renderMessages() {
    bodyEl.innerHTML = '';
    state.messages.forEach((msg) => {
      const msgDiv = document.createElement('div');
      const senderClass = msg.senderType === 'CUSTOMER' ? 'resolve-msg-customer' : 'resolve-msg-ai';
      msgDiv.className = `resolve-msg ${senderClass}`;
      msgDiv.innerText = msg.content;

      if (msg.sources && msg.sources.length > 0) {
        const sourceDiv = document.createElement('div');
        sourceDiv.className = 'resolve-msg-source';
        sourceDiv.innerText = `Sources: ${msg.sources.map((s) => s.name).join(', ')}`;
        msgDiv.appendChild(sourceDiv);
      }

      bodyEl.appendChild(msgDiv);
    });
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  function initializeConversation() {
    if (state.conversationId) return Promise.resolve(state.conversationId);
    return fetch(`${baseUrl}/api/v1/widget/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId }),
    })
      .then((res) => res.json())
      .then((data) => {
        state.conversationId = data.conversationId;
        return state.conversationId;
      });
  }

  function handleSend() {
    const text = inputEl.value.trim();
    if (!text || state.isLoading) return;

    inputEl.value = '';
    state.messages.push({ senderType: 'CUSTOMER', content: text });
    renderMessages();

    state.isLoading = true;

    initializeConversation()
      .then((convId) => {
        return fetch(`${baseUrl}/api/v1/widget/conversations/${convId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: text }),
        });
      })
      .then((res) => res.json())
      .then((data) => {
        state.isLoading = false;
        if (data.aiMessage) {
          state.messages.push({
            senderType: 'AI',
            content: data.aiMessage.content,
            sources: data.sources,
          });
        }
        if (data.shouldEscalate) {
          state.isEscalated = true;
          escalateBar.style.display = 'flex';
        }
        renderMessages();
      })
      .catch((err) => {
        state.isLoading = false;
        state.messages.push({
          senderType: 'AI',
          content: 'Unable to reach support servers. Please check your network connection.',
        });
        renderMessages();
      });
  }

  launcher.addEventListener('click', toggleWidget);
  closeBtn.addEventListener('click', toggleWidget);
  sendBtn.addEventListener('click', handleSend);
  inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });

  escalateBtn.addEventListener('click', () => {
    if (!state.conversationId) return;
    fetch(`${baseUrl}/api/v1/conversations/${state.conversationId}/escalate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Customer clicked Talk to Human' }),
    }).then(() => {
      state.messages.push({
        senderType: 'AI',
        content: 'Your conversation has been escalated. A human support representative will join shortly.',
      });
      escalateBar.style.display = 'none';
      renderMessages();
    });
  });
})();
