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

const panelPosition = ref(getCenterPosition())

function getCenterPosition() {
  const pw = 550
  const ph = 480
  return {
    left: Math.max(0, (window.innerWidth - pw) / 2) + 'px',
    top: Math.max(0, (window.innerHeight - ph) / 2) + 'px',
  }
}

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

function hideIcon() {
  showIcon.value = false
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
        panelPosition.value = getCenterPosition()
        showPanel.value = true
        sendResponse?.({ ok: true })
      }
      return true // Signal async response to prevent popup fallback
    })
  }
}

onMounted(() => {
  setupMessageListener()
  document.addEventListener('mouseup', onMouseUp)
  document.addEventListener('mousedown', onMouseDown)
  window.addEventListener('scroll', hideIcon)
  console.log('[AI-chat] App mounted, mouseup listener registered')
})

function onMouseDown(e: MouseEvent) {
  const insideIcon = e.composedPath().some(
    el => el instanceof HTMLElement && el.classList.contains('floating-icon'),
  )
  if (showIcon.value && !insideIcon) {
    hideIcon()
  }
}
</script>
