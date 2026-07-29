<template>
  <!-- Floating icon (shown on text selection) -->
  <FloatingIcon
    v-if="showIcon"
    :style="iconStyle"
    @click="openPanel(false)"
  />

  <!-- Chat panel -->
  <ChatPanel
    v-if="showPanel"
    :panel-style="panelPosition"
    :select="selectedText"
    :is-chat="isChatMode"
    @close="closePanel"
  />
</template>

<script setup lang="ts">
import ChatPanel from './components/ChatPanel.vue'
import FloatingIcon from './components/FloatingIcon.vue'
import { storage } from './utils/storage'
import config from './config'

const showIcon = ref(false)
const showPanel = ref(false)
const selectedText = ref('')
const isChatMode = ref(false)

// Frozen mouse position at selection time
const iconX = ref(0)
const iconY = ref(0)

const iconStyle = computed(() => ({
  position: 'fixed' as const,
  left: iconX.value + 8 + 'px',
  top: iconY.value + 8 + 'px',
}))

const panelPosition = ref({ top: '100px', left: '100px' })

function calculatePanelPosition() {
  const pw = 550
  const ph = 480
  const scrollX = window.scrollX || document.documentElement.scrollLeft
  const scrollY = window.scrollY || document.documentElement.scrollTop
  const ww = window.innerWidth + scrollX
  const wh = window.innerHeight + scrollY

  const left = iconX.value + pw > ww ? iconX.value - pw : iconX.value
  const top = iconY.value + ph / 2 > wh ? iconY.value - ph : iconY.value

  panelPosition.value = {
    left: left + 'px',
    top: top + 'px',
  }
}

function openPanel(chat: boolean) {
  showIcon.value = false
  isChatMode.value = chat
  calculatePanelPosition()
  showPanel.value = true
}

function closePanel() {
  showPanel.value = false
  isChatMode.value = false
}

// Check search engine pages
async function checkSearchModel() {
  const searchGpt = await storage.get('searchGpt').then(d => d.searchGpt as boolean)
  if (!searchGpt) return

  for (const it of config.hosts) {
    if (location.host === it.host && location.pathname === it.path) {
      const res = location.href.match(it.reg)
      if (res && res[0] && res[1]) {
        isChatMode.value = true
        selectedText.value = decodeURIComponent(res[1])
        panelPosition.value = { top: '0px', left: '0px' }
        showPanel.value = true

        if (it.effect) {
          it.effect(() => {
            showPanel.value = false
            setTimeout(checkSearchModel, 100)
          })
        }
      }
    }
  }
}

// Text selection handler
function onMouseUp(e: MouseEvent) {
  const mx = e.clientX
  const my = e.clientY
  setTimeout(() => {
    if (showPanel.value) return
    const sel = window.getSelection()
    const text = sel?.toString().trim()
    if (text && text.length > 0) {
      selectedText.value = text
      iconX.value = mx
      iconY.value = my
      showIcon.value = true
      console.log('[AI-chat] selection detected, showing icon')
    }
  }, 0)
}

// Chrome runtime message handler
function setupMessageListener() {
  if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      if (request.message === 'open aichat' && !showPanel.value) {
        selectedText.value = ''
        isChatMode.value = true
        panelPosition.value = {
          top: (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0) + 'px',
          left: '0px',
        }
        showPanel.value = true
        sendResponse?.({ ok: true })
      }
      return true // Signal async response to prevent popup fallback
    })
  }
}

onMounted(() => {
  setupMessageListener()
  checkSearchModel()
  document.addEventListener('mouseup', onMouseUp)
  console.log('[AI-chat] App mounted, mouseup listener registered')
})
</script>
