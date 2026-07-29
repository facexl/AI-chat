<template>
  <div class="settings-overlay">
    <div class="settings-form">
      <label class="text-sm">请输入 DashScope API Key:</label>
      <div class="settings-field">
        <input
          v-model="form.apikey"
          class="native-input"
          placeholder="请输入 DashScope API Key"
          style="width: 100%"
        />
      </div>
      <div class="settings-field">
        <input
          v-model="form.host"
          class="native-input"
          placeholder="默认: https://coding.dashscope.aliyuncs.com/apps/anthropic/v1/messages"
          style="width: 100%"
        />
      </div>
      <div class="settings-row">
        <span>搜索时自动询问 AI:</span>
        <span
          class="toggle-switch"
          :class="{ active: form.searchGpt }"
          @click="form.searchGpt = !form.searchGpt"
        />
      </div>
      <div class="settings-divider" />
      <div class="platform-info">
        <div class="platform-title">平台说明</div>
        <div class="platform-desc">当前仅支持 <b>阿里云 Coding Plan</b>，Coding Plan 支持的模型:</div>
        <div class="model-list">
          <span v-for="m in MODELS" :key="m.id" class="model-tag">{{ m.label }}</span>
        </div>
      </div>
      <div class="settings-actions">
        <button class="native-btn" @click="$emit('close')">取消</button>
        <button class="native-btn native-btn-primary" @click="submit">确定</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useStorage } from '../composables/useStorage'
import { MODELS } from '../api/chat'

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { loadAll, saveSettings } = useStorage()

const form = reactive({
  apikey: '',
  host: '',
  searchGpt: false,
})

onMounted(async () => {
  const data = await loadAll()
  form.apikey = data.apikey
  form.host = data.host
  form.searchGpt = data.searchGpt
})

async function submit() {
  await saveSettings({
    apikey: form.apikey,
    host: form.host,
    searchGpt: form.searchGpt,
  })
  emit('close')
  emit('saved')
}
</script>

<style lang="less" scoped>
.settings-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background-color: var(--ai-chat-bg);
  color: var(--ai-chat-font-color);
  z-index: 2;
  overflow-y: auto;
  padding: 24px 0;
}

.settings-form {
  width: 360px;
}

.settings-field {
  margin-top: 8px;
}

.settings-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}

.settings-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.settings-divider {
  height: 1px;
  background: var(--ai-chat-font-color);
  opacity: 0.12;
  margin: 16px 0;
}

.platform-info {
  font-size: 13px;
}

.platform-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.platform-desc {
  color: var(--ai-chat-font-color);
  opacity: 0.75;
  margin-bottom: 8px;
}

.model-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.model-tag {
  display: inline-block;
  padding: 0 6px;
  height: 20px;
  line-height: 20px;
  font-size: 11px;
  border-radius: 3px;
  border: 1px solid var(--light-border-gray, #f0f0f0);
  background: var(--ai-chat-bg);
  color: var(--ai-chat-font-color);
  opacity: 0.65;
}

.text-sm {
  font-size: 14px;
}
</style>
