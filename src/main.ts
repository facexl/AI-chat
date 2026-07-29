import 'uno.css'
import { createApp } from 'vue'
import App from './App.vue'
import { isExtension } from './utils/storage'

async function mountExtension() {
  // Clean up any stale AI-chat elements from previous content script loads
  const staleEls = document.querySelectorAll('[data-ai-chat-host]')
  staleEls.forEach(el => el.remove())

  const el = document.createElement('div')
  el.setAttribute('data-ai-chat-host', '')
  const shadow = el.attachShadow({ mode: 'open' })

  // Fetch CSS and inject as <style> (more reliable than <link> in Shadow DOM)
  try {
    const cssUrl = chrome.runtime.getURL('aichat.css')
    const cssText = await fetch(cssUrl).then(r => r.text())
    shadow.innerHTML = `
      <style>${cssText}</style>
      <div id="ai-chat"></div>
    `
  } catch (e) {
    console.error('[AI-chat] failed to load CSS:', e)
    shadow.innerHTML = '<div id="ai-chat"></div>'
  }

  document.documentElement.appendChild(el)

  try {
    createApp(App).mount(shadow.getElementById('ai-chat') as HTMLElement)
    console.log('[AI-chat] content script loaded')
  } catch (e) {
    console.error('[AI-chat] mount error:', e)
  }
}

function mountDev() {
  const el = document.createElement('div')
  el.id = 'ai-chat'
  document.documentElement.appendChild(el)
  createApp(App).mount(el)
}

if (isExtension) {
  mountExtension()
} else {
  mountDev()
}
