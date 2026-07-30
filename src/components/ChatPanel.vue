<template>
  <div
    ref="panelRoot"
    class="chat-panel-root"
    :class="{
      'chat-panel-dark': isDark,
      'chat-panel-full': isFull,
      'chat-panel-dragging': isDragging,
    }"
    :style="computedStyle"
  >
    <!-- Toolbar -->
    <div
      class="toolbar"
      :class="{ 'toolbar-dragging': isDragging }"
      @mousedown="startDrag"
    >
      <span
        v-if="pageStatus === 0"
        class="toolbar-title"
      >AI-chat</span>
      <span
        v-else
        class="toolbar-title toolbar-back"
        @click="setPageStatus(0)"
      >返回</span>
      <select
        v-if="pageStatus === 0"
        v-model="currentModel"
        class="model-select"
        @change="onModelChange"
      >
        <option v-for="m in providerModels" :key="m.id" :value="m.id">{{ m.label }}</option>
      </select>
      <div class="toolbar-menus">
        <span class="menu-item" @click="toggleTheme">{{ isDark ? 'light' : 'dark' }}</span>
        <span class="menu-item" @click="setPageStatus(2)">历史记录</span>
        <span class="menu-item" @click="setPageStatus(1)">设置</span>
        <span v-if="!isPopup" class="menu-item" @click="isFull = !isFull">
          {{ isFull ? '最小化' : '最大化' }}
        </span>
        <span v-if="!isPopup" class="menu-item menu-close" @click="$emit('close')">x</span>
      </div>
    </div>

    <!-- Settings overlay -->
    <Settings
      v-if="pageStatus === 1"
      @close="setPageStatus(0)"
      @saved="loadSettings"
    />

    <!-- History overlay -->
    <HistoryList
      v-if="pageStatus === 2"
      @select="selectHistory"
      @close="setPageStatus(0)"
    />

    <!-- Tag panel -->
    <div v-if="showTagPanel" class="tag-panel">
      <div class="tag-header">
        <span>导语设置:</span>
        <span class="tag-close" @click="showTagPanel = false">x</span>
      </div>
      <span
        v-for="(item, i) in tags"
        :key="item.content"
        class="native-tag"
        :class="{ 'native-tag-dark': isDark }"
      >
        <input
          v-if="editingTagIndex === i"
          v-model="editingTagValue"
          class="native-input-edit"
          @keydown.enter="confirmEditTag(i)"
          @blur="confirmEditTag(i)"
          @click.stop
        />
        <span
          v-else
          class="tag-text"
          @click="applyTag(item)"
          @dblclick.stop="startEditTag(i, item)"
        >
          {{ item.content }}
        </span>
        <span class="native-tag-close" @click.stop="removeTag(i)">x</span>
      </span>
      <div class="input-group-compact">
        <input
          v-model="newTagInput"
          class="native-input native-input-small"
          style="width: calc(100% - 80px)"
          placeholder="新导语"
          @keydown.enter="addTag"
        />
        <button class="native-btn native-btn-primary native-btn-small" @click="addTag">添加</button>
      </div>
    </div>

    <!-- Messages -->
    <div ref="chatScroll" class="messages-area">
      <div
        v-for="(item, index) in msgs"
        :key="index"
        class="msg-row"
        :class="{ msgQ: item.role === 'user', msgA: item.role === 'assistant' }"
      >
        <span class="msg-label">{{ item.role === 'user' ? 'Q' : 'A' }}</span>
        <span
          v-if="item.tag"
          class="native-tag native-tag-small"
          :class="{ 'native-tag-dark': isDark }"
          @click="showTagPanel = true"
        >
          {{ item.tag }}
        </span>
        <span
          v-if="item.role !== 'user'"
          class="markdown-body"
          v-html="item.marked || item.content"
        />
        <span v-else>{{ item.content }}</span>
        <span v-if="index === msgs.length - 1 && reqing" class="cursor-blink">
          <span style="opacity: 0">_</span>
        </span>
      </div>
    </div>

    <!-- Error tip -->
    <div v-if="errorMsg" class="error-toast">{{ errorMsg }}</div>

    <!-- Input area -->
    <div class="input-area">
      <div class="input-actions">
        <button class="native-btn native-btn-small" @click="saveThread">保存聊天</button>
        <button class="native-btn native-btn-small" @click="clearThread">新聊天</button>
      </div>
      <textarea
        ref="textareaRef"
        v-model="inputText"
        class="native-textarea"
        rows="4"
        placeholder="可以继续聊天哟"
        @keydown.enter="send"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Settings from './Settings.vue'
import HistoryList from './HistoryList.vue'
import { useStorage } from '../composables/useStorage'
import { useChat } from '../composables/useChat'
import { useTheme } from '../composables/useTheme'
import { getProviderModels, getDefaultModel } from '../api/providers'
import type { TagItem, ParseHistory } from '../types'

const props = defineProps<{
  select?: string
  isPopup?: boolean
  panelStyle?: Record<string, string | number>
  isChat?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const { loadAll, saveTags, saveDarkMode, saveDefaultTag, saveModel, DEFAULT_TAGS } = useStorage()
const { isDark, toggle: toggleTheme, setDark } = useTheme()
const {
  msgs, reqing, chatThreadId, errorMsg,
  addUserMessage, sendRequest, clearThread, loadHistory, saveThread,
} = useChat()

const inputText = ref('')
const isFull = ref(false)
const pageStatus = ref<0 | 1 | 2>(0) // 0=chat, 1=settings, 2=history
const showTagPanel = ref(false)
const tags = ref<TagItem[]>([...DEFAULT_TAGS])
const newTagInput = ref('')
const editingTagIndex = ref<number | null>(null)
const editingTagValue = ref('')
const chatScroll = ref<HTMLElement>()
const textareaRef = ref<HTMLTextAreaElement>()
const panelRoot = ref<HTMLElement>()

// Provider-based model selection
const providerId = ref('dashscope')
const currentModel = ref('')

const providerModels = computed(() => getProviderModels(providerId.value))

function onModelChange() {
  saveModel(currentModel.value)
}

// Drag state
const isDragging = ref(false)
const panelLeft = ref(100)
const panelTop = ref(100)
let dragMouseStartX = 0
let dragMouseStartY = 0
let dragPanelStartX = 0
let dragPanelStartY = 0

const computedStyle = computed(() => {
  const base = { ...props.panelStyle } as Record<string, string>
  if (base.position !== 'relative') {
    base.left = panelLeft.value + 'px'
    base.top = panelTop.value + 'px'
  }
  return base
})

function initPosition() {
  const defaultLeft = Math.max(0, (window.innerWidth - 550) / 2)
  const defaultTop = Math.max(0, (window.innerHeight - 480) / 2)
  panelLeft.value = parseFloat(props.panelStyle?.left as string || String(defaultLeft))
  panelTop.value = parseFloat(props.panelStyle?.top as string || String(defaultTop))
}

function startDrag(e: MouseEvent) {
  if (isFull.value) return
  const target = e.target as HTMLElement
  if (target.closest('span')) return

  isDragging.value = true
  dragMouseStartX = e.clientX
  dragMouseStartY = e.clientY
  if (panelRoot.value) {
    const rect = panelRoot.value.getBoundingClientRect()
    dragPanelStartX = rect.left
    dragPanelStartY = rect.top
  } else {
    dragPanelStartX = panelLeft.value
    dragPanelStartY = panelTop.value
  }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

function onDrag(e: MouseEvent) {
  panelLeft.value = dragPanelStartX + (e.clientX - dragMouseStartX)
  panelTop.value = dragPanelStartY + (e.clientY - dragMouseStartY)
}

function stopDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

let apiKey = ''

function setPageStatus(status: 0 | 1 | 2) {
  pageStatus.value = pageStatus.value === status ? 0 : status
}

// Auto-scroll on new messages
watch(msgs, () => {
  nextTick(() => {
    if (chatScroll.value) {
      chatScroll.value.scrollTop = chatScroll.value.scrollHeight
    }
  })
}, { deep: true })

// Clear error toast after 3s
watch(errorMsg, (msg) => {
  if (msg) {
    setTimeout(() => { errorMsg.value = '' }, 3000)
  }
})

// Persist theme
watch(isDark, (v) => {
  saveDarkMode(v)
})

// Persist tags (skip during initial load)
let tagsSaveSkipped = false
watch(tags, (v) => {
  if (!tagsSaveSkipped) {
    saveTags(v)
  }
  tagsSaveSkipped = false
}, { deep: true })

function addTag() {
  const val = newTagInput.value.trim()
  if (!val) return
  if (tags.value.some((t) => t.content === val)) {
    errorMsg.value = '该导语已存在'
    return
  }
  tags.value.push({ content: val })
  newTagInput.value = ''
}

function removeTag(i: number) {
  tags.value.splice(i, 1)
}

function startEditTag(i: number, item: TagItem) {
  editingTagIndex.value = i
  editingTagValue.value = item.content
}

function confirmEditTag(i: number) {
  const val = editingTagValue.value.trim()
  if (!val) {
    editingTagIndex.value = null
    return
  }
  if (tags.value.some((t, idx) => idx !== i && t.content === val)) {
    errorMsg.value = '该导语已存在'
    return
  }
  tags.value[i] = { content: val }
  editingTagIndex.value = null
}

async function applyTag(item: TagItem) {
  if (reqing.value) {
    errorMsg.value = '请等待回复完成'
    return
  }
  await saveDefaultTag(item.content)
  showTagPanel.value = false
  addUserMessage(props.select || '', item.content)
  sendRequest(apiKey, providerId.value, currentModel.value)
}

function send() {
  if (reqing.value) {
    errorMsg.value = '请等待回复完成'
    return
  }
  const text = inputText.value.trim()
  if (text) {
    addUserMessage(text)
    inputText.value = ''
    textareaRef.value?.blur()
    sendRequest(apiKey, providerId.value, currentModel.value)
  }
}

function selectHistory(item: ParseHistory) {
  loadHistory(item)
  setPageStatus(0)
}

async function loadSettings() {
  const data = await loadAll()
  apiKey = data.apikey

  // Reset model when provider changes, or use stored model if still valid
  const prevProvider = providerId.value
  providerId.value = data.provider
  const models = getProviderModels(providerId.value)
  const modelExists = models.some(m => m.id === data.model)
  if (prevProvider !== data.provider || !modelExists) {
    currentModel.value = getDefaultModel(providerId.value)
    saveModel(currentModel.value)
  } else {
    currentModel.value = data.model
  }

  setDark(data.isDark)
  tagsSaveSkipped = true
  tags.value = Array.isArray(data.tags) ? [...data.tags] : [...DEFAULT_TAGS]

  if (!apiKey) {
    errorMsg.value = '请设置 API Key'
    pageStatus.value = 1
    return
  }

  // In popup mode, just load settings
  if (props.isPopup) return

  // Auto-send with selected text
  if (props.select) {
    if (props.isChat) {
      addUserMessage(props.select)
    } else {
      const defaultTag = data.defaultTag || '翻译成中文:'
      addUserMessage(props.select, defaultTag)
    }
    sendRequest(apiKey, providerId.value, currentModel.value)
  }
}

// Init position from props when panel is created
watch(() => props.panelStyle, () => {
  initPosition()
}, { immediate: false })

onMounted(() => {
  initPosition()
  loadSettings()
})
</script>

<style lang="less">
/* highlight.js theme */
@import 'highlight.js/styles/github.css';

/* markdown body styles */
@keyframes cursorBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* ---- Native component styles ---- */

.native-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 4px 15px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
  background: #fff;
  color: rgba(0, 0, 0, 0.88);
  cursor: pointer;
  white-space: nowrap;
  outline: none;
  transition: all 0.2s;
  &:hover { color: #1677ff; border-color: #1677ff; }
}

.native-btn-primary {
  background: #1677ff;
  border-color: #1677ff;
  color: #fff;
  &:hover { background: #4096ff; border-color: #4096ff; color: #fff; }
}

.native-btn-small {
  height: 24px;
  padding: 0 7px;
  font-size: 12px;
  border-radius: 4px;
}

.native-input {
  box-sizing: border-box;
  height: 32px;
  padding: 4px 11px;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  outline: none;
  transition: all 0.2s;
  color: rgba(0, 0, 0, 0.88);
  background: #fff;
  &:focus { border-color: #1677ff; box-shadow: 0 0 0 2px rgba(5, 145, 255, 0.1); }
  &::placeholder { color: #bfbfbf; }
}

.native-input-small {
  height: 24px;
  padding: 1px 7px;
  font-size: 12px;
  border-radius: 4px;
}

.native-textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 8px 11px;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  outline: none;
  resize: vertical;
  transition: all 0.2s;
  color: rgba(0, 0, 0, 0.88);
  background: #fff;
  font-family: inherit;
  &:focus { border-color: #1677ff; box-shadow: 0 0 0 2px rgba(5, 145, 255, 0.1); }
  &::placeholder { color: #bfbfbf; }
}

.native-tag {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 7px;
  font-size: 12px;
  line-height: 20px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  background: #fafafa;
  color: rgba(0, 0, 0, 0.88);
  cursor: pointer;
  margin-right: 4px;
  margin-bottom: 8px;
}

.native-tag-dark {
  border-color: #1677ff;
  background: rgba(22, 119, 255, 0.1);
  color: #1677ff;
}

.native-tag-small {
  height: 20px;
  padding: 0 5px;
  font-size: 11px;
  margin-bottom: 0;
}

.native-tag-close {
  margin-left: 4px;
  cursor: pointer;
  font-size: 11px;
  line-height: 1;
  &:hover { color: #ff4d4f; }
}

.native-input-edit {
  box-sizing: border-box;
  height: 18px;
  padding: 0 3px;
  font-size: 12px;
  line-height: 18px;
  border: 1px solid #1677ff;
  border-radius: 2px;
  outline: none;
  color: rgba(0, 0, 0, 0.88);
  background: #fff;
  width: 100px;
}

.tag-text {
  cursor: pointer;
}

.input-group-compact {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Toggle switch */
.toggle-switch {
  display: inline-block;
  width: 44px;
  height: 22px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 11px;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
  &.active {
    background: #1677ff;
  }
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    transition: left 0.2s;
  }
  &.active::after {
    left: 24px;
  }
}

/* ---- Chat Panel Styles ---- */

.chat-panel-root {
  --ai-chat-bg: #fff;
  --ai-chat-deep-bg: #f3f3f3;
  --ai-chat-font-color: #000;
  --toolbar-height: 30px;
  --history-gray: rgba(27, 31, 35, 0.05);
  --light-border-gray: #f0f0f0;

  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100% !important;
  display: flex;
  position: absolute;
  z-index: 2147483647;
  box-sizing: border-box;
  padding-top: var(--toolbar-height);
  width: 550px;
  height: 480px;
  transition: all 0.3s ease;
  border-radius: 6px;
  box-shadow: rgb(0 0 0 / 80%) 0 4px 23px -6px;
  background-color: var(--ai-chat-deep-bg);
  padding-bottom: 98px;
  color: var(--ai-chat-font-color);

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--toolbar-height);
    box-sizing: border-box;
    padding: 0 8px;
    background-color: #5caf9e;
    font-weight: bold;
    color: #fff;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    z-index: 999;
    font-size: 13px;
    cursor: grab;
    user-select: none;
  }

  .toolbar-dragging {
    cursor: grabbing;
  }

  .model-select {
    height: 22px;
    padding: 0 4px;
    font-size: 12px;
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
    outline: none;
    cursor: pointer;
    margin-right: auto;
    margin-left: 8px;
    option {
      color: #000;
      background: #fff;
    }
  }

  .toolbar-menus {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .menu-item {
    cursor: pointer;
    padding: 0 4px;
    line-height: var(--toolbar-height);
    display: inline-flex;
    align-items: center;
    &:hover { opacity: 0.8; }
  }

  .menu-close {
    font-size: 14px;
  }

  .toolbar-back {
    cursor: pointer;
  }

  .messages-area {
    width: 100%;
    height: auto;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }
  }

  .msg-row {
    padding: 8px;
  }

  .msgQ {
    background-color: var(--ai-chat-bg);
    .msg-label { color: #f50; font-weight: bold; }
  }

  .msgA {
    background-color: var(--ai-chat-deep-bg);
    .msg-label { color: rgb(135, 208, 104); font-weight: bold; }
  }

  .msg-tag {
    cursor: pointer;
    margin-left: 4px;
  }

  .input-area {
    width: 100%;
    position: absolute;
    bottom: 0;
    z-index: 1;
  }

  .input-actions {
    text-align: right;
    margin-bottom: 2px;
    display: flex;
    justify-content: flex-end;
    gap: 2px;
  }

  .chat-input {
    background-color: var(--ai-chat-bg);
    color: var(--ai-chat-font-color);
  }

  .tag-panel {
    padding: 8px;
    background-color: var(--ai-chat-bg);
    position: absolute;
    top: var(--toolbar-height);
    left: 0;
    right: 0;
    z-index: 3;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .tag-header {
    font-weight: 500;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
  }

  .tag-close {
    cursor: pointer;
  }

  .error-toast {
    position: absolute;
    bottom: 100px;
    color: red;
    font-size: 12px;
    padding: 4px 8px;
    z-index: 4;
  }

  .cursor-blink::after {
    content: ' ';
    animation: cursorBlink 1s infinite;
    font-weight: bold;
  }
}

.chat-panel-dark {
  --ai-chat-bg: #1e1e20;
  --ai-chat-deep-bg: #101014;
  --ai-chat-font-color: #c9d1d9;
  --history-gray: #000;
  --light-border-gray: #312f2f;

  .native-btn {
    background: #1e1e20;
    border-color: #434343;
    color: #c9d1d9;
    &:hover { color: #1677ff; border-color: #1677ff; }
  }
  .native-btn-primary {
    background: #1677ff;
    border-color: #1677ff;
    color: #fff;
    &:hover { background: #4096ff; border-color: #4096ff; color: #fff; }
  }
  .native-input,
  .native-textarea {
    background: #1e1e20;
    border-color: #434343;
    color: #c9d1d9;
    &::placeholder { color: #666; }
  }
  .native-tag {
    background: #1e1e20;
    border-color: #434343;
    color: #c9d1d9;
  }
  .native-tag-dark {
    border-color: #1677ff;
    background: rgba(22, 119, 255, 0.15);
    color: #1677ff;
  }
  .native-input-edit {
    background: #1e1e20;
    border-color: #1677ff;
    color: #c9d1d9;
  }
  .toggle-switch {
    background: rgba(255, 255, 255, 0.25);
  }

  .chat-input {
    border: none;
  }
}

.chat-panel-full {
  width: 100vw !important;
  height: 100vh !important;
  left: 0 !important;
  top: 0 !important;
  position: fixed;
}

.chat-panel-dragging {
  transition: none !important;
}
</style>
