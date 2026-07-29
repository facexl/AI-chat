import 'uno.css'
import { createApp } from 'vue'
import ChatPanel from './components/ChatPanel.vue'

function renderPanel() {
  const div = document.createElement('div')
  div.id = 'ai-chat-popup'
  document.body.appendChild(div)
  createApp(ChatPanel, {
    isPopup: true,
    panelStyle: { position: 'relative', left: '0', top: '0' },
  }).mount(div)
}

async function init() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })

  if (tabs.length === 0 || !tabs[0].active) {
    renderPanel()
    return
  }

  const tabId = tabs[0].id as number
  try {
    const tab = await chrome.tabs.get(tabId)
    if (!tab.url || tab.url.startsWith('chrome://')) {
      renderPanel()
      return
    }
  } catch {
    renderPanel()
    return
  }

  chrome.tabs.sendMessage(tabId, { message: 'open aichat' }, () => {
    if (chrome.runtime.lastError) {
      renderPanel()
      return
    }
    window.close()
  })
}

init()
